/* ==========================================
   Segmentazione Clienti — K-Means (3×3)
   Canvas con asse Y corretto (Frequenza ↑)
   Click: aggiungi cliente • Shift+Click: rimuovi
   ========================================== */

const canvas = document.getElementById('stage');
const ctx    = canvas.getContext('2d');

const kRange  = document.getElementById('kRange');
const kVal    = document.getElementById('kVal');
const btnInit = document.getElementById('btnInit');
const btnStep = document.getElementById('btnStep');
const btnRun  = document.getElementById('btnRun');
const btnReset= document.getElementById('btnReset');
const chkLinks= document.getElementById('chkLinks');
const chkRegs = document.getElementById('chkRegions');

const inertiaVal = document.getElementById('inertiaVal');
const exInertia  = document.getElementById('exInertia');
const statusChip = document.getElementById('statusChip');
const stAssign   = document.getElementById('stAssign');
const stUpdate   = document.getElementById('stUpdate');
const stDone     = document.getElementById('stDone');
const iterVal    = document.getElementById('iterVal');
const legend     = document.getElementById('legend');

const btnIT = document.getElementById('btnIT');
const btnEN = document.getElementById('btnEN');
let LANG = 'it';

/* ------------ I18N (divulgativa, con griglia 3×3) ------------ */
const I18N = {
  it:{
    title:'Segmentazione clienti',
    lblK:'K', lblInertia:'Inertia', lblIter:'Iterazioni: ',
    steps:['1. Assegnazione','2. Aggiornamento','Convergenza'],
    axisX:'Spesa →', axisY:'Frequenza ↑',
    btns:{init:'Inizializza',step:'Passo',run:'Avvia',pause:'Pausa',reset:'Reset',idle:'Idle',conv:'Converged',running:'Running'},
    toggles:{links:'Passaggi', regions:'Zone colorate'},

    problemH:'Cos’è il K-Means?',
    problem:
      'È una tecnica di <b>machine learning non supervisionato</b>: non ha bisogno di esempi “giusti”. Osserva i dati e <b>trova da sola gruppi</b> (cluster) di elementi simili.<br><br>'+
      'Qui ogni punto è un <b>cliente</b> descritto da <em>spesa media</em> (X) e <em>frequenza</em> d’acquisto (Y). L’obiettivo è creare pochi gruppi per capire i comportamenti e <b>personalizzare le azioni</b>.',

    centroidH:'Centroidi in due parole',
    centroidUL:[
      'Il <b>centroide</b> è il <b>punto medio</b> del gruppo: il suo “prototipo”.',
      '<b>K</b> è il <b>numero di gruppi</b> che scegli tu (2–8).'
    ],

    howH:'Come funziona (in 4 passi)',
    howUL:[
      '<b>1) Inizializza</b> alcuni centri (centroidi).',
      '<b>2) Assegna</b> ogni cliente al centro più vicino.',
      '<b>3) Aggiorna</b> i centri: si spostano verso la <b>media</b> dei clienti.',
      '<b>4) Ripeti</b> finché i centri <b>non si muovono più</b> (convergenza).'
    ],

    inertiaP:
      '<b>Inertia</b> misura quanto i clienti stanno “stretti” ai centroidi (somma delle distanze punto→centroide). <b>Più bassa</b> ⇒ cluster più compatti.',

    howUseH:'Come si usa',
    howUseUL:[
      '<b>Inizializza</b> i K centroidi (<em>k-means++</em>).',
      '<b>Passo</b> esegue un’iterazione (<em>Assegnazione → Aggiornamento</em>).',
      '<b>Avvia</b> ripete finché i centroidi non si muovono più.',
      '<b>Reset</b> rigenera i clienti.',
      '<b>Click</b>: aggiungi un cliente. <b>Shift+Click</b>: rimuovi il punto più vicino.'
    ],

    whyH:'Perché è utile?',
    whyUL:[
      '<b>Marketing mirato</b>: promozioni diverse per cluster diversi.',
      '<b>Assortimento & pricing</b>: capisco dove spingere brand/formati.',
      '<b>Engagement</b>: programmi fedeltà su misura (premium vs occasionali).'
    ],

    catsH:'Categorie tipiche',
    // 9 combinazioni: dall’alto (freq alta) al basso (freq bassa)
    catsUL:[
      '<b>Premium & fedeli</b> (famiglie fidelizzate) — spesa <b>alta</b>, frequenza <b>alta</b>.',
      '<b>Regolari attenti</b> (frequenti, spesa media) — spesa <b>media</b>, frequenza <b>alta</b>.',
      '<b>Piccoli acquisti frequenti</b> (studenti/single) — spesa <b>bassa</b>, frequenza <b>alta</b>.',
      '<b>Spese mirate</b> (alta spesa, visite regolari) — spesa <b>alta</b>, frequenza <b>media</b>.',
      '<b>Clienti regolari</b> — spesa <b>media</b>, frequenza <b>media</b>.',
      '<b>Passanti abituali</b> (bassa spesa, visite regolari) — spesa <b>bassa</b>, frequenza <b>media</b>.',
      '<b>Grandi spese pianificate</b> (famiglie/lavoratori) — spesa <b>alta</b>, frequenza <b>bassa</b>.',
      '<b>Visite leggere</b> (spesa media, poche visite) — spesa <b>media</b>, frequenza <b>bassa</b>.',
      '<b>Occasionali</b> (clienti saltuari/di passaggio) — spesa <b>bassa</b>, frequenza <b>bassa</b>.'
    ],
    catsP:'Le etichette compaiono sui centroidi alla <b>convergenza</b> e si adattano automaticamente.',

    tipsH:'Suggerimenti',
    tipsUL:[
      '<b>k-means++</b> parte meglio e converge prima.',
      'Prova più valori di <b>K</b> e osserva l’<b>Inertia</b>.'
    ],

    // label per bolle (3×3): key = [spesa][frequenza] con h/m/l
    lab:{
      hh:'Premium & fedeli (famiglie fidelizzate)',
      mh:'Regolari attenti (frequenti, spesa media)',
      lh:'Piccoli acquisti frequenti (studenti/single)',
      hm:'Spese mirate (alta spesa, visite regolari)',
      mm:'Clienti regolari (media spesa, visite regolari)',
      lm:'Passanti abituali (bassa spesa, visite regolari)',
      hl:'Grandi spese pianificate (famiglie/lavoratori)',
      ml:'Visite leggere (spesa media, poche visite)',
      ll:'Occasionali (clienti saltuari/di passaggio)',
      spesa:q=>`Spesa ${q}`, freq:q=>`frequenza ${q}`, q:{hi:'alta', lo:'bassa', md:'media'}
    }
  },

  en:{
    title:'Customer segmentation',
    lblK:'K', lblInertia:'Inertia', lblIter:'Iterations: ',
    steps:['1. Assignment','2. Update','Convergence'],
    axisX:'Spend →', axisY:'Frequency ↑',
    btns:{init:'Init',step:'Step',run:'Run',pause:'Pause',reset:'Reset',idle:'Idle',conv:'Converged',running:'Running'},
    toggles:{links:'Links', regions:'Colored regions'},

    problemH:'What is K-Means?',
    problem:
      'It is an <b>unsupervised machine learning</b> method: it doesn’t need “right answers”. It looks at the data and <b>automatically finds groups</b> (clusters) of similar items.<br><br>'+
      'Here each dot is a <b>customer</b> described by <em>average spend</em> (X) and <em>shopping frequency</em> (Y). The goal is to build a few groups to understand behaviours and <b>target actions</b>.',

    centroidH:'Centroids in a nutshell',
    centroidUL:[
      'A <b>centroid</b> is the group’s <b>average point</b> — its prototype.',
      '<b>K</b> is the <b>number of groups</b> you choose (2–8).'
    ],

    howH:'How it works (4 steps)',
    howUL:[
      '<b>1) Initialize</b> some centers (centroids).',
      '<b>2) Assign</b> each customer to the nearest center.',
      '<b>3) Update</b> centers: move to the <b>mean</b> of their customers.',
      '<b>4) Repeat</b> until centers <b>stop moving</b> (converge).'
    ],

    inertiaP:
      '<b>Inertia</b> measures how tightly customers stick to their centroids (sum of point→centroid distances). <b>Lower</b> ⇒ tighter clusters.',

    howUseH:'How to use',
    howUseUL:[
      '<b>Init</b> K centroids (<em>k-means++</em>).',
      '<b>Step</b> runs one iteration (<em>Assignment → Update</em>).',
      '<b>Run</b> repeats until centroids stop moving.',
      '<b>Reset</b> regenerates customers.',
      '<b>Click</b>: add a customer. <b>Shift+Click</b>: remove nearest.'
    ],

    whyH:'Why useful?',
    whyUL:[
      '<b>Targeted marketing</b>: different promos per cluster.',
      '<b>Assortment & pricing</b>: see where to push brands/sizes.',
      '<b>Loyalty</b>: tailored programmes (premium vs occasional).'
    ],

    catsH:'Typical categories',
    catsUL:[
      '<b>Premium & loyal</b> (loyal families) — <b>high</b> spend, <b>high</b> frequency.',
      '<b>Steady enthusiasts</b> (frequent, medium spend) — <b>medium</b> spend, <b>high</b> frequency.',
      '<b>Frequent small baskets</b> (students/singles) — <b>low</b> spend, <b>high</b> frequency.',
      '<b>Focused big spends</b> (high spend, regular visits) — <b>high</b> spend, <b>medium</b> frequency.',
      '<b>Regular customers</b> — <b>medium</b> spend, <b>medium</b> frequency.',
      '<b>Habitual pass-by</b> (low spend, regular visits) — <b>low</b> spend, <b>medium</b> frequency.',
      '<b>Planned big baskets</b> (families/workers) — <b>high</b> spend, <b>low</b> frequency.',
      '<b>Light visits</b> (medium spend, few visits) — <b>medium</b> spend, <b>low</b> frequency.',
      '<b>Occasional</b> (infrequent/pass-through) — <b>low</b> spend, <b>low</b> frequency.'
    ],
    catsP:'Labels appear on centroids at <b>convergence</b> and adapt automatically.',

    tipsH:'Tips',
    tipsUL:[
      '<b>k-means++</b> starts better and converges faster.',
      'Try different <b>K</b> and watch <b>Inertia</b>.'
    ],

    lab:{
      hh:'Premium & loyal (loyal families)',
      mh:'Steady enthusiasts (frequent, medium spend)',
      lh:'Frequent small baskets (students/singles)',
      hm:'Focused big spends (high spend, regular visits)',
      mm:'Regular customers (medium spend, regular visits)',
      lm:'Habitual pass-by (low spend, regular visits)',
      hl:'Planned big baskets (families/workers)',
      ml:'Light visits (medium spend, few visits)',
      ll:'Occasional (infrequent/pass-through)',
      spesa:q=>`Spend ${q}`, freq:q=>`frequency ${q}`, q:{hi:'high', lo:'low', md:'medium'}
    }
  }
};

