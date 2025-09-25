/* Versione compatta con testi divulgativi IT/EN, canvas ridotti e tooltip */

const STR = {
  it: {
    title: "La matematica delle case",

    explain_text:
      "Questo modellino è un esempio di <b>apprendimento supervisionato</b>: il computer impara da esempi in cui <b>conosciamo già</b> il prezzo delle case. Così può <b>prevedere</b> il prezzo di nuove case con caratteristiche simili.<br><br>" +
      "A cosa serve? A capire come le diverse <b>feature</b> (metri quadri, camere, bagni, quartiere, piano, balcone/ascensore, vicinanza alla metro…) <b>influenzano</b> il valore. È lo stesso principio usato da portali e agenzie per stimare i prezzi.<br><br>" +
      "Come funziona? È una <b>regressione lineare</b>: il modello trova una <em>formula</em> che combina le feature con dei <i>pesi</i> (w) per <b>minimizzare l’errore</b> sui dati di esempio. Ogni feature può <b>aumentare</b> o <b>diminuire</b> il prezzo: il totale è la <b>somma dei contributi</b> (guarda il <b>punto verde</b> e le <b>barre</b>).",
    formula_toggle: "Formula (apri/chiudi)",
    controls: "Controlli",
    mq: "Metri quadri", camere: "Camere", bagni: "Bagni", piano: "Piano",
    dist: "Vicinanza alla metro", balcone: "Balcone", ascensore: "Ascensore",
    quartiere: "Quartiere",
    quart_explain: "* A=Base (servizi essenziali), B=Buono (servizi e collegamenti migliori), C=Ottimo (molto richiesto).",
    scatterTitle: "m² vs Prezzo previsto",
    legend_you: "tua casa", legend_saved: "case aggiunte",
    legend_line: "relazione m² → prezzo (altre feature fissate)",
    priceTitle: "Prezzo previsto", contribTitle: "Contribuzioni delle feature",
    btnReset: "Reset", btnRandom: "Random", btnAdd: "Aggiungi al grafico", btnClear: "Pulisci punti",
    langToggle: "EN",
    axis_x: "Metri quadri (m²)", axis_y: "Prezzo (€)",
    qA: "A — Base", qB: "B — Buono", qC: "C — Ottimo"
  },
  en: {
    title: "The Math of Houses",
    explain_text:
      "This demo shows <b>supervised learning</b>: the computer learns from examples where we <b>already know</b> the house price. Then it can <b>predict</b> prices for new houses with similar features.<br><br>" +
      "What is it for? To see how different <b>features</b> (size, bedrooms, bathrooms, neighborhood, floor, balcony/elevator, subway proximity…) <b>influence</b> value. It’s the same idea used by listing websites and agencies to estimate prices.<br><br>" +
      "How does it work? It’s <b>linear regression</b>: the model finds a <em>formula</em> combining features with <i>weights</i> (w) to <b>minimize error</b> on the examples. Each feature can <b>increase</b> or <b>decrease</b> the price: the total is the <b>sum of contributions</b> (watch the <b>green dot</b> and the <b>bars</b>).",
    formula_toggle: "Equation (show/hide)",
    controls: "Controls",
    mq: "Square meters", camere: "Bedrooms", bagni: "Bathrooms", piano: "Floor",
    dist: "Subway proximity", balcone: "Balcony", ascensore: "Elevator",
    quartiere: "Neighborhood",
    quart_explain: "* A=Basic (essential services), B=Good (better services & connections), C=Great (highly sought-after).",
    scatterTitle: "m² vs Predicted Price",
    legend_you: "your house", legend_saved: "saved houses",
    legend_line: "m² → price relation (other features fixed)",
    priceTitle: "Predicted price", contribTitle: "Feature contributions",
    btnReset: "Reset", btnRandom: "Random", btnAdd: "Add to chart", btnClear: "Clear points",
    langToggle: "IT",
    axis_x: "Square meters (m²)", axis_y: "Price (€)",
    qA: "A — Basic", qB: "B — Good", qC: "C — Great"
  }
};
let LANG = 'it';
const t = k => STR[LANG][k];

