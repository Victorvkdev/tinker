/* Tinker · three.js device: model, materials, screen texture, teardown poses, callouts and render loop. */
'use strict';
/* ---------- three.js ---------- */
function loadThree(){return window.THREE?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=ok;s.onerror=no;(document.head||document.body).appendChild(s)})}
function noGL(){gl=null;root.classList.add('no-gl');const f=$('#fin-stage');f.removeAttribute('tabindex');f.removeAttribute('aria-roledescription');f.setAttribute('role','img');f.setAttribute('aria-label','Tinker in '+CW[colorway].n)}
const idle=window.requestIdleCallback||(f=>setTimeout(f,200));
function boot3D(){let ok=false;try{const c=document.createElement('canvas');const g=c.getContext('webgl')||c.getContext('experimental-webgl');ok=!!g;const lx=g&&g.getExtension('WEBGL_lose_context');lx&&lx.loseContext()}catch(e){}
 if(!ok){noGL();return}
 loadThree().then(()=>{try{gl=buildGL()}catch(e){noGL()}}).catch(noGL)}

function buildGL(){
const T=THREE,cv=$('#gl');
const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'});
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();root.classList.remove('gl-on');cv.style.visibility='hidden';csvg.style.visibility='hidden';noGL()},{once:true});
R.setClearColor(0,0);R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.physicallyCorrectLights=true;
let dpr=Math.min(devicePixelRatio||1,MOB.matches?1.5:2);R.setPixelRatio(dpr);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(28,1,.1,80);
const C=h=>new T.Color(h).convertSRGBToLinear();
/* studio env */
(function(){const s=new T.Scene();
 const sg=new T.SphereGeometry(10,32,16),pp=sg.attributes.position,cols=[],ca=C('#3a3633'),cb=C('#15140f'),cc=C('#0b0a09'),tc=new T.Color();
 for(let i=0;i<pp.count;i++){const y=pp.getY(i)/10;if(y>0)tc.copy(cb).lerp(ca,clamp(y/.8));else tc.copy(cb).lerp(cc,clamp(-y/.5));cols.push(tc.r,tc.g,tc.b)}
 sg.setAttribute('color',new T.Float32BufferAttribute(cols,3));
 s.add(new T.Mesh(sg,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,depthWrite:false})));
 const box=(w,h,i,col,pos)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:C(col).multiplyScalar(i),side:T.DoubleSide}));m.position.set(pos[0],pos[1],pos[2]);m.lookAt(0,0,0);s.add(m)};
 box(5,1.3,6,'#ffffff',[0,5,1.5]);box(.7,4.5,3.5,'#fff1e0',[-5,.6,1.2]);box(.7,4.5,2.5,'#dfe6ff',[5,.6,-.6]);box(3.2,1.6,1.2,'#ffffff',[0,1.2,6]);box(2.5,.5,1.6,'#ffe2cc',[0,-3,3]);
 const pm=new T.PMREMGenerator(R);scene.environment=pm.fromScene(s,.04).texture;pm.dispose();
 s.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose()})})();
/* lights */
scene.add(new T.HemisphereLight(C('#f4efe6'),C('#1a1816'),.9));
const key=new T.DirectionalLight(C('#fff1e0'),3);key.position.set(3,4,5);scene.add(key);
const rimL=new T.DirectionalLight(C('#9fb4ff'),1.4);rimL.position.set(-4,1.5,-3);scene.add(rimL);
/* materials */
const rimU={c:{value:C('#cfc8bd')},s:{value:.12}};
const rimify=m=>{m.onBeforeCompile=sh=>{sh.uniforms.rimC=rimU.c;sh.uniforms.rimS=rimU.s;sh.fragmentShader='uniform vec3 rimC;uniform float rimS;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat frs=pow(1.-clamp(abs(dot(normal,normalize(vViewPosition))),0.,1.),3.);totalEmissiveRadiance+=rimC*frs*rimS;')};return m};
const Ph=o=>new T.MeshPhysicalMaterial(o);
const cw0=CW.graphite;
const bodyMat=rimify(Ph({color:C(cw0.c),metalness:cw0.m,roughness:cw0.r,clearcoat:cw0.cc,clearcoatRoughness:cw0.ccr,envMapIntensity:2}));
const mat={
 seam:new T.MeshStandardMaterial({color:C('#0c0b0a'),roughness:.8}),
 glass:Ph({color:C('#050505'),roughness:.05,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.4}),
 rubber:Ph({color:C('#1a1918'),roughness:.82,envMapIntensity:.7}),
 metal:Ph({color:C('#c8c3ba'),metalness:1,roughness:.28,envMapIntensity:1.2}),
 cap:Ph({color:C('#22201e'),roughness:.32,metalness:.1,clearcoat:1,clearcoatRoughness:.08}),
 signal:Ph({color:C('#ff6a2b'),roughness:.35,clearcoat:.8,clearcoatRoughness:.2,emissive:C('#ff6a2b'),emissiveIntensity:.06}),
 copper:Ph({color:C('#b8744a'),metalness:1,roughness:.32,envMapIntensity:1.3}),
 batt:Ph({color:C('#2c2c2e'),roughness:.4,clearcoat:.6,clearcoatRoughness:.2}),
 dot:new T.MeshBasicMaterial({color:C('#a39d93')}),
 led:new T.MeshStandardMaterial({color:C('#2a201b'),emissive:C('#ff6a2b'),emissiveIntensity:0,roughness:.4})};
