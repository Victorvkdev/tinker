/* Tinker · Pointer tilt, the shared frame ticker and the three.js boot. */
'use strict';
/* ---------- pointer tilt ---------- */
const tilt={x:0,y:0,tx:0,ty:0};
if(!reduce&&!COARSE.matches)addEventListener('pointermove',e=>{tilt.tx=(e.clientX/vw-.5)*.12;tilt.ty=(e.clientY/vh-.5)*.08},{passive:true});

/* ---------- ticker ---------- */
let lastY=-1,lastT=performance.now();
function tick(){const now=performance.now(),dt=Math.min(.05,(now-lastT)/1000);lastT=now;const y=scrollY,moved=y!==lastY;
 if(moved){navScroll(y);capsUpdate(y);lastY=y}
 if(gl)gl.frame(now/1000,dt,moved,y)}
if(hasG)G.ticker.add(tick);else{const loop=()=>{tick();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
capsUpdate(scrollY);

/* boot three.js when the browser is idle */
idle(boot3D,{timeout:900});
