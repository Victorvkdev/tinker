/* Tinker · Wickfire Dash, the mini-game that runs on the device screen. */
'use strict';
/* ---------- Wickfire Dash ---------- */
(function game(){
const cv=$('#game'),ctx=cv.getContext('2d'),W=640,H=360;
const startB=$('#g-start'),sndB=$('#g-sound'),res=$('#g-res'),acts=$('#g-actions'),again=$('#g-again'),dashB=$('#g-dash');
let st='idle',tp=0,pen=0,left=15,got=0,combo=0,best=0,lastC=-9,hit=0,shake=0,bootT=0,cnt=0,flash=0,inv=0,auto=false,running=false,endInfo=null,sc=1;
const pl={x:120,y:200,vx:0,vy:0,dash:0,cd:0,dx:1,dy:0,trail:[]};let sparks=[],hz=[],parts=[];const keys={u:0,d:0,l:0,r:0};
let snd=store.get('tinker-sound')!=='off',ac=null;sndB.textContent='Sound: '+(snd?'on':'off');sndB.setAttribute('aria-pressed',snd);
sndB.addEventListener('click',()=>{snd=!snd;store.set('tinker-sound',snd?'on':'off');sndB.textContent='Sound: '+(snd?'on':'off');sndB.setAttribute('aria-pressed',snd)});
function audio(){try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){ac=null}}
function blip(step,f0=440){if(!snd||!ac)return;try{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=f0*(1+.16*(step-1));o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2,t+.09);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.12)}catch(e){}}
function size(){const r=cv.getBoundingClientRect();if(!r.width)return;const d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);sc=cv.width/W;draw()}
new (window.ResizeObserver||function(){this.observe=()=>{}})(size).observe(cv);
const bg=document.createElement('canvas');bg.width=W;bg.height=H;(()=>{const b=bg.getContext('2d');const g=b.createRadialGradient(320,180,20,320,180,380);g.addColorStop(0,'#1b1714');g.addColorStop(1,'#0b0a09');b.fillStyle=g;b.fillRect(0,0,W,H);b.fillStyle='rgba(235,230,220,.07)';for(let x=20;x<W;x+=32)for(let y=20;y<H;y+=32)b.fillRect(x,y,2,2)})();
const rand=(a,b)=>a+Math.random()*(b-a);
function place(px,py){let x,y,n=0;do{x=rand(50,W-50);y=rand(70,H-40);n++}while(Math.hypot(x-px,y-py)<150&&n<40);return{x,y}}
function reset(){tp=0;pen=0;left=15;got=0;combo=0;best=0;lastC=-9;hit=0;shake=0;flash=0;inv=0;parts=[];Object.assign(pl,{x:120,y:200,vx:0,vy:0,dash:0,cd:0,dx:1,dy:0,trail:[]});
 sparks=[];let px=pl.x,py=pl.y;for(let i=0;i<5;i++){const s=place(px,py);sparks.push(s);px=s.x;py=s.y}
 hz=[{x:rand(80,300),y:132,w:110,h:12,vx:70},{x:rand(340,520),y:262,w:110,h:12,vx:-60}]}