/* geometry helpers */
const OUT=[['L',.84,.555],['C',1.10,.555,1.26,.48,1.27,.24],['C',1.285,0,1.28,-.40,1.14,-.60],['C',1.01,-.75,.76,-.76,.64,-.635],['C',.57,-.56,.50,-.555,.38,-.555],['L',0,-.555]];
function outline(sc=1){const s=new T.Shape();s.moveTo(0,.555*sc);let prev=[0,.555];const segs=[];
 for(const g of OUT){if(g[0]==='L'){s.lineTo(g[1]*sc,g[2]*sc);segs.push(['L',prev]);prev=[g[1],g[2]]}else{s.bezierCurveTo(g[1]*sc,g[2]*sc,g[3]*sc,g[4]*sc,g[5]*sc,g[6]*sc);segs.push(['C',prev,[g[1],g[2]],[g[3],g[4]]]);prev=[g[5],g[6]]}}
 for(let i=segs.length-1;i>=0;i--){const g=segs[i];if(g[0]==='L')s.lineTo(-g[1][0]*sc,g[1][1]*sc);else s.bezierCurveTo(-g[3][0]*sc,g[3][1]*sc,-g[2][0]*sc,g[2][1]*sc,-g[1][0]*sc,g[1][1]*sc)}return s}
