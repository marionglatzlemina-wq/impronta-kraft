
/*
 * IMPRONTA KRAFT
 * Catálogo, personalización y carrito de compras.
 * Los productos se definen en productos.js.
 */

const listaProductos = document.getElementById("lista-productos");
const contadoresCarrito = document.querySelectorAll(".contador-carrito");
const anio = document.getElementById("anio");

const contenidoCarrito = document.getElementById("contenido-carrito");
const resumenCarrito = document.getElementById("resumen-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonVaciarCarrito = document.getElementById("vaciar-carrito");

const CLAVE_CARRITO = "improntaKraftCarrito";

const disenosDisponibles = [
    "Minimalista",
    "Elegante"
];

let carrito = cargarCarrito();

/* Evita que el texto escrito por el cliente se interprete como HTML. */
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

/* Formatea los precios en dólares. */
function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD"
    }).format(precio);
}

/* Busca un producto del catálogo por su identificador. */
function buscarProducto(id) {
    return productos.find(producto => producto.id === id);
}

/* Crea un identificador para cada artículo del carrito. */
function crearIdLinea() {
    return "linea-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 9);
}

/* Carga el carrito y conserva los datos guardados anteriormente. */
function cargarCarrito() {
    try {
        const datosGuardados = localStorage.getItem(CLAVE_CARRITO);

        if (!datosGuardados) {
            return [];
        }

        const datos = JSON.parse(datosGuardados);

        if (!Array.isArray(datos)) {
            return [];
        }

        return datos
            .filter(item =>
                item &&
                Number.isInteger(item.id) &&
                Number.isInteger(item.cantidad) &&
                item.cantidad > 0 &&
                productos.some(producto => producto.id === item.id)
            )
            .map(item => ({
                lineaId: item.lineaId || crearIdLinea(),
                id: item.id,
                cantidad: item.cantidad,
                diseno: disenosDisponibles.includes(item.diseno)
                    ? item.diseno
                    : "Minimalista",
                instrucciones: typeof item.instrucciones === "string"
                    ? item.instrucciones
                    : "",
                archivoNombre: typeof item.archivoNombre === "string"
                    ? item.archivoNombre
                    : "",
                archivoData: typeof item.archivoData === "string"
                    ? item.archivoData
                    : ""
            }));
    } catch (error) {
        console.warn("No se pudo cargar el carrito:", error);
        return [];
    }
}

/* Guarda el carrito en el navegador. */
function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
        return true;
    } catch (error) {
        console.warn("No se pudo guardar el carrito:", error);
        alert(
            "No se pudieron guardar los cambios. " +
            "Es posible que el almacenamiento del navegador esté lleno."
        );
        return false;
    }
}

/* Lee una imagen seleccionada y la convierte en una cadena de datos. */
function leerArchivoComoDataURL(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo) {
            resolve({
                nombre: "",
                datos: ""
            });
            return;
        }

        if (!archivo.type.startsWith("image/")) {
            reject(new Error("Selecciona un archivo de imagen válido."));
            return;
        }

        // Limitamos el tamaño para evitar llenar el almacenamiento.
        if (archivo.size > 500 * 1024) {
            reject(new Error(
                "La imagen supera los 500 KB. " +
                "Selecciona una imagen más pequeña."
            ));
            return;
        }

        const lector = new FileReader();

        lector.onload = () => {
            resolve({
                nombre: archivo.name,
                datos: lector.result
            });
        };

        lector.onerror = () => {
            reject(new Error("No se pudo leer la imagen seleccionada."));
        };

        lector.readAsDataURL(archivo);
    });
}

/* Genera las opciones de diseño para el catálogo y el carrito. */
function generarOpcionesDiseno(disenoActual) {
    return disenosDisponibles.map(diseno => `
        <option value="${diseno}"
            ${disenoActual === diseno ? "selected" : ""}>
            ${diseno}
        </option>
    `).join("");
}

