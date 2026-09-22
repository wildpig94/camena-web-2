# El editor: cómo se escriben los textos de aquí en adelante

**Qué es.** El manual del editor de textos del estudio: el que revisa cada frase
antes de que salga en una página. Nace de una revisión del 22 de septiembre de
2026 en la que el dueño marcó ocho frases del sitio —seis que no cuadraban y dos
que estaban bien— y de esas ocho correcciones salen las reglas de abajo, que
sirven para juzgar frases que todavía no existen.

**A qué se aplica.** A **todo texto visible de cualquier página**, en español:
páginas del sitio, fichas de servicio, textos de los formularios, mensajes que
arma JavaScript, el pie, los datos estructurados que lee Google y los textos de
las publicaciones de redes. **Las páginas en inglés quedan fuera**: su voz es
otra y vive en `docs/traducir-al-ingles.md`.

**Cómo se usa.** Cualquier sesión que vaya a escribir o cambiar una palabra lee
esto primero; `AGENTS.md` lo manda. La tabla del apartado 3 no se borra: se
acumula, y cada corrección nueva hace más listo al editor.

---

## 1 · Las seis familias que rechinan

Cada renglón de la tabla del dueño es un caso; agrupados son siete maneras de
escribir mal, y son las que el editor busca en cualquier texto nuevo.

| # | Familia | Cómo se reconoce | Ejemplo (y su arreglo) |
|---|---|---|---|
| 1 | **Calco del inglés** | Si al traducir la frase palabra por palabra al inglés queda perfecta, se escribió en inglés primero. Se busca en frases hechas: *nivel de estudio* (`studio-level`), *píxel a píxel* (`pixel by pixel`) | «video comercial con nivel de estudio» → «video comercial con **calidad de producción profesional**» |
| 2 | **Jerga de otro oficio** | La frase trae un mundo que no es el del cliente. *Precio de partida* es de subasta: quien lo lee siente que va a competir por el precio | «Precios de partida, publicados» → «Precios **base**, publicados» |
| 3 | **Preposición mal puesta** | El verbo o el sustantivo pide otra preposición, y la que está suena a traducción. *Control* pide **de** | «no tienes control **en** quién te debe» → «no tienes control **de** quién te debe» |
| 4 | **Sujeto ambiguo** | La frase no dice quién hace qué, y el lector puede entender lo contrario. *Repetido* suena a que lo repetiste tú | «que el nombre no esté repetido» → «que el nombre **no lo esté usando ya alguien más**» |
| 5 | **Adverbio coloquial en texto que se vende formal** | Se usa en la calle y no es error, pero al lado de un texto profesional se lee informal de más. No se prohíbe el coloquio: se le pide la forma plena | «Cada negocio opera **distinto**» → «Cada negocio opera **de forma distinta**» |
| 6 | **Tono importado** | Suena a agencia de fuera más que a taller de aquí, aunque se entienda. Es cuestión de dónde se siente el estudio | «Diseñado **píxel a píxel** en Apatzingán» → «**Hecho a mano**, en Apatzingán» |
| 7 | **Narración de la máquina** (texto de log interno) | La frase cuenta cómo está hecho el sitio o qué hace por dentro: cuántas preguntas trae el instrumento, que se calcula en el navegador, que no hay servidor, para qué sirve la página. Al visitante no le sirve de nada y lo saca de su negocio para meterlo en el nuestro | «**dieciséis renglones** con tus números» → «las horas que se van en repetir, lo que se echa a perder, lo que te deben» |

**La prueba que las junta todas:** leer la frase en voz alta como si se la
estuvieras diciendo al cliente enfrente. Si al decirla se siente uno disfrazado
—de agencia gringa, de subastador, de traductor—, se reescribe.

## 2 · La otra mitad de la regla: lo mexicano no se corrige

El editor no es un corrector que vuelve todo neutro. Estas dos frases las marcó
el dueño como **buenas**, y son el modelo de lo que se busca:

- **«Compites bajando tus precios porque nada te distingue.»** (inicio, tarjeta de
  diagnóstico) — natural, directa, sin adornos.
- **«¿De cuánto andamos hablando?»** (campo de presupuesto) — *«no la toques, es
  de las mejores frases del sitio»*. Ya es la frase que está escrita ahí.

La prueba para decidir de qué lado cae una frase: **¿un dueño de negocio de
Apatzingán diría esto en su mostrador sin sonar raro?** Si sí, se queda aunque
no sea de manual. Lo que se persigue no es un español impecable: es un español
**de aquí**, que no suene a nadie más.