function star(x,y,r,col,al){ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.quadraticCurveTo(x,y,x,y+r);ctx.quadraticCurveTo(x,y,x-r,y);ctx.quadraticCurveTo(x,y,x,y-r);ctx.fill();ctx.globalAlpha=1}
const FD='"Bricolage Grotesque", Arial, sans-serif',FM='"IBM Plex Mono", Menlo, monospace';
function txt(s,x,y,f,col,al='center'){ctx.font=f;ctx.fillStyle=col;ctx.textAlign=al;ctx.fillText(s,x,y)}
function draw(){const now=performance.now()/1000;ctx.setTransform(sc,0,0,sc,0,0);
 if(shake>0&&!reduce)ctx.translate(rand(-3,3),rand(-3,3));
 ctx.drawImage(bg,0,0);
 if(st==='idle'){for(let i=0;i<14;i++)star(60+i*41%560,50+(i*67)%280,4+(i%3)*2,'#ff6a2b',.25);txt('WICKFIRE DASH',320,176,'800 54px '+FD,'#ebe6dc');txt('15 SECONDS · 5 SPARKS',320,214,'500 14px '+FM,'#a39d93');txt('PRESS START',320,268,'500 16px '+FM,'#ff6a2b');return}
 if(st==='boot'){const k=e2(clamp(bootT/.5));ctx.globalAlpha=k;txt('WICKFIRE DASH',320,180,'800 '+Math.round(44+10*k)+'px '+FD,'#ebe6dc');ctx.globalAlpha=1;ctx.fillStyle='rgba(235,230,220,.15)';ctx.fillRect(220,214,200,3);ctx.fillStyle='#ff6a2b';ctx.fillRect(220,214,200*clamp(bootT/.8),3);return}
 // world
 if(tp>4.5)hz.forEach(h=>{const warm=tp<5;ctx.globalAlpha=warm?(Math.sin(now*40)>0?.5:.15):.9;ctx.fillStyle='#4b4741';ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle='#ebe6dc';for(let i=0;i<10;i++)ctx.fillRect(h.x+((i*13+now*120)%h.w),h.y+(i%3)*4,6,2);ctx.globalAlpha=1});
 const s=sparks[got],n=sparks[got+1];if(n)star(n.x,n.y,8,'#ff6a2b',.22);
 if(s&&st!=='end'){const pr=1+.15*Math.sin(now*8);ctx.globalAlpha=.25;ctx.fillStyle='#ff6a2b';ctx.beginPath();ctx.arc(s.x,s.y,22*pr,0,7);ctx.fill();ctx.globalAlpha=1;star(s.x,s.y,13*pr,'#ff6a2b',1)}
 if(!reduce)pl.trail.forEach((p,i)=>{ctx.globalAlpha=(i+1)/pl.trail.length*.35;ctx.fillStyle='#ff6a2b';ctx.beginPath();ctx.arc(p.x,p.y,9*(i+1)/pl.trail.length,0,7);ctx.fill()});ctx.globalAlpha=1;
 ctx.fillStyle=inv>0&&Math.sin(now*50)>0?'#7a756d':'#ebe6dc';ctx.beginPath();ctx.arc(pl.x,pl.y,10,0,7);ctx.fill();
 if(pl.cd>0){ctx.strokeStyle='rgba(255,106,43,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pl.x,pl.y,16,-PI/2,-PI/2+PI*2*(1-pl.cd/.6));ctx.stroke()}
 parts.forEach(p=>{ctx.globalAlpha=clamp(p.l/.5);ctx.fillStyle=p.c;ctx.fillRect(p.x-2,p.y-2,4,4)});ctx.globalAlpha=1;
 // hud
 txt('SPARKS '+got+'/5',20,32,'500 15px '+FM,'#ebe6dc','left');
 txt(Math.max(0,left).toFixed(1),620,32,'500 22px '+FM,flash>0?'#ff6a2b':'#ebe6dc','right');
 if(combo>1&&st==='run')txt('x'+combo,320,32,'700 22px '+FD,'#ff6a2b');
 const cw=st==='run'?clamp(1-(tp-lastC)/2):0;ctx.fillStyle='rgba(235,230,220,.1)';ctx.fillRect(20,H-14,W-40,4);ctx.fillStyle='#ff6a2b';ctx.fillRect(20,H-14,(W-40)*cw*(combo/5),4);
 if(st==='count'){ctx.fillStyle='rgba(12,11,10,.55)';ctx.fillRect(0,0,W,H);txt(String(Math.ceil(cnt)),320,206,'800 96px '+FD,'#ebe6dc')}
 if(st==='paused'){ctx.fillStyle='rgba(12,11,10,.7)';ctx.fillRect(0,0,W,H);txt('PAUSED',320,176,'800 48px '+FD,'#ebe6dc');txt('PRESS START TO RESUME',320,214,'500 14px '+FM,'#a39d93')}
 if(st==='end'&&endInfo){ctx.fillStyle='rgba(12,11,10,.74)';ctx.fillRect(0,0,W,H);txt(endInfo.all?'CLEAR':'TIME',320,128,'500 15px '+FM,'#a39d93');txt(endInfo.got+' / 5',320,196,'800 72px '+FD,'#ebe6dc');txt(endInfo.line,320,236,'500 15px '+FM,'#ebe6dc');
  if(endInfo.rank){ctx.save();ctx.translate(500,140);ctx.rotate(-.12);ctx.strokeStyle='#ff6a2b';ctx.lineWidth=3;ctx.strokeRect(-34,-34,68,68);txt(endInfo.rank,0,22,'800 60px '+FD,'#ff6a2b');ctx.restore()}
  txt('PRESS START TO PLAY AGAIN',320,300,'500 13px '+FM,'#ff6a2b')}}
function burst(x,y){if(reduce)return;for(let i=0;i<12;i++){const a=i/12*PI*2+rand(-.2,.2),v=rand(120,260);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c:i%3?'#ff6a2b':'#ebe6dc'})}}
function dash(){if(st!=='run'||pl.cd>0)return;let dx=keys.r-keys.l,dy=keys.d-keys.u;if(!dx&&!dy){const v=Math.hypot(pl.vx,pl.vy);if(v>20){dx=pl.vx/v;dy=pl.vy/v}else{dx=pl.dx;dy=pl.dy}}const L=Math.hypot(dx,dy)||1;pl.dx=dx/L;pl.dy=dy/L;pl.dash=.15;pl.cd=.6;blip(1,220)}
function update(dt){
 parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.9;p.vy*=.9;p.l-=dt});parts=parts.filter(p=>p.l>0);shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);
 if(st==='boot'){bootT+=dt;if(bootT>=.8)st='run';return}
 if(st==='count'){cnt-=dt;if(cnt<=0)st='run';return}
 if(st!=='run')return;
 if(hit>0){hit-=dt;return}
 tp+=dt;left=15-tp-pen;inv=Math.max(0,inv-dt);
 let ax=keys.r-keys.l,ay=keys.d-keys.u;const al=Math.hypot(ax,ay);if(al){ax/=al;ay/=al;pl.dx=ax;pl.dy=ay}
 if(pl.dash>0){pl.dash-=dt;pl.vx=pl.dx*620;pl.vy=pl.dy*620}else{pl.vx+=ax*2400*dt;pl.vy+=ay*2400*dt;const f=Math.pow(.86,dt*60);pl.vx*=f;pl.vy*=f;const v=Math.hypot(pl.vx,pl.vy);if(v>260){pl.vx*=260/v;pl.vy*=260/v}}
 pl.cd=Math.max(0,pl.cd-dt);pl.x=clamp(pl.x+pl.vx*dt,12,W-12);pl.y=clamp(pl.y+pl.vy*dt,48,H-24);
 pl.trail.push({x:pl.x,y:pl.y});if(pl.trail.length>6)pl.trail.shift();
 if(tp>5)hz.forEach(h=>{h.x+=h.vx*dt;if(h.x<10||h.x+h.w>W-10)h.vx*=-1;const cx=clamp(pl.x,h.x,h.x+h.w),cy=clamp(pl.y,h.y,h.y+h.h);if(inv<=0&&Math.hypot(pl.x-cx,pl.y-cy)<10){pen+=1;flash=.5;inv=.8;pl.vy=(pl.y<h.y?-1:1)*240;blip(1,160)}});
 const s=sparks[got];if(s&&Math.hypot(pl.x-s.x,pl.y-s.y)<24){got++;combo=(got>1&&tp-lastC<=2)?Math.min(5,combo+1):1;lastC=tp;best=Math.max(best,combo);hit=.06;shake=reduce?0:.12;burst(s.x,s.y);blip(combo);if(got>=5){end();return}}
 if(left<=0){left=0;end()}}