/* Dibuja las tarjetas del catálogo. */
function mostrarProductos() {
    if (!listaProductos) return;

    listaProductos.innerHTML = productos.map(producto => `
        <article class="producto">
            <div class="producto-imagen">
    <img
        src="${escaparHTML(producto.imagen)}"
        alt="${escaparHTML(producto.nombre)}"
        loading="lazy"
    >
</div>

            <div class="producto-detalle">
                <h3>${escaparHTML(producto.nombre)}</h3>
                <p>${escaparHTML(producto.descripcion)}</p>

                <p>
                    <strong>Tamaño:</strong>
                    ${escaparHTML(producto.tamano)}<br>
                    <strong>Medidas:</strong>
                    ${escaparHTML(producto.medidas)}
                </p>

                <span class="producto-precio">
                    ${formatearPrecio(producto.precio)}
                </span>

                <div class="personalizacion">
                    <h4>Personaliza tu funda</h4>

                    <label for="diseno-${producto.id}">
                        Estilo de diseño
                    </label>

                    <select
                        id="diseno-${producto.id}"
                        data-campo="diseno"
                    >
                        ${generarOpcionesDiseno("Minimalista")}
                    </select>

                    <label for="archivo-${producto.id}">
                        Tu logotipo o diseño (opcional)
                    </label>

                    <input
                        id="archivo-${producto.id}"
                        type="file"
                        data-campo="archivo"
                        accept="image/*"
                    >

                    <small class="ayuda-personalizacion">
                        Imágenes de hasta 500 KB.
                    </small>

                    <label for="instrucciones-${producto.id}">
                        Instrucciones adicionales (opcional)
                    </label>

                    <textarea
                        id="instrucciones-${producto.id}"
                        data-campo="instrucciones"
                        rows="3"
                        maxlength="500"
                        placeholder="Nombre de tu negocio, colores, texto..."
                    ></textarea>
                </div>

                <button
                    class="boton boton-principal agregar-carrito"
                    type="button"
                    data-id="${producto.id}"
                >
                    Agregar al pedido
                </button>
            </div>
        </article>
    `).join("");
}

/* Agrega una funda con la personalización elegida. */
async function agregarProducto(id, boton) {
    const tarjeta = boton.closest(".producto");

    if (!tarjeta || !buscarProducto(id)) return;

    const diseno = tarjeta.querySelector(
        '[data-campo="diseno"]'
    ).value;

    const instrucciones = tarjeta.querySelector(
        '[data-campo="instrucciones"]'
    ).value.trim();

    const entradaArchivo = tarjeta.querySelector(
        '[data-campo="archivo"]'
    );

    const archivo = entradaArchivo.files[0];

    boton.disabled = true;
    boton.textContent = "Agregando...";

    try {
        const imagen = await leerArchivoComoDataURL(archivo);

        // Si la misma funda tiene exactamente las mismas opciones,
        // aumentamos la cantidad de esa línea del carrito.
        const existente = carrito.find(item =>
            item.id === id &&
            item.diseno === diseno &&
            item.instrucciones === instrucciones &&
            item.archivoNombre === imagen.nombre &&
            item.archivoData === imagen.datos
        );

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                lineaId: crearIdLinea(),
                id: id,
                cantidad: 1,
                diseno: diseno,
                instrucciones: instrucciones,
                archivoNombre: imagen.nombre,
                archivoData: imagen.datos
            });
        }

        if (!guardarCarrito()) {
            // No confirmamos el cambio si no pudo guardarse.
            carrito = cargarCarrito();
            actualizarCarrito();
            return;
        }

        actualizarCarrito();

        boton.textContent = "¡Agregado!";

        // Limpiamos el archivo y las instrucciones del formulario.
        // El diseño vuelve al valor inicial para la próxima funda.
        tarjeta.querySelector(
            '[data-campo="archivo"]'
        ).value = "";

        tarjeta.querySelector(
            '[data-campo="instrucciones"]'
        ).value = "";

        tarjeta.querySelector(
            '[data-campo="diseno"]'
        ).value = "Minimalista";

        return;
    } catch (error) {
        alert(error.message || "No se pudo agregar la funda.");
    } finally {
        boton.disabled = false;

        if (boton.textContent === "Agregando...") {
            boton.textContent = "Agregar al pedido";
        } else if (boton.textContent === "¡Agregado!") {
            window.setTimeout(() => {
                boton.textContent = "Agregar al pedido";
            }, 1200);
        }
    }
}

