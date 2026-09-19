#!/usr/bin/env python3
"""
docs/redes/medir.py — Mide las piezas ya generadas, píxel a píxel.

Por qué existe: el generador comprueba lo que el navegador sabe de sí mismo
(contraste declarado, alto, ancho de cada renglón). Esto comprueba lo que de
verdad quedó pintado en el PNG, que es otra cosa: cuánta tinta hay, dónde está el
vacío, en qué margen cae la primera y la última marca, y si el texto arrastra
franjas de color por el antialiasing de subpíxel (lo que al reescalarlo la red
social se convierte en halos de color).

Uso:
    python3 docs/redes/medir.py                       # mide la carpeta salida/
    python3 docs/redes/medir.py ruta/a/otra/carpeta   # mide otra carpeta

No adivina: cuenta píxeles. Sirve para comparar dos versiones de la plantilla
antes de decidir cuál se publica.
"""
import collections
import pathlib
import sys

import numpy as np
from PIL import Image

# El fondo de la casa, para saber si una pieza salió con el tema que le tocaba.
PAPEL = {"oscuro": (0x11, 0x11, 0x11), "claro": (0xF7, 0xF6, 0xF3)}


def analizar(ruta):
    im = Image.open(ruta).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    alto, ancho = a.shape[:2]
    tema = ruta.name.split("-")[1]

    # La tinta es todo lo que se aparta del fondo. El fondo se mide en la orilla.
    fondo = np.array(PAPEL[tema], dtype=np.int16)
    gris = a.mean(axis=2)
    tinta = np.abs(a - fondo).max(axis=2) > 14
    por_renglon = tinta.sum(axis=1)

    con_tinta = np.flatnonzero(por_renglon > 2)
    if con_tinta.size == 0:
        return None
    arriba, abajo = int(con_tinta[0]), int(con_tinta[-1])

    # El hueco más grande y dónde empieza: es el aire que se acumula en algún lado.
    vacios = np.flatnonzero(por_renglon[arriba:abajo + 1] <= 2)
    hueco, desde = 0, 0
    if vacios.size:
        for tramo in np.split(vacios, np.flatnonzero(np.diff(vacios) > 1) + 1):
            if len(tramo) > hueco:
                hueco, desde = len(tramo), int(tramo[0] + arriba)

    # Franjas de color: en un texto gris sobre fondo gris, R y B tienen que ir
    # casi iguales. Si se separan, el antialiasing de subpíxel metió color.
    tinta_px = a[tinta]
    franja = np.abs(tinta_px[:, 0] - tinta_px[:, 2]) if tinta_px.size else np.array([0])
    # Dónde está la tinta a lo ancho y en qué renglones, para saber si algo se sale.
    cols = np.flatnonzero(tinta.any(axis=0))

    return {
        "archivo": ruta.name,
        "tamano": (ancho, alto),
        "esquinas_ok": all(tuple(a[y, x]) == PAPEL[tema] for y, x in ((2, 2), (2, ancho - 3), (alto - 3, 2), (alto - 3, ancho - 3))),
        "tinta_pct": 100 * tinta.mean(),
        "margen_sup": arriba,
        "margen_inf": alto - 1 - abajo,
        "margen_izq": int(cols[0]),
        "margen_der": ancho - 1 - int(cols[-1]),
        "hueco": hueco,
        "hueco_desde": desde,
        "franja_max": int(franja.max()),
        "franja_pct": 100 * float((franja > 30).mean()),
    }


def resumen(carpeta, patron, etiqueta):
    filas = [f for f in (analizar(p) for p in sorted(carpeta.glob(patron))) if f]
    if not filas:
        print(f"  (no hay piezas que empiecen por {patron})")
        return []
    print(f"  ── {etiqueta}: {len(filas)} piezas ──")
    def rango(clave):
        v = [f[clave] for f in filas]
        return f"{min(v)}–{max(v)}"
    print(f"    márgenes: arriba {rango('margen_sup')} · abajo {rango('margen_inf')} · izquierda {rango('margen_izq')} · derecha {rango('margen_der')} px")
    print(f"    tinta: {min(f['tinta_pct'] for f in filas):.1f}–{max(f['tinta_pct'] for f in filas):.1f}% de la pieza")
    print(f"    hueco mayor en medio: {rango('hueco')} px")
    print(f"    franjas de color (|R-B|): máximo {rango('franja_max')} · píxeles por encima de 30: {min(f['franja_pct'] for f in filas):.1f}–{max(f['franja_pct'] for f in filas):.1f}%")
    malas = [f["archivo"] for f in filas if not f["esquinas_ok"]]
    print(f"    fondo de la casa en las cuatro esquinas: {'✗ ' + ', '.join(malas) if malas else '✓ las ' + str(len(filas))}")
    return filas


def main():
    carpeta = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else
                           pathlib.Path(__file__).parent / "salida")
    print(f"\n  Midiendo {carpeta}\n")
    muro = resumen(carpeta, "*-feed.png", "piezas del muro (1080×1350)")
    historia = resumen(carpeta, "*-historia.png", "historias (1080×1920)")

    # El hueco más grande de cada pieza, para ver si el aire se acumula siempre igual.
    if muro:
        print("\n  · Aire muerto por pieza (el hueco más grande dentro de la mancha):")
        for f in sorted(muro, key=lambda x: -x["hueco"])[:5]:
            print(f"      {f['archivo']:<24} {f['hueco']:>4} px desde y={f['hueco_desde']}")
    if historia:
        peor = max(historia, key=lambda x: x["hueco"])
        print(f"  · La historia más aireada: {peor['archivo']} con {peor['hueco']} px de hueco en un lienzo de {peor['tamano'][1]}")
    print()


if __name__ == "__main__":
    main()
