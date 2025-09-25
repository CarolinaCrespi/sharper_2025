// ================== Palette colori sgargianti ==================
const COLORS = [
  "#FF1744","#FF9100","#FFC400","#00E676","#00B0FF",
  "#651FFF","#D500F9","#FF4081","#76FF03","#FFFF00"
];

// ================== i18n (solo ciò che serve ad app.js) ==================
const I18N = {
  it: {
    levelSuffix: (c,n)=>`min ${c} colori (${n} nodi)`,
    dsaturInfo:
      "<b>DSATUR</b>: sceglie ad ogni passo il nodo più ‘saturo’, cioè con più colori diversi già usati dai vicini. È veloce e spesso ottimo, ma non garantisce il minimo assoluto.",
    backtrackInfo:
      "<b>Backtracking</b>: prova ricorsivamente a colorare i nodi. Se trova un conflitto, torna indietro e prova un altro colore. Garantisce il minimo, ma diventa impraticabile oltre i 15 nodi.",
    backtrackUnavailable:
      "<b>Backtracking</b>: non disponibile su grafi oltre 15 nodi (esplosione combinatoria). Provalo su livelli ≤ 15 nodi per vedere l'animazione."
  },
  en: {
    levelSuffix: (c,n)=>`min ${c} colors (${n} nodes)`,
    dsaturInfo:
      "<b>DSATUR</b>: at each step it picks the most ‘saturated’ node, i.e., the one whose neighbours already use the largest number of different colors. It’s fast and often near-optimal, but it does not guarantee the absolute minimum.",
    backtrackInfo:
      "<b>Backtracking</b>: recursively tries to color nodes. When it hits a conflict, it backtracks and tries another color. Guarantees the minimum, but quickly becomes impractical beyond ~15 nodes.",
    backtrackUnavailable:
      "<b>Backtracking</b>: unavailable for graphs with more than 15 nodes (combinatorial explosion). Try it on levels ≤ 15 nodes to see the animation."
  }
};
let currentLang = (localStorage.getItem('gc_lang') ||
                   ((navigator.language||'it').toLowerCase().startsWith('en')?'en':'it'));

// ================== Stato ==================
let LEVELS = [];
let activeColor = 0;
let current = null;
let hintNode = -1;
let idToIndex = new Map();  // mappa id -> indice nell'array nodes

// DOM
const elStage   = document.getElementById('stage');
const ctx       = elStage.getContext('2d');
const elPalette = document.getElementById('palette');
const elUsed    = document.getElementById('used');
const elConf    = document.getElementById('conf');
const elGoal    = document.getElementById('goal');
const elGoal2   = document.getElementById('goal2');
const elGoal2b  = document.getElementById('goal2_mirror');
const elLevel   = document.getElementById('levelSel');

const elInfoDSATUR = document.getElementById('infoDSATUR');
const elInfoBacktrack = document.getElementById('infoBacktrack');

// ================== Init ==================
init();

async function init(){
  buildPalette();
  wireEvents();
  await loadLevelsFromJSON();
  populateLevelSelect();           // usa currentLang
  if (LEVELS.length) loadLevel(LEVELS[0].id);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ascolta lo switch lingua (se presente nella pagina)
  document.getElementById('btn-it')?.addEventListener('click', ()=>applyLang('it'));
  document.getElementById('btn-en')?.addEventListener('click', ()=>applyLang('en'));
}

// ================== i18n helpers ==================
function applyLang(lang){
  currentLang = lang || currentLang;
  localStorage.setItem('gc_lang', currentLang);
  // conserva il livello selezionato
  const keep = elLevel.value;
  populateLevelSelect(true);
  if (keep) elLevel.value = keep;
  // se le info sono visibili, ritraduci
  if (elInfoDSATUR && elInfoDSATUR.innerHTML) elInfoDSATUR.innerHTML = I18N[currentLang].dsaturInfo;
  if (elInfoBacktrack && elInfoBacktrack.innerHTML) elInfoBacktrack.innerHTML = I18N[currentLang].backtrackInfo;
}