/* Busca una línea específica del carrito. */
function buscarLinea(lineaId) {
    return carrito.find(item => item.lineaId === lineaId);
}

/* Modifica la cantidad de un artículo. */
function cambiarCantidad(lineaId, cambio) {
    const articulo = buscarLinea(lineaId);

    if (!articulo) return;

    const nuevaCantidad = articulo.cantidad + cambio;

    if (nuevaCantidad < 1) return;

    const cantidadAnterior = articulo.cantidad;
    articulo.cantidad = nuevaCantidad;

    if (!guardarCarrito()) {
        articulo.cantidad = cantidadAnterior;
        actualizarCarrito();
        return;
    }

    actualizarCarrito();
}

/* Elimina una línea específica del carrito. */
function eliminarProducto(lineaId) {
    const carritoAnterior = carrito;
    carrito = carrito.filter(item => item.lineaId !== lineaId);

    if (!guardarCarrito()) {
        carrito = carritoAnterior;
        actualizarCarrito();
        return;
    }

    actualizarCarrito();
}

/* Elimina todos los productos del carrito. */
function vaciarCarrito() {
    const carritoAnterior = carrito;
    carrito = [];

    if (!guardarCarrito()) {
        carrito = carritoAnterior;
        actualizarCarrito();
        return;
    }

    actualizarCarrito();
}

/* Actualiza todos los contadores de la página. */
function actualizarContador() {
    const totalUnidades = carrito.reduce(
        (total, item) => total + item.cantidad,
        0
    );

    contadoresCarrito.forEach(contador => {
        contador.textContent = totalUnidades;
    });
}

/* Muestra el contenido del carrito y sus personalizaciones. */
function mostrarCarrito() {
    if (!contenidoCarrito || !resumenCarrito) return;

    carrito = carrito.filter(item => buscarProducto(item.id));

    if (carrito.length === 0) {
        contenidoCarrito.innerHTML = `
            <div class="carrito-vacio">
                <h3>Tu pedido está vacío</h3>
                <p>
                    Explora nuestro catálogo y agrega las fundas
                    que te gustaría personalizar.
                </p>
                <a class="boton boton-principal" href="catalogo.html">
                    Ver catálogo
                </a>
            </div>
        `;

        resumenCarrito.hidden = true;
        return;
    }

    contenidoCarrito.innerHTML = `
        <div class="lista-carrito">
            ${carrito.map(item => {
                const producto = buscarProducto(item.id);
                const subtotal = producto.precio * item.cantidad;

                return `
                    <article class="articulo-carrito">
                        <div class="datos-articulo">
                            <h3>${escaparHTML(producto.nombre)}</h3>

                            <p>${escaparHTML(producto.descripcion)}</p>

                            <p class="precio-unitario">
                                Precio por unidad:
                                ${formatearPrecio(producto.precio)}
                            </p>

                            <div class="personalizacion personalizacion-carrito">
                                <h4>Personalización</h4>

                                <label>
                                    Estilo de diseño
                                    <select
                                        data-editar="diseno"
                                        data-linea="${escaparHTML(item.lineaId)}"
                                    >
                                        ${generarOpcionesDiseno(item.diseno)}
                                    </select>
                                </label>

                                <label>
                                    Instrucciones adicionales
                                    <textarea
                                        data-editar="instrucciones"
                                        data-linea="${escaparHTML(item.lineaId)}"
                                        rows="2"
                                        maxlength="500"
                                        placeholder="Escribe tus indicaciones..."
                                    >${escaparHTML(item.instrucciones)}</textarea>
                                </label>

                                <label>
                                    ${item.archivoNombre
                                        ? "Cambiar logotipo o diseño"
                                        : "Agregar logotipo o diseño (opcional)"}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        data-editar="archivo"
                                        data-linea="${escaparHTML(item.lineaId)}"
                                    >
                                </label>

                                ${item.archivoNombre ? `
                                    <p class="archivo-seleccionado">
                                        Archivo: ${escaparHTML(item.archivoNombre)}
                                    </p>

                                    ${item.archivoData ? `
                                        <img
                                            class="vista-previa-diseno"
                                            src="${item.archivoData}"
                                            alt="Vista previa del diseño seleccionado"
                                        >
                                    ` : ""}
                                ` : ""}
                            </div>
                        </div>

                        <div class="cantidad-controles">
                            <button
                                class="boton-cantidad"
                                type="button"
                                data-accion="restar"
                                data-linea="${escaparHTML(item.lineaId)}"
                                aria-label="Disminuir cantidad"
                            >−</button>

                            <span class="numero-cantidad">
                                ${item.cantidad}
                            </span>

                            <button
                                class="boton-cantidad"
                                type="button"
                                data-accion="sumar"
                                data-linea="${escaparHTML(item.lineaId)}"
                                aria-label="Aumentar cantidad"
                            >+</button>
                        </div>

                        <div class="subtotal-articulo">
                            <span>Subtotal</span>
                            <strong>${formatearPrecio(subtotal)}</strong>

                            <button
                                class="eliminar-articulo"
                                type="button"
                                data-accion="eliminar"
                                data-linea="${escaparHTML(item.lineaId)}"
                            >
                                Eliminar
                            </button>
                        </div>
                    </article>
                `;
            }).join("")}
        </div>
    `;

    const total = carrito.reduce((suma, item) => {
        const producto = buscarProducto(item.id);
        return suma + producto.precio * item.cantidad;
    }, 0);

    totalCarrito.textContent = formatearPrecio(total);
    resumenCarrito.hidden = false;
}

