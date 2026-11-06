/* Tinker · Smooth scroll, anchor links, section metrics, nav and the teardown captions. */
'use strict';
/* ---------- smooth scroll + anchors ---------- */
let lenis=null;
if(hasG&&!reduce&&window.Lenis&&!COARSE.matches){try{lenis=new Lenis({lerp:.09,smoothWheel:true});lenis.on('scroll',ST.update);G.ticker.add(t=>lenis.raf(t*1000));G.ticker.lagSmoothing(0)}catch(e){lenis=null}}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);const t=id&&document.getElementById(id);if(!t)return;e.preventDefault();
 if(lenis)lenis.scrollTo(t,{duration:1.3});else t.scrollIntoView({behavior:reduce?'auto':'smooth'});
 if(!t.hasAttribute('tabindex'))t.setAttribute('tabindex','-1');t.focus({preventScroll:true})});

/* ---------- metrics ---------- */
const secs={hero:$('#overview'),inside:$('#inside'),fin:$('#finishes'),close:$('#reserve')};
const M={};let vw=innerWidth,vh=innerHeight;
function measure(){const y=scrollY;vw=innerWidth;vh=innerHeight;for(const k in secs){const r=secs[k].getBoundingClientRect();M[k]={top:r.top+y,h:r.height}}}
measure();
let mT=0;const remeasure=()=>{clearTimeout(mT);mT=setTimeout(()=>{measure();if(gl)gl.resize()},120)};
addEventListener('resize',remeasure);
if(window.ResizeObserver)new ResizeObserver(remeasure).observe($('#main'));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{measure();hasG&&ST.refresh()});

/* ---------- nav ---------- */
const nav=$('#nav');
const toneIO=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)nav.classList.toggle('on-light',e.target.dataset.tone==='light')},{rootMargin:'-26px 0px -96% 0px'});
$$('[data-tone]').forEach(s=>toneIO.observe(s));
let navY=0;
function navScroll(y){if(reduce||nav.contains(document.activeElement)){nav.classList.remove('is-hidden');navY=y;return}
 const d=y-navY;if(Math.abs(d)<6)return;nav.classList.toggle('is-hidden',d>0&&y>vh*.8);navY=y}

/* ---------- story captions (independent of WebGL) ---------- */
const caps=$$('#inside .cap'),rail=$$('#inside .rail i'),legend=$('#inside .legend');let capI=0;
function insideP(y){const m=M.inside;return clamp((y-m.top)/Math.max(1,m.h-vh))}
function capsUpdate(y){if(reduce)return;const p=insideP(y);const i=p<.3?0:p<.56?1:p<.92?2:3;if(i!==capI){caps[capI].classList.remove('is-on');rail[capI].classList.remove('on');capI=i;caps[i].classList.add('is-on');rail[i].classList.add('on')}
 if(legend&&MOB.matches)legend.style.opacity=(i===1||i===2)?1:0}