function fmt(t){return'0:'+t.toFixed(1).padStart(4,'0')}
let endAt=0;const canRe=()=>st!=='end'||performance.now()-endAt>900;
function end(){st='end';endAt=performance.now();const time=Math.min(15,tp+pen),all=got>=5;const rank=all?(time<=9?'S':time<=12?'A':'B'):'';
 const line=all?fmt(time)+' · best combo x'+best:'best combo x'+best;endInfo={got,all,rank,line};
 let bestT=parseFloat(store.get('tinker-best')||'0');if(all&&(!bestT||time<bestT)){store.set('tinker-best',time.toFixed(1));bestT=time}
 res.innerHTML=(rank?'<span class="rank">Rank '+rank+'</span>':'')+got+' / 5 sparks · '+fmt(time)+' · best combo x'+best+(bestT?' · personal best '+fmt(bestT):'')+'<span class="sub">Wickfire Dash by Lumen Pact. The full game has more levels.</span>';
 acts.hidden=false;startB.textContent='Press start';blip(5,520)}
function loop(){if(!running)return;const now=performance.now();const dt=Math.min(.05,(now-loop.t)/1000);loop.t=now;update(dt);draw();
 if(st==='run'||st==='boot'||st==='count'||parts.length||shake>0)requestAnimationFrame(loop);else running=false}
