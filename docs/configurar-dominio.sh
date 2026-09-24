#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/configurar-dominio.sh — Deja el dominio sirviendo el sitio.
#
#   bash docs/configurar-dominio.sh camena.com.mx camena            → dice qué haría
#   bash docs/configurar-dominio.sh camena.com.mx camena --aplicar  → lo hace
#
# Por qué existe: conectar el dominio son seis ajustes repartidos en tres
# pantallas distintas de Cloudflare, y dos de ellos —la ofuscación de correos
# y el «Always Use HTTPS»— vienen activados por defecto con valores que no
# queremos. Hacerlo a mano una vez se olvida; hacerlo con un script se puede
# volver a comprobar. Es idempotente: si algo ya está como debe, lo dice y
# sigue.
#
# Lo que deja como debe: cuatro pasos, seis ajustes.
#   1 · DNS: CNAME del dominio raíz y de www hacia el proyecto de Pages
#   2 · Cifrado: SSL/TLS en Full (strict) y «Always Use HTTPS» encendido
#   3 · Que Cloudflare no reescriba el sitio: la ofuscación de correos APAGADA,
#       porque Cloudflare la enciende sola y reescribe los mailto del sitio; sin
#       JavaScript el visitante ve «[email protected]» en vez de la dirección, y
#       el aviso de privacidad necesita ese correo legible.
#   4 · www redirige al dominio raíz con un 301 (una sola dirección pública)
#
# No borra reglas ajenas: el conjunto de redirecciones de la fase se reescribe a
# partir de lo que ya había, así que el enlace corto del QR (`/qr`, ver
# docs/qr.py) sobrevive a cada pasada.
#
# El token necesita estos permisos:
#   · Zone → DNS → Edit
#   · Zone → Zone Settings → Edit
#   · Zone → Single Redirect → Edit   (para la redirección de www)
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

DOMINIO="${1:-}"
PROYECTO="${2:-}"
APLICAR=""
for arg in "$@"; do [[ "$arg" == "--aplicar" ]] && APLICAR="--aplicar"; done

if [[ -z "$DOMINIO" || -z "$PROYECTO" ]]; then
  echo "Faltan datos."
  echo "  Uso: bash docs/configurar-dominio.sh <dominio> <proyecto-de-pages> [--aplicar]"
  echo "  Ej.: bash docs/configurar-dominio.sh camena.com.mx camena"
  exit 2
fi

API="https://api.cloudflare.com/client/v4"

# El token: de la variable de entorno o del archivo local con permisos 600.
TOKEN="${CLOUDFLARE_API_TOKEN:-}"
if [[ -z "$TOKEN" && -f "$HOME/.config/camena/.cf-token" ]]; then
  TOKEN="$(tr -d '[:space:]' < "$HOME/.config/camena/.cf-token")"
fi
if [[ -z "$TOKEN" ]]; then
  echo "✗ Falta el token."
  echo "  Ponlo en CLOUDFLARE_API_TOKEN o guárdalo en ~/.config/camena/.cf-token"
  exit 2
fi

leer() { # $1 = ruta de la API → imprime "ok JSON" o "error mensaje"
  curl -s -m 30 -H "Authorization: Bearer $TOKEN" "$API/$1"
}
json() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }

problemas=0
hecho() { echo "  ✓ $*"; }
falta() { echo "  ✗ $*"; problemas=$((problemas + 1)); }
nota()  { echo "  · $*"; }

echo "── Zona $DOMINIO ──"
ZONA="$(leer "zones?name=$DOMINIO" | json "d['result'][0]['id'] if d.get('result') else ''")"
if [[ -z "$ZONA" ]]; then
  echo "✗ No encontré la zona (¿el token ve este dominio?)"
  exit 1
fi
hecho "zona $ZONA"

if [[ "$APLICAR" != "--aplicar" ]]; then
  echo
  nota "Simulación: no se cambia nada. Para aplicarlo, añade --aplicar"
fi
echo

