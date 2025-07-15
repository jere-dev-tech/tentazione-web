document.addEventListener("DOMContentLoaded", () => {
  const btnVolverArriba = document.getElementById("btnVolverArriba");
  if (!btnVolverArriba) return;

  let scrollTimeout;

  console.log("🔥 botonScroll.js cargado correctamente");

  window.addEventListener("scroll", () => {
    console.log("🌀 Scroll detectado en el sitio");

    if (window.scrollY > 300) {
      btnVolverArriba.classList.remove("hidden", "opacity-0");
      btnVolverArriba.classList.add("opacity-100");

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        btnVolverArriba.classList.add("opacity-0");
        setTimeout(() => {
          btnVolverArriba.classList.add("hidden");
        }, 500);
      }, 1000);
    } else {
      btnVolverArriba.classList.add("opacity-0");
      setTimeout(() => {
        btnVolverArriba.classList.add("hidden");
        btnVolverArriba.classList.remove("opacity-100");
      }, 500);
    }
  });

  btnVolverArriba.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