function go(){if(!running){running=true;loop.t=performance.now();requestAnimationFrame(loop)}}
function start(){audio();if(st==='paused'){st='count';cnt=3;startB.textContent='Press start';go();cv.focus({preventScroll:true});return}
 reset();st='boot';bootT=0;endInfo=null;acts.hidden=true;res.textContent='Running. Five sparks before the timer ends.';cv.focus({preventScroll:true});go()}
function pause(isAuto){if(st!=='run'&&st!=='count'&&st!=='boot')return;st='paused';auto=!!isAuto;startB.textContent='Resume';draw();for(const k in keys)keys[k]=0}
startB.addEventListener('click',start);again.addEventListener('click',start);
cv.addEventListener('click',()=>{if(st==='idle'||st==='end'||st==='paused')start()});
const KM={ArrowUp:'u',w:'u',W:'u',ArrowDown:'d',s:'d',S:'d',ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r'};
cv.addEventListener('keydown',e=>{const k=e.key;
 if(k==='Escape'){pause(false);startB.focus();return}
 if((k==='Enter'||k===' ')&&(st==='idle'||st==='end'||st==='paused')){e.preventDefault();if(canRe())start();return}
 if(st!=='run'&&st!=='count'&&st!=='boot')return;
 if(KM[k]){keys[KM[k]]=1;e.preventDefault()}else if(k===' '){e.preventDefault();dash()}});
cv.addEventListener('keyup',e=>{if(KM[e.key])keys[KM[e.key]]=0});
cv.addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
$$('.pad [data-k]').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();keys[k]=1;b.classList.add('down');if(st==='idle'||st==='end')start()},off=()=>{keys[k]=0;b.classList.remove('down')};
 b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,off))});
dashB.addEventListener('pointerdown',e=>{e.preventDefault();dashB.classList.add('down');if(st==='idle'||st==='end'||st==='paused'){if(canRe())start()}else dash()});
['pointerup','pointercancel','pointerleave'].forEach(t=>dashB.addEventListener(t,()=>dashB.classList.remove('down')));
dashB.addEventListener('click',e=>{if(e.detail===0){if(st==='idle'||st==='end'||st==='paused')start();else dash()}});
new IntersectionObserver(([e])=>{if(!e.isIntersecting)pause(true);else if(st==='paused'&&auto){auto=false;st='count';cnt=3;startB.textContent='Press start';go()}},{threshold:.25}).observe(cv);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true)});
size();})();