/* ------------ Colori ------------ */
const COLORS = ['#56B4E9','#E69F00','#009E73','#D55E00','#CC79A7','#0072B2','#F0E442','#000000'];

/* ------------ Stato ------------- */
let points=[], assign=[], centroids=[];
let K = Number(kRange.value);
let running=false, timer=null, iter=0, isConverged=false, isInited=false;
let showLinks=true, showRegions=false;

/* ------------ Canvas ------------ */
function resizeCanvas(){
  const dpr=window.devicePixelRatio||1, r=canvas.getBoundingClientRect();
  canvas.width=Math.floor(r.width*dpr); canvas.height=Math.floor(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0); draw();
}
window.addEventListener('resize', resizeCanvas);

/* ----------- Dataset ------------ */
function regenDataset(){
  const N=440; points=[]; assign=[]; centroids=[];
  iter=0; isConverged=false; isInited=false;
  statusChip.textContent=I18N[LANG].btns.idle;

  // quattro “nuvole” (x=spesa, y=frequenza). y è logica: 0=bassa, 1=alta
  const centers=[[0.28,0.72],[0.62,0.68],[0.30,0.28],[0.76,0.30]];
  for(let i=0;i<N;i++){
    const c=centers[i%centers.length];
    const x=clamp(c[0]+randn()*0.06,0.05,0.95);
    const y=clamp(c[1]+randn()*0.06,0.05,0.95);
    points.push({x,y});
  }
  iterVal.textContent='0'; buildLegend(); updateInertia(); draw();
}