# ── 1 · DNS ─────────────────────────────────────────────────────
echo "── 1 · DNS ──"
destino="$PROYECTO.pages.dev"
registros="$(leer "zones/$ZONA/dns_records?per_page=100")"
for nombre in "$DOMINIO" "www.$DOMINIO"; do
  actual="$(printf '%s' "$registros" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if not d.get('success'):
    print('SINPERMISO'); raise SystemExit
for x in d['result']:
    if x['name'] == '$nombre':
        print(x['content']); break
")"
  if [[ "$actual" == "SINPERMISO" ]]; then
    falta "no puedo leer el DNS (falta el permiso Zone → DNS → Edit)"
    break
  elif [[ "$actual" == "$destino" ]]; then
    hecho "$nombre → $destino"
  elif [[ -n "$actual" && "$APLICAR" != "--aplicar" ]]; then
    falta "$nombre apunta a «$actual» en vez de a «$destino»"
  else
    if [[ "$APLICAR" != "--aplicar" ]]; then
      nota "$nombre: habría que crearlo apuntando a $destino"
      continue
    fi
    if [[ -n "$actual" ]]; then
      # Ya existe con otro destino: se corrige en vez de duplicar.
      id="$(printf '%s' "$registros" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(next(x['id'] for x in d['result'] if x['name'] == '$nombre'))
")"
      r="$(curl -s -m 30 -X PUT "$API/zones/$ZONA/dns_records/$id" \
            -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
            --data "{\"type\":\"CNAME\",\"name\":\"$nombre\",\"content\":\"$destino\",\"proxied\":true,\"ttl\":1}")"
    else
      r="$(curl -s -m 30 -X POST "$API/zones/$ZONA/dns_records" \
            -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
            --data "{\"type\":\"CNAME\",\"name\":\"$nombre\",\"content\":\"$destino\",\"proxied\":true,\"ttl\":1,\"comment\":\"Sitio de CAMENA en Cloudflare Pages\"}")"
    fi
    if printf '%s' "$r" | grep -q '"success":true'; then
      hecho "$nombre → $destino (creado)"
    else
      falta "$nombre: $(printf '%s' "$r" | json "json.dumps(d.get('errors'))[:160]")"
    fi
  fi
done

# ── 2 y 3 · Seguridad y https ───────────────────────────────────
ajuste() { # $1 = ajuste, $2 = valor, $3 = por qué
  local actual
  actual="$(leer "zones/$ZONA/settings/$1" | json "(d.get('result') or {}).get('value','')")"
  if [[ "$actual" == "$2" ]]; then
    hecho "$1 ya está en «$2»"
    return
  fi
  if [[ "$APLICAR" != "--aplicar" ]]; then
    nota "$1: habría que ponerlo en «$2» ($3)"
    return
  fi
  if curl -s -m 30 -X PATCH "$API/zones/$ZONA/settings/$1" \
       -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       --data "{\"value\":\"$2\"}" | grep -q '"success":true'; then
    hecho "$1 → $2"
  else
    falta "$1: no se pudo cambiar (¿falta Zone → Zone Settings → Edit?)"
  fi
}

echo
echo "── 2 · Cifrado ──"
ajuste ssl strict "Pages presenta certificado válido"
ajuste always_use_https on "el http lleva al https"
ajuste automatic_https_rewrites on "los recursos que quedaran en http suben a https"

echo
echo "── 3 · Que Cloudflare no reescriba el sitio ──"
ajuste email_obfuscation off "sin JavaScript el correo se vería como «[email protected]»"
ajuste rocket_loader off "cambia cómo cargan los scripts"
for opt in css html js; do
  nota "minify.$opt: $(leer "zones/$ZONA/settings/minify" | json "(d.get('result') or {}).get('value',{}).get('$opt','?')")"
done

# ── 4 · www al dominio raíz ─────────────────────────────────────
echo
echo "── 4 · www redirige al dominio raíz ──"
regla="$(leer "zones/$ZONA/rulesets/phases/http_request_dynamic_redirect/entrypoint")"
# ¿Ya existe la regla? Se mira la expresión de las reglas de verdad, con el JSON
# leído, no el texto crudo: dentro del JSON las comillas van escapadas y una
# comparación de texto —«\"http.host eq \\\"www.dominio\\\"\"»— no coincide nunca,
# así que el script decía «habría que crearla» aunque la regla ya estuviera
# puesta, y en cada pasada intentaba volver a crearla.
existe="$(printf '%s' "$regla" | python3 -c '
import json, sys
try:
    datos = json.load(sys.stdin)
