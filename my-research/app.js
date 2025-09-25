window.addEventListener('DOMContentLoaded', function(){
  'use strict';

  // ================= I18N =================
  const I18N = {
    it: {
      title: "DAL COMPORTAMENTO DELLE FORMICHE AI MODELLI SOCIALI",
      sec1_h3: "COS’È L’ACO E COME FUNZIONA",
      sec1_p1: "L’Ant Colony Optimization (ACO) è un metodo di <b>ottimizzazione</b> ispirato alle <span class=\"hl\">formiche</span>. Ogni “formica” lascia <span class=\"hl\">feromone</span> sui cammini; il segnale <span class=\"hl\">evapora</span> con tasso <b>ρ</b>, mantenendo il sistema flessibile. La scelta del prossimo arco <i>i→j</i> combina due indizi: il feromone <b>τ</b><sub>ij</sub> (memoria di quanto quel cammino è stato preferito) e la <b>visibilità</b> <b>η</b><sub>ij</sub> = 1/<i>lunghezza</i> (quanto la meta è vicina), pesati da <b>α</b> e <b>β</b>.",
      sec1_formula: "p<sub>i→j</sub> ∝ τ<sub>ij</sub><sup>α</sup> · η<sub>ij</sub><sup>β</sup>",
      sec1_p2: "I cammini percorsi si <b>rinforzano</b> (↑<b>τ</b>), gli altri si attenuano per <b>evaporazione</b> (<b>ρ</b>): l’equilibrio tra memoria ed esplorazione guida verso buoni percorsi su grafi complessi. La stessa logica, bilanciare ciò che “si è imparato” con ciò che “si vede”, sostiene il <span class=\"hl\">mapping</span> sociale presentato qui sotto.",
      map_tau_l: '<span class="chip chip-tau">τ</span> Feromoni',
      map_tau_r: "Tracce sociali: memoria collettiva dei percorsi già scelti.",
      map_eta_l: '<span class="chip chip-eta">η</span> Visibilità',
      map_eta_r: "Desiderabilità oggettiva: η = 1/lunghezza (più corto = più attraente).",
      map_alpha_l: '<span class="chip chip-alpha">α</span> Peso su τ',
      map_alpha_r: "Fiducia sociale: quanto seguo le scelte altrui (tracce).",
      map_beta_l: '<span class="chip chip-beta">β</span> Peso su η',
      map_beta_r: "Fiducia oggettiva: quanto seguo i dati/geometria del percorso.",
      map_rho_l: '<span class="chip chip-rho">ρ</span> Evaporazione',
      map_rho_r: "Oblio: le tracce si affievoliscono se non usate → adattamento.",
      b1: "Rappresentazione: nodi ⇢ opzioni/luoghi; archi ⇢ scelte possibili.",
      b2: "Trasposizione: ho interpretato τ, η, α, β come tracce sociali, desiderabilità, fiducia sociale/oggettiva.",
      b3: "Memoria dinamica: rinforzo al passaggio (↑τ) e decadimento con ρ.",
      b4: "Esplorazione: ho introdotto una quota di agenti competitivi che danneggiano alcuni archi (rallentamento) per rompere l’effetto-gregge.",
      sec2_h3: "DECISIONI COLLETTIVE: UNA NUOVA PROSPETTIVA",
      sec2_p1: "Gli agenti pesano insieme <span class=\"hl\">tracce sociali (τ)</span> e <span class=\"hl\">dati oggettivi (η)</span>. Le scelte ricorrenti vengono <b>rinforzate</b> (↑τ) e diventano più attraenti per gli agenti futuri; al contrario, le tracce poco usate <b>svaniscono</b> (ρ), permettendo al sistema di adattarsi. La <b>competizione</b> (se presente) danneggia alcuni archi, spezza l’effetto-gregge e facilita l’esplorazione.",
      // Legend & KPIs
      leg_coop_b: "Agenti cooperativi",
      leg_coop_t: "— rinforzano τ",
      leg_comp_b: "Agenti competitivi",
      leg_comp_t: "— danno sull’arco",
      leg_tau_low: "τ basso",
      leg_tau_high: "τ alto",
      leg_damage: "<b>Danno</b> sull’arco → movimento più lento",
      k_done: "Run completate:",
      k_avg: "Lunghezza media (ultimi 20):",
      k_best: "Best trovato:",
      // Controls
      ctrl_alpha_l: "fiducia sociale",
      ctrl_alpha_h: "Peso alle tracce: più alto ⇒ seguo l’esperienza altrui.",
      ctrl_beta_l: "fiducia oggettiva",
      ctrl_beta_h: "Peso ai dati del percorso: più alto ⇒ seguo la geometria.",
      ctrl_rho_l: "decadimento della traccia",
      ctrl_rho_h: "Velocità di evaporazione: più alto ⇒ le tracce svaniscono prima.",
      ctrl_coop_l: "Cooperazione (%)",
      ctrl_coop_h: "Quota di agenti cooperativi: più alto ⇒ più rinforzo su τ.",
      ctrl_comp_l: "Intensità competizione",
      ctrl_comp_h: "Aumenta il rallentamento causato dai competitivi.",
      ctrl_ants_l: "Agenti",
      ctrl_ants_h: "Numero di agenti nella simulazione.",
      ctrl_speed_l: "Velocità (px/s)",
      ctrl_speed_h: "Velocità di movimento degli agenti sul grafo.",
      // Buttons / HUD
      btn_pause: "⏸️ Pausa",
      btn_resume: "▶️ Riprendi",
      btn_reset: "🔁 Reset",
      btn_regen: "🧩 Rigenera grafo",
      hud_agents: "Agenti",
      hud_coop: "Coop",
      hud_comp: "Comp",
      hud_pause: "Pausa",
      yes: "sì",
      no: "no"
    },
    en: {
      title: "FROM ANT BEHAVIOR TO SOCIAL MODELS",
      sec1_h3: "WHAT IS ACO AND HOW IT WORKS",
      sec1_p1: "Ant Colony Optimization (ACO) is an <b>optimization</b> method inspired by <span class=\"hl\">ants</span>. Each “ant” lays <span class=\"hl\">pheromone</span> on paths; the signal <span class=\"hl\">evaporates</span> with rate <b>ρ</b>, keeping the system adaptive. The choice of the next edge <i>i→j</i> combines two cues: the pheromone <b>τ</b><sub>ij</sub> (collective memory of how much that path was preferred) and the <b>visibility</b> <b>η</b><sub>ij</sub> = 1/<i>length</i> (how close the destination is), weighted by <b>α</b> and <b>β</b>.",
      sec1_formula: "p<sub>i→j</sub> ∝ τ<sub>ij</sub><sup>α</sup> · η<sub>ij</sub><sup>β</sup>",
      sec1_p2: "Traversed paths get <b>reinforced</b> (↑<b>τ</b>), others fade due to <b>evaporation</b> (<b>ρ</b>): the balance between memory and exploration guides the search for good routes on complex graphs. The same logic—balancing what has been “learned” with what is “seen”—supports the social <span class=\"hl\">mapping</span> presented below.",
      map_tau_l: '<span class="chip chip-tau">τ</span> Pheromones',
      map_tau_r: "Social traces: collective memory of paths already chosen.",
      map_eta_l: '<span class="chip chip-eta">η</span> Visibility',
      map_eta_r: "Objective desirability: η = 1/length (shorter = more attractive).",
      map_alpha_l: '<span class="chip chip-alpha">α</span> Weight on τ',
      map_alpha_r: "Social trust: how much I follow others’ choices (traces).",
      map_beta_l: '<span class="chip chip-beta">β</span> Weight on η',
      map_beta_r: "Objective trust: how much I follow data/geometry of the route.",
      map_rho_l: '<span class="chip chip-rho">ρ</span> Evaporation',
      map_rho_r: "Forgetting: traces fade if unused → adaptation.",
      b1: "Representation: nodes ⇢ options/places; edges ⇢ possible choices.",
      b2: "Transposition: I interpret τ, η, α, β as social traces, desirability, social/objective trust.",
      b3: "Dynamic memory: reinforcement when traversed (↑τ) and decay with ρ.",
      b4: "Exploration: I introduce some competitive agents that damage certain edges (slowdown) to break the herd effect.",
      sec2_h3: "COLLECTIVE DECISIONS: A NEW PERSPECTIVE",
      sec2_p1: "Agents weigh <span class=\"hl\">social traces (τ)</span> and <span class=\"hl\">objective data (η)</span> together. Recurrent choices are <b>reinforced</b> (↑τ) and become more attractive for future agents; rarely used traces <b>fade</b> (ρ), allowing the system to adapt. <b>Competition</b> (if present) damages some edges, breaks the herd effect, and fosters exploration.",
      // Legend & KPIs
      leg_coop_b: "Cooperative agents",
      leg_coop_t: "— reinforce τ",
      leg_comp_b: "Competitive agents",
      leg_comp_t: "— edge damage",
      leg_tau_low: "low τ",
      leg_tau_high: "high τ",
      leg_damage: "<b>Damage</b> on the edge → slower movement",
      k_done: "Completed runs:",
      k_avg: "Average length (last 20):",
      k_best: "Best found:",
      // Controls
      ctrl_alpha_l: "social trust",
      ctrl_alpha_h: "Weight on traces: higher ⇒ I follow others’ experience.",
      ctrl_beta_l: "objective trust",
      ctrl_beta_h: "Weight on route data: higher ⇒ I follow geometry.",
      ctrl_rho_l: "trace decay",
      ctrl_rho_h: "Evaporation speed: higher ⇒ traces fade sooner.",
      ctrl_coop_l: "Cooperation (%)",
      ctrl_coop_h: "Share of cooperative agents: higher ⇒ more reinforcement on τ.",
      ctrl_comp_l: "Competition intensity",
      ctrl_comp_h: "Increases slowdown caused by competitive agents.",
      ctrl_ants_l: "Agents",
      ctrl_ants_h: "Number of agents in the simulation.",
      ctrl_speed_l: "Speed (px/s)",
      ctrl_speed_h: "Agents' speed on the graph.",
      // Buttons / HUD
      btn_pause: "⏸️ Pause",
      btn_resume: "▶️ Resume",
      btn_reset: "🔁 Reset",
      btn_regen: "🧩 Regenerate graph",
      hud_agents: "Agents",
      hud_coop: "Coop",
      hud_comp: "Comp",
      hud_pause: "Pause",
      yes: "yes",
      no: "no"
    }
  };

  const STATE = {
    lang: (localStorage.getItem('lang') || (window.INIT_LANG || document.documentElement.lang || 'it')).slice(0,2)
  };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const t = (k) => (I18N[STATE.lang] && I18N[STATE.lang][k]) || (I18N.it[k] || k);

  function applyI18N(){
    document.documentElement.lang = STATE.lang;
    // buttons state
    $$('.lang-btn').forEach(btn => {
      const active = btn.dataset.lang === STATE.lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // content nodes
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    // buttons with icons (reset/regen) - keep icons but update text via data-i18n
    try{ $('#btnPause').textContent = (typeof paused !== 'undefined' && paused ? t('btn_resume') : t('btn_pause')); }catch(_){}
    $('#btnReset').textContent = t('btn_reset');
    $('#btnRegen').textContent = t('btn_regen');
    // refresh HUD immediately
    if (typeof draw === 'function') draw(true);
  }

  function setLang(lang){
    STATE.lang = (lang === 'en' ? 'en' : 'it');
    localStorage.setItem('lang', STATE.lang);
    applyI18N();
  }

  // Attach language switch events
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('.lang-btn');
    if(btn){
      setLang(btn.dataset.lang);
    }
  });

  // ================= Utility =================
  const rnd = (a,b) => a + Math.random()*(b-a);
  const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
  const edgeKey = (i,j) => i<j ? `${i}-${j}` : `${j}-${i}`;

  // ================= Canvas & DPR =================
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const box = document.getElementById('canvasBox');
  function resizeCanvas(){
    const dpr = window.devicePixelRatio || 1;
    const rect = box.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(640 * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = 640 + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  if (typeof ResizeObserver !== 'undefined') { new ResizeObserver(resizeCanvas).observe(box); } else { window.addEventListener('resize', resizeCanvas); }
  resizeCanvas();

  // ================= UI =================
  const ui = {
    alpha: document.getElementById('alpha'),
    beta:  document.getElementById('beta'),
    rho:   document.getElementById('rho'),
    coop:  document.getElementById('coop'),
    comp:  document.getElementById('comp'),
    ants:  document.getElementById('ants'),
    speed: document.getElementById('speed'),
    alphaVal: document.getElementById('alphaVal'),
    betaVal: document.getElementById('betaVal'),
    rhoVal: document.getElementById('rhoVal'),
    coopVal: document.getElementById('coopVal'),
    compVal: document.getElementById('compVal'),
    antsVal: document.getElementById('antsVal'),
    speedVal: document.getElementById('speedVal'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    btnRegen: document.getElementById('btnRegen'),
    hud: document.getElementById('hud'),
    kDone: document.getElementById('kDone'),
    kAvg: document.getElementById('kAvg'),
    kBest: document.getElementById('kBest')
  };

  function syncLabels(){
    ui.alphaVal.textContent = (+ui.alpha.value).toFixed(1);
    ui.betaVal.textContent  = (+ui.beta.value).toFixed(1);
    ui.rhoVal.textContent   = (+ui.rho.value).toFixed(2);
    ui.coopVal.textContent  = ui.coop.value;
    ui.compVal.textContent  = (+ui.comp.value).toFixed(2);
    ui.antsVal.textContent  = ui.ants.value;
    ui.speedVal.textContent = ui.speed.value;
  }
  ['alpha','beta','rho','coop','comp','ants','speed'].forEach(id=>{
    ui[id].addEventListener('input',()=>{
      syncLabels();
      if(id==='ants' || id==='coop') rebuildAnts();
      if (id === 'speed') {
  const v = +ui.speed.value;
  ants.forEach(a => { a.speed = v * (a.speedFactor || 1); });
}

    });
  });
  syncLabels();

  // ================= Graph state =================
  let nodes = [];
  const edges = new Map(); // key -> {i,j,len,tau}
  const damage = new Map(); // key -> damage >=0, decays with time
  let startNode = 0, goalNode = 0;

  const CFG = {
    N_RING: 36,        // (qui = N punti random)
    KNN: 4,            // vicini per ogni nodo
    TAU0: 1.0,
    TAU_MIN: 0.01,
    TAU_MAX: 8.0,
    DEPOSIT_GOAL: 110.0,// bonus a goal (coop)
    DEPOSIT_STEP: 1.0, // Q per traversamento (coop)
    DMG_STEP: 0.80,   // più danno per passaggio competitivo
    DMG_DECAY: 0.20,  // il danno resta più a lungo
    DMG_COST: 12.0,   // moltiplicatore molto forte sulla lunghezza
    DMG_SLOW: 4.0,     // rallentamento visivo più evidente
    AGENT_STYLE: 'person',  // 'person' | 'dot'
    AGENT_SIZE: 12,          // dimensione agenti in px (regola tutto da qui)
  };

  function drawAgent(x, y, type){
    const s = CFG.AGENT_SIZE;
    const col = (type === 'coop') ? '#00e5ff' : '#ffd24d';

    if (CFG.AGENT_STYLE === 'person'){
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // testa
      ctx.beginPath();
      ctx.arc(0, -s*0.35, s*0.25, 0, Math.PI*2);
      ctx.fill();

      // corpo/arti (stilizzato a linee)
      ctx.lineWidth = Math.max(1.2, s*0.22);
      ctx.beginPath();
      // torso
      ctx.moveTo(0, -s*0.1);
      ctx.lineTo(0,  s*0.45);
      // braccia
      ctx.moveTo(0, 0);
      ctx.lineTo(-s*0.35, s*0.2);
      ctx.moveTo(0, 0);
      ctx.lineTo( s*0.35, s*0.2);
      // gambe
      ctx.moveTo(0,  s*0.45);
      ctx.lineTo(-s*0.3, s*0.9);
      ctx.moveTo(0,  s*0.45);
      ctx.lineTo( s*0.3, s*0.9);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // fallback: puntino (se AGENT_STYLE === 'dot')
    ctx.beginPath();
    ctx.arc(x, y, s*0.45, 0, Math.PI*2);
    ctx.fillStyle = col;
    ctx.fill();
  }

  function resetEdgesTau(){
    for(const e of edges.values()) e.tau = CFG.TAU0;
    damage.clear();
  }

  function distance(a,b){
    const dx = nodes[a].x - nodes[b].x;
    const dy = nodes[a].y - nodes[b].y;
    return Math.hypot(dx,dy);
  }

  function connect(i,j){
    if(i===j) return;
    const key = edgeKey(i,j);
    if(edges.has(key)) return;
    const len = distance(i,j);
    edges.set(key,{i,j,len,tau:CFG.TAU0});
    nodes[i].nbrs.push(j);
    nodes[j].nbrs.push(i);
  }

  function regenerateGraph(){
    try{
      nodes = [];
      edges.clear();
      damage.clear();

      const W = (canvas.width / (window.devicePixelRatio||1));
      const H = (canvas.height / (window.devicePixelRatio||1));
      const marginX = Math.max(10, W*0.06), marginY = Math.max(10, H*0.08);
      const innerW = Math.max(40, W - marginX*2), innerH = Math.max(40, H - marginY*2);

      // --- NODI RANDOM UNIFORMI NELLO SPAZIO ---
      for(let i=0;i<CFG.N_RING;i++){
        const x = marginX + Math.random()*innerW;
        const y = marginY + Math.random()*innerH;
        nodes.push({id:i,x,y,nbrs:[]});
      }

      // --- CONNESSIONI K-NEAREST NEIGHBORS ---
      for(let i=0;i<nodes.length;i++){
        const dists = nodes.map((n,j)=>({j, d: i===j?Infinity:distance(i,j)})).sort((a,b)=>a.d-b.d);
        const kmax = Math.min(CFG.KNN, dists.length-1);
        for(let k=1;k<=kmax;k++) connect(i,dists[k].j);
      }

      // start = min x, goal = max x
      if(nodes.length){
        startNode = nodes.reduce((a,b)=> (b.x < a.x ? b : a )).id;
        goalNode  = nodes.reduce((a,b)=> (b.x > a.x ? b : a )).id;
      } else {
        startNode = goalNode = 0;
      }

      resetEdgesTau();
      rebuildAnts();
    }catch(err){
      console.error('regenerateGraph error', err);
    }
  }

  // ================= Ants =================
  let ants = [];
  const STATS = { done:0, best:null, last20:[] };

  function getEdge(i,j){ return edges.get(edgeKey(i,j)); }
  function getDamage(i,j){ return damage.get(edgeKey(i,j)) || 0; }
  function addDamage(i,j, v){ const k=edgeKey(i,j); damage.set(k, (damage.get(k)||0) + v); }

  function effLen(e){ // lunghezza effettiva con danno
    const d = getDamage(e.i,e.j);
    return e.len * (1 + d*CFG.DMG_COST);
  }

  function pickNext(from, last){
    const alpha = +ui.alpha.value;
    const beta  = +ui.beta.value;

    const nbrsRaw = nodes[from].nbrs;
    if(!nbrsRaw.length) return from; // nessun vicino: resti fermo

    // 1) Escludi il nodo da cui sei appena arrivato (last),
    //    MA solo se esistono alternative (altrimenti permetti il backtrack da cul-de-sac)
    let nbrs = nbrsRaw;
    if (last !== -1) {
      const filtered = nbrsRaw.filter(j => j !== last);
      if (filtered.length > 0) nbrs = filtered;
    }

    // 2) Calcolo pesi PTR sui candidati
    let weights = [];
    let sum = 0;
    for (const j of nbrs){
      const e = getEdge(from, j);
      const lenEff = effLen(e);
      const eta = 1.0 / (lenEff + 1e-6);
      const w = Math.pow(Math.max(e.tau, CFG.TAU_MIN), alpha) * Math.pow(eta, beta);
      weights.push({ j, w });
      sum += w;
    }

    if (sum <= 0) return nbrs[Math.floor(Math.random() * nbrs.length)];

    let r = Math.random() * sum;
    for (const o of weights){ r -= o.w; if (r <= 0) return o.j; }
    return weights[weights.length - 1].j;
  }

  function newAnt(type){
    const speed = +ui.speed.value; // px/s
    //const a = { type, node:startNode, last:-1, next:-1, t:0, edge:null, speed:speed*(0.85+rnd(0,0.3)), path:[], pathLen:0 };
    const base = 0.85 + Math.random()*0.3;           // fattore personale (varia tra ~0.85 e ~1.15)
    const a = { type, node:startNode, last:-1, next:-1, t:0, edge:null,
            speed: (+ui.speed.value) * base,      // velocità = slider × fattore
            speedFactor: base,                    // lo memorizzo per aggiornamenti live
            path:[], pathLen:0 };

    a.next = pickNext(a.node, a.last);
    a.edge = getEdge(a.node,a.next);
    a.t = 0;
    return a;

  }

  function rebuildAnts(){
    const N = +ui.ants.value;
    ants.length = 0;
    const coopPct = (+ui.coop.value)/100;
    const nCoop = Math.round(N*coopPct);
    const nComp = N - nCoop;
    for(let i=0;i<nCoop;i++) ants.push(newAnt('coop'));
    for(let i=0;i<nComp;i++) ants.push(newAnt('comp'));
  }

  function onArriveNode(a){
    const compIntensity = +ui.comp.value; // 0..1
    if(a.edge){
      const L = effLen(a.edge);
      if(a.type==='coop'){
        a.edge.tau = clamp(a.edge.tau + CFG.DEPOSIT_STEP / L, CFG.TAU_MIN, CFG.TAU_MAX);
      } else { // competitive: anti-reinforcement + temporary damage
        addDamage(a.edge.i, a.edge.j, CFG.DMG_STEP * compIntensity);
      }
    }

    if(a.next === goalNode){
      STATS.done++;
      STATS.last20.push(a.pathLen + effLen(a.edge));
      if(STATS.last20.length>20) STATS.last20.shift();
      const totalLen = a.pathLen + effLen(a.edge);
      if(STATS.best===null || totalLen < STATS.best) STATS.best = totalLen;

      const keys = [...a.path, edgeKey(a.node,a.next)];
      for(const key of keys){
        const e = edges.get(key); if(!e) continue; const L = effLen(e);
        if(a.type==='coop'){
          e.tau = clamp(e.tau + CFG.DEPOSIT_GOAL / L, CFG.TAU_MIN, CFG.TAU_MAX);
        } else {
          const [i,j] = key.split('-').map(n=>+n);
          addDamage(i,j, CFG.DMG_STEP*1.5 * compIntensity);
        }
      }
      const nx = pickNext(startNode,-1);
      Object.assign(a, { node:startNode, last:-1, next:nx, t:0, edge:getEdge(startNode, nx), path:[], pathLen:0 });
      return;
    }

    a.path.push(edgeKey(a.node,a.next));
    a.pathLen += effLen(a.edge);
    a.last = a.node;
    a.node = a.next;
    a.next = pickNext(a.node, a.last);
    a.edge = getEdge(a.node,a.next);
    a.t = 0;
  }

  // ================= Simulation loop =================
  let paused = false; let lastT = performance.now();

  function step(){
    const now = performance.now();
    const dt = (now - lastT) / 1000; // seconds
    lastT = now;
    if(!paused){
      const rho = +ui.rho.value;
      const decayTau = Math.exp(-rho * dt);
      for(const e of edges.values()) e.tau = clamp(e.tau * decayTau, CFG.TAU_MIN, CFG.TAU_MAX);
      const decayDmg = Math.exp(-CFG.DMG_DECAY * dt);
      for(const [k,v] of damage){ const nv = v*decayDmg; if(nv<1e-4) damage.delete(k); else damage.set(k, nv); }

      for(const a of ants){
        if(!a.edge || effLen(a.edge)<=1e-6){ onArriveNode(a); continue; }
        // Rallentamento visibile su archi danneggiati
        const d = getDamage(a.edge.i,a.edge.j);
        const slow = 1 + d*CFG.DMG_SLOW; // >1 ⇒ più lento
        a.t += (a.speed / (effLen(a.edge) * slow)) * dt;
        if(a.t >= 1){ onArriveNode(a); }
      }
    }
    draw();
    requestAnimationFrame(step);
  }

  // ================= Draw =================
  function draw(forceHud){
    const W = (canvas.width / (window.devicePixelRatio||1));
    const H = (canvas.height / (window.devicePixelRatio||1));
    ctx.clearRect(0,0,W,H);

    let maxTau = 0, minTau = Infinity;
    for(const e of edges.values()){ maxTau = Math.max(maxTau, e.tau); minTau = Math.min(minTau, e.tau); }
    const span = Math.max(1e-6, maxTau - minTau);

    ctx.lineCap = 'round';
    for(const e of edges.values()){
      const A = nodes[e.i], B = nodes[e.j];
      // base
      ctx.strokeStyle = 'rgba(180,188,220,0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();
      // τ heat (relativo per contrasto visivo)
      const tRel = (e.tau - minTau) / span;
      const w = 1 + 5 * Math.pow(tRel, 0.8);
      ctx.strokeStyle = `rgba(157,124,255,${0.25 + 0.65*tRel})`;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();
      // damage overlay (rosso)
      const d = getDamage(e.i,e.j);
      if(d>0){
        const a = clamp(d*0.55, 0.15, 0.85);
        ctx.setLineDash([8,6]);
        ctx.strokeStyle = `rgba(255,120,133,${a})`;
        ctx.lineWidth = 1 + 6*Math.tanh(d);
        ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for(const n of nodes){
      ctx.beginPath(); ctx.arc(n.x,n.y, 4.4, 0, Math.PI*2);
      ctx.fillStyle = '#d9ddff'; ctx.fill();
    }

    const S = nodes[startNode], G = nodes[goalNode];
    ctx.beginPath(); ctx.arc(S.x,S.y, 7, 0, Math.PI*2); ctx.fillStyle = '#16e0a0'; ctx.fill();
    ctx.beginPath(); ctx.arc(G.x,G.y, 7, 0, Math.PI*2); ctx.fillStyle = '#ff5a7f'; ctx.fill();

    for (const a of ants){
      const A = nodes[a.node], B = nodes[a.next] || nodes[a.node];
      const x = A.x + (B.x - A.x) * a.t;
      const y = A.y + (B.y - A.y) * a.t;
      drawAgent(x, y, a.type);
    }

    // HUD text (i18n)
    const coopPct = (+ui.coop.value);
    const nCoop = Math.round(+ui.ants.value * coopPct/100);
    ui.hud.innerHTML = `α=<b>${(+ui.alpha.value).toFixed(1)}</b>  β=<b>${(+ui.beta.value).toFixed(1)}</b>  ρ=<b>${(+ui.rho.value).toFixed(2)}</b><br/>`
      + `${t('hud_agents')}: <b>${ants.length}</b>  |  ${t('hud_coop')}: <b>${nCoop}</b>  ${t('hud_comp')}: <b>${ants.length-nCoop}</b>  |  ${t('hud_pause')}: <b>${paused? t('yes'):t('no')}</b>`;

    // KPIs (numbers only here)
    ui.kDone.textContent = STATS.done;
    if(STATS.last20.length){
      const avg = STATS.last20.reduce((a,b)=>a+b,0)/STATS.last20.length;
      ui.kAvg.textContent = avg.toFixed(1);
    } else ui.kAvg.textContent = '—';
    ui.kBest.textContent = STATS.best? STATS.best.toFixed(1) : '—';
  }

  // expose draw to i18n refresh
  window.draw = draw;

  // ================= Buttons =================
  // (paused already declared above)
  ui.btnPause.addEventListener('click',()=>{
    paused=!paused;
    ui.btnPause.textContent = paused? t('btn_resume') : t('btn_pause');
  });
  ui.btnReset.addEventListener('click',()=>{ resetEdgesTau(); STATS.done=0; STATS.best=null; STATS.last20.length=0; rebuildAnts(); });
  ui.btnRegen.addEventListener('click',()=>{ regenerateGraph(); STATS.done=0; STATS.best=null; STATS.last20.length=0; });

  // ================= Init =================
  // Build graph first, then apply i18n (so the first draw shows content)
  regenerateGraph();
  applyI18N();
  requestAnimationFrame(step);
});