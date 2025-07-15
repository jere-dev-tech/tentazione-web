document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ productos.js cargado correctamente");

  let carrito = JSON.parse(localStorage.getItem("carritoTentazione")) || [];
  let productoTemporal = null;
  let cantidadTemporal = 1;

  const modalAgregar = document.getElementById("modalAgregar");
  const cerrarAgregarModal = document.getElementById("cerrarAgregarModal");
  const nombreProductoModal = document.getElementById("nombreProductoModal");
  const precioProductoModal = document.getElementById("precioProductoModal");
  const cantidadSeleccionada = document.getElementById("cantidadSeleccionada");
  const btnSumar = document.getElementById("sumarCantidad");
  const btnRestar = document.getElementById("restarCantidad");
  const btnConfirmarAgregar = document.getElementById("confirmarAgregar");
  const btnCancelarAgregar = document.getElementById("cancelarAgregar");

  function actualizarBotones() {
    if (btnRestar && btnSumar && cantidadSeleccionada) {
      btnRestar.disabled = cantidadTemporal <= 1;
      btnSumar.disabled = cantidadTemporal >= 99;
      cantidadSeleccionada.value = cantidadTemporal;
    }
  }

  function cerrarModalAgregar() {
    modalAgregar.classList.add("hidden");
    modalAgregar.classList.remove("flex");
  }

  window.seleccionarCantidadRapida = function (cantidad) {
    cantidadTemporal = cantidad;
    actualizarBotones();
  };

  window.abrirModalProducto = function (nombre, precio) {
    productoTemporal = { nombre, precio };
    cantidadTemporal = 1;
    nombreProductoModal.textContent = nombre;
    precioProductoModal.textContent = `$${precio}`;
    cantidadSeleccionada.value = cantidadTemporal;
    modalAgregar.classList.remove("hidden");
    modalAgregar.classList.add("flex");
    actualizarBotones();
  };

  if (btnSumar) {
    btnSumar.onclick = () => {
      if (cantidadTemporal < 99) {
        cantidadTemporal++;
        actualizarBotones();
      }
    };
  }

  if (btnRestar) {
    btnRestar.onclick = () => {
      if (cantidadTemporal > 1) {
        cantidadTemporal--;
        actualizarBotones();
      }
    };
  }

  if (cantidadSeleccionada) {
    cantidadSeleccionada.addEventListener("input", () => {
      let cantidad = parseInt(cantidadSeleccionada.value);
      if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
      else if (cantidad > 99) cantidad = 99;
      cantidadTemporal = cantidad;
      actualizarBotones();
    });
  }

  if (btnConfirmarAgregar) {
    btnConfirmarAgregar.onclick = () => {
      if (productoTemporal) {
        const existente = carrito.find(p => p.nombre === productoTemporal.nombre);
        if (existente) {
          existente.cantidad += cantidadTemporal;
        } else {
          carrito.push({ ...productoTemporal, cantidad: cantidadTemporal });
        }
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarToast();
        cerrarModalAgregar();
      }
    };
  }

  if (btnCancelarAgregar) btnCancelarAgregar.onclick = cerrarModalAgregar;
  if (cerrarAgregarModal) cerrarAgregarModal.onclick = cerrarModalAgregar;
  if (modalAgregar) {
    modalAgregar.addEventListener("click", (e) => {
      if (e.target === modalAgregar) cerrarModalAgregar();
    });
  }

  // === CARRITO ===
  const modal = document.getElementById("modalCarrito");
  const carritoLista = document.getElementById("carritoLista");
  const totalCarritoSpan = document.getElementById("totalCarrito");
  const btnEnviarPedido = document.getElementById("btnEnviarPedido");
  const cerrarModalBtn = document.getElementById("cerrarModal");
  const botonCarrito = document.getElementById("botonCarrito");

  if (botonCarrito) {
    botonCarrito.addEventListener("click", () => {
      renderCarrito();
    });
  }

  if (cerrarModalBtn) {
    cerrarModalBtn.addEventListener("click", () => {
      cerrarCarrito();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) cerrarCarrito();
    });
  }

  function guardarCarrito() {
    localStorage.setItem("carritoTentazione", JSON.stringify(carrito));
  }

  function renderCarrito() {
    if (!carritoLista || !totalCarritoSpan) return;

    if (carrito.length === 0) {
      carritoLista.innerHTML = `<p class="text-center text-gray-500 py-4">🛒 Aún no agregaste productos</p>`;
      totalCarritoSpan.textContent = "0";
      if (btnEnviarPedido) btnEnviarPedido.classList.add("hidden");
    } else {
      let html = "";
      carrito.forEach((item, index) => {
        html += `
          <div class="item-carrito">
            <span>${item.nombre}</span>
            <div>
              <button onclick="cambiarCantidad(${index}, -1)">−</button>
              <span>${item.cantidad}</span>
              <button onclick="cambiarCantidad(${index}, 1)">+</button>
              <button onclick="eliminarItem(${index})">×</button>
            </div>
            <span>$${item.precio * item.cantidad}</span>
          </div>
        `;
      });
      carritoLista.innerHTML = html;
      const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      totalCarritoSpan.textContent = total;
      if (btnEnviarPedido) btnEnviarPedido.classList.remove("hidden");
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  window.eliminarItem = function (index) {
    carrito.splice(index, 1);
    guardarCarrito();
    renderCarrito();
    actualizarContadorCarrito();
  };

  window.cambiarCantidad = function (index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    guardarCarrito();
    renderCarrito();
    actualizarContadorCarrito();
  };

  window.vaciarCarrito = function () {
    if (carrito.length === 0) {
      cerrarCarrito();
      return;
    }
    carrito.length = 0;
    guardarCarrito();
    renderCarrito();
    actualizarContadorCarrito();
  };

  window.enviarPorWhatsApp = function () {
    const numero = "5493834640224";
    let mensaje = "Hola! Quiero hacer un pedido:%0A";
    carrito.forEach((p) => {
      mensaje += `- ${p.cantidad} x ${p.nombre}%0A`;
    });
    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    mensaje += `%0ATotal: $${total}`;
    window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
  };

  function cerrarCarrito() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  function actualizarContadorCarrito() {
    const contador = document.getElementById("contadorCarrito");
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (!contador) return;
    if (totalItems > 0) {
      contador.textContent = totalItems;
      contador.classList.remove("hidden");
    } else {
      contador.classList.add("hidden");
    }
  }

  actualizarContadorCarrito();

  function mostrarToast(mensaje = "Producto agregado al carrito ✅") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.remove("opacity-0", "pointer-events-none");
    toast.classList.add("opacity-100", "toast-animar");

    toast.onclick = () => {
      renderCarrito();
    };

    setTimeout(() => {
      toast.classList.remove("opacity-100", "toast-animar");
      toast.classList.add("opacity-0", "pointer-events-none");
    }, 3000);
  }
});