/* ----------- Init (k-means++) ---- */
function initCentroids(){
  centroids=[];
  const first=points[Math.floor(Math.random()*points.length)];
  centroids.push({...first});
  while(centroids.length<K){
    const d2=points.map(p=>{
      let m=Infinity; for(const c of centroids){ const dx=p.x-c.x, dy=p.y-c.y; const v=dx*dx+dy*dy; if(v<m)m=v; }
      return m;
    });
    const sum=d2.reduce((a,b)=>a+b,0)||1; let r=Math.random()*sum, idx=0;
    for(;idx<d2.length;idx++){ r-=d2[idx]; if(r<=0) break; }
    centroids.push({...points[Math.min(idx,points.length-1)]});
  }
  assign=new Array(points.length).fill(-1); iter=0; isConverged=false; isInited=true;
  setExplain('assign'); updateInertia(); draw();
}

/* -------------- Step ------------- */
function step(){
  if(!isInited) initCentroids();
  if(isConverged) return;

  // 1) Assegnazione
  setExplain('assign');
  for(let i=0;i<points.length;i++){
    let best=-1,bd=Infinity;
    for(let k=0;k<K;k++){
      const dx=points[i].x-centroids[k].x, dy=points[i].y-centroids[k].y, d=dx*dx+dy*dy;
      if(d<bd){ bd=d; best=k; }
    }
    assign[i]=best;
  }

  // 2) Aggiornamento
  setExplain('update');
  const sum=Array.from({length:K},()=>({x:0,y:0,c:0}));
  for(let i=0;i<points.length;i++){ const a=assign[i]; if(a>=0){ sum[a].x+=points[i].x; sum[a].y+=points[i].y; sum[a].c++; } }
  let movedMax=0;
  for(let k=0;k<K;k++){
    if(sum[k].c>0){ const nx=sum[k].x/sum[k].c, ny=sum[k].y/sum[k].c;
      movedMax=Math.max(movedMax, Math.hypot(nx-centroids[k].x, ny-centroids[k].y));
      centroids[k].x=nx; centroids[k].y=ny;
    }
  }
  iter++; iterVal.textContent=String(iter); updateInertia();

  if(movedMax<1e-4){ isConverged=true; setExplain('done'); setRunning(false,true); }
  draw();
}

