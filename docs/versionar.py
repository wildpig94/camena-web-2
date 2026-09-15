#!/usr/bin/env python3
"""docs/versionar.py — Pone la versión de CSS y JS en las URLs.

    python3 docs/versionar.py [carpeta]

Por qué existe: el navegador guarda el CSS y el JS. Cuando se cambia el diseño,
el dueño abre la página en el celular y sigue viendo la versión vieja —o peor,
una mezcla de las dos— y parece que el trabajo no se hizo. Poner la huella del
contenido en la URL (`css/layout.css?v=17364851`) obliga al navegador a bajar el
archivo nuevo, y solo cuando de verdad cambió: si el archivo es el mismo, la
dirección es la misma y el caché se sigue usando.

La huella se calcula del contenido, no se escribe a mano. Así no hay que
acordarse de subir un número.

Se corre solo en la copia que se publica (ver .github/workflows/publicar.yml),
pero también sirve a mano: `python3 docs/versionar.py` sella el repo tal cual.
"""
import hashlib
import pathlib
import re
import sys

RAIZ = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
PAGINAS = [
    "index.html",
    "servicios.html",
    "como-trabajamos.html",
    "aviso-de-privacidad.html",
    "terminos.html",
    "producto/control-de-autos.html",
]

# Solo los archivos propios de los que el navegador se guarda copia. El `?v=`
# que ya estuviera se consume, para poder volver a sellar sin duplicarlo.
PATRON = re.compile(r'(href|src)="((?:\.\./)?(?:css|js)/[^"?]+)(?:\?v=[0-9a-f]+)?"')


def huella(archivo: pathlib.Path) -> str:
    return hashlib.sha256(archivo.read_bytes()).hexdigest()[:8]


def main() -> int:
    selladas = 0
    faltantes = []
    for pagina in PAGINAS:
        ruta = RAIZ / pagina
        if not ruta.exists():
            continue
        texto = ruta.read_text(encoding="utf-8")

        def sustituir(m):
            nonlocal selladas
            atributo, referencia = m.group(1), m.group(2)
            archivo = (ruta.parent / referencia).resolve()
            if not archivo.exists():
                faltantes.append(f"{pagina} → {referencia}")
                return m.group(0)
            selladas += 1
            return f'{atributo}="{referencia}?v={huella(archivo)}"'

        nuevo = PATRON.sub(sustituir, texto)
        if nuevo != texto:
            ruta.write_text(nuevo, encoding="utf-8")

    print(f"✓ {selladas} referencias selladas en {RAIZ}")
    if faltantes:
        print("✗ referencias que no existen:")
        for f in faltantes:
            print("   " + f)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
