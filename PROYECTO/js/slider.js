document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ slider.js cargado correctamente");

  // === VARIABLES GLOBALES ===
  const productos = [
    { nombre: "ALFAJOR PATAGÓNICO", precio: 2500 },
    { nombre: "ALFAJOR BON O BON", precio: 2500 },
    { nombre: "ALFAJOR NEGRO", precio: 2000 },
    { nombre: "ALFAJOR BLANCO", precio: 2000 },
    { nombre: "ALFAJOR DE MANÍ", precio: 2500 },
    { nombre: "ALFAJOR DE NUEZ", precio: 2500 },
    { nombre: "ALFAJOR CHOCOMOUSSE", precio: 2500 }
  ];

  let modalProductoActual = null;
  let carrito = JSON.parse(localStorage.getItem("carritoTentazione")) || [];

// === BOTÓN VOLVER ARRIBA ===
const btnVolverArriba = document.getElementById("btnVolverArriba");

if (btnVolverArriba) {
  let timeout;
  let bloqueado = false;

  window.addEventListener("scroll", () => {
    if (bloqueado) return;

    const scrollY = window.scrollY;

    if (scrollY > 300) {
      btnVolverArriba.classList.remove("hidden", "opacity-0");
      btnVolverArriba.classList.add("opacity-100");

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        btnVolverArriba.classList.add("opacity-0");
        setTimeout(() => {
          if (window.scrollY <= 300) {
            btnVolverArriba.classList.add("hidden");
          }
        }, 500);
      }, 1000);
    } else {
      btnVolverArriba.classList.add("opacity-0");
      setTimeout(() => {
        btnVolverArriba.classList.add("hidden");
      }, 500);
    }
  });

  btnVolverArriba.addEventListener("click", () => {
    bloqueado = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      bloqueado = false;
    }, 1000);
  });
}




  // === WHATSAPP FLOTANTE ===
  const wspBtn = document.getElementById("wspBtn");
  const wspMenu = document.getElementById("wspMenu");

  if (wspBtn && wspMenu) {
    let menuAbierto = false;

    wspBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuAbierto = !menuAbierto;

      if (menuAbierto) {
        wspMenu.classList.remove("hidden");
        setTimeout(() => {
          wspMenu.classList.remove("opacity-0", "scale-95");
          wspMenu.classList.add("opacity-100", "scale-100", "flex");
        }, 10);
      } else {
        wspMenu.classList.add("opacity-0", "scale-95");
        wspMenu.classList.remove("opacity-100", "scale-100", "flex");
        setTimeout(() => {
          wspMenu.classList.add("hidden");
        }, 300);
      }
    });

    document.addEventListener("click", (e) => {
      if (
        menuAbierto &&
        !wspMenu.contains(e.target) &&
        !wspBtn.contains(e.target)
      ) {
        wspMenu.classList.add("opacity-0", "scale-95");
        wspMenu.classList.remove("opacity-100", "scale-100", "flex");
        setTimeout(() => {
          wspMenu.classList.add("hidden");
        }, 300);
        menuAbierto = false;
      }
    });
  }

  // === MODAL AGREGAR PRODUCTO ===
  const modalAgregar = document.getElementById("modalAgregar");
  const cerrarAgregarModal = document.getElementById("cerrarAgregarModal");
  const nombreProductoModal = document.getElementById("nombreProductoModal");
  const precioProductoModal = document.getElementById("precioProductoModal");
  const cantidadSeleccionada = document.getElementById("cantidadSeleccionada");
  const btnSumar = document.getElementById("sumarCantidad");
  const btnRestar = document.getElementById("restarCantidad");
  const btnConfirmarAgregar = document.getElementById("confirmarAgregar");
  const btnCancelarAgregar = document.getElementById("cancelarAgregar");

  let productoTemporal = null;
  let cantidadTemporal = 1;

  function actualizarBotones() {
    if (btnRestar && btnSumar && cantidadSeleccionada) {
      btnRestar.disabled = cantidadTemporal <= 1;
      btnSumar.disabled = cantidadTemporal >= 99;
      cantidadSeleccionada.value = cantidadTemporal;
    }
  }

  function abrirModalAgregar(producto) {
    productoTemporal = producto;
    cantidadTemporal = 1;
    nombreProductoModal.textContent = producto.nombre;
    precioProductoModal.textContent = `$${producto.precio}`;
    cantidadSeleccionada.value = cantidadTemporal;
    modalAgregar.classList.remove("hidden");
    modalAgregar.classList.add("flex");
    actualizarBotones();
  }

  window.seleccionarCantidadRapida = function (cantidad) {
    cantidadTemporal = cantidad;
    actualizarBotones();
  };

  function cerrarModalAgregar() {
    modalAgregar.classList.add("hidden");
    modalAgregar.classList.remove("flex");
  }

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

  // === CARRITO GENERAL ===
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
      <!-- Nombre del producto -->
      <span class="nombre-producto">${item.nombre}</span>

      <!-- Controles de cantidad -->
      <div>
        <button onclick="cambiarCantidad(${index}, -1)">−</button>
        <span>${item.cantidad}</span>
        <button onclick="cambiarCantidad(${index}, 1)">+</button>
        <button onclick="eliminarItem(${index})">×</button>
      </div>

      <!-- Precio -->
     <span class="precio-producto">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>

    </div>
  `;
});

    carritoLista.innerHTML = html;
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
   totalCarritoSpan.textContent = total.toLocaleString('es-AR');


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

  const toastText = document.getElementById("toastText");
  if (toastText) toastText.textContent = mensaje;

  toast.classList.remove("opacity-0", "pointer-events-none");
  toast.classList.add("opacity-100", "toast-animar");

  toast.onclick = () => {
    if (typeof renderCarrito === "function") {
      renderCarrito();
    }
  };

  setTimeout(() => {
    toast.classList.remove("opacity-100", "toast-animar");
    toast.classList.add("opacity-0", "pointer-events-none");
  }, 3000);
}



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

  // === EFECTO WOW ===
  const imgWow = document.getElementById('img-wow');
  const mensajeWow = document.getElementById('mensaje-wow');

  const observerWOW = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imgWow.classList.remove('opacity-0', 'scale-50');
        imgWow.classList.add('img-wow-animada');

        mensajeWow.classList.remove('mensaje-oculto');
        mensajeWow.classList.add('mensaje-visible');
      } else {
        imgWow.classList.remove('img-wow-animada');
        imgWow.classList.add('opacity-0', 'scale-50');

        mensajeWow.classList.remove('mensaje-visible');
        mensajeWow.classList.add('mensaje-oculto');
      }
    });
  }, { threshold: 0.5 });

  const sectionWow = document.querySelector('.section-wow');
  if (sectionWow) observerWOW.observe(sectionWow);

  // === AUTOSLIDE DEL SLIDER ===
const slider = document.getElementById("slider");
const dots = document.querySelectorAll(".dots button");
let currentSlide = 0;
let totalSlides = 0;

if (slider) {
  totalSlides = slider.children.length;

  function mostrarSlide(index) {
    slider.scrollTo({
      left: index * slider.clientWidth,
      behavior: "smooth",
    });

    dots.forEach(dot => dot.classList.remove("dot-active"));
    if (dots[index]) dots[index].classList.add("dot-active");
  }

  function siguienteSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    mostrarSlide(currentSlide);
  }

  let intervalo = setInterval(siguienteSlide, 6000);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      clearInterval(intervalo);
      currentSlide = index;
      mostrarSlide(currentSlide);
      intervalo = setInterval(siguienteSlide, 5000);
    });
  });

  slider.addEventListener("scroll", () => {
    const slideWidth = slider.clientWidth;
    const newIndex = Math.round(slider.scrollLeft / slideWidth);
    if (newIndex !== currentSlide) {
      currentSlide = newIndex;
      dots.forEach(dot => dot.classList.remove("dot-active"));
      if (dots[currentSlide]) dots[currentSlide].classList.add("dot-active");
    }
  });
}


  const h2Animado = document.querySelector(".h2-animado");
  if (h2Animado) {
    const observerH2 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          h2Animado.classList.remove("h2-animado");
          void h2Animado.offsetWidth;
          h2Animado.classList.add("h2-animado");
        }
      });
    }, { threshold: 0.5 });

    observerH2.observe(h2Animado);
  }

 
  // Carga la imagen, calcula su relación de aspecto y la aplica al contenedor
  (function () {
    const box = document.getElementById('zoomText');
    const src = box.getAttribute('data-src');
    const img = new Image();
    img.src = src;
    img.decode ? img.decode().then(init).catch(() => init()) : img.onload = init;

    function init() {
      const ratio = img.naturalWidth && img.naturalHeight
        ? (img.naturalWidth / img.naturalHeight)
        : (16/9); // respaldo

      // Ajusta el aspecto del contenedor para que la imagen quepa completa (sin recorte)
      box.style.setProperty('--img-ratio', ratio);

      // Setea la imagen como background
      box.style.backgroundImage = `url("${src}")`;
      
      // Si tu foto es MUY vertical y querés que “lejos” sea aún más lejos:
      // box.style.setProperty('--zoom-lejos', '90%'); // opcional
    }
  })();
  
});