/* ------- Convergenza rapida ------- */
function convergeQuick(max=25){
  const wasRunning=running; setRunning(false);
  if(!isInited) initCentroids();
  let n=0; while(!isConverged && n<max){ step(); n++; }
  if(wasRunning) setRunning(true);
}

/* --------- Run/Stop -------- */
function setRunning(on,converged=false){
  running=on;
  if(running){
    statusChip.textContent=I18N[LANG].btns.running; btnRun.textContent=I18N[LANG].btns.pause;
    timer=setInterval(step,200);
  }else{
    if(timer){ clearInterval(timer); timer=null; }
    statusChip.textContent= converged ? I18N[LANG].btns.conv : I18N[LANG].btns.idle;
    btnRun.textContent=I18N[LANG].btns.run;
  }
}

/* --------- Explain state ----- */
function setExplain(ph){
  stAssign.classList.toggle('on', ph==='assign');
  stUpdate.classList.toggle('on', ph==='update');
  stDone  .classList.toggle('on', ph==='done');
}

/* --------- Legend / Inertia --- */
function buildLegend(){
  let html=''; for(let k=0;k<K;k++){
    html+=`<span><i class="dot" style="background:${COLORS[k%COLORS.length]}"></i>C${k+1}</span>`;
  } legend.innerHTML=html;
}
function updateInertia(){
  if(!isInited||centroids.length===0){ inertiaVal.textContent=exInertia.textContent='–'; return; }
  let S=0; for(let i=0;i<points.length;i++){
    const a=(assign[i]>=0)?assign[i]:0; const dx=points[i].x-centroids[a].x, dy=points[i].y-centroids[a].y; S+=dx*dx+dy*dy;
  }
  const val=S.toFixed(4);
  inertiaVal.textContent=val; exInertia.textContent=val;
}