/* ---------- pesi (semplici ma credibili) ---------- */
const W = {
  intercept: 10000,
  mq:         700,
  camere:     5000,
  bagni:      4000,
  piano:       600,
  metro_prox:   3,
  balcone:    2500,
  ascensore:  2000,
  quartB:     6000,
  quartC:    15000
};
const CLAMP_MIN = 15000, CLAMP_MAX = 400000;

/* ---------- stato ---------- */
let state = { mq:70, camere:3, bagni:2, piano:2, dist:600, balcone:true, ascensore:false, quartiere:'B' };
const userPoints = [];

/* ---------- util ---------- */
function euro(x){ const v=Math.round(x); return v.toLocaleString(LANG==='it'?'it-IT':'en-US',{style:'currency',currency:'EUR',maximumFractionDigits:0}); }
function clamp(x,a,b){ return Math.min(b, Math.max(a,x)); }
function randInt(a,b){ return Math.round(a + Math.random()*(b-a)); }
function randRange(a,b){ return a + Math.random()*(b-a); }
function dpr(){ return Math.max(1, window.devicePixelRatio || 1); }

/* ---------- predizione ---------- */
function predict(st){
  const prox = Math.max(0, 2000 - st.dist);
  const terms = [
    {key:'Intercept',      value: W.intercept},
    {key:'Metri quadri',   value: W.mq * st.mq},
    {key:'Camere',         value: W.camere * st.camere},
    {key:'Bagni',          value: W.bagni * st.bagni},
    {key:'Piano',          value: W.piano * st.piano},
    {key:'Vicinanza metro',value: W.metro_prox * prox},
    {key:'Balcone',        value: W.balcone * (st.balcone?1:0)},
    {key:'Ascensore',      value: W.ascensore * (st.ascensore?1:0)},
    {key:'Quartiere B',    value: W.quartB * (st.quartiere==='B')},
    {key:'Quartiere C',    value: W.quartC * (st.quartiere==='C')},
  ];
  let y = terms.reduce((s,t)=>s+t.value,0);
  y = clamp(y, CLAMP_MIN, CLAMP_MAX);
  return { price:y, contributions: terms.filter(t=>t.key!=='Intercept') };
}

/* ---------- dataset di sfondo ---------- */
function generateDataset(n=70){
  const data=[]; for(let i=0;i<n;i++){
    const mq=randInt(30,150), cam=Math.max(1, Math.round(mq/35)+randInt(-1,1));
    const bag=Math.max(1, Math.round(cam/2)), piano=randInt(0,5), dist=randInt(100,1800);
    const balc=Math.random()<0.5, elev=Math.random()<0.5, quart=(Math.random()<0.5)?'A':(Math.random()<0.8?'B':'C');
    let { price } = predict({ mq, camere:cam, bagni:bag, piano, dist, balcone:balc, ascensore:elev, quartiere:quart });
    price = clamp(price + randRange(-7000,7000), CLAMP_MIN, CLAMP_MAX);
    data.push({ mq, price });
  } return data;
}
const dataset = generateDataset();

/* ---------- DOM refs ---------- */
let scatter,sctx,bars,bctx,elPrice,tooltipEl;
let elMq, elCam, elBag, elPiano, elDist, elBal, elElev, elQuart;
let lblMq, lblCam, lblBag, lblPiano, lblDist;

/* ---------- Responsive canvas helpers (compatti) ---------- */
function setCanvasSizeTo(container, canvas, desiredHeightPx){
  const ratio = dpr();
  const cssW = Math.floor(container.clientWidth);
  const cssH = Math.floor(desiredHeightPx);
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width  = Math.floor(cssW * ratio);
  canvas.height = Math.floor(cssH * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio,0,0,ratio,0,0);
}
function autoSizeCanvases(){
  // Scatter: ~45% larghezza, clamp 220..420
  const wrapScatter = document.querySelector('#scatter').parentElement;
  const w = Math.max(240, wrapScatter.clientWidth);
  const hScatter = Math.max(220, Math.min(420, w * 0.45));
  setCanvasSizeTo(wrapScatter, scatter, hScatter);

  // Bars: righe più basse + gap minore
  const contribsCount = 9; const barH = 18, gap = 8, padTop=16, padBot=26;
  const hBars = Math.max(220, Math.min(420, padTop + contribsCount*(barH+gap) + padBot));
  const wrapBars = document.querySelector('#bars').parentElement;
  setCanvasSizeTo(wrapBars, bars, hBars);
}

