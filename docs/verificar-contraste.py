#!/usr/bin/env python3
"""
Verificador de contraste WCAG para la paleta de CAMENA.

Uso:  python3 docs/verificar-contraste.py

Reglas:
  · texto normal ....... 4.5:1
  · texto grande ....... 3:1
  · controles y bordes . 3:1   (un botón de contorno es interfaz, no adorno)
  · filetes decorativos  1.2:1 (una línea de 1 px que no comunica nada)

IMPORTANTE: estos valores deben coincidir con css/variables.css. Si se cambia
un token allá y no aquí, el verificador pasa en verde midiendo colores que el
sitio ya no usa. Eso ya ocurrió una vez y dejó entrar dos fallos reales: el
acento claro sobre hueso (1.63:1) y el borde de los botones de contorno.
"""
import sys

# ── Paleta vigente (debe espejar css/variables.css) ─────────────
C = {
    # Neutros claros
    "paper":         "#F8F3E8",
    "paper-2":       "#FDFAF3",
    "texto":         "#16130D",
    "texto-2":       "#6B6759",
    "linea":         "#E0D5C0",
    "borde-fuerte":  "#8A7D62",
    # Neutros oscuros
    "ink":           "#191510",
    "ink-2":         "#201B14",
    "ink-3":         "#312A22",
    "ink-4":         "#7A6340",
    "texto-claro":   "#F4F1E8",
    "texto-claro-2": "#B5B1A8",
    # Marca
    "oro":           "#C9962B",
    "oro-lt":        "#E5BC55",
    "oro-tx":        "#7A560F",
}

# (frente, fondo, mínimo, descripción)
P = [
    # ── Texto sobre superficies claras ──
    ("texto",        "paper",    4.5, "texto sobre hueso"),
    ("texto-2",      "paper",    4.5, "texto secundario sobre hueso"),
    ("texto",        "paper-2",  4.5, "texto sobre tarjeta"),
    ("texto-2",      "paper-2",  4.5, "texto secundario sobre tarjeta"),
    ("oro-tx",       "paper",    4.5, "acento de TEXTO sobre hueso"),
    ("oro-tx",       "paper-2",  4.5, "acento de TEXTO sobre tarjeta"),
    # ── Texto sobre superficies oscuras ──
    ("texto-claro",   "ink",     4.5, "texto claro sobre tinta"),
    ("texto-claro",   "ink-2",   4.5, "texto claro sobre superficie"),
    ("texto-claro-2", "ink",     4.5, "texto atenuado sobre tinta"),
    ("texto-claro-2", "ink-2",   4.5, "texto atenuado sobre superficie"),
    ("oro-lt",        "ink",     4.5, "acento de texto sobre tinta"),
    ("oro-lt",        "ink-2",   4.5, "acento de texto sobre superficie"),
    # ── Gráficos ──
    ("oro",           "ink",     3.0, "acento gráfico sobre tinta"),
    ("oro",           "ink-2",   3.0, "acento gráfico sobre superficie"),
    # ── Controles: un borde de botón es interfaz y exige 3:1 ──
    ("borde-fuerte",  "paper",   3.0, "borde de control sobre hueso"),
    ("borde-fuerte",  "paper-2", 3.0, "borde de control sobre tarjeta"),
    ("ink-4",         "ink",     3.0, "borde de control sobre tinta"),
    ("ink-4",         "ink-2",   3.0, "borde de control sobre superficie"),
    # ── Filetes decorativos de 1 px: no comunican información ──
    ("oro",           "paper",   1.2, "filete decorativo sobre hueso"),
    ("linea",         "paper",   1.2, "línea divisoria sobre hueso"),
    ("ink-3",         "ink",     1.2, "línea divisoria sobre tinta"),
]


def srgb(v):
    v /= 255
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4


def lum(hx):
    hx = hx.lstrip("#")
    r, g, b = (int(hx[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)


def ratio(a, b):
    la, lb = lum(C[a]), lum(C[b])
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def main():
    fallos = []
    print(f"{'frente':15} {'fondo':9} {'ratio':>8} {'mín':>5}  ok   descripción")
    print("─" * 84)
    for fg, bg, minimo, desc in P:
        r = ratio(fg, bg)
        ok = r >= minimo
        if not ok:
            fallos.append((fg, bg, r, minimo, desc))
        marca = "AAA" if r >= 7 and minimo >= 4.5 else ""
        print(f"{fg:15} {bg:9} {r:6.2f}:1 {minimo:5.1f}  {'✓' if ok else '✗':3}  {desc} {marca}")
    print("─" * 84)

    if fallos:
        print(f"\n✗ {len(fallos)} par(es) por debajo del mínimo:\n")
        for fg, bg, r, minimo, desc in fallos:
            print(f"   {desc}: {C[fg]} sobre {C[bg]} = {r:.2f}:1 (mínimo {minimo})")
        print("\n   Ajusta el token en css/variables.css Y aquí: los dos deben coincidir.")
        return 1

    print("✓ Todos los pares cumplen WCAG AA, controles incluidos.")
    print("\nRecuerda: si cambias un token en css/variables.css, cámbialo también aquí.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