const ext=(shape,depth,bevel,segs=8,curve=16)=>{const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:bevel>0?segs:1,curveSegments:curve});g.translate(0,0,-depth/2);return g};
function rr(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.absarc(x+w-r,y+r,r,-PI/2,0,false);s.lineTo(x+w,y+h-r);s.absarc(x+w-r,y+h-r,r,0,PI/2,false);s.lineTo(x+r,y+h);s.absarc(x+r,y+h-r,r,PI/2,PI,false);s.lineTo(x,y+r);s.absarc(x+r,y+r,r,PI,1.5*PI,false);return s}
const rrx=(w,h,r,d,b,segs=5,curve=10)=>ext(rr(w,h,r),d,b,segs,curve);
const mesh=(g,m,x=0,y=0,z=0,p)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);(p||dev).add(o);return o};
const grp=(p,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g};
const lathe=(pts,seg=48)=>{const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);g.rotateX(PI/2);return g};
/* rig */
const rig=new T.Group();scene.add(rig);const dev=new T.Group();rig.add(dev);
const front=grp(dev),back=grp(dev),trig=grp(dev),sticks=grp(dev),chamber=grp(dev),board=grp(dev),batt=grp(dev),hapL=grp(dev),hapR=grp(dev);
const shellG=ext(outline(),.03,.035,10,22);
mesh(shellG,bodyMat,0,0,.05,front);mesh(shellG,bodyMat,0,0,-.05,back);
mesh(ext(outline(.995),.022,0,1,22),mat.seam,0,0,.011,front);
mesh(rrx(1.62,.95,.075,.004,.004,4,8),mat.glass,0,.0,.104,front);
/* screen */
const scrC=document.createElement('canvas');scrC.width=1024;scrC.height=576;const sx=scrC.getContext('2d');
const scrTex=new T.CanvasTexture(scrC);scrTex.encoding=T.sRGBEncoding;scrTex.anisotropy=4;
const scrMat=new T.MeshBasicMaterial({map:scrTex,toneMapped:false,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false});
const screen=mesh(new T.PlaneGeometry(1.52,.855),scrMat,0,0,.1112,front);
/* controls */
const boardMatS=new T.MeshStandardMaterial({color:C('#0f2f2c'),metalness:.2,roughness:.5,emissive:C('#0f2f2c'),emissiveIntensity:.15});
const stickG=lathe([[.046,0],[.05,.02],[.088,.034],[.108,.05],[.11,.062],[.102,.073],[.086,.081],[.062,.077],[.03,.074],[.001,.073]],48);
const ringG=new T.TorusGeometry(.124,.011,12,48);
const stkPcb=rrx(.3,.3,.03,.012,.003,2,6),stkCan=new T.CylinderGeometry(.075,.075,.05,32).rotateX(PI/2);
[[-1.03,.21],[1.03,-.27]].forEach(([x,y])=>{mesh(stickG,mat.rubber,x,y,.1,front);mesh(stkCan,mat.metal,x,y,.06,sticks);mesh(stkPcb,boardMatS,x,y,.025,sticks);mesh(ringG,mat.metal,x,y,.1,front)});
const dp=new T.Shape(),a=.034,b=.105;[[-a,b],[a,b],[a,a],[b,a],[b,-a],[a,-a],[a,-b],[-a,-b],[-a,-a],[-b,-a],[-b,a],[-a,a]].forEach((p,i)=>i?dp.lineTo(p[0],p[1]):dp.moveTo(p[0],p[1]));
mesh(ext(dp,.016,.008,3,2),mat.rubber,-1.03,-.27,.112,front);
const capG=lathe([[.044,0],[.045,.016],[.041,.025],[.03,.029],[.001,.03]],32);
const fb=[[1.13,.21],[.93,.21],[1.03,.31],[1.03,.11]];fb.forEach(([x,y])=>mesh(capG,mat.cap,x,y,.1,front));
const dots=new T.InstancedMesh(new T.CircleGeometry(.011,14),mat.dot,4);const m4=new T.Matrix4();fb.forEach(([x,y],i)=>{m4.makeTranslation(x,y,.1315);dots.setMatrixAt(i,m4)});front.add(dots);
const pill=rrx(.075,.026,.013,.01,.004,3,6);mesh(pill,mat.cap,-.9,.45,.107,front);mesh(pill,mat.cap,.9,.45,.107,front);
const led=mesh(new T.CylinderGeometry(.016,.016,.008,20),mat.led,-.9,-.47,.104,front);led.rotation.x=PI/2;
const gr=new T.InstancedMesh(new T.CylinderGeometry(.0085,.0085,.006,10).rotateX(PI/2),mat.seam,36);let gi=0;
for(const sxn of[-1,1])for(let r=0;r<3;r++)for(let c=0;c<6;c++){m4.makeTranslation(sxn*1.03+(c-2.5)*.034,-.5-r*.034,.1);gr.setMatrixAt(gi++,m4)}front.add(gr);
/* top: bumpers + triggers + port */
const bump=rrx(.42,.085,.035,.02,.012);const trg=rrx(.44,.15,.05,.05,.016,5,10);
for(const sxn of[-1,1]){const bm=mesh(bump,bodyMat,sxn*.8,.585,.045,trig);bm.rotation.x=PI/2;const t=mesh(trg,mat.signal,sxn*.8,.6,-.05,trig);t.rotation.set(PI/2,0,-sxn*.04)}
const port=mesh(rrx(.09,.03,.014,.03,0),mat.seam,0,.56,0,front);port.rotation.x=PI/2;
/* back details */
const ridge=rrx(.34,.6,.15,.03,.022,5,10);mesh(ridge,bodyMat,-.98,-.22,-.115,back);mesh(ridge,bodyMat,.98,-.22,-.115,back);
const vents=new T.InstancedMesh(rrx(.2,.014,.007,.01,0,1,4),mat.seam,14);for(let i=0;i<14;i++){m4.makeTranslation((i%2?.13:-.13),.4-Math.floor(i/2)*.036,-.101);vents.setMatrixAt(i,m4)}back.add(vents);
/* internals */
const bc=document.createElement('canvas');bc.width=1024;bc.height=512;const bx=bc.getContext('2d');
bx.fillStyle='#0f2f2c';bx.fillRect(0,0,1024,512);bx.strokeStyle='#b87333';bx.lineWidth=1.4;let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
for(let i=0;i<220;i++){let x=rnd()*1024,y=rnd()*512;bx.globalAlpha=.35+rnd()*.5;bx.beginPath();bx.moveTo(x,y);for(let k=0;k<3;k++){if(rnd()<.5)x+=(rnd()-.5)*260;else y+=(rnd()-.5)*160;bx.lineTo(x,y)}bx.stroke()}
bx.globalAlpha=1;bx.fillStyle='#16201f';[[120,90,120,70],[790,330,140,80],[680,80,90,60],[200,340,70,110]].forEach(r=>bx.fillRect(...r));
bx.fillStyle='#c9a24a';for(let i=0;i<60;i++)bx.fillRect(40+i*16,486,6,14);
const boardTex=new T.CanvasTexture(bc);boardTex.encoding=T.sRGBEncoding;boardTex.repeat.set(1/1.7,1/.7);boardTex.offset.set(.5,.5);
const boardMat=new T.MeshStandardMaterial({map:boardTex,metalness:.2,roughness:.55});
mesh(rrx(1.7,.7,.08,.02,.004,2,6),boardMat,0,-.02,-.02,board);
mesh(rrx(.34,.34,.03,.04,.01,3,6),mat.metal,-.15,0,-.055,board);
mesh(rrx(.9,.42,.05,.015,.004,2,6),mat.copper,-.25,.06,-.075,chamber);
const fins=new T.InstancedMesh(new T.BoxGeometry(.008,.34,.07),mat.copper,22);for(let i=0;i<22;i++){m4.makeTranslation(-.66+i*.036,.06,-.12);fins.setMatrixAt(i,m4)}chamber.add(fins);
const fanH=mesh(new T.CylinderGeometry(.18,.18,.05,48,1,true),mat.cap,.42,.08,-.09,chamber);fanH.rotation.x=PI/2;fanH.material=Ph({color:C('#22201e'),roughness:.4,side:T.DoubleSide,emissive:new T.Color(0x2a2622)});
const fanRim=mesh(new T.TorusGeometry(.18,.008,8,48),new T.MeshStandardMaterial({color:C('#3a3632'),emissive:new T.Color(0x2a2622),roughness:.5}),.42,.08,-.115,chamber);
const rotor=grp(chamber,.42,.08,-.09);
const bladeM=Ph({color:C('#4a4642'),roughness:.38,metalness:.3,emissive:new T.Color(0x2a2622)});const blades=new T.InstancedMesh(new T.BoxGeometry(.13,.045,.01),bladeM,7);const q=new T.Quaternion(),v3=new T.Vector3(),s3=new T.Vector3(1,1,1);
for(let i=0;i<7;i++){const an=i/7*PI*2;q.setFromEuler(new T.Euler(.35,0,an));v3.set(Math.cos(an)*.09,Math.sin(an)*.09,0);m4.compose(v3,q,s3);blades.setMatrixAt(i,m4)}rotor.add(blades);
mesh(new T.CylinderGeometry(.045,.045,.05,24).rotateX(PI/2),mat.metal,0,0,0,rotor);
const lc=document.createElement('canvas');lc.width=256;lc.height=128;const lx=lc.getContext('2d');lx.fillStyle='#2c2c2e';lx.fillRect(0,0,256,128);lx.fillStyle='#ebe6dc';lx.font='500 30px IBM Plex Mono, monospace';lx.fillText('6,200 mAh',20,62);lx.font='500 16px IBM Plex Mono, monospace';lx.fillStyle='#a39d93';lx.fillText('2 CELL · 7.7 V',20,94);lx.fillStyle='#ff6a2b';lx.fillRect(20,18,26,6);
const labTex=new T.CanvasTexture(lc);labTex.encoding=T.sRGBEncoding;
const cellG=rrx(.62,.5,.06,.05,.012,3,6);const labG=new T.PlaneGeometry(.42,.21);const labM=new T.MeshBasicMaterial({map:labTex,toneMapped:false});
for(const sxn of[-1,1]){mesh(cellG,mat.batt,sxn*.36,-.04,.03,batt);const l=mesh(labG,labM,sxn*.36,-.04,-.007,batt);l.rotation.y=PI}
const hapG=new T.CylinderGeometry(.1,.1,.07,40).rotateX(PI/2),hapRing=new T.TorusGeometry(.1,.012,10,40);
const hapBody=Ph({color:C('#1c1b19'),roughness:.45,metalness:.2,clearcoat:.5,clearcoatRoughness:.3});const hapCap=new T.CircleGeometry(.088,40);
[[hapL,-1],[hapR,1]].forEach(([g,sxn])=>{mesh(hapG,hapBody,sxn*.98,-.36,0,g);const c=mesh(hapCap,mat.metal,sxn*.98,-.36,-.0355,g);c.rotation.y=PI;mesh(hapRing,mat.signal,sxn*.98,-.36,-.036,g)});
/* assembled depth: every internal layer sits inside the back shell's depth, ordered the way it leaves */
chamber.position.z=.0552;board.position.z=.03;batt.position.z=.005;sticks.position.z=-.04;
const internals=[chamber,board,batt,hapL,hapR];internals.forEach(g=>g.visible=false);
/* callout anchors */
const marks=[[chamber,-.3,.2,-.13],[batt,.36,-.04,-.02],[hapL,-.98,-.36,-.04],[sticks,1.03,-.27,.01],[trig,.8,.64,-.05]].map(([g,x,y,z])=>{const o=new T.Object3D();o.position.set(x,y,z);g.add(o);return o});
/* contact shadow */
const shC=document.createElement('canvas');shC.width=shC.height=256;const shx=shC.getContext('2d');const rg=shx.createRadialGradient(128,128,0,128,128,128);rg.addColorStop(0,'rgba(0,0,0,.6)');rg.addColorStop(.45,'rgba(0,0,0,.22)');rg.addColorStop(1,'rgba(0,0,0,0)');shx.fillStyle=rg;shx.fillRect(0,0,256,256);
const shTex=new T.CanvasTexture(shC);
const shM=new T.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,opacity:.6,toneMapped:false});
const shadow=new T.Mesh(new T.PlaneGeometry(1,1),shM);shadow.rotation.x=-PI/2;shadow.position.y=-.95;rig.add(shadow);
const shadow2=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,opacity:.5,toneMapped:false}));shadow2.rotation.x=-PI/2;shadow2.position.y=-.94;rig.add(shadow2);
/* callout svg */
const NS='http://www.w3.org/2000/svg',csvg=$('#callouts');const LBL=['Vapor chamber · 24 dB','6,200 mAh, two cells','Voice-coil haptics ×2','Hall-effect sticks','Triggers, 3 travel stops'];
const CO=LBL.map((t,i)=>{const g=document.createElementNS(NS,'g');g.innerHTML='<polyline/><circle class="dot" r="3.5"/><circle class="nb" r="9"/><text class="nt">'+(i+1)+'</text><text class="lt">'+t+'</text>';csvg.appendChild(g);return{g,pl:g.children[0],d:g.children[1],nb:g.children[2],nt:g.children[3],lt:g.children[4]}});
/* screen drawing */
function star(c,x,y,r,col,al){c.globalAlpha=al;c.fillStyle=col;c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fill();c.globalAlpha=1}
const FD='"Bricolage Grotesque", Arial, sans-serif',FMn='"IBM Plex Mono", Menlo, monospace';
const SHELF=[['WICKFIRE DASH','LUMEN PACT','JAM PICKS','#ff8a52','#4a1c0c'],['TIDEWALK','SALTMARSH GAMES','FAVORITES','#3c5a54','#14201e'],['LANTERNLINE','ODA & FENN','FAVORITES','#5c5466','#1a1720'],['QUIET FERRY','HOLLOW PINE','DEMOS','#4d6478','#141a22'],['NINEFOLD STAIR','PELL STUDIO','JAM PICKS','#b08a3e','#2a1f0c']];
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function shelf(c,t,still,al){c.globalAlpha=al;c.textBaseline='alphabetic';
 c.textAlign='left';c.fillStyle='#ebe6dc';c.font='700 34px '+FD;c.fillText('Tinker',56,74);c.fillStyle='#ff6a2b';c.beginPath();c.arc(166,64,6,0,7);c.fill();
 c.textAlign='right';c.font='500 24px '+FMn;c.fillStyle='rgba(235,230,220,.6)';c.fillText('SYNCED FROM ITCH.IO',968,72);
 c.textAlign='left';c.font='500 25px '+FMn;let tx=56;['ALL','FAVORITES','JAM PICKS','DEMOS'].forEach((n,i)=>{c.fillStyle=i?'rgba(235,230,220,.5)':'#ebe6dc';c.fillText(n,tx,130);if(!i){c.fillStyle='#ff6a2b';c.fillRect(tx,141,c.measureText(n).width,4)}tx+=c.measureText(n).width+38});
 const f=still?0:Math.floor(t/2.6)%4,w=188,h=236,g=34,x0=(1024-(4*w+3*g))/2,y0=170;
 SHELF.slice(0,4).forEach((s,i)=>{const on=i===f,k=on?1.07:1,cw=w*k,ch=h*k,x=x0+i*(w+g)-(cw-w)/2,y=y0-(ch-h)/2;
  const gr=c.createLinearGradient(x,y,x+cw*.4,y+ch);gr.addColorStop(0,s[3]);gr.addColorStop(1,s[4]);rrect(c,x,y,cw,ch,10);c.fillStyle=gr;c.fill();
  c.save();rrect(c,x,y,cw,ch,10);c.clip();c.globalAlpha=al*.35;c.fillStyle='#ebe6dc';c.beginPath();c.arc(x+cw*.68,y+ch*.34,cw*.22,0,7);c.fill();c.globalAlpha=al*.18;c.fillRect(x,y+ch*.62,cw,2);c.restore();c.globalAlpha=al;
  if(on){rrect(c,x-5,y-5,cw+10,ch+10,14);c.strokeStyle='#ff6a2b';c.lineWidth=4;c.stroke()}});
 const s=SHELF[f];c.textAlign='left';c.fillStyle='#ebe6dc';c.font='800 60px '+FD;c.fillText(s[0],x0,484);c.font='500 22px '+FMn;c.fillStyle='rgba(235,230,220,.62)';c.fillText(s[1]+' · '+s[2],x0,522);
 c.fillStyle='#ff6a2b';rrect(c,1024-x0-112,446,112,50,25);c.fill();c.fillStyle='#121110';c.textAlign='center';c.font='600 21px '+FMn;c.fillText('PLAY',1024-x0-56,479);c.globalAlpha=1}