**Ojo con una cosa:** la frase del presupuesto lleva un «andamos» que el
verificador de voz marca como plural. **No lo es**: es el «andamos» de la frase
—¿de cuánto andamos hablando?—, no el plural de equipo que el sitio tiene
prohibido. Si alguien pasa el verificador y ve dos plurales, el otro es «quiénes
somos», que es el nombre de una sección de los sitios de clientes. **Los dos
están bien: no se tocan.**

## 3 · Lo que ya está entrenado (22 de septiembre de 2026)

La tabla tal como la mandó el dueño, con la frase real del archivo y en qué quedó.
**Estado:** ✅ aplicado · ⏳ esperando su palabra · 🔒 aprobado, no se toca.

| # | Dónde | Dice (en el sitio) | Por qué rechina | Cómo queda | Estado |
|---|---|---|---|---|---|
| 1 | Tarjeta «Fías y no tienes control…» | «Fías y no tienes control **sobre** quién te debe, cuánto o desde cuándo.» `index.html:357`, y la misma frase otra vez en la ficha `index.html:697` | La preposición correcta es **de**. El dueño lo escribió como «en»; el archivo dice «sobre»: en los dos casos se arregla igual | «…no tienes control **de** quién te debe, cuánto o desde cuándo.» | ✅ |
| 2 | Precios, encabezado | «**Precios de partida**, publicados.» `index.html:413` | *Precio de partida* es de subasta, no de un tarifario | «Precios **base**, publicados» | ✅ |
| 3 | Ficha «Nombre y frase de la marca» | «Verificación de que el nombre **no esté repetido** en tu zona» `index.html:502` (y `:506`) | *Repetido* es ambiguo: suena a que ya lo usaste tú | «Verificación de que el nombre **no lo esté usando ya alguien más** en tu zona», en la lista y en la nota del precio | ✅ |
| 4 | Ficha «Video comercial con nivel de estudio» | «video comercial con **nivel de estudio**» `index.html:1005`, `:1038`, `:1044`, `:1158` | Calco de *studio-level* | «Video comercial con **calidad de producción profesional**»: cinco veces en el inicio (la banda, la ficha, la nota del precio y los dos del armador), más el README y los pendientes | ✅ |
| 5 | Hero, primera línea | «Cada negocio **opera distinto**.» `index.html:189` | Coloquial al lado de un texto que se vende formal | «Cada negocio opera **de forma distinta**.» | ✅ |
| 6 | Tarjeta «Compites bajando tus precios…» | «…porque **nada te distingue**.» `index.html:345` | Esta sí es natural | — | 🔒 |
| 7 | Pie de página | «**Diseñado píxel a píxel** en Apatzingán, Michoacán» `index.html:1595` | Frase importada del inglés; suena a agencia de fuera | «**Hecho a mano**, en Apatzingán, Michoacán» | ✅ |
| 8 | Formulario, presupuesto | El sitio decía «¿De cuánto es el proyecto?» `index.html:1475` | — | La frase aprobada es **«¿De cuánto andamos hablando?»**: el dueño la celebró y ya es la que está escrita ahí | ✅ |
| 9 | Invitación del inicio, tras las seis tarjetas | «…**dieciséis renglones con tus números** —horas que se van en repetir, lo que se echa a perder, lo que te deben— y el diagnóstico lo hago contigo.» `index.html:398` | La cuenta del instrumento es asunto de casa, y *renglón* es una línea que se escribe: de las dieciséis, la mayoría son números y dos son elegir | «…las horas que se van en repetir, lo que se echa a perder, lo que te deben. El diagnóstico lo hago contigo. Si sales sin necesitar nada, te lo digo.» | ✅ |
| 10 | Entrada del diagnóstico | «**Dieciséis renglones** sobre cómo opera tu negocio… **No hay servidor de por medio** y no hace falta que sepas qué necesitas; **para eso es el diagnóstico**.» `diagnostico.html:72` | Lo mismo, más dos frases que hablan de la máquina y de para qué sirve la página | «Cómo opera tu negocio: qué repites, cuántas horas te lleva, cuánto se te echa a perder, cuánto te deben. Con tus propios números se ve el tamaño del hueco. No hace falta que sepas qué necesitas.» | ✅ |
| 11 | Aviso de faltantes del diagnóstico | «**Con los primeros tres renglones ya sale algo**: cuántos días abres, cuántas horas se te van en repetir…» `diagnostico.html:194` y `js/diagnostico.js:232` | Narra por dentro lo que el instrumento hace con las respuestas | «Contesta lo que falta para ver el resultado.»: el mismo registro llano de «Marca lo que necesitas para ver el total» | ✅ |
| 12 | Aviso sin JavaScript | «**Las dieciséis preguntas** están arriba…» `diagnostico.html:221` | Otra vez la cuenta del instrumento | «Las preguntas están arriba…» | ✅ |

