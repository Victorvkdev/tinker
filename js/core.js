/* Tinker · Shared helpers, media queries and state used by every module. */
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement;root.classList.add('js');
const RM=matchMedia('(prefers-reduced-motion: reduce)'),MOB=matchMedia('(max-width: 819px)'),COARSE=matchMedia('(pointer: coarse)');
const reduce=RM.matches;
const G=window.gsap,ST=window.ScrollTrigger,hasG=!!(G&&ST);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,PI=Math.PI;
const e2=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
if(hasG){G.registerPlugin(ST);ST.config({ignoreMobileResize:true})}

let gl=null; // WebGL scene API, set by device.js once three.js boots
