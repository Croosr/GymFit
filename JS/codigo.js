document.querySelectorAll('.current-year,[data-year]').forEach(el => el.textContent = new Date().getFullYear());
const backTop = document.getElementById('backTop');
if (backTop) backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
const dayFilter = document.getElementById('dayFilter');
if (dayFilter) dayFilter.addEventListener('change', () => document.querySelectorAll('#scheduleBody tr').forEach(row => row.hidden = dayFilter.value !== 'todos' && row.dataset.day !== dayFilter.value));
const contactForm = document.getElementById('contactForm');
if (contactForm) {
 const planSelect = document.getElementById('plan');
 const queryPlan = new URLSearchParams(location.search).get('plan');
 if (queryPlan && planSelect) {const option = [...planSelect.options].find(o => o.value.toLowerCase() === queryPlan.toLowerCase()); if (option) planSelect.value = option.value;}
 contactForm.addEventListener('submit', async event => {
  event.preventDefault();contactForm.classList.add('was-validated');
  const alertBox = document.getElementById('formAlert');
  if (!contactForm.checkValidity()) {alertBox.className='alert alert-danger mt-3';alertBox.textContent='Revisa los campos obligatorios.';return;}
  const key=contactForm.querySelector('[name="access_key"]').value;
  if (key==='REEMPLAZA_CON_TU_ACCESS_KEY') {alertBox.className='alert alert-warning mt-3';alertBox.textContent='Falta configurar la clave de Web3Forms en contacto.html.';return;}
  const button=contactForm.querySelector('[type="submit"]');button.disabled=true;
  try {const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(contactForm)});const result=await response.json();if(!response.ok||!result.success)throw new Error(result.message||'No se pudo enviar');alertBox.className='alert alert-success mt-3';alertBox.textContent='Mensaje enviado correctamente.';contactForm.reset();contactForm.classList.remove('was-validated');}
  catch(error){alertBox.className='alert alert-danger mt-3';alertBox.textContent='Error al enviar: '+error.message;}
  finally{button.disabled=false;}
 });
}
document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', event => {event.preventDefault();const status=form.querySelector('.newsletter-status');const email=form.querySelector('input[type="email"]');if(!email.checkValidity()){status.textContent='Escribe un correo válido.';return;}status.textContent='Newsletter pendiente de conectar con un servicio de suscripciones. No se ha registrado tu correo.';}));
const geoButton=document.getElementById('geoButton');
if(geoButton) geoButton.addEventListener('click',()=>{const status=document.getElementById('geoStatus');if(!navigator.geolocation){status.textContent='Tu navegador no admite geolocalización.';return;}status.textContent='Solicitando permiso de ubicación…';navigator.geolocation.getCurrentPosition(position=>{const {latitude,longitude}=position.coords;const link=document.getElementById('mapLink');link.href=`https://www.google.com/maps?q=${encodeURIComponent(latitude+','+longitude)}`;link.classList.remove('d-none');document.getElementById('locationMap').src=`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-.01}%2C${latitude-.01}%2C${longitude+.01}%2C${latitude+.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;status.textContent='Ubicación mostrada en el mapa. No se ha enviado a FitGym.';},error=>{status.textContent=error.code===1?'Permiso denegado. Puedes continuar sin compartir tu ubicación.':'No fue posible obtener tu ubicación. Prueba con HTTPS o localhost.';},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});});

// Comparador de membresías: información ilustrativa del proyecto.
const membershipData = {
 Basico:{price:'$79.900 / mes',features:['Zona de máquinas','Área de cardio','Horario regular']},
 Premium:{price:'$119.900 / mes',features:['Zona de máquinas','Área de cardio','Horario regular','Clases grupales','Orientación inicial']},
 VIP:{price:'$179.900 / mes',features:['Zona de máquinas','Área de cardio','Horario regular','Clases grupales','Orientación inicial','Sesión personalizada mensual','Seguimiento de objetivos']}
};
const compareA=document.getElementById('compareA');
const compareB=document.getElementById('compareB');
const comparisonResult=document.getElementById('comparisonResult');
if(compareA&&compareB&&comparisonResult){
 const renderComparison=()=>{
  const a=compareA.value,b=compareB.value;
  const features=[...new Set([...membershipData[a].features,...membershipData[b].features])];
  const rows=[['Precio ilustrativo',membershipData[a].price,membershipData[b].price],...features.map(f=>[f,membershipData[a].features.includes(f)?'Incluido':'No incluido',membershipData[b].features.includes(f)?'Incluido':'No incluido'])];
  comparisonResult.replaceChildren();
  const table=document.createElement('table');
  const thead=document.createElement('thead');const headRow=document.createElement('tr');
  ['Característica',a,b].forEach(label=>{const th=document.createElement('th');th.textContent=label;headRow.append(th)});thead.append(headRow);table.append(thead);
  const tbody=document.createElement('tbody');rows.forEach(row=>{const tr=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});tbody.append(tr)});table.append(tbody);comparisonResult.append(table);
 };compareA.addEventListener('change',renderComparison);compareB.addEventListener('change',renderComparison);renderComparison();
}