function drawScr(mode,t,bt){const c=sx;const g=c.createLinearGradient(0,0,1024,576);g.addColorStop(0,'#1a1410');g.addColorStop(1,'#08070a');c.fillStyle=g;c.fillRect(0,0,1024,576);c.textAlign='center';c.textBaseline='alphabetic';
 if(mode==='attract'||mode==='still')shelf(c,t,mode==='still',1);
 else if(mode==='wake'){const rgd=c.createRadialGradient(512,288,0,512,288,520);rgd.addColorStop(0,'rgba(255,106,43,.16)');rgd.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=rgd;c.fillRect(0,0,1024,576)}
 else if(mode==='boot'){if(bt<.8){const k=e2(clamp(bt/.5));c.globalAlpha=k;c.fillStyle='#ebe6dc';c.font='700 '+Math.round(96+20*k)+'px '+FD;c.fillText('Tinker',496,320);const lw=c.measureText('Tinker').width;c.fillStyle='#ff6a2b';c.beginPath();c.arc(496+lw/2+22,300,11,0,7);c.fill();c.globalAlpha=1;
   c.fillStyle='rgba(235,230,220,.18)';c.fillRect(392,380,240,4);c.fillStyle='#ff6a2b';c.fillRect(392,380,240*clamp(bt/.8),4)}
  else shelf(c,0,true,clamp((bt-.8)/.3))}
 scrTex.needsUpdate=true}