/* Actualiza todas las partes visibles del carrito. */
function actualizarCarrito() {
    actualizarContador();
    mostrarCarrito();
}

/* =========================================
   ENVIAR PEDIDO POR WHATSAPP
========================================= */

// Número comercial de Impronta Kraft, en formato internacional.
const WHATSAPP_NUMERO = "593990084940";


function enviarPedidoWhatsApp() {
    if (!Array.isArray(carrito) || carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de realizar el pedido.");
        return;
    }

    const lineasPedido = [];
    let totalPedido = 0;

    lineasPedido.push("¡Hola! Quiero realizar un pedido en Impronta Kraft.");
    lineasPedido.push("");
    lineasPedido.push("DETALLE DEL PEDIDO");
    lineasPedido.push("--------------------------------");

    carrito.forEach((item, indice) => {
        const producto = buscarProducto(item.id);

        if (!producto) return;

        const cantidad = item.cantidad;
        const precio = producto.precio;
        const subtotal = precio * cantidad;

        totalPedido += subtotal;

        lineasPedido.push(`${indice + 1}. ${producto.nombre}`);
        lineasPedido.push(`   Tamaño: ${producto.tamano}`);
        lineasPedido.push(`   Medidas: ${producto.medidas}`);
        lineasPedido.push(`   Cantidad: ${cantidad}`);
        lineasPedido.push(
            `   Precio unitario: ${formatearPrecio(precio)}`
        );
        lineasPedido.push(
            `   Subtotal: ${formatearPrecio(subtotal)}`
        );
        lineasPedido.push(`   Diseño: ${item.diseno || "Minimalista"}`);

        if (item.instrucciones && item.instrucciones.trim()) {
            lineasPedido.push(
                `   Instrucciones: ${item.instrucciones.trim()}`
            );
        }

        if (item.archivoNombre) {
            lineasPedido.push(`   Archivo de diseño: ${item.archivoNombre}`);
            lineasPedido.push(
                "   Recuerda adjuntar manualmente la imagen en WhatsApp."
            );
        }

        lineasPedido.push("");
    });

    if (totalPedido === 0) {
        alert("No se encontraron productos válidos en el carrito.");
        return;
    }

    lineasPedido.push("--------------------------------");
    lineasPedido.push(`TOTAL DEL PEDIDO: ${formatearPrecio(totalPedido)}`);
    lineasPedido.push("");
    lineasPedido.push(
        "Por favor, confirmen la disponibilidad y el costo del envío."
    );
    lineasPedido.push("¡Gracias!");

    const mensaje = lineasPedido.join("\n");
    const url =
        `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
}


/* Escucha los clics en los botones del catálogo. */
if (listaProductos) {
    listaProductos.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".agregar-carrito");

        if (!boton) return;

        const id = Number(boton.dataset.id);
        agregarProducto(id, boton);
    });
}

/* Guarda los cambios de diseño e instrucciones desde el carrito. */
if (contenidoCarrito) {
    contenidoCarrito.addEventListener("change", async function (evento) {
        const campo = evento.target.dataset.editar;
        const lineaId = evento.target.dataset.linea;

        if (!campo || !lineaId) return;

        const articulo = buscarLinea(lineaId);

        if (!articulo) return;

        if (campo === "diseno") {
            const anterior = articulo.diseno;
            articulo.diseno = evento.target.value;

            if (!guardarCarrito()) {
                articulo.diseno = anterior;
            }

            actualizarCarrito();
        }

        if (campo === "instrucciones") {
            const anterior = articulo.instrucciones;
            articulo.instrucciones = evento.target.value.trim();

            if (!guardarCarrito()) {
                articulo.instrucciones = anterior;
            }

            actualizarCarrito();
        }

        if (campo === "archivo") {
            const archivo = evento.target.files[0];

            // Si se cancela el selector, no cambiamos el archivo actual.
            if (!archivo) return;

            try {
                const imagen = await leerArchivoComoDataURL(archivo);

                const anterior = {
                    archivoNombre: articulo.archivoNombre,
                    archivoData: articulo.archivoData
                };

                articulo.archivoNombre = imagen.nombre;
                articulo.archivoData = imagen.datos;

                if (!guardarCarrito()) {
                    articulo.archivoNombre = anterior.archivoNombre;
                    articulo.archivoData = anterior.archivoData;
                }

                actualizarCarrito();
            } catch (error) {
                alert(error.message || "No se pudo cargar la imagen.");
            }
        }
    });

    /* Escucha los botones de cantidad y eliminación. */
    contenidoCarrito.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-accion]");

        if (!boton) return;

        const lineaId = boton.dataset.linea;
        const accion = boton.dataset.accion;

        if (accion === "sumar") {
            cambiarCantidad(lineaId, 1);
        }

        if (accion === "restar") {
            cambiarCantidad(lineaId, -1);
        }

        if (accion === "eliminar") {
            eliminarProducto(lineaId);
        }
    });
}

/* Vacía el carrito previa confirmación. */
if (botonVaciarCarrito) {
    botonVaciarCarrito.addEventListener("click", function () {
        const confirmar = window.confirm(
            "¿Seguro que deseas vaciar todo el carrito?"
        );

        if (confirmar) {
            vaciarCarrito();
        }
    });
}



/* Gestiona el botón flotante de WhatsApp. */
const botonEnviarWhatsApp = document.getElementById("enviar-whatsapp");

if (botonEnviarWhatsApp) {
    botonEnviarWhatsApp.addEventListener("click", function (evento) {
        evento.preventDefault();

        if (Array.isArray(carrito) && carrito.length > 0) {
            enviarPedidoWhatsApp();
        } else {
            const mensaje =
                "¡Hola! Me interesa conocer más sobre las fundas personalizadas de Impronta Kraft. ¿Podrían brindarme información, por favor?";

            const url =
                `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;

            window.open(url, "_blank");
        }
    });
}



/* Inicialización de la página. */
if (anio) {
    anio.textContent = new Date().getFullYear();
}

mostrarProductos();
actualizarCarrito();

console.log("Impronta Kraft está funcionando.");
console.log("Productos cargados:", productos.length);
