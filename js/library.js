/* Tinker · Game shelf filters (Favorites, Jam picks, Demos) and the "show all" toggle. */
'use strict';
/* ---------- library filter ---------- */
const chips=$$('.chips button'),games=$$('.shelf .game'),libLive=$('#lib-live');
const shelfEl=$('#shelf'),moreB=$('#more');moreB.addEventListener('click',()=>{const o=!shelfEl.classList.contains('open');shelfEl.classList.toggle('open',o);moreB.setAttribute('aria-expanded',o);moreB.textContent=o?'Show fewer':'Show all 10 games';if(o){const g=games[6];g.classList.remove('is-in');void g.offsetWidth;g.classList.add('is-in')}});
const FN={all:'all',fav:'Favorites',jam:'Jam picks',demo:'Demos'};
chips.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;chips.forEach(c=>c.setAttribute('aria-pressed',c===b));let n=0;
 games.forEach(g=>{const on=f==='all'||g.dataset.c.split(' ').includes(f);if(on){n++;if(g.hidden){g.hidden=false;g.classList.remove('is-in');void g.offsetWidth;g.classList.add('is-in')}}else g.hidden=true});
 shelfEl.classList.toggle('capped',f==='all');
 libLive.textContent=f==='all'?'Showing all '+n+' games · synced from your itch.io library':'Showing '+n+' games in '+FN[f]}));