/* poses */
const KF=[[0,.22,-.2,0,0,0,1],[.14,.10,PI+.28,0,0,.15,1.22],[.30,.12,PI+.35,.45,0,.30,1.08],[.48,.08,PI+.49,1,0,.45,1],[.64,.08,PI+.49,1,0,.55,1],[.78,.10,PI+.2,0,0,.70,1],[.90,.04,2*PI,0,.15,.85,1],[1,0,2*PI,0,1,1,1]];
function kf(p){let i=0;while(i<KF.length-2&&p>KF[i+1][0])i++;const A=KF[i],B=KF[i+1];const t=e2(clamp((p-A[0])/(B[0]-A[0])));const o=[];for(let k=1;k<7;k++)o.push(lerp(A[k],B[k],t));return{rx:o[0],ry:o[1],ex:o[2],pw:o[3],ct:o[4],sc:o[5]}}
const path=new T.CatmullRomCurve3([new T.Vector3(0,.75,6.2),new T.Vector3(1.6,1.1,5.4),new T.Vector3(.5,.5,5.2),new T.Vector3(0,.3,5.3)]);
const L0=path.getPoint(0).length();
const CH=[{k:'hero',a:$('[data-anchor=hero]')},{k:'inside',a:$('[data-anchor=inside]'),off:reduce},{k:'fin',a:$('[data-anchor=fin]')},{k:'close',a:$('[data-anchor=close]')}];
/* explode: phase 1 lifts every layer straight out along depth into its own slot (ordered, no sideways motion),
   phase 2 spreads them up and apart. Depth moves are monotonic and ordered for every pair, sideways moves start
   only after all layers are clear, so no part ever passes through another. */
