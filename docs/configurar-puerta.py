#!/usr/bin/env python3
"""
docs/configurar-puerta.py — Poner la puerta (Cloudflare Access) a la app del taller.

Por qué existe: publicar en Cloudflare Pages deja la app abierta a cualquiera que
tenga la dirección. La puerta se pone en Zero Trust, y hacerlo a mano es fácil de
dejar a medias: una política sin aplicación no protege nada, y una aplicación sin
política **bloquea a todo el mundo** (Access niega por defecto).

Qué hace, en orden, y sin suponer nada:
  1. Comprueba que el token sirva.
  2. Busca el equipo de Zero Trust; si no existe, lo crea.
  3. Busca o crea una **política reutilizable** con los correos autorizados.
  4. Busca o crea la **aplicación** para el dominio, y le engancha la política.
  5. Verifica desde fuera que la puerta esté puesta (una petición sin sesión tiene
     que acabar en la pantalla de entrar, no en la app).

Uso:
  CLOUDFLARE_API_TOKEN=... python3 docs/configurar-puerta.py \\
      --dominio control-autos-maranatha.pages.dev \\
      --correos "yo@ejemplo.com,ella@ejemplo.com" [--equipo camena] [--aplicar]

Sin `--aplicar` no toca nada: solo dice qué haría.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"


def pedir(metodo, ruta, token, datos=None):
    """Una llamada a la API. Devuelve (código, cuerpo)."""
    cuerpo = json.dumps(datos).encode() if datos is not None else None
    req = urllib.request.Request(API + ruta, data=cuerpo, method=metodo, headers={
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "User-Agent": "camena-configurar-puerta/1.0",
    })
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        crudo = e.read().decode() or "{}"
        try:
            return e.code, json.loads(crudo)
        except json.JSONDecodeError:
            return e.code, {"raw": crudo[:300]}


def errores(cuerpo):
    return "; ".join(x.get("message", "?") for x in (cuerpo.get("errors") or [])) or "sin detalle"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dominio", required=True, help="dominio exacto de la app (sin https)")
    ap.add_argument("--correos", required=True, help="correos autorizados, separados por coma")
    ap.add_argument("--equipo", default="camena", help="nombre del equipo de Zero Trust (una sola vez)")
    ap.add_argument("--cuenta", default=os.environ.get("CLOUDFLARE_ACCOUNT_ID", ""))
    ap.add_argument("--aplicar", action="store_true", help="sin esto solo muestra qué haría")
    args = ap.parse_args()

    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not token:
        print("✗ Falta CLOUDFLARE_API_TOKEN. Crea un token con estos permisos:\n")
        print("   Cuenta → Access: Organizations, Identity Providers, and Groups → Edit")
        print("   Cuenta → Access: Apps and Policies → Edit")
        print("   Cuenta → Cloudflare Pages → Edit            (para el dominio propio)")
        print("   Zona   → DNS → Edit                          (para camena.mx)")
        print("   Zona   → Zone → Read                         (para encontrar la zona)\n")
        print("   Panel → My Profile → API Tokens → Create Token → Custom token.")
        return 2

    correos = [c.strip() for c in args.correos.split(",") if c.strip()]
    if not correos:
        print("✗ No hay correos: sin lista, la política no deja entrar a nadie.")
        return 2

    print("── 1 · ¿Sirve el token? ──────────────────────────────────────")
    codigo, cuerpo = pedir("GET", "/user/tokens/verify", token)
    if codigo != 200 or not cuerpo.get("success"):
        print(f"  ✗ El token no sirve ({codigo}): {errores(cuerpo)}")
        return 1
    print("  ✓ Token válido.")

    cuenta = args.cuenta
    if not cuenta:
        codigo, cuerpo = pedir("GET", "/accounts", token)
        cuentas = cuerpo.get("result") or []
        if codigo != 200 or not cuentas:
            print(f"  ✗ No pude leer la cuenta ({codigo}): {errores(cuerpo)}")
            return 1
        cuenta = cuentas[0]["id"]
        print(f"  Cuenta: {cuentas[0].get('name')} ({cuenta})")

    print("\n── 2 · El equipo de Zero Trust ───────────────────────────────")
    codigo, cuerpo = pedir("GET", f"/accounts/{cuenta}/access/organizations", token)
    if codigo == 200 and cuerpo.get("result"):
        equipo = cuerpo["result"].get("auth_domain")
        print(f"  ✓ Ya existe: {equipo}.cloudflareaccess.com")
    elif not args.aplicar:
        print(f"  Haría: crear el equipo «{args.equipo}» → {args.equipo}.cloudflareaccess.com")
        equipo = args.equipo
    else:
        codigo, cuerpo = pedir("POST", f"/accounts/{cuenta}/access/organizations", token,
                               {"name": args.equipo, "auth_domain": args.equipo})
        if codigo not in (200, 201):
            print(f"  ✗ No pude crear el equipo ({codigo}): {errores(cuerpo)}")
            print("    Si dice que el nombre ya está tomado, elige otro con --equipo.")
            return 1
        equipo = cuerpo["result"].get("auth_domain", args.equipo)
        print(f"  ✓ Equipo creado: {equipo}.cloudflareaccess.com")

    nombre_politica = "Entrar al sistema del taller"
    print("\n── 3 · La política con los correos autorizados ───────────────")
    politica = None
    codigo, cuerpo = pedir("GET", f"/accounts/{cuenta}/access/policies?per_page=100", token)
    for p in (cuerpo.get("result") or []):
        if p.get("name") == nombre_politica:
            politica = p
            break
    if politica:
        print(f"  ✓ Ya existe (id {politica['id']}); los correos se respetan tal como están.")
    elif not args.aplicar:
        print(f"  Haría: crear la política «{nombre_politica}» con: {', '.join(correos)}")
    else:
        codigo, cuerpo = pedir("POST", f"/accounts/{cuenta}/access/policies", token, {
            "name": nombre_politica,
            "decision": "allow",
            "include": [{"email": {"email": c}} for c in correos],
        })
        if codigo not in (200, 201):
            print(f"  ✗ No pude crear la política ({codigo}): {errores(cuerpo)}")
            return 1
        politica = cuerpo["result"]
        print(f"  ✓ Política creada (id {politica['id']}): {', '.join(correos)}")

    print("\n── 4 · La aplicación (la puerta del dominio) ─────────────────")
    app = None
    codigo, cuerpo = pedir("GET", f"/accounts/{cuenta}/access/apps?per_page=100", token)
    for a in (cuerpo.get("result") or []):
        if a.get("domain") == args.dominio:
            app = a
            break
    if app:
        print(f"  ✓ Ya existe la aplicación para {args.dominio} (id {app['id']})")
    elif not args.aplicar:
        print(f"  Haría: crear la aplicación self_hosted para {args.dominio}")
        print("         y engancharle la política de arriba. Sesión: 720 h (30 días).")
    else:
        datos = {
            "name": "Control de autos · Taller",
            "domain": args.dominio,
            "type": "self_hosted",
            "session_duration": "720h",
            "policies": [{"id": politica["id"]}] if politica else [],
        }
        codigo, cuerpo = pedir("POST", f"/accounts/{cuenta}/access/apps", token, datos)
        if codigo not in (200, 201) and datos["session_duration"]:
            # Algunas cuentas no aceptan esa duración: se reintenta con el valor por omisión.
            print(f"  … la sesión de 720 h no se aceptó ({errores(cuerpo)}); reintento sin ese campo")
            datos.pop("session_duration")
            codigo, cuerpo = pedir("POST", f"/accounts/{cuenta}/access/apps", token, datos)
        if codigo not in (200, 201):
            print(f"  ✗ No pude crear la aplicación ({codigo}): {errores(cuerpo)}")
            return 1
        app = cuerpo["result"]
        print(f"  ✓ Aplicación creada (id {app['id']}) con la política enganchada.")

    print("\n── 5 · ¿Está puesta la puerta? ───────────────────────────────")
    req = urllib.request.Request("https://" + args.dominio + "/", method="GET",
                                 headers={"User-Agent": "camena-configurar-puerta/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"  ✗ Respondió {r.status} y no redirige: la puerta NO está puesta.")
            print("    Revisa que la aplicación cubra este dominio exacto.")
            return 1
    except urllib.error.HTTPError as e:
        destino = e.headers.get("Location", "")
        if "cloudflareaccess.com" in destino or e.code in (302, 303, 403):
            print(f"  ✓ Pide entrar antes de mostrar la app ({e.code} → {destino[:70] or 'pantalla de Access'})")
        else:
            print(f"  ? Respondió {e.code} sin apuntar a Access: revísalo a mano.")
            return 1

    print("\n  Falta lo que no se puede automatizar:")
    print("   · Probar con un correo autorizado (llega un código de un solo uso).")
    print("   · Probar con uno que NO esté en la lista: debe quedar fuera.")
    print("   · Instalarla en el teléfono de la encargada y capturar un auto en modo avión.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
