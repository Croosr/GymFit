// Clave pública de Web3Forms utilizada para identificar el formulario remoto.
const WEB3FORMS_KEY = "0a54adbe-1b09-4fd2-b458-f3cbb9c9b1eb";
// Actualiza el año del pie de página sin editar el HTML.
document.querySelectorAll('.current-year,[data-year]').forEach(el => el.textContent = new Date().getFullYear());
// Localiza el botón de regreso al inicio y activa el desplazamiento suave.
const backTop = document.getElementById('backTop');
if (backTop) backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
// Filtro de horarios heredado; solo funciona si existe el selector en la página.
const dayFilter = document.getElementById('dayFilter');
if (dayFilter) dayFilter.addEventListener('change', () => document.querySelectorAll('#scheduleBody tr').forEach(row => row.hidden = dayFilter.value !== 'todos' && row.dataset.day !== dayFilter.value));
// Busca el formulario de contacto; no todas las páginas lo contienen.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
 // Recupera el plan indicado en la URL y lo selecciona si existe.
 const planSelect = document.getElementById('plan');
 const queryPlan = new URLSearchParams(location.search).get('plan');
 if (queryPlan && planSelect) {const option = [...planSelect.options].find(o => o.value.toLowerCase() === queryPlan.toLowerCase()); if (option) planSelect.value = option.value;}
}
// Función común asíncrona para contacto, suscripción y membresía.
async function submitFitGym(form, type, status) {
 // Obtiene el botón de envío para evitar solicitudes simultáneas.
 const button = form.querySelector('[type="submit"]');
 // Activa los estilos de validación de Bootstrap.
 form.classList.add('was-validated');
 status.className = 'alert alert-danger mt-3';
 // Comprueba los campos obligatorios antes de continuar.
 if (!form.checkValidity()) {status.textContent = 'Revisa los campos obligatorios.'; return;}
 // Deshabilita temporalmente el botón durante el proceso.
 button.disabled = true;
 status.className = 'alert alert-info mt-3';
 status.textContent = 'Guardando información…';
 // Recoge los valores del formulario mediante FormData.
 const data = new FormData(form);
 // Comprueba el campo trampa antispam.
 if (data.get('botcheck')) {button.disabled = false; status.className = 'alert alert-danger mt-3'; status.textContent = 'Solicitud inválida.'; return;}
 // Elimina una clave previa y asigna el tipo de solicitud.
 data.delete('access_key');
 data.set('tipo', type);
 // Controla por separado el resultado de la descarga y el correo.
 let saved = false, sent = false, saveError = '', mailError = '';
 // Define el nombre del TXT según el tipo de formulario.
 const filenames = {contacto:'contactos.txt',suscripcion:'suscripciones.txt',membresia:'membresias.txt'};
 // Construye el registro con fecha ISO, correo y consentimiento.
 const record = {fecha:new Date().toISOString(), email:String(data.get('email') || '').trim(), consentimiento:true};
 // Agrega nombre, teléfono y plan cuando corresponda.
 if (type !== 'suscripcion') Object.assign(record,{nombre:data.get('nombre'),telefono:data.get('telefono'),plan:data.get('plan')});
 // Incluye el mensaje del contacto.
 if (type === 'contacto') record.mensaje = data.get('mensaje');
 // Añade precio ilustrativo y estado pendiente; no procesa pagos.
 if (type === 'membresia') Object.assign(record,{precio_mensual_cop:{Basico:79900,Premium:119900,VIP:179900}[record.plan],estado:'pendiente'});
 try {
  if (data.get('botcheck')) throw new Error('Solicitud inválida.');
  // Convierte el registro JSON en un archivo de texto descargable.
  const blob = new Blob([JSON.stringify(record) + '\n'], {type:'text/plain;charset=utf-8'});
  // Crea una URL temporal para el archivo generado en memoria.
  const url = URL.createObjectURL(blob);
  // Crea un enlace de descarga sin necesidad de PHP ni servidor de datos.
  const link = document.createElement('a');
  link.href = url; link.download = filenames[type];
  // Solicita la descarga en el dispositivo del visitante.
  document.body.appendChild(link); link.click(); link.remove();
  // Libera la URL temporal después de 30 segundos.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  // Marca que se solicitó la descarga, no confirma escritura en disco.
  saved = true;
 } catch (error) { saveError = error.message; }
 // Inicia el envío al correo independientemente del resultado del TXT.
 status.textContent = 'Enviando notificación al correo…';
 try {
  // Prepara los datos que se enviarán a Web3Forms.
  const mail = new FormData();
  for (const [key,value] of data) if (key !== 'botcheck') mail.append(key,value);
  // Incluye la clave pública requerida por la API.
  mail.set('access_key', WEB3FORMS_KEY);
  // Define el asunto según el formulario.
  mail.set('subject', type === 'membresia' ? 'FitGym: solicitud de membresía' : type === 'contacto' ? 'FitGym: nuevo contacto' : 'FitGym: nueva suscripción');
  // Establece el nombre visible del remitente.
  mail.set('name', data.get('nombre') || 'FitGym Newsletter');
  // Construye el contenido de la notificación.
  mail.set('message', type === 'contacto' ? data.get('mensaje') : type === 'membresia' ? 'Solicitud de membresía: ' + data.get('plan') : 'Nueva suscripción al newsletter de FitGym.');
  // Envía una petición HTTP POST a Web3Forms mediante Fetch API.
  const response = await fetch('https://api.web3forms.com/submit', {method:'POST', body:mail, headers:{Accept:'application/json'}});
  // Interpreta la respuesta JSON y verifica si el servicio aceptó el envío.
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw new Error(result?.message || `HTTP ${response.status}`);
  sent = true;
 } catch (error) { mailError = error.message; }
 // Selecciona el estilo del aviso según ambos resultados.
 status.className = 'alert mt-3 ' + (saved && sent ? 'alert-success' : saved || sent ? 'alert-warning' : 'alert-danger');
 // Informa si se solicitó el TXT y si Web3Forms aceptó la notificación.
 status.textContent = (saved ? 'Descarga TXT solicitada. Revisa tus descargas.' : 'No se pudo generar el TXT: ' + saveError) + ' ' + (sent ? 'Notificación enviada correctamente.' : 'Correo no enviado: ' + mailError);
 // Limpia el formulario si alguna operación tuvo éxito y conserva el plan elegido.
 if (saved || sent) {const selectedPlan = data.get('plan'); form.reset(); if (type === 'membresia') form.elements.plan.value = selectedPlan; form.classList.remove('was-validated');}
 // Vuelve a habilitar el botón de envío.
 button.disabled = false;
}
// Intercepta el envío de contacto para evitar la recarga de la página.
if (contactForm) contactForm.addEventListener('submit', event => {event.preventDefault(); submitFitGym(contactForm, 'contacto', document.getElementById('formAlert'));});
// Conecta todos los formularios de suscripción con la función común.
document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', event => {event.preventDefault(); submitFitGym(form, 'suscripcion', form.querySelector('.newsletter-status'));}));

