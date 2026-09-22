#!/usr/bin/env python3
"""Sirve el sitio en local como lo sirve Cloudflare Pages.

    python3 docs/servir-en-local.py [puerto] [carpeta]

Por qué existe: `python3 -m http.server` no entiende las direcciones limpias que
el sitio usa en todos sus enlaces (`/servicios`, `/como-trabajamos`,
`/proyectos`). Con ese comando, cualquier enlace del menú da 404 en local aunque
en el dominio funcione: el dueño lo reportó el 21 de septiembre creyendo que la
página de proyectos estaba rota, y no lo estaba — era el servidor de pruebas.

Cloudflare Pages sirve `/proyectos` desde `proyectos.html` y redirige la versión
con extensión. Aquí se hace lo mismo, para que lo que se prueba en local sea lo
que se publica.
"""
import http.server, os, socketserver, sys, urllib.parse

RAIZ = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), ".."))
PUERTO = int(sys.argv[1] if len(sys.argv) > 1 else 8899)


class Manejador(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=RAIZ, **kwargs)

    def traducir(self, ruta):
        """La ruta limpia se resuelve contra su archivo .html, como en Pages."""
        limpia = urllib.parse.urlparse(ruta).path
        if limpia.endswith("/"):
            limpia += "index.html"
        candidatos = [limpia.lstrip("/")]
        if not limpia.endswith(".html"):
            candidatos.append(limpia.lstrip("/") + ".html")
            candidatos.append(limpia.lstrip("/") + "/index.html")
        for c in candidatos:
            if c and os.path.isfile(os.path.join(RAIZ, c)):
                return "/" + c
        return ruta

    def do_GET(self):
        self.path = self.traducir(self.path)
        return super().do_GET()

    def do_HEAD(self):
        self.path = self.traducir(self.path)
        return super().do_HEAD()

    def log_message(self, formato, *args):
        # Sin ruido: solo los 404, que son los que interesan al revisar.
        if args and str(args[1]).startswith("4"):
            sys.stderr.write("  404 · %s\n" % args[0])


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with Servidor(("127.0.0.1", PUERTO), Manejador) as httpd:
        print(f"  sitio servido desde {RAIZ}")
        print(f"  http://127.0.0.1:{PUERTO}/   (direcciones limpias, como Cloudflare)")
        httpd.serve_forever()
