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
import os
import re
import sys

# ── Paleta vigente (debe espejar css/variables.css) ─────────────
C = {
    # Neutros claros
    "paper":         "#F7F6F3",
    "paper-2":       "#FCFBF9",
    "texto":         "#111111",
    "texto-2":       "#5C5C58",
    "linea":         "#E3E1DB",
    "borde-fuerte":  "#6F6F69",
    # Neutros oscuros
    "ink":           "#111111",
    "ink-2":         "#181818",
    "ink-3":         "#2B2B2B",
    "ink-4":         "#757570",
    "texto-claro":   "#F4F3F0",
    "texto-claro-2": "#A8A8A2",
    # Tres familias de acento, con su trabajo asignado
    "oro":           "#A8821F",   # acento principal: marca, precios, CTA
    "oro-lt":        "#E8C766",
    "oro-tx":        "#8A6A0F",
    "rojo":          "#B23A2E",   # línea fija del titular del hero
    "rojo-lt":       "#D0614F",
    "magenta":       "#D6247A",   # acento del eje de sistemas
    "magenta-lt":    "#F472B6",
    "magenta-tx":    "#A81B5A",
    # Fondos con color y sus acentos
    "oro-fondo":       "#F5EFDF",
    "oro-fondo-suave": "#F4EEE0",
    "oro-fuerte":      "#6F550B",
    "verde-fondo":     "#EFF4F0",
    "verde":         "#0E9F6E",   # estado
    "verde-lt":      "#A9C46C",
    "verde-tx":      "#0A6B4C",
}

# (frente, fondo, mínimo, descripción)
P = [
    # ── Texto sobre superficies claras ──
    ("texto",        "paper",    4.5, "texto sobre hueso"),
    ("texto-2",      "paper",    4.5, "texto secundario sobre hueso"),
    ("texto",        "paper-2",  4.5, "texto sobre tarjeta"),
    ("texto-2",      "paper-2",  4.5, "texto secundario sobre tarjeta"),
    ("verde-tx",       "paper",    4.5, "acento de TEXTO sobre hueso"),
    ("verde-tx",       "paper-2",  4.5, "acento de TEXTO sobre tarjeta"),
    # ── Texto sobre superficies oscuras ──
    ("texto-claro",   "ink",     4.5, "texto claro sobre tinta"),
    ("texto-claro",   "ink-2",   4.5, "texto claro sobre superficie"),
    ("texto-claro-2", "ink",     4.5, "texto atenuado sobre tinta"),
    ("texto-claro-2", "ink-2",   4.5, "texto atenuado sobre superficie"),
    ("rojo-lt",         "ink",     4.5, "línea fija del titular sobre tinta"),
    ("rojo",            "paper",   4.5, "rojo de texto sobre hueso"),
    ("rojo",            "paper-2", 4.5, "rojo de texto sobre tarjeta"),
    ("rojo",            "ink",     3.0, "rojo gráfico sobre tinta"),
    ("verde-lt",        "ink",     4.5, "acento de texto sobre tinta"),
    ("verde-lt",        "ink-2",   4.5, "acento de texto sobre superficie"),
    # ── Gráficos ──
    ("verde",           "ink",     3.0, "acento gráfico sobre tinta"),
    ("verde",           "ink-2",   3.0, "acento gráfico sobre superficie"),
    # ── Controles: un borde de botón es interfaz y exige 3:1 ──
    ("borde-fuerte",  "paper",   3.0, "borde de control sobre hueso"),
    ("borde-fuerte",  "paper-2", 3.0, "borde de control sobre tarjeta"),
    ("ink-4",         "ink",     3.0, "borde de control sobre tinta"),
    ("ink-4",         "ink-2",   3.0, "borde de control sobre superficie"),
    # ── Filetes decorativos de 1 px: no comunican información ──
    # ── Las otras dos familias de acento, con el mismo rasero ──
    ("magenta-tx",     "paper",   4.5, "acento de sistemas sobre hueso"),
    ("magenta-tx",     "paper-2", 4.5, "acento de sistemas sobre tarjeta"),
    ("magenta-lt",     "ink",     4.5, "acento de sistemas sobre tinta"),
    ("magenta-lt",     "ink-2",   4.5, "acento de sistemas sobre superficie"),
    ("magenta",        "ink",     3.0, "gráfico de sistemas sobre tinta"),
    ("magenta",        "paper",   3.0, "gráfico de sistemas sobre hueso"),
    ("verde",          "paper",   3.0, "punto de estado y acento gráfico sobre hueso"),
    ("linea",         "paper",   1.2, "línea divisoria sobre hueso"),
    ("ink-3",         "ink",     1.2, "línea divisoria sobre tinta"),
    # ── Fondos con color: el mismo rasero para texto y acento ──
    ("texto",      "oro-fondo",       4.5, "texto sobre el fondo oro del hero"),
    ("texto-2",    "oro-fondo",       4.5, "texto secundario sobre fondo oro"),
    ("oro-fuerte", "oro-fondo",       4.5, "acento del hero sobre su fondo oro"),
    ("verde-tx",   "oro-fondo",       3.0, "punto de estado sobre el fondo oro"),
    ("texto",      "oro-fondo-suave", 4.5, "texto sobre tarjeta de marca"),
    ("texto-2",    "oro-fondo-suave", 4.5, "texto secundario sobre tarjeta de marca"),
    ("oro-fuerte", "oro-fondo-suave", 4.5, "acento sobre tarjeta de marca"),
    ("texto",      "verde-fondo",     4.5, "texto sobre tarjeta de presencia"),
    ("texto-2",    "verde-fondo",     4.5, "texto secundario sobre tarjeta de presencia"),
    ("verde-tx",   "verde-fondo",     4.5, "acento sobre tarjeta de presencia"),
    ("verde",      "verde-fondo",     3.0, "filete de la tarjeta de presencia"),
]


def tokens_del_css():
    """Lee los tokens de color de css/variables.css, para no medir colores muertos."""
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ruta = os.path.join(raiz, "css", "variables.css")
    with open(ruta, encoding="utf-8") as f:
        texto = f.read()
    return {m.group(1): m.group(2).upper()
            for m in re.finditer(r"--([a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})", texto)}


def revisar_paleta():
    """La paleta de aquí contra la del sitio. Devuelve la lista de problemas."""
    tokens = tokens_del_css()
    problemas = []
    for nombre, hexa in sorted(C.items()):
        if nombre not in tokens:
            problemas.append(f"«{nombre}» no existe como token en css/variables.css")
        elif tokens[nombre] != hexa.upper():
            problemas.append(f"«{nombre}»: aquí {hexa.upper()}, en el sitio {tokens[nombre]}")
    for fg, bg, _, desc in P:
        for nombre in (fg, bg):
            if nombre not in C:
                problemas.append(f"el par «{desc}» usa «{nombre}», que no está en la paleta")
    return problemas


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
    problemas = revisar_paleta()
    if problemas:
        print("✗ La paleta de este archivo ya no espeja css/variables.css:\n")
        for p in problemas:
            print(f"   · {p}")
        print("\n  Un verificador desincronizado pasa en verde midiendo colores que el")
        print("  sitio ya no usa. Arréglalo antes de creerle al resto del informe.\n")
        return 1
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