/* -------------- Draw -------------- */
function draw(){
  const W=canvas.clientWidth, H=canvas.clientHeight;
  ctx.clearRect(0,0,W,H);

  const bottomGutter=96;              // spazio per legenda/asse X
  const Hdraw = H - bottomGutter;
  const Y = y => (1 - y) * Hdraw;     // y logica (0..1 basso→alto) → pixel canvas

  // griglia
  ctx.globalAlpha=.12; ctx.strokeStyle='#1b2b44';
  for(let x=0;x<W;x+=40) line(x,0,x,Hdraw);
  for(let y=0;y<Hdraw;y+=40) line(0,y,W,y);
  ctx.globalAlpha=1;

  // assi
  ctx.font='12px system-ui'; ctx.fillStyle='#dfe9ff';
  ctx.fillText(I18N[LANG].axisY, 8, 16);
  ctx.fillText(I18N[LANG].axisX, 8, H - bottomGutter + 18);

  // regioni colorate
  if(showRegions && isInited && centroids.length){
    const step=16; ctx.globalAlpha=.08;
    for(let y=0;y<Hdraw;y+=step){
      for(let x=0;x<W;x+=step){
        const yData = 1 - (y / Hdraw); // inversione
        let best=0,bd=Infinity;
        for(let k=0;k<K;k++){
          const dx=x/W-centroids[k].x, dy=yData-centroids[k].y, d=dx*dx+dy*dy;
          if(d<bd){ bd=d; best=k; }
        }
        ctx.fillStyle=COLORS[best%COLORS.length];
        ctx.fillRect(x,y,step,step);
      }
    }
    ctx.globalAlpha=1;
  }

  // se non inizializzato, mostra solo i punti
  if(!isInited || centroids.length===0){
    for(const p of points) dot(p.x*W, Y(p.y), 2.3, '#d6ecff');
    return;
  }

  // link cliente→centroide
  if(showLinks){
    ctx.lineWidth=.8; ctx.globalAlpha=.25;
    for(let i=0;i<points.length;i++){
      const a=(assign[i]>=0)?assign[i]:0; ctx.strokeStyle=COLORS[a%COLORS.length];
      line(points[i].x*W, Y(points[i].y), centroids[a].x*W, Y(centroids[a].y));
    }
    ctx.globalAlpha=1;
  }

  // punti
  for(let i=0;i<points.length;i++){
    const a=(assign[i]>=0)?assign[i]:0; dot(points[i].x*W, Y(points[i].y), 2.5, COLORS[a%COLORS.length]);
  }

  // centroidi + etichette “fuori”
  ctx.lineWidth=2; ctx.font='12px system-ui';
  const placed=[];
  for(let k=0;k<K;k++){
    const c=centroids[k], x=c.x*W, y=Y(c.y);
    ctx.strokeStyle=COLORS[k%COLORS.length];
    ctx.beginPath(); ctx.moveTo(x-8,y); ctx.lineTo(x+8,y); ctx.moveTo(x,y-8); ctx.lineTo(x,y+8); ctx.stroke();
    ctx.fillStyle=COLORS[k%COLORS.length]; ctx.fillText(`C${k+1}`, x+10, y-10);

    if(isConverged){
      const text = labelForShopper(c);
      placeBubbleOutside(x, y, `C${k+1} — ${text}`, placed, bottomGutter);
    }
  }
}

/* ---- label dinamiche 3×3 (x=spesa, y=frequenza) ---- */
function labelForShopper(c){
  const L = I18N[LANG].lab;
  const tL = 0.34, tH = 0.66;
  const bx = (c.x < tL) ? 'l' : (c.x > tH) ? 'h' : 'm';
  const by = (c.y < tL) ? 'l' : (c.y > tH) ? 'h' : 'm';
  const key = bx + by; // es. 'hh','ml',...

  if (L[key]) return L[key];

  // fallback descrittivo
  const q = v => (v > tH ? (LANG==='it'?'alta':'high')
                         : v < tL ? (LANG==='it'?'bassa':'low')
                                 : (LANG==='it'?'media':'medium'));
  return `${L.spesa(q(c.x))}, ${L.freq(q(c.y))}`;
}