/* ---------- draw: Scatter ---------- */
function drawScatter(){
  const Wc = scatter.width, Hc = scatter.height;
  const cssW = Wc/dpr(), cssH = Hc/dpr();
  const pad = { l:44, r:14, t:12, b:40 };
  sctx.clearRect(0,0,Wc,Hc);

  const xMin=30,xMax=150,yMin=CLAMP_MIN,yMax=CLAMP_MAX;
  const x2c=x=>pad.l+(x-xMin)/(xMax-xMin)*(cssW-pad.l-pad.r);
  const y2c=y=>cssH-pad.b-(y-yMin)/(yMax-yMin)*(cssH-pad.t-pad.b);

  // assi
  sctx.strokeStyle='#175e57'; sctx.beginPath();
  sctx.moveTo(pad.l, cssH-pad.b); sctx.lineTo(cssW-pad.r, cssH-pad.b);
  sctx.moveTo(pad.l, cssH-pad.b); sctx.lineTo(pad.l, pad.t); sctx.stroke();

  // ticks
  sctx.fillStyle='#9ad7cc'; sctx.font='11px system-ui';
  for(let x=30;x<=150;x+=20){
    const cx=x2c(x), cy=cssH-pad.b;
    sctx.beginPath(); sctx.moveTo(cx,cy); sctx.lineTo(cx,cy+4);
    sctx.strokeStyle='#175e57'; sctx.stroke();
    sctx.fillText(String(x),cx-8,cy+14);
  }
  for(let y=CLAMP_MIN;y<=CLAMP_MAX;y+=80000){
    const cy=y2c(y);
    sctx.beginPath(); sctx.moveTo(pad.l-4,cy); sctx.lineTo(pad.l,cy);
    sctx.strokeStyle='#175e57'; sctx.stroke();
    sctx.fillText((y/1000).toFixed(0)+'k',pad.l-34,cy+3);
  }

  // labels assi
  sctx.fillStyle='#d7fff5';
  sctx.textAlign='center';
  sctx.fillText(t('axis_x'), cssW/2, cssH-10);
  sctx.save(); sctx.translate(38, cssH/2); sctx.rotate(-Math.PI/2);
  sctx.fillText(t('axis_y'), 0, 0); sctx.restore();

  // dataset
  sctx.fillStyle='#7bd5c7';
  dataset.forEach(p=>{ sctx.beginPath(); sctx.arc(x2c(p.mq), y2c(p.price), 2, 0, Math.PI*2); sctx.fill(); });

  // linea mq->prezzo
  sctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2dd4bf';
  sctx.lineWidth=2; sctx.beginPath();
  for(let x=30;x<=150;x+=2){
    const {price}=predict({...state,mq:x});
    const cx=x2c(x), cy=y2c(price);
    if(x===30) sctx.moveTo(cx,cy); else sctx.lineTo(cx,cy);
  }
  sctx.stroke();

  // punto corrente
  const { price }=predict(state);
  sctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--good').trim() || '#22c55e';
  sctx.beginPath(); sctx.arc(x2c(state.mq), y2c(price), 4.5, 0, Math.PI*2); sctx.fill();
  sctx.strokeStyle='#0a4f2a'; sctx.lineWidth=1; sctx.stroke();

  // punti salvati
  const savedColor=getComputedStyle(document.documentElement).getPropertyValue('--saved').trim() || '#fcd80cff';
  sctx.fillStyle=savedColor;
  userPoints.forEach(p=>{
    const pr = predict(p).price;
    p.price = pr;
    p.cx = x2c(p.mq);
    p.cy = y2c(pr);
    sctx.beginPath(); sctx.arc(p.cx, p.cy, 3.6, 0, Math.PI*2); sctx.fill();
    sctx.strokeStyle='#fcd80cff'; sctx.lineWidth=1; sctx.stroke();
  });
}

