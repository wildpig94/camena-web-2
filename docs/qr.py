#!/usr/bin/env python3
"""docs/qr.py — Hace el código QR que lleva a CAMENA.

    python3 docs/qr.py                       → docs/qr/camena-qr.png (1080×1080)
    python3 docs/qr.py --url ... --salida ... --lado 2048

**A dónde lleva.** Al enlace corto `https://camena.com.mx/qr`, no a la portada
directamente. Es a propósito: la regla que resuelve ese enlace vive en Cloudflare
(Rules → Redirect Rules, fase `http_request_dynamic_redirect`) y hoy manda a la
portada. Si algún día conviene que el QR lleve a otra parte —el diagnóstico, un
número de WhatsApp, una campaña— se cambia la regla y **todo el material que ya
está en la calle sigue sirviendo**: la dirección del código no se toca.

**Por qué se ve así.** Módulos oscuros (`#111111`) sobre fondo claro (`#F7F6F3`,
los tokens de la casa) y zona de silencio de cuatro módulos exactos, que es el
mínimo que pide la especificación y lo que hace que un lector lo agarre a la
primera. Nada de invertirlo —claro sobre oscuro— ni de apretar el margen: eso es
lo que produce códigos que «a veces sí leen». La corrección de errores va en Q,
que aguanta que WhatsApp o Instagram recompriman la imagen. Y va solo el código,
sin nombre ni frase alrededor.

**Por qué se verifica solo.** Un QR que no se puede leer es un QR que no sirve, y
a ojo no se sabe: hace falta un lector. Este script, después de dibujarlo, lo
vuelve a abrir y lo decodifica con OpenCV; si lo que lee no es exactamente la
dirección, borra el archivo y sale con error. Así lo que se publique ya se probó.
"""
import argparse
import pathlib
import sys

import qrcode
from PIL import Image

PAPEL = "#F7F6F3"   # --paper
TINTA = "#111111"   # --texto
DIRECCION = "https://camena.com.mx/qr"
SALIDA = "docs/qr/camena-qr.png"
LADO = 1080         # cuadrado, el tamaño con el que trabajan las redes
SILENCIO = 4        # módulos de zona de silencio: el mínimo de la especificación


def dibujar(direccion, lado, salida):
    codigo = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q,
                           border=SILENCIO, box_size=1)
    codigo.add_data(direccion)
    codigo.make(fit=True)
    modulos = codigo.modules_count + 2 * SILENCIO

    # El lado de cada módulo se elige entero para que ningún borde se difumine:
    # un QR reescalado con interpolación es un QR que a veces no lee. El margen
    # que sobra se reparte alrededor y agranda la zona de silencio, nunca la come.
    por_modulo = lado // modulos
    if por_modulo < 3:
        raise SystemExit(f"Con {lado} px no caben {modulos} módulos con holgura.")
    codigo.box_size = por_modulo
    imagen = codigo.make_image(fill_color=TINTA, back_color=PAPEL).convert("RGB")
    ancho = modulos * por_modulo

    lienzo = Image.new("RGB", (lado, lado), PAPEL)
    hueco = (lado - ancho) // 2
    lienzo.paste(imagen, (hueco, hueco))

    ruta = pathlib.Path(salida)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    lienzo.save(ruta, "PNG", optimize=True)
    return ruta, modulos, por_modulo, hueco


def verificar(ruta, esperado):
    """Lo lee con un lector de verdad. Si no coincide, el archivo no se queda."""
    import cv2
    leido, _puntos, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread(str(ruta)))
    if leido.strip() != esperado:
        ruta.unlink(missing_ok=True)
        raise SystemExit(f"✗ El QR no se lee bien: dice «{leido.strip()}» y debía decir «{esperado}»."
                         "\n  Se borró el archivo: no se publica un QR que no se puede comprobar.")
    return leido.strip()


def main():
    p = argparse.ArgumentParser(description="Genera y verifica el QR de CAMENA.")
    p.add_argument("--url", default=DIRECCION)
    p.add_argument("--salida", default=SALIDA)
    p.add_argument("--lado", type=int, default=LADO)
    a = p.parse_args()

    ruta, modulos, por_modulo, hueco = dibujar(a.url, a.lado, a.salida)
    leido = verificar(ruta, a.url)
    kb = ruta.stat().st_size / 1024
    # El silencio de verdad es el borde que dibuja el propio código más lo que
    # sobra del lienzo: informar solo del sobrante diría «0.1 módulos» y haría
    # pensar que el margen no existe.
    silencio_px = SILENCIO * por_modulo + hueco
    print(f"  ✓ {ruta}  ({a.lado}×{a.lado} px, {kb:.1f} KB)")
    print(f"    {modulos} módulos contando el silencio · {por_modulo} px por módulo")
    print(f"    zona de silencio: {silencio_px} px por lado ({silencio_px / por_modulo:.1f} módulos,"
          f" el mínimo son {SILENCIO})")
    print(f"    leído por el lector: {leido}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
