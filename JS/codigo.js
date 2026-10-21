


//Botón de "Volver arriba" (Back to Top)
const backTop = document.getElementById("backTop");

if (backTop) {
    backTop.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// Filtro de horarios por día
const dayFilter = document.getElementById("dayFilter");
if (dayFilter) {
    dayFilter.addEventListener("change", () => {
        document.querySelectorAll("#scheduleBody tr").forEach(row => {
            row.hidden = dayFilter.value !== "todos" && row.dataset.day !== dayFilter.value;
        });
    });
}


//  Validación de formulario y preselección de plan por URL
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