/* ---------- draw: Bars ---------- */
function drawBars(contribs){
  const Wc = bars.width, Hc = bars.height;
  const cssW = Wc/dpr(), cssH = Hc/dpr();
  bctx.clearRect(0,0,Wc,Hc);

  const items = [...contribs].sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));

  const pad = { l:170, r:22, t:16, b:26 };
  const barH = 18, gap = 8;
  const usableW = cssW - pad.l - pad.r;

  const maxAbs = Math.max(1, ...items.map(it => Math.abs(it.value)));
  const mid = pad.l + usableW/2;
  const half = usableW/2;
  const x2c = v => mid + (v/maxAbs)*half;

  // asse 0
  bctx.strokeStyle = '#175e57';
  bctx.beginPath();
  bctx.moveTo(x2c(0), pad.t-6);
  bctx.lineTo(x2c(0), cssH - pad.b + 6);
  bctx.stroke();

  bctx.font = '11px system-ui';

  items.forEach((it, i) => {
    const y = pad.t + i*(barH + gap);

    // label
    bctx.fillStyle = '#d7fff5'; bctx.textAlign = 'left';
    const label = (LANG==='it') ? it.key : it.key
      .replace('Metri quadri','Square meters')
      .replace('Camere','Bedrooms')
      .replace('Bagni','Bathrooms')
      .replace('Piano','Floor')
      .replace('Vicinanza metro','Subway proximity')
      .replace('Balcone','Balcony')
      .replace('Ascensore','Elevator')
      .replace('Quartiere B','Neighborhood B')
      .replace('Quartiere C','Neighborhood C');
    bctx.fillText(label, 8, y + barH - 6);

    // barra
    const x0 = x2c(0), x1 = x2c(it.value);
    const x  = Math.min(x0, x1);
    const w  = Math.abs(x1 - x0);
    bctx.fillStyle = it.value >= 0
      ? getComputedStyle(document.documentElement).getPropertyValue('--good').trim() || '#22c55e'
      : getComputedStyle(document.documentElement).getPropertyValue('--bad').trim()  || '#ef4444';
    bctx.fillRect(x, y, w, barH);

    // valore
    const txt = euro(it.value);
    const insideThreshold = Math.max(64, usableW * 0.12);
    const txtW = bctx.measureText(txt).width;

    if (it.value >= 0) {
      if (w > insideThreshold && x1 - x >= txtW + 8) {
        bctx.fillStyle = '#ffffff'; bctx.textAlign = 'right';
        bctx.fillText(txt, x1 - 5, y + barH - 6);
      } else {
        bctx.fillStyle = '#b7d9cf';
        let vx = x1 + 6;
        if (vx + txtW > cssW - 6){ bctx.textAlign='right'; vx = cssW - 6; }
        else { bctx.textAlign='left'; }
        bctx.fillText(txt, vx, y + barH - 6);
      }
    } else {
      if (w > insideThreshold && x + w - x >= txtW + 8) {
        bctx.fillStyle = '#ffffff'; bctx.textAlign = 'left';
        bctx.fillText(txt, x1 + 6, y + barH - 6);
      } else {
        bctx.fillStyle = '#b7d9cf';
        let vx = x1 - 6;
        if (vx - txtW < 6){ bctx.textAlign='left'; vx = 6; }
        else { bctx.textAlign='right'; }
        bctx.fillText(txt, vx, y + barH - 6);
      }
    }
  });

  // legenda
  bctx.fillStyle = '#b7d9cf'; bctx.textAlign = 'left';
  bctx.fillText(LANG==='it' ? 'verde = aumenta, rosso = diminuisce'
                             : 'green = increases, red = decreases',
                8, cssH - 8);
}