function levelLabel(l){ // nome + suffisso tradotto
  const suf = I18N[currentLang].levelSuffix(l.goal, l.nodes.length);
  // mantieni il nome così com'è (IT/EN nel JSON), traduci solo il suffisso
  return `${l.name} – ${suf}`;
}

// ================== Palette ==================
function buildPalette(){
  elPalette.innerHTML='';
  COLORS.forEach((c,i)=>{
    const sw = document.createElement('div');
    sw.className='swatch';
    sw.style.background=c;
    sw.dataset.active = (i===activeColor?'1':'0');
    sw.addEventListener('click', ()=>{
      activeColor=i;
      document.querySelectorAll('.swatch').forEach(x=>x.dataset.active='0');
      sw.dataset.active='1';
    });
    elPalette.appendChild(sw);
  });
}

// ================== Levels ==================
async function loadLevelsFromJSON(){
  try{
    const res = await fetch('levels.json',{cache:'no-store'});
    LEVELS = await res.json();
  }catch(e){ console.error(e); }
}

function populateLevelSelect(preserve=false){
  const prev = preserve ? elLevel.value : null;
  elLevel.innerHTML='';
  LEVELS.forEach(l=>{
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = levelLabel(l);
    elLevel.appendChild(opt);
  });
  if (preserve && prev) elLevel.value = prev;
}

function levelById(id){ return LEVELS.find(l=>l.id===id); }

function loadLevel(id){
  const L = levelById(id);
  if(!L) return;
  current = {
    goal:L.goal,
    nodes:L.nodes.map(v=>({...v,color:-1})),
    edges:L.edges.map(e=>[...e])
  };

  // costruisci mappa id -> index per accessi sicuri
  idToIndex = new Map();
  current.nodes.forEach((v, idx)=> idToIndex.set(v.id, idx));

  elGoal.textContent=current.goal;
  elGoal2.textContent=current.goal;
  if(elGoal2b) elGoal2b.textContent=current.goal;
  hintNode=-1; 
  resizeCanvas();
}

// ================== Canvas ==================
function resizeCanvas(){
  const dpr=window.devicePixelRatio||1;
  const rect=elStage.getBoundingClientRect();
  elStage.width=Math.floor(rect.width*dpr);
  elStage.height=Math.floor(rect.height*dpr);
  draw();
}

// ================== Canvas mapping ==================
function computeTransform(){
  if(!current) return {scale:1, offX:0, offY:0};

  // bounding box dei nodi
  const xs = current.nodes.map(v=>v.x);
  const ys = current.nodes.map(v=>v.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const W = elStage.width;
  const H = elStage.height;

  const boxW = maxX - minX;
  const boxH = maxY - minY;

  // scala per far stare il grafo nel canvas (con margine 10%)
  const scale = 0.8 * Math.min(W/boxW, H/boxH);

  // centro del grafo e del canvas
  const cxGraph = (minX + maxX)/2;
  const cyGraph = (minY + maxY)/2;
  const cxCanvas = W/2;
  const cyCanvas = H/2;

  return {
    scale,
    offX: cxCanvas - cxGraph*scale,
    offY: cyCanvas - cyGraph*scale
  };
}

function toPx(x,y,tf=null){
  if(!tf) tf = computeTransform();
  return { X: x*tf.scale + tf.offX, Y: y*tf.scale + tf.offY };
}

function draw(){
  if(!current) return;
  const W=elStage.width,H=elStage.height;
  ctx.clearRect(0,0,W,H);

  const tf = computeTransform();

  // edges
  current.edges.forEach(([a,b])=>{
    const ia=idToIndex.get(a), ib=idToIndex.get(b);
    if(ia===undefined || ib===undefined) return;
    const A=current.nodes[ia], B=current.nodes[ib];
    const pA=toPx(A.x,A.y,tf), pB=toPx(B.x,B.y,tf);
    const conflict=(A.color>=0 && A.color===B.color);
    ctx.beginPath();ctx.moveTo(pA.X,pA.Y);ctx.lineTo(pB.X,pB.Y);
    ctx.lineWidth=conflict?2.5:2;
    ctx.strokeStyle=conflict?"rgba(255,107,107,0.9)":"rgba(158,252,255,0.35)";
    ctx.stroke();
  });

  // nodes
  const R=Math.max(8,Math.min(W,H)/70);
  current.nodes.forEach(v=>{
    const p=toPx(v.x,v.y,tf);
    ctx.save();
    ctx.shadowColor=(v.id===hintNode?"#ffd166":"rgba(158,252,255,0.45)");
    ctx.shadowBlur=(v.id===hintNode?22:12);

    ctx.beginPath();ctx.arc(p.X,p.Y,R,0,Math.PI*2);
    ctx.fillStyle=(v.color>=0?COLORS[v.color]:"#e6f2ff");ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.25)";ctx.stroke();

    ctx.font=`${Math.round(H/28)}px Outfit`;
    ctx.fillStyle="#cfe3ff";
    ctx.fillText(String.fromCharCode(65+v.id),p.X-4,p.Y-(R+6));
    ctx.restore();
  });

  updateHUD();
}

