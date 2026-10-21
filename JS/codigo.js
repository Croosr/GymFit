// 1. Actualizar el año dinámicamente
document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
});

// 2. Marcar el enlace activo en la barra de navegación
const currentFile = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".navbar .nav-link").forEach(link => {
    if (link.getAttribute("href") === currentFile) {
        link.classList.add("active");
    }
});

// 3. Botón de "Volver arriba" (Back to Top)
const backTop = document.getElementById("backTop");

if (backTop) {
    backTop.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// 4. Filtro de horarios por día
const dayFilter = document.getElementById("dayFilter");
if (dayFilter) {
    dayFilter.addEventListener("change", () => {
        document.querySelectorAll("#scheduleBody tr").forEach(row => {
            row.hidden = dayFilter.value !== "todos" && row.dataset.day !== dayFilter.value;
        });
    });
}

// 5. Modal de galería con Bootstrap
const galleryModalElement = document.getElementById("galleryModal");
if (galleryModalElement) {
    const galleryModal = new bootstrap.Modal(galleryModalElement);
    document.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", () => {
            const image = document.getElementById("galleryModalImage");
            image.src = item.dataset.image;
            image.alt = item.dataset.caption;
            document.getElementById("galleryCaption").textContent = item.dataset.caption;
            galleryModal.show();
        });
    });
}

// 6. Validación de formulario y preselección de plan por URL
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    const planSelect = document.getElementById("plan");
    const queryPlan = new URLSearchParams(location.search).get("plan");
    
    if (queryPlan && planSelect) {
        const match = [...planSelect.options].find(option => option.value.toLowerCase() === queryPlan.toLowerCase());
        if (match) planSelect.value = match.value;
    }
    
    contactForm.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();
        contactForm.classList.add("was-validated");
        const alertBox = document.getElementById("formAlert");
        
        if (contactForm.checkValidity()) {
            alertBox.className = "alert alert-success mt-3";
            alertBox.textContent = "Formulario validado correctamente. Para enviar el mensaje de verdad, conecta un servicio de correo o backend.";
            contactForm.reset();
            contactForm.classList.remove("was-validated");
        } else {
            alertBox.className = "alert alert-danger mt-3";
            alertBox.textContent = "Revisa los campos marcados antes de continuar.";
        }
    });
}