except Exception:
    print("no"); raise SystemExit
reglas = (datos.get("result") or {}).get("rules") or []
buscado = sys.argv[1]
print("si" if any(buscado in (r.get("expression") or "") for r in reglas) else "no")
' "www.$DOMINIO")"
if [[ "$existe" == "si" ]]; then
  hecho "la redirección de www ya existe"
elif printf '%s' "$regla" | grep -q 'Authentication error'; then
  falta "no puedo tocar las redirecciones: al token le falta «Zone → Single Redirect → Edit»"
  nota "Alternativa sin tocar el token: Cloudflare → Rules → Redirect Rules →"
  nota "  si el hostname es www.$DOMINIO → redirección dinámica a https://$DOMINIO (301)"
elif [[ "$APLICAR" != "--aplicar" ]]; then
  nota "habría que crear la regla: www.$DOMINIO → https://$DOMINIO (301)"
else
  # El cuerpo se arma a partir de las reglas que YA existen, no de cero: este
  # PUT reemplaza todo el conjunto de la fase, así que enviar solo la regla de
  # www borraría cualquier otra que viva ahí —por ejemplo el enlace corto del QR
  # (`/qr`, ver docs/qr.py)—. Lo que no es de este script, no se toca.
  cuerpo="$(REGLAS="$regla" python3 - "$DOMINIO" <<'PY'
import json, os, sys
d = sys.argv[1]
try:
    actual = (json.loads(os.environ.get("REGLAS") or "{}").get("result") or {}).get("rules") or []
except Exception:
    actual = []
nueva = {
    "action": "redirect",
    "description": "www al dominio raíz",
    "enabled": True,
    "expression": f'(http.host eq "www.{d}")',
    "action_parameters": {"from_value": {
        "status_code": 301,
        "target_url": {"expression": f'concat("https://{d}", http.request.uri.path)'},
        "preserve_query_string": True,
    }},
}
print(json.dumps({"rules": actual + [nueva]}))
PY
)"
  respuesta="$(curl -s -m 30 -X PUT "$API/zones/$ZONA/rulesets/phases/http_request_dynamic_redirect/entrypoint" \
       -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       --data "$cuerpo")"
  # La respuesta se lee como JSON, no como texto: la API de reglas contesta con
  # sangría («"success": true», con espacio), y comprobar «"success":true» daba
  # por fallida una regla que sí se había creado.
  if printf '%s' "$respuesta" | python3 -c 'import json, sys
d = json.load(sys.stdin)
raise SystemExit(0 if d.get("success") else 1)' 2>/dev/null; then
    hecho "www.$DOMINIO → https://$DOMINIO (301)"
  else
    falta "no se pudo crear la redirección"
    nota "La API contestó: $(printf '%s' "$respuesta" | python3 -c 'import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print("respuesta ilegible"); raise SystemExit
errores = d.get("errors") or []
print(" · ".join(str(e.get("code")) + ": " + str(e.get("message")) for e in errores) if errores else "sin detalle")' 2>/dev/null)"
    nota "Si el motivo es de permisos: al token le falta «Zone → Single Redirect → Edit»."
    nota "Alternativa sin tocar el token: Cloudflare → Rules → Redirect Rules →"
    nota "  si el hostname es www.$DOMINIO → redirección dinámica a https://$DOMINIO (301)"
  fi
fi

echo
if [[ "$problemas" -gt 0 ]]; then
  echo "✗ Quedaron $problemas punto(s) pendientes."
  exit 1
fi
if [[ "$APLICAR" != "--aplicar" ]]; then
  echo "· Simulación terminada sin pendientes."
else
  echo "✓ Dominio configurado. Compruébalo desde fuera:"
  echo "    bash docs/comprobar-dominio.sh $DOMINIO"
fi