// ================== HUD ==================
function totalConflicts(){
  let c=0;
  current.edges.forEach(([a,b])=>{
    const ia=idToIndex.get(a), ib=idToIndex.get(b);
    if(ia===undefined || ib===undefined) return;
    if(current.nodes[ia].color>=0 && current.nodes[ia].color===current.nodes[ib].color) c++;
  });
  return c;
}
function usedColors(){return new Set(current.nodes.filter(v=>v.color>=0).map(v=>v.color)).size;}
function updateHUD(){elUsed.textContent=usedColors()||'–';elConf.textContent=totalConflicts();}

// ================== Helpers ==================
function neighbors(id){
  const nb=[];
  current.edges.forEach(([a,b])=>{
    if(a===id) nb.push(b);
    else if(b===id) nb.push(a);
  });
  return nb;
}
function degree(id){
  let d=0;
  current.edges.forEach(([a,b])=>{ if(a===id||b===id) d++; });
  return d;
}
function colorable(id,c){
  return neighbors(id).every(j=>{
    const idx = idToIndex.get(j);
    return idx!==undefined && current.nodes[idx].color !== c;
  });
}
function resetColors(){current.nodes.forEach(v=>v.color=-1);hintNode=-1;draw();}

// ================== Algoritmi ==================
function orderByDegreeDesc(){
  // ordina per grado decrescente usando gli ID
  return [...current.nodes].sort((a,b)=>degree(b.id)-degree(a.id)).map(v=>v.id);
}

// --- DSATUR animato ---
async function runDsaturAnimated(){
  resetColors();
  const n=current.nodes.length;
  const usedNbs=Array.from({length:n},()=>new Set());
  for(let step=0;step<n;step++){
    let pick=-1,bestSat=-1,bestDeg=-1;
    // scorri per indice, ma valuta saturazione per ID
    for(let idx=0; idx<n; idx++){
      if(current.nodes[idx].color!==-1) continue;
      const id = current.nodes[idx].id;
      const s = usedNbs[idx].size;
      const d = degree(id);
      if(s>bestSat || (s===bestSat && d>bestDeg)){ bestSat=s; bestDeg=d; pick=idx; }
    }
    if(pick===-1) break;
    hintNode=current.nodes[pick].id; draw(); await delay(400);

    let c=0; while(usedNbs[pick].has(c)) c++;
    current.nodes[pick].color=c;

    // aggiorna saturazione dei vicini (per indici!)
    neighbors(current.nodes[pick].id).forEach(nid=>{
      const nbIdx = idToIndex.get(nid);
      if(nbIdx!==undefined && current.nodes[nbIdx].color===-1) usedNbs[nbIdx].add(c);
    });

    hintNode=-1; draw(); await delay(200);
  }
}