## 4 · Antes de dar un texto por bueno

1. **Pasar las seis familias**, una por una, por la frase nueva.
2. **La prueba de la voz alta**, como si el cliente estuviera enfrente.
3. **Buscar la frase entera en el repositorio**, no solo donde se ve: el mismo
   texto suele estar repetido en el mensaje de WhatsApp (`js/contacto.js`), en el
   armador de servicios, en los datos estructurados, en `README.md` o en las
   publicaciones de `docs/redes/contenido.json`. Un cambio a medias deja el sitio
   diciendo dos cosas.
4. **Medir cuando la frase toca el diseño.** La línea del hero alterna y reserva
   su alto: alargarla mueve la primera pantalla. Se vuelve a medir con
   `node docs/medir-hero.mjs` (1440 y 390) y se corre `bash docs/auditar.sh` sobre
   la página tocada. Si es una ficha de precio, `node docs/medir-fichas.mjs`.
5. **Comprobar antes de publicar**: `bash docs/preparar-publicacion.sh /tmp/camena-publicar`.

## 5 · Lo que el editor no hace

- **No inventa.** Ni cifras, ni plazos, ni testimonios, ni credenciales, ni el
  motivo de un precio. Si falta un dato, se deja el hueco y se anota en
  `docs/pendientes.md`.
- **No toca los precios.** Viven en el HTML y se cambian cuando el dueño lo dice.
- **No renombra un servicio a medias.** El nombre de una ficha aparece en el
  armador, en el mensaje de WhatsApp y en el README: se cambia en todos lados, y
  la abreviatura del armador tiene que seguir siendo prefijo del nombre.
- **No cuenta la máquina.** Cuántas preguntas trae el instrumento, en qué se
  calcula, si hay servidor o no: eso es de casa. El visitante viene a que le
  midan su negocio, no a conocer el nuestro.
- **No traduce.** Las páginas en inglés no se rigen por este manual.
- **No reescribe los textos legales por su cuenta.** `terminos.html` y
  `aviso-de-privacidad.html` se corrigen con el mismo criterio, pero avisando:
  ahí manda el sentido jurídico.
- **No toca las frases aprobadas** del apartado 2 ni las que ya pasaron por su
  revisión, aunque al editor le suenen mejor de otra manera.
- **No publica nada sin decir qué cambió y qué midió.**

## 6 · Cómo se entrena

El entrenamiento es este: el dueño manda renglones como los del apartado 3 —qué
dice, por qué rechina, cómo lo pondría— y el editor hace tres cosas.

1. **Aplica** la corrección en todos los lugares donde vive la frase.
2. **La anota** en la tabla del apartado 3, con su fecha y su estado.
3. **La sube a regla** si generaliza: si el renglón no cabe en ninguna de las seis
   familias, nace una familia nueva en el apartado 1. Ahí está el aprendizaje: la
   tabla guarda los casos, las familias guardan el criterio.

Y al revés también: cuando el dueño aprueba una frase —como las dos del apartado
2—, entra a la lista de lo que no se toca. Lo aprobado entrena tanto como lo
corregido.

**Esperando su palabra (candidatos que encontró el editor):** el aviso del
formulario de contacto, «Este formulario no guarda nada en ningún servidor»
`index.html:1508`; el aviso sin JavaScript, «La medición se calcula en tu
navegador» `diagnostico.html:220`; y un «renglón por renglón» del armador de
precios `index.html:1256`. Los tres hablan de la máquina, y los dos primeros
además prometen algo al visitante —que no se guarda nada—, así que el editor no
los toca sin que él diga: en el aviso de privacidad esa misma explicación sí
tiene que estar.

**Bitácora**

| Fecha | Qué entró | Qué se hizo |
|---|---|---|
| 22 sep 2026 | **Segunda entrega:** «nada de texto de log interno, nada de 16 renglones» | Nace la familia 7 (narración de la máquina). Cinco frases corregidas en cuatro lugares: la invitación del inicio, la entrada del diagnóstico, el aviso de faltantes —en el HTML y en el JavaScript— y el aviso sin JavaScript. Quedan tres candidatos esperando su palabra, anotados abajo |
| 22 sep 2026 | Primera entrega: 8 renglones (6 correcciones, 2 aprobaciones) | Seis familias nuevas y dos frases aprobadas. Aplicadas las siete correcciones en el inicio y, donde la misma frase vivía, en el README, los pendientes, el comentario del CSS que cita el hero, las muestras del hero del laboratorio y las publicaciones de redes. Publicado el mismo día |
