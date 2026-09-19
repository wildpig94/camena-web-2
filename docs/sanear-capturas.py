#!/usr/bin/env python3
"""
docs/sanear-capturas.py — Tapa los datos de terceros que quedaron en las capturas.

Por qué existe: las capturas del sistema del taller que están publicadas en el
sitio se tomaron del sistema funcionando, con coches de verdad: placas y folios de
siniestro de clientes del taller. La página dice, con razón, que son capturas de
uso real, así que el dato real se queda, pero lo que identifica a un tercero se
tapa: la placa y el folio.

Cómo lo hace: recibe las cajas (en píxeles de la imagen original) donde está cada
dato, toma el color de fondo alrededor de la caja y pinta un rectángulo de ese
color. No inventa el fondo ni lo difumina: lo copia de la propia captura.

Uso:
    python3 docs/sanear-capturas.py cajas.json            # simula y avisa
    python3 docs/sanear-capturas.py cajas.json --escribir # escribe de verdad

El JSON es una lista de objetos:
    [{"archivo": "assets/producto/autos-tablero.webp",
      "texto": "PBC-482-A",
      "x": 300, "y": 480, "ancho": 140, "alto": 34}, ...]

Después de escribir, conviene comprobar con OCR que los datos ya no se lean.
"""
import json
import pathlib
import sys

import numpy as np
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MARGEN = 6  # píxeles de más alrededor de la caja, para no dejar medio glifo


def sanear(ruta, cajas, escribir):
    im = Image.open(ruta).convert("RGB")
    a = np.array(im)
    cambios = 0
    for c in cajas:
        x0 = max(0, int(c["x"]) - MARGEN)
        y0 = max(0, int(c["y"]) - MARGEN)
        x1 = min(a.shape[1], int(c["x"]) + int(c["ancho"]) + MARGEN)
        y1 = min(a.shape[0], int(c["y"]) + int(c["alto"]) + MARGEN)
        # El color de fondo se toma de un marco por fuera de la caja: es el color
        # de la tarjeta, así que el hueco queda como si el dato no estuviera.
        marco = np.concatenate([
            a[max(0, y0 - 14):y0, x0:x1].reshape(-1, 3),
            a[y1:y1 + 14, x0:x1].reshape(-1, 3),
            a[y0:y1, max(0, x0 - 14):x0].reshape(-1, 3),
            a[y0:y1, x1:x1 + 14].reshape(-1, 3),
        ])
        color = np.median(marco, axis=0) if marco.size else np.array([0, 0, 0])
        a[y0:y1, x0:x1] = color
        cambios += (y1 - y0) * (x1 - x0)
        print(f"    «{c['texto']}» en ({x0},{y0})-({x1},{y1}) tapado con rgb({int(color[0])},{int(color[1])},{int(color[2])})")
    pct = 100 * cambios / (a.shape[0] * a.shape[1])
    print(f"    se tapa {pct:.2f}% de la imagen")
    if pct > 6:
        print("    ✗ es demasiada superficie: revisa las cajas antes de escribir")
        return False
    if escribir:
        Image.fromarray(a).save(ruta, "WEBP", quality=88, method=6)
        print(f"    escrito {ruta}")
    return True


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    cajas = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    escribir = "--escribir" in sys.argv
    por_archivo = {}
    for c in cajas:
        por_archivo.setdefault(c["archivo"], []).append(c)
    ok = True
    for archivo, lista in por_archivo.items():
        ruta = RAIZ / archivo
        print(f"  ── {archivo} ({len(lista)} datos) ──")
        ok = sanear(ruta, lista, escribir) and ok
    if not escribir:
        print("\n  (simulación: no se escribió nada. Agrega --escribir para hacerlo)")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