/* ---- label “fuori”: anti-overlap + no-bottom ---- */
function placeBubbleOutside(cx,cy,text,placed,bottomGutter){
  ctx.font='12px system-ui';
  const padX=8, maxW=360, h=24;
  const W=canvas.clientWidth, H=canvas.clientHeight;
  const w=Math.min(maxW, ctx.measureText(text).width + padX*2);

  const vx=cx-W/2, vy=cy-(H-bottomGutter)/2, len=Math.hypot(vx,vy)||1, ux=vx/len, uy=vy/len;
  const baseOff=24;
  const cand = [
    [cx + ux*baseOff,         cy + uy*baseOff],
    [cx + ux*(baseOff+18),    cy + uy*(baseOff+18)],
    [cx + uy*(baseOff+12),    cy - ux*(baseOff+12)],
    [cx - uy*(baseOff+12),    cy + ux*(baseOff+12)],
    [cx + ux*(baseOff+46),    cy + uy*(baseOff+10)],
    [cx + ux*(baseOff+68),    cy + uy*(baseOff+4)]
  ];

  let bx=cx, by=cy, ok=false;
  for(const [px,py] of cand){
    const rx = clamp(px - w/2, 8, W - w - 8);
    const ry = clamp(py - h/2, 8, H - bottomGutter - h - 6);
    const box = {x:rx, y:ry, w, h:24};
    if(!boxesOverlap(box, placed)){ bx=rx; by=ry; placed.push(box); ok=true; break; }
  }
  if(!ok){ const rx = clamp(cx+12, 8, W - w - 8); const ry = clamp(cy-36, 8, H - bottomGutter - 24 - 6);
    placed.push({x:rx,y:ry,w,h:24}); bx=rx; by=ry; }

  ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1;
  line(cx,cy, bx + w/2, by + 12);

  ctx.fillStyle='rgba(2,12,24,.55)'; ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1;
  roundRect(bx,by,w,24,9,true,true);
  ctx.fillStyle='#eaf4ff'; ctx.fillText(text, bx+padX, by+16);
}

function boxesOverlap(box, list){
  for(const b of list){
    if(!(box.x+box.w < b.x || b.x+b.w < box.x || box.y+box.h < b.y || b.y+b.h < box.y)) return true;
  }
  return false;
}