// DSATUR con animazione adattiva
async function runDsaturAnimatedAdaptive(){
  resetColors();
  const n = current.nodes.length;

  const stepDelay = Math.max(70, 340 - n*10); // ritmo adattivo
  const MAX_TIME = 2500;
  const t0 = performance.now();

  const usedNbs = Array.from({length:n},()=>new Set());

  // mappa ID->index locale
  const idToIndexLocal = new Map();
  current.nodes.forEach((v,idx)=>idToIndexLocal.set(v.id,idx));

  const neighByIdx = (idx) => {
    const id = current.nodes[idx].id;
    const out = [];
    current.edges.forEach(([a,b])=>{
      if(a===id){ const j = idToIndexLocal.get(b); if(j!==undefined) out.push(j); }
      else if(b===id){ const j = idToIndexLocal.get(a); if(j!==undefined) out.push(j); }
    });
    return out;
  };
  const degByIdx = (idx) => neighByIdx(idx).length;

  for(let step=0; step<n; step++){
    let pick=-1, bestSat=-1, bestDeg=-1;
    for(let i=0;i<n;i++){
      if(current.nodes[i].color!==-1) continue;
      const s = usedNbs[i].size;
      const d = degByIdx(i);
      if(s>bestSat || (s===bestSat && d>bestDeg)){ bestSat=s; bestDeg=d; pick=i; }
    }
    if(pick===-1) break;

    if(performance.now() - t0 > MAX_TIME){
      dsatur(); // completa istantaneamente
      draw();
      return;
    }

    hintNode = current.nodes[pick].id;
    draw();
    await delay(stepDelay);

    let c=0; while(usedNbs[pick].has(c)) c++;
    current.nodes[pick].color = c;

    neighByIdx(pick).forEach(j=>{
      if(current.nodes[j].color===-1) usedNbs[j].add(c);
    });

    hintNode = -1;
    draw();
    await delay(Math.max(50, stepDelay/2));
  }
}

// --- Backtracking animato ---
async function runBacktrackingAnimated(){
  resetColors();
  const orderIDs=orderByDegreeDesc(); // lista di ID
  const K=current.goal;
  async function bt(idx){
    if(idx===orderIDs.length){draw();return true;}
    const id=orderIDs[idx];
    const i=idToIndex.get(id);
    for(let c=0;c<K;c++){
      if(colorable(id,c)){
        current.nodes[i].color=c;hintNode=id;draw();await delay(300);
        if(await bt(idx+1)) return true;
        current.nodes[i].color=-1;hintNode=id;draw();await delay(200);
      }
    }
    return false;
  }
  await bt(0);hintNode=-1;draw();
}

// utility delay
function delay(ms){return new Promise(r=>setTimeout(r,ms));}

// ================== Interazione canvas ==================
function canvasToGraphXY(evt){
  const r = elStage.getBoundingClientRect();
  const sX = elStage.width  / r.width;
  const sY = elStage.height / r.height;
  return { x: (evt.clientX - r.left)*sX, y: (evt.clientY - r.top)*sY };
}

function hitNode(px, py){
  const R = Math.max(10, Math.min(elStage.width, elStage.height)/60) + 4;
  for (const v of current.nodes){
    const p = toPx(v.x, v.y);
    if (Math.hypot(px - p.X, py - p.Y) <= R) return v.id; // ritorna l'ID
  }
  return -1;
}