// Comparador de membresías: información ilustrativa del proyecto.
// Catálogo de precios y beneficios ilustrativos utilizado por el comparador y el modal.
const membershipData = {
 Basico:{price:'$79.900 / mes',features:['Zona de máquinas','Área de cardio','Horario regular']},
 Premium:{price:'$119.900 / mes',features:['Zona de máquinas','Área de cardio','Horario regular','Clases grupales','Orientación inicial']},
 VIP:{price:'$179.900 / mes',features:['Zona de máquinas','Área de cardio','Horario regular','Clases grupales','Orientación inicial','Sesión personalizada mensual','Seguimiento de objetivos']}
};
// Obtiene los selectores de planes y el contenedor del resultado.
const compareA=document.getElementById('compareA');
const compareB=document.getElementById('compareB');
const comparisonResult=document.getElementById('comparisonResult');
if(compareA&&compareB&&comparisonResult){
 // Reconstruye la tabla al cambiar cualquiera de los planes.
 const renderComparison=()=>{
  const a=compareA.value,b=compareB.value;
  // Une los beneficios de ambos planes sin repetirlos.
  const features=[...new Set([...membershipData[a].features,...membershipData[b].features])];
  // Genera filas de precios y disponibilidad de beneficios.
  const rows=[['Precio ilustrativo',membershipData[a].price,membershipData[b].price],...features.map(f=>[f,membershipData[a].features.includes(f)?'Incluido':'No incluido',membershipData[b].features.includes(f)?'Incluido':'No incluido'])];
  // Elimina la tabla anterior antes de generar la nueva.
  comparisonResult.replaceChildren();
  // Crea una tabla HTML mediante el DOM.
  const table=document.createElement('table');
  // Construye los encabezados de la tabla.
  const thead=document.createElement('thead');const headRow=document.createElement('tr');
  ['Característica',a,b].forEach(label=>{const th=document.createElement('th');th.textContent=label;headRow.append(th)});thead.append(headRow);table.append(thead);
  // Construye las filas y celdas con texto seguro mediante textContent.
  const tbody=document.createElement('tbody');rows.forEach(row=>{const tr=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});tbody.append(tr)});table.append(tbody);comparisonResult.append(table);
 };compareA.addEventListener('change',renderComparison);compareB.addEventListener('change',renderComparison);renderComparison();
}

// Si una imagen externa falla, mostrar la imagen local de respaldo.
document.querySelectorAll("#fitCarousel .carousel-item > img").forEach((img,i)=>{img.addEventListener("error",()=>{if(!img.dataset.fallback){img.dataset.fallback="1";img.src=`IMG/fitgym-slide-${i+1}.jpg`;}});});


// Localiza la ventana modal de solicitud de membresía.
const membershipModal = document.getElementById('membershipModal');
if (membershipModal) {
 const form = document.getElementById('membershipForm');
 const status = document.getElementById('membershipStatus');
 // Al abrir el modal, identifica el plan y actualiza el formulario.
 membershipModal.addEventListener('show.bs.modal', event => {
  // Obtiene el plan desde el botón pulsado o desde la URL.
  const plan = event.relatedTarget?.dataset.plan || new URLSearchParams(location.search).get('plan');
  // Rechaza planes que no pertenecen al catálogo.
  if (!Object.hasOwn(membershipData, plan)) {event.preventDefault(); return;}
  // Limpia datos y mensajes de solicitudes anteriores.
  form.reset(); form.classList.remove('was-validated'); status.textContent=''; status.className='';
  // Guarda el plan seleccionado en el campo oculto.
  form.elements.plan.value=plan;
  // Muestra el nombre y el precio del plan al visitante.
  document.getElementById('selectedMembership').textContent=plan==='Basico'?'Básico':plan;
  document.getElementById('selectedPrice').textContent=membershipData[plan].price;
 });
 // Envía la solicitud de membresía mediante la función común.
 form.addEventListener('submit', event => {event.preventDefault(); submitFitGym(form,'membresia',status);});
 // Permite abrir el modal directamente desde enlaces con un plan en la URL.
 const requestedPlan=new URLSearchParams(location.search).get('plan');
 if (Object.hasOwn(membershipData,requestedPlan)) bootstrap.Modal.getOrCreateInstance(membershipModal).show();
}
