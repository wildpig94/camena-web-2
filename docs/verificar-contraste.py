#!/usr/bin/env python3
"""
Verificador de contraste WCAG para la paleta de CAMENA 2.0.

Uso:  python3 docs/verificar-contraste.py

Regla: texto 4.5:1 · gráficos y bordes 3:1. Nada se elige "a ojo".
"""
import sys

# ── Paleta candidata ────────────────────────────────────────────
COLORES = {
    # Neutros
    "ink":       "#0E0E10",   # negro de tinta (fondos oscuros, texto)
    "ink-2":     "#17171A",   # negro elevado (superficies)
    "ink-3":     "#232327",   # superficie alta / bordes en oscuro
    "paper":     "#F6F3EA",   # hueso (fondo principal claro)
    "paper-2":   "#FCFAF5",   # blanco cálido (tarjetas)
    "linea":     "#DED8C8",   # línea suave sobre hueso
    "muted":     "#6B6759",   # texto atenuado sobre hueso
    "muted-osc": "#B5B1A8",   # texto atenuado sobre tinta
    # Marca
    "gold":      "#C9962B",   # oro de marca (acento, gráficos, texto grande en oscuro)
    "gold-lt":   "#E5BC55",   # oro claro (texto pequeño sobre tinta)
    "gold-tx":   "#7A560F",   # oro de texto sobre claro
}

PARES = [
    # (frente, fondo, mínimo, descripción)
    ("ink",       "paper",     4.5, "texto principal sobre hueso"),
    ("muted",     "paper",     4.5, "texto secundario sobre hueso"),
    ("ink",       "paper-2",   4.5, "texto sobre tarjeta"),
    ("muted",     "paper-2",   4.5, "texto secundario sobre tarjeta"),
    ("gold-tx",   "paper",     4.5, "acento como texto sobre hueso"),
    ("gold-tx",   "paper-2",   4.5, "acento como texto sobre tarjeta"),
    ("paper",     "ink",       4.5, "texto claro sobre tinta"),
    ("paper",     "ink-2",     4.5, "texto claro sobre superficie oscura"),
    ("muted-osc", "ink",       4.5, "texto atenuado sobre tinta"),
    ("gold-lt",   "ink",       4.5, "acento pequeño sobre tinta"),
    ("gold-lt",   "ink-2",     4.5, "acento pequeño sobre superficie oscura"),
    ("gold",      "ink",       3.0, "acento gráfico sobre tinta"),
    ("gold",      "ink-2",     3.0, "acento gráfico sobre superficie oscura"),
    # Sobre claro el oro de marca NO puede llevar información: solo filetes y
    # marcos decorativos de 1px, que se rigen por el mínimo decorativo (1.2).
    # Cualquier marca con significado sobre hueso usa --gold-tx (5.98:1).
    ("gold",      "paper",     1.2, "filete decorativo 1px sobre hueso"),
    ("ink-3",     "ink",       1.2, "borde sobre tinta (decorativo)"),
    ("linea",     "paper",     1.2, "línea sobre hueso (decorativa)"),
]


def srgb(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(hexcol):
    h = hexcol.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def main():
    fallos = 0
    print(f"{'frente':10} {'fondo':10} {'ratio':>7}  {'min':>4}  ok   descripción")
    print("─" * 78)
    for fg, bg, minimo, desc in PARES:
        r = ratio(COLORES[fg], COLORES[bg])
        ok = r >= minimo
        if not ok:
            fallos += 1
        # AAA para texto normal
        marca = "AAA" if r >= 7 and minimo >= 4.5 else ""
        print(f"{fg:10} {bg:10} {r:6.2f}:1  {minimo:4.1f}  "
              f"{'✓' if ok else '✗':3}  {desc} {marca}")
    print("─" * 78)
    if fallos:
        print(f"✗ {fallos} par(es) por debajo del mínimo. Corrige antes de seguir.")
        return 1
    print("✓ Todos los pares cumplen WCAG AA.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
