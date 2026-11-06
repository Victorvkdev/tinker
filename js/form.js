/* Tinker · Reserve form with inline validation. Nothing is sent anywhere. */
'use strict';
/* ---------- form ---------- */
const form=$('#reserve-form'),email=$('#email'),fmsg=$('#form-msg'),rbtn=$('#reserve-btn');
form.addEventListener('submit',e=>{e.preventDefault();if(rbtn.getAttribute('aria-disabled')==='true')return;if(!email.value.trim()||!email.checkValidity()){email.setAttribute('aria-invalid','true');fmsg.textContent='Enter an email like you@example.com.';email.focus();return}
 email.removeAttribute('aria-invalid');rbtn.textContent='Reserved';rbtn.setAttribute('aria-disabled','true');email.readOnly=true;fmsg.textContent='Your Tinker is on hold for '+email.value.trim()+'. Concept page, so nothing was sent.';fmsg.focus()});
email.addEventListener('input',()=>{if(email.getAttribute('aria-invalid')&&email.checkValidity()){email.removeAttribute('aria-invalid');fmsg.textContent=''}});