const EX=[{g:back,k:0,zc:-.41,z:-1.9,y:4.46},{g:trig,k:0,zc:-.41,z:-1.9,y:4.46},{g:chamber,k:.08,zc:-.26,z:-1.5052,y:3.1},{g:board,k:.14,zc:-.16,z:-1.03,y:2.32},{g:batt,k:.2,zc:-.1,z:-.555,y:1.32},{g:hapL,k:.16,zc:-.17,z:-.5,y:1.32,x:-.05},{g:hapR,k:.16,zc:-.17,z:-.5,y:1.32,x:.05},{g:sticks,k:.1,zc:-.08,z:-.24}];
const eOut=t=>1-Math.pow(1-t,3),XZ=.12;
function explodeAt(ex){const a=eOut(clamp(ex/XZ)),b=e2(clamp((ex-.1)/.9));EX.forEach(e=>{const ty=e2(clamp((ex-XZ-e.k*.4)/.5));e.g.position.set(e.p0.x+(e.x||0)*ty,e.p0.y+(e.y||0)*ty,e.p0.z+e.zc*a+(e.z-e.zc)*b)})}
EX.forEach(e=>{e.p0=e.g.position.clone()});
const spr=ex=>e2(clamp((ex-XZ)/.6));/* camera follows the spread, not raw ex, so the stack stays framed mid-move */
let W=1,H=1,shown=false,cur=null,lastKey='',boot={on:false,t0:0},scrLast=-1,probe=[],probed=false,dirty=true,rendered=false;
const tgt=new T.Vector3(),pv=new T.Vector3(),cvv=new T.Vector3();
/* touch: the canvas lives in page coordinates (absolute, taller than the screen) and moves only when it renders,
   so native scrolling carries the 3D with the page instead of chasing it one frame late */
const OVR=COARSE.matches,stageEl=$('#inside .story-stage');let OFF=0,TOP=-1,lastTop=-1,rW=0,rVH=0;
if(OVR){cv.style.position=csvg.style.position='absolute';cv.style.willChange=csvg.style.willChange='transform'}
function resize(){
 if(OVR){const w=innerWidth,v=Math.max(innerHeight,document.documentElement.clientHeight);if(w===rW&&Math.abs(v-rVH)<160&&rW)return;/* address bar show/hide: keep the buffer, no flash */
  rW=w;rVH=v;OFF=Math.round(v*.3);W=w;H=v+2*OFF;cv.style.height=csvg.style.height=H+'px';R.setSize(W,H,false);TOP=-1;dirty=true;return}
 W=cv.clientWidth||innerWidth;H=cv.clientHeight||innerHeight;R.setSize(W,H,false);dirty=true}
resize();
function setCW(name,instant){const c=CW[name],from={c:bodyMat.color.clone(),m:bodyMat.metalness,r:bodyMat.roughness,cc:bodyMat.clearcoat,ccr:bodyMat.clearcoatRoughness,rim:rimU.c.value.clone()},to=C(c.c),rimTo=C(c.rim),o={t:0};
 const ap=()=>{const t=o.t;bodyMat.color.copy(from.c).lerp(to,t);bodyMat.metalness=lerp(from.m,c.m,t);bodyMat.roughness=lerp(from.r,c.r,t);bodyMat.clearcoat=lerp(from.cc,c.cc,t);bodyMat.clearcoatRoughness=lerp(from.ccr,c.ccr,t);rimU.c.value.copy(from.rim).lerp(rimTo,t);dirty=true};
 if(hasG&&!reduce&&!instant)G.to(o,{t:1,duration:.6,ease:'power3.inOut',onUpdate:ap});else{o.t=1;ap()}}