// ================== Events ==================
function wireEvents(){
  document.getElementById('loadBtn').addEventListener('click',()=>loadLevel(elLevel.value));
  
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    resetColors();
    // reset spiegazioni
    elInfoDSATUR.style.display = 'none';
    elInfoDSATUR.innerHTML = "";
    elInfoBacktrack.style.display = 'none';
    elInfoBacktrack.innerHTML = "";
  });

  // click sul canvas per colorare
  elStage.addEventListener('click', e=>{
    if(!current) return;
    const {x,y} = canvasToGraphXY(e);
    const nodeId = hitNode(x,y);
    if(nodeId < 0) return;
    const idx = idToIndex.get(nodeId);
    if(idx === undefined) return;

    if(e.shiftKey) current.nodes[idx].color = -1;
    else current.nodes[idx].color = activeColor;

    hintNode=-1; draw();
  });

  // hover per cursore "mano"
  elStage.addEventListener('mousemove', e=>{
    if(!current) return;
    const {x,y} = canvasToGraphXY(e);
    const nodeId = hitNode(x,y);
    elStage.style.cursor = (nodeId>=0 ? 'pointer' : 'default');
  });

  // Algoritmi
  document.getElementById('btnDSATUR').addEventListener('click',()=>{
    elInfoDSATUR.style.display='block';
    elInfoDSATUR.innerHTML = I18N[currentLang].dsaturInfo;
    runDsaturAnimatedAdaptive();
  });

  document.getElementById('btnBacktrack').addEventListener('click',()=>{
    if(current.nodes.length > 15){
      elInfoBacktrack.style.display='block';
      elInfoBacktrack.innerHTML = I18N[currentLang].backtrackUnavailable;
      return;
    }
    elInfoBacktrack.style.display='block';
    elInfoBacktrack.innerHTML = I18N[currentLang].backtrackInfo;
    runBacktrackingAnimated();
  });

  document.getElementById('btnHint').addEventListener('click',hintDsaturNode);
}

// fallback DSATUR istantaneo
function dsatur(){
  resetColors();
  const n=current.nodes.length;
  const usedNbs=Array.from({length:n},()=>new Set());
  for(let step=0;step<n;step++){
    let pick=-1,bestSat=-1,bestDeg=-1;
    for(let idx=0;idx<n;idx++){
      if(current.nodes[idx].color!==-1)continue;
      const id=current.nodes[idx].id;
      const s=usedNbs[idx].size, d=degree(id);
      if(s>bestSat||(s===bestSat&&d>bestDeg)){bestSat=s;bestDeg=d;pick=idx;}
    }
    if(pick===-1)break;
    let c=0;while(usedNbs[pick].has(c))c++;
    current.nodes[pick].color=c;
    neighbors(current.nodes[pick].id).forEach(nid=>{
      const nbIdx=idToIndex.get(nid);
      if(nbIdx!==undefined && current.nodes[nbIdx].color===-1) usedNbs[nbIdx].add(c);
    });
  }
  draw();
}

// fallback Backtracking istantaneo
function backtrackingMinColors(limitK=6,timeMs=400){
  const start=performance.now();
  const orderIDs=orderByDegreeDesc();
  for(let K=1;K<=limitK;K++){
    resetColors();
    if(bt(0,K)) {draw();return;}
    if(performance.now()-start>timeMs) break;
  }
  draw();

  function bt(idx,K){
    if(idx===orderIDs.length) return true;
    const id=orderIDs[idx];
    const i=idToIndex.get(id);
    for(let c=0;c<K;c++){
      if(colorable(id,c)){
        current.nodes[i].color=c;
        if(bt(idx+1,K)) return true;
        current.nodes[i].color=-1;
      }
    }
    return false;
  }
}

function hintDsaturNode(){
  let pick=-1,best=-1,bestDeg=-1;
  for(const v of current.nodes){
    if(v.color!==-1) continue;
    const s=new Set(neighbors(v.id).map(j=>{
      const idx = idToIndex.get(j);
      return (idx!==undefined? current.nodes[idx].color : -1);
    }).filter(c=>c>=0)).size;
    const d=degree(v.id);
    if(s>best||(s===best&&d>bestDeg)){best=s;bestDeg=d;pick=v.id;}
  }
  hintNode=pick; draw();
}