/* ---------- Tooltip ---------- */
function showTooltip(html, x, y){
  if(!tooltipEl) tooltipEl = document.getElementById('tooltip');
  tooltipEl.innerHTML = html;
  tooltipEl.classList.remove('hidden');
  const wrap = document.querySelector('#scatter').parentElement.getBoundingClientRect();
  const t = tooltipEl.getBoundingClientRect();
  const left = Math.min(x + 12, wrap.width - t.width - 8);
  const top  = Math.min(y + 12, wrap.height - t.height - 8);
  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top  = top  + 'px';
}
function hideTooltip(){ if(!tooltipEl) tooltipEl = document.getElementById('tooltip'); tooltipEl.classList.add('hidden'); }
function buildTooltipHTML(p){
  if (LANG==='it'){
    return `
      <div><b>Prezzo:</b> ${euro(p.price)}</div>
      <div><b>Metri quadri:</b> ${p.mq} m²</div>
      <div><b>Camere:</b> ${p.camere} — <b>Bagni:</b> ${p.bagni}</div>
      <div><b>Piano:</b> ${p.piano} — <b>Metro:</b> ${p.dist} m</div>
      <div><b>Balcone:</b> ${p.balcone?'Sì':'No'} — <b>Ascensore:</b> ${p.ascensore?'Sì':'No'}</div>
      <div><b>Quartiere:</b> ${p.quartiere}</div>
    `;
  } else {
    return `
      <div><b>Price:</b> ${euro(p.price)}</div>
      <div><b>Size:</b> ${p.mq} m²</div>
      <div><b>Bedrooms:</b> ${p.camere} — <b>Bathrooms:</b> ${p.bagni}</div>
      <div><b>Floor:</b> ${p.piano} — <b>Subway:</b> ${p.dist} m</div>
      <div><b>Balcony:</b> ${p.balcone?'Yes':'No'} — <b>Elevator:</b> ${p.ascensore?'Yes':'No'}</div>
      <div><b>Neighborhood:</b> ${p.quartiere}</div>
    `;
  }
}
function installScatterHover(){
  const canvas = document.getElementById('scatter');

  canvas.addEventListener('mousemove', (ev)=>{
    const r = canvas.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;

    const R = 8;
    let hit = null, best = 1e9;
    for (const p of userPoints){
      const dx = x - p.cx, dy = y - p.cy;
      const d2 = dx*dx + dy*dy;
      if (d2 < R*R && d2 < best){ best = d2; hit = p; }
    }
    if (hit){ showTooltip(buildTooltipHTML(hit), x, y); }
    else { hideTooltip(); }
  });

  canvas.addEventListener('mouseleave', hideTooltip);
}

/* ---------- render & controls ---------- */
function render(){
  autoSizeCanvases();
  const {price, contributions} = predict(state);
  elPrice.textContent = euro(price);
  drawScatter();
  drawBars(contributions);
}

function bindControls(){
  elMq.addEventListener('input', ()=>{ state.mq=+elMq.value; lblMq.textContent=elMq.value; render(); });
  elCam.addEventListener('input', ()=>{ state.camere=+elCam.value; lblCam.textContent=elCam.value; render(); });
  elBag.addEventListener('input', ()=>{ state.bagni=+elBag.value; lblBag.textContent=elBag.value; render(); });
  elPiano.addEventListener('input', ()=>{ state.piano=+elPiano.value; lblPiano.textContent=elPiano.value; render(); });
  elDist.addEventListener('input', ()=>{ state.dist=+elDist.value; lblDist.textContent=elDist.value; render(); });
  elBal.addEventListener('change', ()=>{ state.balcone=elBal.checked; render(); });
  elElev.addEventListener('change', ()=>{ state.ascensore=elElev.checked; render(); });
  elQuart.addEventListener('change', ()=>{ state.quartiere=elQuart.value; render(); });

  document.getElementById('btnReset').addEventListener('click', ()=>{
    state={ mq:70, camere:3, bagni:2, piano:2, dist:600, balcone:true, ascensore:false, quartiere:'B' };
    elMq.value=70; lblMq.textContent='70'; elCam.value=3; lblCam.textContent='3';
    elBag.value=2; lblBag.textContent='2'; elPiano.value=2; lblPiano.textContent='2';
    elDist.value=600; lblDist.textContent='600'; elBal.checked=true; elElev.checked=false; elQuart.value='B';
    render();
  });

  document.getElementById('btnRandom').addEventListener('click', ()=>{
    state={ mq:randInt(35,140), camere:randInt(1,5), bagni:randInt(1,3), piano:randInt(0,8),
            dist:randInt(0,2000), balcone:Math.random()<0.5, ascensore:Math.random()<0.5, quartiere:['A','B','C'][randInt(0,2)] };
    elMq.value=state.mq; lblMq.textContent=String(state.mq);
    elCam.value=state.camere; lblCam.textContent=String(state.camere);
    elBag.value=state.bagni; lblBag.textContent=String(state.bagni);
    elPiano.value=state.piano; lblPiano.textContent=String(state.piano);
    elDist.value=state.dist; lblDist.textContent=String(state.dist);
    elBal.checked=state.balcone; elElev.checked=state.ascensore; elQuart.value=state.quartiere;
    render();
  });

  document.getElementById('btnAddPoint').addEventListener('click', ()=>{
    const {price} = predict(state);
    userPoints.push({
      mq: state.mq, price,
      camere: state.camere, bagni: state.bagni, piano: state.piano,
      dist: state.dist, balcone: state.balcone, ascensore: state.ascensore,
      quartiere: state.quartiere,
      cx: 0, cy: 0
    });
    render();
  });
  document.getElementById('btnClearPoints').addEventListener('click', ()=>{ userPoints.length=0; render(); });

  // toggle lingua
  document.getElementById('btnLang').addEventListener('click', ()=>{
    LANG = (LANG==='it') ? 'en' : 'it';
    document.getElementById('btnLang').textContent = t('langToggle');
    applyI18n();
  });
}