function pose(ch,t,y){const P={rx:0,ry:0,py:0,ex:0,pw:0,ct:0,px:0,anim:false,mode:'attract'};
 if(ch.k==='hero'){const p=clamp(y/M.hero.h);P.zm=MOB.matches?1:1.2;P.rx=.10+.12*p;P.ry=-.38+.18*p;P.py=-.25*p;P.pw=.45*(1-p);
  if(!reduce){P.py+=.03*Math.sin(t*PI/3);P.ry+=.04*Math.sin(t*PI/3+1)+tilt.x;P.rx+=tilt.y;P.anim=true}}
 else if(ch.k==='inside'){const p=insideP(y),k=kf(p);Object.assign(P,k);const mb=MOB.matches;const sp=spr(P.ex);P.py=-2.1*sp;P.px=(mb?-.42:-.3)*sp;P.zm=((mb?1.08:1)+(mb?1.0:1.44)*sp)*k.sc;
  if(p>.92&&!boot.on){boot.on=true;boot.t0=t}else if(p<.86&&boot.on)boot.on=false;
  P.mode=boot.on?'boot':'wake';if(boot.on&&t-boot.t0<1.4)P.anim=true}
 else if(ch.k==='fin'){P.zm=1.1;P.rx=.08+fin.rx;P.ry=-.5+fin.ry-fin.intro*.7;P.px=-.6*fin.intro;P.pw=.6;if(!reduce)P.anim=true}
 else{const m=M.close,p=clamp((y-(m.top-vh))/(m.h+vh));P.zm=1.28;P.rx=.12;P.ry=-.3+.2*p;P.pw=1;if(!reduce){P.py=.02*Math.sin(t*PI/4);P.anim=true}}
 if(reduce)P.mode='still';return P}
function apply(P,aw,ah,cx,cy,w,h){
 dev.rotation.set(P.rx,P.ry,0);rig.position.set(P.px,P.py,0);
 const ex=P.ex;explodeAt(ex);
 internals.forEach(g=>g.visible=ex>.05);/* shown only once every layer has cleared its neighbours (behind the lifted back shell) */
 scrMat.opacity=clamp(P.pw*1.1);mat.led.emissiveIntensity=P.pw*3;
 const sw=1.9+1.5*Math.abs(Math.cos(P.ry));shadow.scale.set(sw,1.25,1);shadow2.scale.set(sw*.7,.38,1);
 const fov=MOB.matches?32:28,tf=Math.tan(fov*PI/360);cam.fov=fov;
 const d=Math.max(2.62*h/(2*tf*aw),1.4*h/(2*tf*ah))*(P.zm||1);
 path.getPoint(P.ct,pv);cam.position.copy(pv).multiplyScalar(d/pv.length());tgt.set(0,.04*P.ct,.12*P.ct);cam.lookAt(tgt);
 cam.aspect=w/h;cam.setViewOffset(w,h,w/2-cx,h/2-cy,w,h);cam.updateProjectionMatrix()}
function callouts(on,P,aL){if(!on){csvg.style.visibility='hidden';return}csvg.style.visibility='visible';const op=clamp((P.ex-.6)/.4);csvg.style.opacity=op;
 const mob=MOB.matches;dev.updateMatrixWorld(true);cvv.set(0,0,0).project(cam);const ox=(cvv.x+1)/2*W,oy=(1-cvv.y)/2*H;
 marks.forEach((m,i)=>{m.getWorldPosition(pv);pv.project(cam);const x=(pv.x+1)/2*W,y=(1-pv.y)/2*H;const o=CO[i];
  o.d.setAttribute('cx',x);o.d.setAttribute('cy',y);o.g.style.display=(x<8||x>W-8||y<8||y>H-8)?'none':'';
  let dx=x-ox,dy=y-oy;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;if(!mob&&i===1){dx=-1;dy=0}/* battery: straight left, above the far haptic ring */
  let side=dx>=0?1:-1;if(!mob&&side<0&&x-60-190<aL){side=1;dx=Math.abs(dx)}const lx=x+dx*(mob?30:60),ly=y+dy*(mob?30:50);const ex=lx+side*(mob?0:22);
  o.pl.setAttribute('points',x+','+y+' '+lx+','+ly+' '+ex+','+ly);
  o.nb.setAttribute('cx',lx);o.nb.setAttribute('cy',ly);o.nt.setAttribute('x',lx);o.nt.setAttribute('y',ly);
  o.nb.style.display=o.nt.style.display=mob?'':'none';o.lt.style.display=mob?'none':'';
  if(!mob){const tx=clamp(ex+side*6,8,W-8);o.lt.setAttribute('x',tx);o.lt.setAttribute('y',ly+4);o.lt.setAttribute('text-anchor',side>0?'start':'end')}})}