/* ---- helpers ---- */
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
function randn(){ let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function line(x1,y1,x2,y2){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
function dot(x,y,r,color){
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke();
}
function roundRect(x,y,w,h,r,fill=true,stroke=true){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,  x+w,y+h, rr);
  ctx.arcTo(x+w,y+h,x,  y+h, rr);
  ctx.arcTo(x,  y+h,x,  y,   rr);
  ctx.arcTo(x,  y,  x+w,y,   rr);
  ctx.closePath();
  if(fill) ctx.fill(); if(stroke) ctx.stroke();
}

/* ---- Eventi ---- */
kRange.addEventListener('input', ()=>{ K=+kRange.value; kVal.textContent=String(K); buildLegend(); if(isInited) initCentroids(); draw(); });
btnInit.addEventListener('click', initCentroids);
btnStep.addEventListener('click', step);
btnRun .addEventListener('click', ()=> setRunning(!running));
btnReset.addEventListener('click', ()=> regenDataset());
chkLinks.addEventListener('change', ()=>{ showLinks=chkLinks.checked; draw(); });
chkRegs .addEventListener('change', ()=>{ showRegions=chkRegs.checked; draw(); });

/* click: aggiungi/rimuovi clienti (y salvata in spazio dati: 0=bassa,1=alta) */
canvas.addEventListener('click', (ev)=>{
  const r=canvas.getBoundingClientRect();
  const xNorm = (ev.clientX - r.left) / r.width;

  const bottomGutter=96;
  const Hdraw = canvas.clientHeight - bottomGutter;
  const yWithinDraw = (ev.clientY - r.top);
  const yClampedPx = clamp(yWithinDraw, 0, Hdraw);
  const yData = 1 - (yClampedPx / Hdraw); // inversione verso dati

  if(ev.shiftKey){
    // rimuovi punto più vicino (entro 14px)
    const W=canvas.clientWidth, H=Hdraw;
    let best=-1, bd=14;
    for(let i=0;i<points.length;i++){
      const px = points[i].x*W, py = (1-points[i].y)*H; // y → pixel
      const d=Math.hypot(px - xNorm*W, py - yWithinDraw);
      if(d<bd){ bd=d; best=i; }
    }
    if(best>=0){ points.splice(best,1); assign.splice(best,1); }
  }else{
    points.push({x:clamp(xNorm,0.03,0.97), y:clamp(yData,0.03,0.97)});
    assign.push(-1);
  }
  isConverged=false; iter=0; iterVal.textContent='0';
  convergeQuick(25);
});

btnIT.addEventListener('click', ()=> setLang('it'));
btnEN.addEventListener('click', ()=> setLang('en'));

/* ---- Lingua ---- */
function setLang(lang){
  LANG=lang; document.documentElement.setAttribute('data-lang',lang); document.documentElement.lang=lang;
  btnIT.setAttribute('aria-pressed', lang==='it'?'true':'false');
  btnEN.setAttribute('aria-pressed', lang==='en'?'true':'false');

  document.getElementById('title').textContent = I18N[lang].title;
  document.getElementById('lblK').textContent  = I18N[lang].lblK;
  document.getElementById('lblInertia').textContent = I18N[lang].lblInertia;
  document.getElementById('lblInertia2').textContent= I18N[lang].lblInertia;

  btnInit.textContent = I18N[lang].btns.init;
  btnStep.textContent = I18N[lang].btns.step;
  btnRun.textContent  = running ? I18N[lang].btns.pause : I18N[lang].btns.run;
  btnReset.textContent= I18N[lang].btns.reset;
  document.getElementById('lblLinks').textContent= I18N[lang].toggles.links;
  document.getElementById('lblRegions').textContent= I18N[lang].toggles.regions;

  stAssign.textContent= I18N[lang].steps[0];
  stUpdate.textContent= I18N[lang].steps[1];
  stDone.textContent  = I18N[lang].steps[2];

  document.getElementById('hProblem').textContent= I18N[lang].problemH;
  document.getElementById('pProblem').innerHTML  = I18N[lang].problem;
  document.getElementById('hCentroid').textContent= I18N[lang].centroidH;
  document.getElementById('ulCentroid').innerHTML = I18N[lang].centroidUL.map(li=>`<li>${li}</li>`).join('');
  document.getElementById('hHow').textContent    = I18N[lang].howH;
  document.getElementById('ulHow').innerHTML     = I18N[lang].howUL.map(li=>`<li>${li}</li>`).join('');
  document.getElementById('pInertia').innerHTML  = I18N[lang].inertiaP;
  document.getElementById('hHowUse').textContent = I18N[lang].howUseH;
  document.getElementById('ulHowUse').innerHTML  = I18N[lang].howUseUL.map(li=>`<li>${li}</li>`).join('');
  document.getElementById('hWhy').textContent    = I18N[lang].whyH;
  document.getElementById('ulWhy').innerHTML     = I18N[lang].whyUL.map(li=>`<li>${li}</li>`).join('');
  document.getElementById('hCats').textContent   = I18N[lang].catsH;
  document.getElementById('ulCats').innerHTML    = I18N[lang].catsUL.map(li=>`<li>${li}</li>`).join('');
  document.getElementById('pCats').innerHTML     = I18N[lang].catsP;
  document.getElementById('hTips').textContent   = I18N[lang].tipsH;
  document.getElementById('ulTips').innerHTML    = I18N[lang].tipsUL.map(li=>`<li>${li}</li>`).join('');

  draw();
}

/* ---- Avvio ---- */
function start(){ resizeCanvas(); regenDataset(); setLang('it'); }
start();
