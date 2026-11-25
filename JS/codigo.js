const WEB3FORMS_KEY = "0a54adbe-1b09-4fd2-b458-f3cbb9c9b1eb";
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
}
async function submitFitGym(form, type, status) {
 const button = form.querySelector('[type="submit"]');
 form.classList.add('was-validated');
 status.className = 'alert alert-danger mt-3';
 if (!form.checkValidity()) {status.textContent = 'Revisa los campos obligatorios.'; return;}
 button.disabled = true;
 status.className = 'alert alert-info mt-3';
 status.textContent = 'Guardando información…';
 const data = new FormData(form);
 if (data.get('botcheck')) {button.disabled = false; status.className = 'alert alert-danger mt-3'; status.textContent = 'Solicitud inválida.'; return;}
 data.delete('access_key');
 data.set('tipo', type);
 let saved = false, sent = false, saveError = '', mailError = '';
 const filenames = {contacto:'contactos.txt',suscripcion:'suscripciones.txt',membresia:'membresias.txt'};
 const record = {fecha:new Date().toISOString(), email:String(data.get('email') || '').trim(), consentimiento:true};
 if (type !== 'suscripcion') Object.assign(record,{nombre:data.get('nombre'),telefono:data.get('telefono'),plan:data.get('plan')});
 if (type === 'contacto') record.mensaje = data.get('mensaje');
 if (type === 'membresia') Object.assign(record,{precio_mensual_cop:{Basico:79900,Premium:119900,VIP:179900}[record.plan],estado:'pendiente'});
 try {
  if (data.get('botcheck')) throw new Error('Solicitud inválida.');
  const blob = new Blob([JSON.stringify(record) + '\n'], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filenames[type];
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  saved = true;
 } catch (error) { saveError = error.message; }
 status.textContent = 'Enviando notificación al correo…';
 try {
  const mail = new FormData();
  for (const [key,value] of data) if (key !== 'botcheck') mail.append(key,value);
  mail.set('access_key', WEB3FORMS_KEY);
  mail.set('subject', type === 'membresia' ? 'FitGym: solicitud de membresía' : type === 'contacto' ? 'FitGym: nuevo contacto' : 'FitGym: nueva suscripción');
  mail.set('name', data.get('nombre') || 'FitGym Newsletter');
  mail.set('message', type === 'contacto' ? data.get('mensaje') : type === 'membresia' ? 'Solicitud de membresía: ' + data.get('plan') : 'Nueva suscripción al newsletter de FitGym.');
  const response = await fetch('https://api.web3forms.com/submit', {method:'POST', body:mail, headers:{Accept:'application/json'}});
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw new Error(result?.message || `HTTP ${response.status}`);
  sent = true;
 } catch (error) { mailError = error.message; }
 status.className = 'alert mt-3 ' + (saved && sent ? 'alert-success' : saved || sent ? 'alert-warning' : 'alert-danger');
 status.textContent = (saved ? 'Descarga TXT solicitada. Revisa tus descargas.' : 'No se pudo generar el TXT: ' + saveError) + ' ' + (sent ? 'Notificación enviada correctamente.' : 'Correo no enviado: ' + mailError);
 if (saved || sent) {const selectedPlan = data.get('plan'); form.reset(); if (type === 'membresia') form.elements.plan.value = selectedPlan; form.classList.remove('was-validated');}
 button.disabled = false;
}
if (contactForm) contactForm.addEventListener('submit', event => {event.preventDefault(); submitFitGym(contactForm, 'contacto', document.getElementById('formAlert'));});
document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', event => {event.preventDefault(); submitFitGym(form, 'suscripcion', form.querySelector('.newsletter-status'));}));

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

// Si una imagen externa falla, mostrar la imagen local de respaldo.
document.querySelectorAll("#fitCarousel .carousel-item > img").forEach((img,i)=>{img.addEventListener("error",()=>{if(!img.dataset.fallback){img.dataset.fallback="1";img.src=`IMG/fitgym-slide-${i+1}.jpg`;}});});


const membershipModal = document.getElementById('membershipModal');
if (membershipModal) {
 const form = document.getElementById('membershipForm');
 const status = document.getElementById('membershipStatus');
 membershipModal.addEventListener('show.bs.modal', event => {
  const plan = event.relatedTarget?.dataset.plan || new URLSearchParams(location.search).get('plan');
  if (!Object.hasOwn(membershipData, plan)) {event.preventDefault(); return;}
  form.reset(); form.classList.remove('was-validated'); status.textContent=''; status.className='';
  form.elements.plan.value=plan;
  document.getElementById('selectedMembership').textContent=plan==='Basico'?'Básico':plan;
  document.getElementById('selectedPrice').textContent=membershipData[plan].price;
 });
 form.addEventListener('submit', event => {event.preventDefault(); submitFitGym(form,'membresia',status);});
 const requestedPlan=new URLSearchParams(location.search).get('plan');
 if (Object.hasOwn(membershipData,requestedPlan)) bootstrap.Modal.getOrCreateInstance(membershipModal).show();
}