function chapterLook(ch){const light=ch.k==='fin';R.toneMappingExposure=light?.95:1.05;shM.opacity=ch.k==='close'?.35:(light?.32:.6);shadow2.material.opacity=ch.k==='close'?.35:(light?.4:.55);rimU.s.value=probed&&dpr<1.3?0:(light?.06:.12);dirty=true}
function render(){R.render(scene,cam);if(!rendered){rendered=true;root.classList.add('gl-on')}}
function frame(t,dt,moved,y){
 let best=null,bv=0;for(const c of CH){if(c.off)continue;const m=M[c.k];const top=m.top-y,v=Math.min(vh,top+m.h)-Math.max(0,top);if(v>bv){bv=v;best=c}}
 if(!best){if(shown){cv.style.visibility='hidden';csvg.style.visibility='hidden';shown=false}return}
 if(!shown){cv.style.visibility='visible';shown=true;dirty=true}
 if(document.hidden)return;
 let oy=0,CT=0;if(OVR){const mi=M.inside;
  /* while the teardown stage is stuck to the screen, the canvas sticks too (fixed); elsewhere it rides the page */
  if(best.k==='inside'&&mi.top-y<=0&&mi.top+mi.h-y>=stageEl.offsetHeight){TOP='f';CT=y-OFF}
  else{const dh=document.documentElement.scrollHeight;TOP=Math.max(0,Math.min(Math.round(y-OFF),dh-H));CT=TOP}oy=y-CT}
 {const m=M[best.k],t=OVR?Math.max(0,Math.round(m.top-CT)):Math.max(0,Math.round(m.top-y)),bt=OVR?Math.max(0,Math.round(H-(m.top+m.h-CT))):Math.max(0,Math.round(vh-(m.top+m.h-y)));const cp=t||bt?'inset('+t+'px 0 '+bt+'px 0)':'none';if(cp!==frame.cp){frame.cp=cp;cv.style.clipPath=cp}}
 if(best!==cur){cur=best;chapterLook(cur)}
 if(cur.k==='fin'&&!fin.played&&bv>vh*.35){fin.played=true;if(hasG&&!reduce)G.to(fin,{intro:0,duration:1.1,ease:'expo.out'});else fin.intro=0}
 if(cur.k==='fin'&&!fin.drag&&Math.abs(fin.vx)>1e-4&&!reduce){fin.ry+=fin.vx;fin.vx*=.92}
 if(!reduce){tilt.x+=(tilt.tx-tilt.x)*.08;tilt.y+=(tilt.ty-tilt.y)*.08}
 const P=pose(cur,t,y);
 const r=cur.a.getBoundingClientRect();const aw=Math.max(40,r.width),ah=Math.max(40,r.height),cx=r.left+r.width/2,cy=r.top+r.height/2+oy;
 const keyS=[P.rx,P.ry,P.py,P.ex,P.pw,P.ct,P.px,cx,cy,aw,ah].map(v=>v.toFixed(4)).join();
 let need=dirty||keyS!==lastKey||P.anim||(OVR&&TOP!==lastTop);lastKey=keyS;
 if(P.ex>.3&&!reduce){rotor.rotation.z+=dt*14;need=true}
 if(P.pw>.01){const fps=P.mode==='still'?0:30;if(scrLast<0||(fps&&t-scrLast>1/fps)||P.mode!==frame.m){drawScr(P.mode,t,boot.on?t-boot.t0:0);scrLast=t;frame.m=P.mode;need=true}}
 if(!need)return;
 apply(P,aw,ah,cx,cy,W,H);
 callouts(cur.k==='inside'&&P.ex>.55,P,r.left);
 if(OVR&&TOP!==lastTop){lastTop=TOP;const f=TOP==='f';cv.style.position=csvg.style.position=f?'fixed':'absolute';cv.style.transform=csvg.style.transform='translate3d(0,'+(f?-OFF:TOP)+'px,0)'}
 render();dirty=false;
 if(!probed&&dt>0){probe.push(dt);if(probe.length>=40){probed=true;probe.sort((a,b)=>a-b);if(probe[20]>.022&&dpr>1.25){dpr=1.25;R.setPixelRatio(dpr);resize();rimU.s.value=0}}}}
/* reduced-motion stills */
function stills(){const imgs=$$('#inside .stills img');if(!imgs.length)return;const w=960,h=600;R.setPixelRatio(1);R.setSize(w,h,false);
 [.14,.48,1].forEach((p,i)=>{const k=kf(p);const P={rx:k.rx,ry:k.ry,py:-2.1*spr(k.ex),ex:k.ex,pw:k.pw,ct:Math.min(k.ct,.4),px:-.3*spr(k.ex),zm:(1+1.47*spr(k.ex))*k.sc};if(p===1){drawScr('boot',0,1.6)}
  apply(P,w*.62,h*.62,w/2,h/2,w,h);R.render(scene,cam);try{imgs[i].src=R.domElement.toDataURL('image/png');imgs[i].hidden=false;imgs[i].previousElementSibling.style.display='none'}catch(e){}});
 R.setPixelRatio(dpr);resize();EX.forEach(e=>e.g.position.copy(e.p0));internals.forEach(g=>g.visible=false);scrLast=-1;lastKey=''}
if(reduce)stills();
if(colorway!=='graphite')setCW(colorway,true);
return{frame,resize,setCW}}
