# Investigación: cómo opera un taller de hojalatería y pintura

**Fuente:** 13 notas de voz de la encargada de un taller (≈4.7 minutos), respondiendo
10 preguntas. Transcritas en esta máquina con `faster-whisper` (modelo `small`, español),
sin subir el audio a ningún servicio.

**Uso:** documento de trabajo interno. **No se publica** (`docs/` queda fuera del
despliegue) y cita palabras de una persona identificable: si algo de esto se va a
mostrar a un cliente o a otro taller, primero hay que anonimizarlo y pedir permiso.

---

## 1 · Cómo son sus números, en su voz

| Tema | Lo que dijo |
|---|---|
| Autos al mismo tiempo | «de atender al mismo tiempo son **tres carros**» |
| Tiempo de estancia | «puede ser de **un mes hasta tres, cuatro meses** dependiendo de lo complejo que sea el vehículo» |
| Quién usa la herramienta | «**solo yo** utilizo el puro teléfono… yo soy la única persona que podría utilizar todas las herramientas» |
| Dispositivo | **puro teléfono**. No tablet, no computadora en el piso |

Tres coches y hasta cuatro meses de estancia significa que el problema no es el
volumen: es que **cada coche vive seis o siete etapas y varias aseguradoras
distintas en paralelo**, y todo eso se sostiene con la memoria de una persona.

---

## 2 · Dolor por dolor, con la cita que lo prueba

### D1 · No existe el registro de entrada (el más grave por lo que arrastra)

> «cada siniestro llega con un **volante de admisión**, ahí tiene la fecha del
> siniestro, más no… **nosotros no anotamos en un lugar** "tal día llegó el carro",
> nos basamos más que nada en **las fotos**»
>
> «no anotamos los datos del cliente en algún lugar… **no registramos todos los
> clientes**, o sea, muchos clientes **yo no los tengo registrados, sus números**»

**Qué significa:** el expediente del auto vive en el papel que trae la aseguradora
y en el teléfono de ella. No hay una ficha propia con fecha de entrada, cliente,
daños y estado. Todo lo demás (cobros, seguimiento, cotizaciones) cuelga de ahí:
**si no hay registro de entrada, no hay nada que ligar después.**

### D2 · Las fotos existen, pero sueltas en carpetas

> «tenemos una **carpeta para cada siniestro** de cada aseguradora… guardamos los
> predocumentos, **fotos de ingreso, fotos de avance y fotos de salida**»
>
> «al recibir tenemos que tomar fotos de todo, desde el principio **antes de
> desarmar**, cuando se está desarmando, porque… hay **daño oculto**»

**Qué significa:** la disciplina de evidencia ya existe y es buena. El problema es
el **traslado manual**: bajar del teléfono, ordenar por carpeta, y que esa carpeta
no esté ligada a la ficha del auto ni a la cotización ni al cobro.

### D3 · No hay lista de precios: el precio es una persona

> «yo **no veo nada** de cotizaciones… no tengo nada en el sentido de costos
> cuando son **particulares**… **no tenemos una lista**, no tenemos algo, **él da el
> precio**»
>
> «con las **aseguradoras** yo solamente pongo **piezas que necesito cambiar** o
> piezas que vea que se van a reparar. Es lo único: **yo no les pongo precio, no
> les pongo cantidades**»

**Qué significa:** dos cotizaciones distintas y ninguna vive en un sistema. La de
particular depende de que el dueño esté disponible; la de aseguradora es una lista
de piezas sin precio ni cantidad. **El taller no puede cotizar sin el dueño.**

### D4 · Facturas y complementos en un Excel por mes

> «en lo de los pagos de cada aseguradora llevamos **un Excel por mes**, donde
> ponemos el **nombre del siniestro, el nombre del carro, la fecha en la que se
> timbra la factura, la cantidad de la factura** y la fecha en la que hacemos
> **complemento de pago**… ahí sí **yo siento que falta organización**»

**Qué significa:** el control existe y es manual, mes por mes, en hojas separadas.
Para saber si un siniestro ya se cobró hay que buscar en el Excel del mes
correspondiente.

### D5 · No puede ver lo que ya se pagó

> «**yo no puedo llevar un control de lo que ya se pagó**. En algunos seguros sí
> puedo ver, pero **no mucho porque no tengo acceso a la cuenta**»

**Qué significa:** la cobranza depende de la plataforma de cada aseguradora, y ella
no tiene acceso. No hay una vista propia de «facturado / pagado / pendiente».

### D6 · El seguimiento se contesta de memoria

> «cuando alguien pregunta cómo va, **le echamos una tirada** de cómo va el carro o
> le decimos en qué estado está… **no es como que sea mayor complicación**»

