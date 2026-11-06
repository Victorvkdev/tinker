/* Tinker · GSAP text reveals, the horizontal detail reel and the live panels (waveform). */
'use strict';
/* ---------- motion: GSAP layers ---------- */
function splitWords(el){const wrap=t=>t.split(/(\s+)/).map(w=>/^\s+$/.test(w)||!w?w:'<span class="w">'+w+'</span>').join('');el.innerHTML=Array.from(el.childNodes).map(n=>n.nodeType===3?wrap(n.textContent):'<'+n.tagName.toLowerCase()+'>'+wrap(n.textContent)+'</'+n.tagName.toLowerCase()+'>').join('');return $$('.w',el)}
function splitChars(el){const t=el.textContent;el.innerHTML=Array.from(t).map(c=>c===' '?' ':'<span class="ch">'+c+'</span>').join('');el.setAttribute('aria-hidden','true');el.insertAdjacentHTML('beforebegin','<span class="vh">'+t+'</span>');return $$('.ch',el)}
if(hasG&&!reduce){
 const chars=splitChars($('[data-split]'));
 G.from(chars,{yPercent:108,duration:.9,ease:'expo.out',stagger:.035,delay:.08,clearProps:'transform'});
 const words=splitWords($('[data-words]'));
 G.fromTo(words,{opacity:.42},{opacity:1,ease:'none',stagger:.08,scrollTrigger:{trigger:'.mani-text',start:'top 85%',end:'top 35%',scrub:true}});
 $$('[data-count]').forEach(el=>ST.create({trigger:el,start:'top 96%',once:true,onEnter:()=>G.fromTo(el,{yPercent:40,opacity:.4},{yPercent:0,opacity:1,duration:.7,ease:'power3.out',clearProps:'transform,opacity'})}));
 G.utils.toArray('.stat').forEach(s=>G.fromTo(s,{'--x':0},{'--x':1,duration:1,ease:'expo.out',scrollTrigger:{trigger:s,start:'top bottom',once:true}}));
 ST.batch('.spec',{start:'top bottom',once:true,onEnter:b=>G.from(b,{y:16,opacity:.35,duration:.6,ease:'expo.out',stagger:.04})});
 G.from('.close-title .ln',{yPercent:30,opacity:.35,duration:.9,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:'.close-title',start:'top bottom',once:true}});
 const mm=G.matchMedia();
 mm.add('(min-width: 820px)',()=>{
  ST.create({trigger:'#inside',start:'top top',end:'bottom bottom',snap:COARSE.matches?false:{snapTo:[0,.14,.48,.64,1],duration:{min:.2,max:.6},ease:'power2.inOut',delay:.12,directional:true}});
  // horizontal reel
  root.classList.add('reel-pin');const sec=$('.reel'),track=$('.reel-track'),intro=$('.reel-intro');track.prepend(intro);track.removeAttribute('data-lenis-prevent');
  const dist=()=>Math.max(0,track.scrollWidth-innerWidth);
  sec.style.height=(innerHeight+dist())+'px';
  const tl=G.timeline({scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true,onRefreshInit:()=>{sec.style.height=(innerHeight+dist())+'px'}}});
  tl.to(track,{x:()=>-dist(),ease:'none'},0).fromTo('.art-in',{xPercent:6},{xPercent:-6,ease:'none'},0);
  const onFocus=e=>{const p=e.target.closest('.panel');if(!p)return;const r=sec.getBoundingClientRect(),top=r.top+scrollY;const pr=clamp((p.offsetLeft-innerWidth*.3)/Math.max(1,dist()));const y=top+pr*dist();if(lenis)lenis.scrollTo(y,{immediate:true});else scrollTo(0,y)};
  track.addEventListener('focusin',onFocus);
  return()=>{root.classList.remove('reel-pin');sec.style.height='';G.set(track,{x:0});track.removeEventListener('focusin',onFocus);track.before(intro);track.setAttribute('data-lenis-prevent','')}});
}
/* reel dots (row mode) */
const trk=$('.reel-track'),dots=$$('.dots i');
trk.addEventListener('scroll',()=>{if(root.classList.contains('reel-pin'))return;const kids=trk.children;let bi=0,bd=1e9;for(let i=0;i<kids.length;i++){const d=Math.abs(kids[i].offsetLeft-trk.scrollLeft-16);if(d<bd){bd=d;bi=i}}dots.forEach((d,i)=>d.classList.toggle('on',i===bi))},{passive:true});
trk.addEventListener('focusin',e=>{if(root.classList.contains('reel-pin'))return;const p=e.target.closest('.panel');p&&p.scrollIntoView({inline:'start',block:'nearest',behavior:reduce?'auto':'smooth'})});

/* panel live state + waveform */
const wave=$('#wave'),wx=wave.getContext('2d');let waveOn=false,waveT=0;
function drawWave(t){const w=480,h=300;wx.clearRect(0,0,w,h);wx.lineWidth=2;
 for(let k=0;k<2;k++){wx.beginPath();for(let x=0;x<=w;x+=4){const u=x/w;const y=h*(k?.66:.36)+(k?Math.sin(u*28+t*7)*(10+20*Math.abs(Math.sin(u*3+t))):Math.sin(u*9-t*3)*Math.sin(u*40+t*9)*22);x?wx.lineTo(x,y):wx.moveTo(x,y)}wx.strokeStyle=k?'#ebe6dc':'#ff6a2b';wx.stroke()}
 wx.font='500 13px IBM Plex Mono, monospace';wx.fillStyle='#a39d93';wx.fillText('LEFT GRIP · RAIN',70,40);wx.fillText('RIGHT GRIP · FOOTSTEPS',70,276)}
drawWave(1.2);
function waveLoop(){if(!waveOn)return;waveT+=1/60;drawWave(waveT);requestAnimationFrame(waveLoop)}
const liveIO=new IntersectionObserver(es=>{for(const e of es){const on=e.isIntersecting&&!reduce;e.target.classList.toggle('is-live',on);if(e.target.contains(wave)){if(on&&!waveOn){waveOn=true;waveLoop()}else if(!on)waveOn=false}}},{threshold:.5});
$$('.panel').forEach(p=>liveIO.observe(p));