/* ---------- i18n ---------- */
function applyI18n(){
  document.getElementById('t_title').textContent = t('title');
  document.title = t('title');
  document.getElementById('t_explain_text').innerHTML = t('explain_text');
  document.getElementById('t_formula_toggle').textContent = t('formula_toggle');
  document.getElementById('t_controls').textContent = t('controls');
  document.getElementById('t_mq').textContent = t('mq');
  document.getElementById('t_camere').textContent = t('camere');
  document.getElementById('t_bagni').textContent = t('bagni');
  document.getElementById('t_piano').textContent = t('piano');
  document.getElementById('t_dist').textContent = t('dist');
  document.getElementById('t_balcone').textContent = t('balcone');
  document.getElementById('t_ascensore').textContent = t('ascensore');
  document.getElementById('t_quartiere').textContent = t('quartiere');
  document.getElementById('t_quart_explain').textContent = t('quart_explain');
  const sel = document.getElementById('quartiere');
  sel.options[0].textContent = t('qA'); sel.options[1].textContent = t('qB'); sel.options[2].textContent = t('qC');

  document.getElementById('t_scatterTitle').textContent = t('scatterTitle');
  document.getElementById('t_legend_you').textContent = t('legend_you');
  document.getElementById('t_legend_saved').textContent = t('legend_saved');
  document.getElementById('t_legend_line').textContent = t('legend_line');
  document.getElementById('t_priceTitle').textContent = t('priceTitle');
  document.getElementById('t_contribTitle').textContent = t('contribTitle');
  document.getElementById('btnReset').textContent = t('btnReset');
  document.getElementById('btnRandom').textContent = t('btnRandom');
  document.getElementById('btnAddPoint').textContent = t('btnAdd');
  document.getElementById('btnClearPoints').textContent = t('btnClear');
  document.getElementById('btnLang').textContent = t('langToggle');

  render();
}

/* ---------- init ---------- */
(function init(){
  scatter=document.getElementById('scatter'); sctx=scatter.getContext('2d');
  bars=document.getElementById('bars'); bctx=bars.getContext('2d');
  elPrice=document.getElementById('price'); tooltipEl=document.getElementById('tooltip');

  elMq=document.getElementById('mq'); elCam=document.getElementById('camere'); elBag=document.getElementById('bagni');
  elPiano=document.getElementById('piano'); elDist=document.getElementById('dist');
  elBal=document.getElementById('balcone'); elElev=document.getElementById('ascensore'); elQuart=document.getElementById('quartiere');
  lblMq=document.getElementById('mqVal'); lblCam=document.getElementById('camereVal'); lblBag=document.getElementById('bagniVal'); lblPiano=document.getElementById('pianoVal'); lblDist=document.getElementById('distVal');

  bindControls(); applyI18n(); installScatterHover();

  const ro = new ResizeObserver(()=>render());
  ro.observe(document.querySelector('.app-grid'));
  window.addEventListener('orientationchange', ()=>setTimeout(render, 200));
})();