**Qué significa:** ella lo tiene en la cabeza, así que hoy no lo siente como
problema — **pero es el dolor que aparece cuando ella no está**: nadie más puede
contestar. Con tres coches y seis etapas, la información tiene una sola copia.

### D7 · Se evita mandar avances al cliente

> «por lo regular **casi no mandamos fotos** de cómo van los carros a menos que lo
> pidan los clientes; **procuramos no hacer eso para no tener problema**»

**Qué significa:** hay miedo al reclamo por daños previos, y la respuesta es
**no mostrar**. Ese miedo se resuelve con evidencia fechada y firmada al recibir,
no con silencio.

### D8 · Todo pasa por WhatsApp, y nada queda

> «**todo lo hacemos vía WhatsApp**»

**Qué significa:** el canal ya es el correcto (es el que usan los clientes), pero
sin registro: lo que se cotizó, lo que se autorizó y lo que se prometió se pierde
en el hilo.

### D9 · Refacciones y materiales: sin respuesta

La pregunta 8 (si se les ha detenido un trabajo por una refacción que se olvidó
pedir, por quedarse sin pintura o por calcular mal el material) **no tiene audio
en la carpeta**. Es un hueco de la investigación, no un «no pasa nada».

---

## 3 · Los dolores ordenados por lo que cuestan

| # | Dolor | Qué cuesta hoy | Se arregla con |
|---|---|---|---|
| 1 | Sin registro de entrada ni base de clientes | Todo el expediente depende del papel de la aseguradora y del teléfono de una persona | Ficha de recepción con cliente, fecha, daños y fotos |
| 2 | Precio que solo existe en la cabeza del dueño | Cotizaciones detenidas y precios inconsistentes | Catálogo de precios editable + cotizador que suma |
| 3 | Cobros y complementos en Excel por mes | No se sabe qué falta cobrar sin buscar mes por mes | Estado de cuenta por siniestro: facturado, pagado, pendiente |
| 4 | Sin acceso a la cuenta de la aseguradora | La cobranza se vuelve a ciegas | Registro propio de pagos y complementos con fecha |
| 5 | Seguimiento de una sola persona | Cuando ella no está, nadie contesta | Tablero por etapas visible desde el celular |
| 6 | Miedo a reclamar daños previos | Se dejan de mandar avances al cliente | Recepción con fotos + conformidad firmada, fechadas |
| 7 | Fotos sueltas en carpetas | Evidencia que no se puede ligar a nada | Fotos dentro de la ficha, por etapa |
| 8 | Refacciones (sin datos) | Trabajo detenido | Lista de pendientes que bloquean la etapa |

---

## 4 · Lo que el prototipo tiene que tener, en orden

1. **Recepción con evidencia**: cliente, vehículo, aseguradora, fecha, daños
   marcados sobre una silueta del auto, fotos y **conformidad firmada** en el
   celular. Sin esto, lo demás no tiene dónde colgarse.
2. **Tablero por etapas**: Recibido → Desarmado → Hojalatería → Pintura → Armado →
   Listo → Entregado, con los días en cada etapa. *Es lo que hoy solo está en su
   cabeza y lo que permite contestar «¿cómo va mi carro?» desde cualquier teléfono.*
3. **Cotizador con catálogo de precios editable**: piezas y mano de obra, con
   cantidades, que sume solo. Sirve para particular y para aseguradora, y libera al
   dueño de ser el único que puede dar precio.
4. **Cobranza por siniestro**: facturado, pagado y pendiente, con fecha de timbrado
   y de complemento. Reemplaza el Excel por mes sin pedirle acceso a nadie.
5. **Avisos por WhatsApp con texto armado**: cotización lista, avance con foto,
   «ya está listo». Un toque, con el mensaje ya escrito.
6. **Refacciones pendientes**: lo que falta pedir y qué trabajo está detenido por eso.
7. **Pensado para el celular y para varias manos**: ella lo usa en el piso; el dueño
   y recepción tienen que ver lo mismo.

---

## 5 · Antes de construirlo hay que decidir tres cosas

1. **¿Hay lista de precios?** Si no existe, el cotizador necesita un editor de
   precios (piezas y mano de obra) con el que el dueño la arme una vez.
2. **¿Un taller o varios?** Si el producto se va a vender a más talleres, la
   arquitectura cambia desde el principio: cada taller con sus datos, sus folios y
   sus precios, y respaldo por taller.
3. **¿La pregunta 8 tiene audio?** Falta la respuesta sobre refacciones y material
   detenido, y es justo la que define si hace falta el módulo de pendientes.

Mientras esas tres no estén claras, construir «en forma» sería adivinar.
