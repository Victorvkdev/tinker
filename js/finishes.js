/* Tinker · Colorway picker and drag/keyboard rotation for the 3D finishes viewer. */
'use strict';
/* ---------- finishes UI ---------- */
const CW={graphite:{c:'#2b2926',m:.55,r:.40,cc:.35,ccr:.35,rim:'#cfc8bd',n:'Graphite'},chalk:{c:'#e4ded2',m:0,r:.48,cc:.6,ccr:.25,rim:'#ffffff',n:'Chalk'},moss:{c:'#3e4a3c',m:.35,r:.44,cc:.5,ccr:.3,rim:'#c9e0b8',n:'Moss'}};
const radios=$$('.sw [role=radio]'),finLive=$('#fin-live');let colorway='graphite';
function pickCW(btn,focus){radios.forEach(b=>{const on=b===btn;b.setAttribute('aria-checked',on);b.tabIndex=on?0:-1});if(focus)btn.focus();colorway=btn.dataset.cw;finLive.textContent='Showing Tinker in '+CW[colorway].n+'.';
 $$('.poster').forEach(p=>{if(p.closest('#finishes'))p.style.color=CW[colorway].c});gl&&gl.setCW(colorway)}
radios.forEach((b,i)=>{b.addEventListener('click',()=>pickCW(b));b.addEventListener('keydown',e=>{let j=-1;if(e.key==='ArrowRight'||e.key==='ArrowDown')j=(i+1)%radios.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=(i+radios.length-1)%radios.length;if(j>=0){e.preventDefault();pickCW(radios[j],true)}})});
const fin={rx:0,ry:0,vx:0,intro:reduce?0:1,drag:false,lx:0,ly:0,played:false};
const fs=$('#fin-stage');
fs.addEventListener('pointerdown',e=>{fin.drag=true;fin.lx=e.clientX;fin.ly=e.clientY;fin.vx=0;try{fs.setPointerCapture(e.pointerId)}catch(_){}});
fs.addEventListener('pointermove',e=>{if(!fin.drag)return;const dx=e.clientX-fin.lx,dy=e.clientY-fin.ly;fin.lx=e.clientX;fin.ly=e.clientY;fin.ry+=dx*.009;fin.rx=clamp(fin.rx+dy*.004,-.35,.35);fin.vx=reduce?0:dx*.009});
const endDrag=()=>{fin.drag=false};fs.addEventListener('pointerup',endDrag);fs.addEventListener('pointercancel',endDrag);
const turnTo=(ry,rx)=>{fin.vx=0;if(hasG&&!reduce)G.to(fin,{ry,rx:rx==null?fin.rx:rx,duration:.6,ease:'power3.inOut'});else{fin.ry=ry;if(rx!=null)fin.rx=rx}};
fs.addEventListener('dblclick',()=>turnTo(0,0));
fs.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();turnTo(fin.ry-PI/12)}else if(e.key==='ArrowRight'){e.preventDefault();turnTo(fin.ry+PI/12)}else if(e.key==='Home'){e.preventDefault();turnTo(0,0)}});
