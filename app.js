/* Boston Transit to Scale
   Mode 1 (#compare): one Type 10 vs one item.  Mode 2 (#sandbox): any number of tracks on one scale. */
(() => {
"use strict";

const T10 = 113.7; // ft (113 ft 8.4 in)

/* ============================== CATALOG ============================== */
const C = { green:"#00843d", red:"#da291c", orange:"#ed8b00", blue:"#003da5", silver:"#7c878e", cr:"#80276c", bus:"#ffc72c", air:"#2f5d99" };
// unit = length of one car/unit in ft; cars = [min, default, max]; h = height drawn (ft); dh = row height if different
const CAT = [
  {g:"Green Line",id:"t10",name:"Type 10 Supercar",unit:113.7,cars:[1,1,2],h:12.2,kind:"lrv",o:{nose:"t10",joints:[19.5,39.6,46.8,66.9,74.1,94.2],trucks:[7.5,43.2,70.5,106.2],doors:[14,29.55,56.85,84.15,99.7],dw:4.6,panto:43.2,low:true},color:C.green,note:"CAF, 113 ft 8 in. One car carries about what a two-car Type 7/8 train does."},
  {g:"Green Line",id:"t9",name:"Type 9",unit:72,cars:[1,2,3],h:12,kind:"lrv",o:{nose:"round",joints:[31,41],trucks:[10,36,62],doors:[5,24,48,67],dw:4.2,panto:36},color:C.green,note:"CAF, 72 ft 0 in. Built for the Green Line Extension, in service since 2018. Usually runs as a two-car train."},
  {g:"Green Line",id:"t8",name:"Type 8",unit:74,cars:[1,2,3],h:11.8,kind:"lrv",o:{nose:"boxy",joints:[31.5,42.5],trucks:[10,37,64],doors:[5,25.5,48.5,69],dw:4.2,panto:37},color:C.green,note:"AnsaldoBreda low-floor car, 74 ft 0 in. Being replaced by the Type 10."},
  {g:"Green Line",id:"t7",name:"Type 7",unit:74,cars:[1,2,3],h:11.8,kind:"lrv",o:{nose:"boxy",joints:[37],trucks:[12,37,62],doors:[4.6,30.5,43.5,69.4],dw:4.2,fold:true,high:true,panto:18},color:C.green,note:"Kinki Sharyo high-floor car, 74 ft 0 in. Being replaced by the Type 10."},
  {g:"Mattapan",id:"pcc",name:"Mattapan PCC trolley",unit:46.5,cars:[1,1,2],h:10.2,kind:"lrv",o:{nose:"pcc",joints:[],trucks:[11,35.5],doors:[4.2,26.5],dw:3.2,fold:true,high:true,single:true,panto:23},color:C.red,approx:true,note:"1940s PCC streetcar, roughly 46 ft (PCCs run 46–50 ft)."},
  {g:"Red Line",id:"rl19",name:"Red Line 1900-series",unit:69.81,cars:[1,6,8],h:12,kind:"metro",o:{doors:4,unit:2},color:C.red,note:"CRRC car, 69 ft 9¾ in. Six-car trains are about 419 ft, close to 3.7 Supercars."},
  {g:"Red Line",id:"rl18",name:"Red Line 1800-series",unit:69.5,cars:[1,6,8],h:12,kind:"metro",o:{doors:4,unit:2},color:C.red,note:"Bombardier car, 69 ft 6 in."},
  {g:"Red Line",id:"rl17",name:"Red Line 1700-series",unit:69.5,cars:[1,6,8],h:12,kind:"metro",o:{doors:4,unit:2},color:C.red,note:"UTDC car, 69 ft 6 in."},
  {g:"Orange Line",id:"ol14",name:"Orange Line 1400-series",unit:65,cars:[1,6,8],h:12,kind:"metro",o:{doors:3,unit:2},color:C.orange,note:"CRRC car, 65 ft. Six-car trains, 390 ft."},
  {g:"Blue Line",id:"bl7",name:"Blue Line 700-series",unit:48,cars:[1,6,8],h:11.5,kind:"metro",o:{doors:3,unit:2},color:C.blue,note:"Siemens car, 48 ft. Six-car trains, 288 ft. The shortest T rapid-transit car."},
  {g:"Bus & Silver Line",id:"sl",name:"Silver Line articulated bus",unit:60,cars:[1,1,1],h:11,kind:"bus",o:{artic:true},color:C.silver,note:"60 ft articulated bus with three doors."},
  {g:"Bus & Silver Line",id:"bus40",name:"MBTA 40 ft bus",unit:40,cars:[1,1,1],h:10.5,kind:"bus",color:C.bus,approx:true,note:"Standard local bus, about 40 ft."},
  {g:"Commuter Rail",id:"cr",name:"Commuter Rail (HSP46 + bilevels)",unit:85.33,loco:71,cars:[1,6,9],h:15.5,kind:"cr",color:C.cr,note:"HSP46 locomotive 71 ft plus bilevel coaches at 85 ft 4 in each. The count is coaches."},
  {g:"Other cities",id:"r211",name:"NYC Subway R211",unit:60.21,cars:[1,10,11],h:12,kind:"metro",o:{doors:4,unit:5},color:"#2850ad",note:"New York B Division car, 60.2 ft. A full train is usually 10 cars."},
  {g:"Other cities",id:"cta",name:"Chicago 'L' 7000-series",unit:48,cars:[1,8,8],h:12,kind:"metro",o:{doors:2,unit:2},color:"#00a1de",note:"48 ft, the same as a Blue Line car. Up to 8 cars."},
  {g:"Other cities",id:"acela",name:"Amtrak NextGen Acela",unit:698.5,cars:[1,1,1],h:13.5,dh:17.8,kind:"acela",color:"#1c5d8c",note:"Alstom Avelia Liberty, 698.5 ft: two power cars and nine coaches. Calls at South Station and Back Bay."},
  {g:"On the road",id:"sedan",name:"Sedan",unit:15,cars:[1,1,1],h:4.7,kind:"car",color:"#2f5d99",approx:true,note:"Compact sedan, about 15 ft. Roughly 7½ fit along one Supercar."},
  {g:"On the road",id:"school",name:"School bus",unit:40,cars:[1,1,1],h:10.5,kind:"bus",color:"#f2b705",o:{school:true},approx:true,note:"Full-size school bus, about 40 ft."},
  {g:"On the road",id:"semi",name:"Tractor-trailer",unit:72,cars:[1,1,1],h:13.5,dh:15.5,kind:"truck",color:"#2f5d99",approx:true,note:"Sleeper cab with a 53 ft trailer, about 72 ft. Nearly a Type 9."},
  {g:"In the air",id:"a320",name:"Airbus A320",unit:123.25,cars:[1,1,1],h:38.6,kind:"plane",o:{fus:13,clear:5.2,nd:7.4,nlen:14,nw:1.0,mw:1.9},color:C.air,note:"123 ft 3 in. A Supercar is only about 10 ft shorter than the jet you'd fly out of Logan."},
  {g:"In the air",id:"b738",name:"Boeing 737-800",unit:129.5,cars:[1,1,1],h:41.2,kind:"plane",o:{fus:12.3,clear:3.9,nd:6.6,nlen:13,nw:0.9,mw:1.8},color:"#b03a2e",note:"129 ft 6 in."},
  {g:"In the air",id:"b748",name:"Boeing 747-8",unit:250.2,cars:[1,1,1],h:63.5,kind:"plane",o:{fus:21,clear:9.2,nd:9.4,nlen:18,nw:1.6,mw:2.1,eng:2,hump:true,bogie:true},color:"#1c3f6e",note:"250 ft 2 in, the longest passenger jet. About 2.2 Supercars."},
  {g:"Places & things",id:"bowl",name:"Bowling lane",unit:60,cars:[1,1,1],h:5.4,kind:"slab",o:{type:"lane",w:5.4,squash:1},color:"#c9a26a",note:"60 ft from foul line to head pin. Courts and fields are drawn as a top view."},
  {g:"Places & things",id:"tennis",name:"Tennis court",unit:78,cars:[1,1,1],h:10.8,kind:"slab",o:{type:"tennis",w:36,squash:.3},color:"#3d7a5c",note:"78 ft baseline to baseline. Drawn as a top view, squashed for perspective."},
  {g:"Places & things",id:"bball",name:"NBA court",unit:94,cars:[1,1,1],h:15,kind:"slab",o:{type:"court",w:50,squash:.3},color:"#c98b4a",note:"94 ft long. A Supercar overhangs it by almost 20 ft. Drawn as a top view."},
  {g:"Places & things",id:"whale",name:"Blue whale",unit:82,cars:[1,1,1],h:14,dh:16,kind:"whale",color:"#4a6f91",approx:true,note:"A large adult blue whale, about 80–90 ft."},
  {g:"Places & things",id:"liberty",name:"Statue of Liberty",unit:151,cars:[1,1,1],h:34,kind:"tower",o:{statue:true},color:"#6fae99",note:"Heel to torch, 151 ft, laid on its side. Pedestal not included."},
  {g:"Places & things",id:"bunker",name:"Bunker Hill Monument",unit:221,cars:[1,1,1],h:34,kind:"tower",color:"#a7aaa4",note:"221 ft granite obelisk in Charlestown, laid on its side."},
  {g:"Places & things",id:"monster",name:"Fenway's Green Monster",unit:231,cars:[1,1,1],h:37.2,dh:48,kind:"wall",color:"#2a5e3f",note:"About 231 ft long and 37 ft tall, with the hand-operated scoreboard, ladder, seats on top and the foul pole."},
  {g:"Places & things",id:"field",name:"Football field",unit:360,cars:[1,1,1],h:40,dh:40,kind:"slab",o:{type:"field",w:160,squash:.25},color:"#3f8a4a",note:"120 yards including end zones. About 3.2 Supercars. Drawn as a top view with goalposts."},
];
const BY = Object.fromEntries(CAT.map(c => [c.id, c]));
const PRESETS = [
  {name:"Every T line", rows:[["t10",1],["t9",2],["rl19",6],["ol14",6],["bl7",6],["pcc",1],["sl",1]]},
  {name:"Green Line generations", rows:[["t10",1],["t9",1],["t8",1],["t7",1],["pcc",1]]},
  {name:"Two-car trains", rows:[["t10",2],["t9",2],["t8",2],["t7",2]]},
  {name:"Supercar vs planes", rows:[["t10",1],["a320",1],["b738",1],["b748",1]]},
  {name:"Longest trains", rows:[["cr",9],["acela",1],["r211",10],["rl19",6],["ol14",6],["bl7",6],["t10",1]]},
  {name:"Around Boston", rows:[["t10",1],["monster",1],["bunker",1],["liberty",1],["school",1],["whale",1]]},
];

/* ============================== HELPERS ============================== */
let unit = "ft";
const lenOf = (id, n) => { const c = BY[id]; return (c.kind === "cr" ? c.loco : 0) + c.unit * n; };
const fmtFt = ft => { let w = Math.floor(ft), i = Math.round((ft - w) * 12); if (i === 12) { w++; i = 0; } return i ? `${w}′ ${i}″` : `${w}′`; };
const fmt = ft => unit === "m" ? `${(ft * 0.3048).toFixed(1)} m` : fmtFt(ft);
const fmtM = ft => `${(ft * 0.3048).toFixed(1)} m`;
const carWord = (c, n) => c.kind === "cr" ? `${n} coach${n > 1 ? "es" : ""}` : (c.cars[2] > 1 ? `${n} car${n > 1 ? "s" : ""}` : "");
const $ = id => document.getElementById(id);
const store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
let toastT;
function toast(msg){ const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 1600); }

/* ============================== DRAWING ==============================
   Every shape is drawn in real feet inside a group scaled to px/ft: x runs from the
   object's left end, y is negative upward from the ground line. Strokes don't scale. */
const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function P(tag, a, parent){ if (a.stroke) a["vector-effect"] = "non-scaling-stroke"; return el(tag, a, parent); }
const soft = (c, p = 26) => `color-mix(in srgb, ${c} ${p}%, var(--paper))`;
const shade = (c, p = 30) => `color-mix(in srgb, ${c} ${100 - p}%, #000)`;
const INK = "var(--ink)";
const G = (parent, x, gy, s) => el("g", {transform:`translate(${x} ${gy}) scale(${s})`}, parent);
const pts = a => a.map(p => p.join(",")).join(" ");
const rect = (g, x, y, w, h, a = {}) => P("rect", {x, y, width:Math.max(0, w), height:Math.max(0, h), ...a}, g);
const line = (g, x1, y1, x2, y2, a = {}) => P("line", {x1, y1, x2, y2, ...a}, g);
const circ = (g, cx, cy, r, a = {}) => P("circle", {cx, cy, r, ...a}, g);
const ell = (g, cx, cy, rx, ry, a = {}) => P("ellipse", {cx, cy, rx, ry, ...a}, g);
const path = (g, d, a = {}) => P("path", {d, ...a}, g);
const poly = (g, p, a = {}) => P("polygon", {points:pts(p), ...a}, g);
const pline = (g, p, a = {}) => P("polyline", {points:pts(p), fill:"none", ...a}, g);
const OUT = {stroke:INK, "stroke-width":1};
const THIN = {stroke:INK, "stroke-width":.5};

function freeSpans(a, b, obs){
  obs = obs.map(([x, y]) => [Math.max(a, x), Math.min(b, y)]).filter(([x, y]) => y > x).sort((p, q) => p[0] - q[0]);
  const out = []; let cur = a;
  for (const [x, y] of obs){ if (x > cur) out.push([cur, x]); cur = Math.max(cur, y); }
  if (b > cur) out.push([cur, b]);
  return out;
}
function windows(g, spans, yTop, yBot, o = {}){
  const pw = o.w ?? 4.5, gap = o.gap ?? .55, fill = o.fill ?? "var(--glass)";
  for (const [a, b] of spans){
    const len = b - a; if (len < (o.min ?? 1.4)) continue;
    const n = Math.max(1, Math.round((len - gap) / (pw + gap))), w = (len - gap * (n + 1)) / n;
    if (w < .5) continue;
    for (let i = 0; i < n; i++){
      const wx = a + gap + i * (w + gap);
      rect(g, wx, yTop, w, yBot - yTop, {rx:o.rx ?? .4, fill, ...THIN});
      if (o.split && w > 2.4) line(g, wx, yTop + (yBot - yTop) * .38, wx + w, yTop + (yBot - yTop) * .38, {stroke:INK, "stroke-width":.35, opacity:.6});
    }
  }
}
// leaves: 1 single, 2 bi-parting, 4 = folding (two leaves each folding in half)
function door(g, cx, w, yTop, yBot, o = {}){
  const fill = o.fill ?? "var(--body)", leaves = o.leaves ?? 2, H = yBot - yTop;
  rect(g, cx - w / 2, yTop, w, H, {fill, stroke:INK, "stroke-width":.8});
  const lw = w / leaves;
  for (let i = 0; i < leaves; i++){
    const lx = cx - w / 2 + i * lw;
    if (i > 0) line(g, lx, yTop, lx, yBot, {stroke:INK, "stroke-width":i === leaves / 2 ? .7 : .4});
    rect(g, lx + lw * .2, yTop + H * .07, lw * .6, H * (o.winH ?? .5), {rx:.2, fill:"var(--glass)", ...THIN});
  }
  if (o.step) rect(g, cx - w / 2, yBot - .25, w, .25, {fill:"var(--dark)"});
}
function wheel(g, cx, r, cy){ cy = cy ?? -r; circ(g, cx, cy, r, {fill:"var(--dark)"}); circ(g, cx, cy, r * .55, {fill:"var(--metal)", stroke:"var(--dark)", "stroke-width":.5}); circ(g, cx, cy, r * .14, {fill:"var(--dark)"}); }
function bogie(g, cx, wb = 6.4, r = 1.15, axles = 2){
  rect(g, cx - wb / 2 - 1.2, -r * 2 - .15, wb + 2.4, r * 1.15, {rx:.45, fill:"var(--dark)"});
  for (let i = 0; i < axles; i++) wheel(g, cx - wb / 2 + (axles === 1 ? wb / 2 : i * wb / (axles - 1)), r);
  rect(g, cx - .9, -r * 2 - .4, 1.8, .6, {fill:"var(--metal)", ...THIN});
}
function pantograph(g, px, roof){
  rect(g, px - 1.8, roof - .45, 3.6, .45, {fill:"var(--dark)"});
  circ(g, px - 1.3, roof - .55, .25, {fill:"var(--metal)", ...THIN});
  circ(g, px + 1.3, roof - .55, .25, {fill:"var(--metal)", ...THIN});
  pline(g, [[px - 1.3, roof - .45], [px + 1.1, roof - 2.4], [px - .7, roof - 4.3]], {stroke:INK, "stroke-width":1.1});
  pline(g, [[px - 1.0, roof - .45], [px + .8, roof - 2.3]], {stroke:INK, "stroke-width":.6});
  line(g, px - 2.4, roof - 4.3, px + 1.0, roof - 4.3, {stroke:INK, "stroke-width":1.6});
}
function headlight(g, x, y, rear){ circ(g, x, y, .3, {fill:rear ? "#e0453a" : "#ffe7a0", stroke:INK, "stroke-width":.4}); }
function signbox(g, x, y, w){ rect(g, x, y, w, .6, {rx:.1, fill:"#141414"}); rect(g, x + w * .12, y + .22, w * .76, .16, {fill:"#f5a623"}); }

/* ---------- Green Line LRVs + PCC ---------- */
function lrv(g, x, gy, s, c, n){
  const o = c.o, H = c.h, gap = 1.4, fine = s > .9;
  const t10 = o.nose === "t10", pcc = o.nose === "pcc";
  for (let k = 0; k < n; k++){
    const L = c.unit - (k < n - 1 ? gap : 0), q = G(g, x + k * c.unit * s, gy, s);
    const bot = o.high ? -2.9 : -1.45, roof = -(H - .8), wT = -9.6, wB = pcc ? -5.0 : -5.6;
    const doorTop = -10.0, doorBot = o.high ? -1.0 : bot - .05;

    for (const t of o.trucks) bogie(q, t, pcc ? 6.2 : 6.0, o.high ? 1.2 : 1.0);
    if (o.high){ // steps visible under high-floor doors
      for (const d of o.doors) rect(q, d - o.dw / 2, bot, o.dw, 1.6, {fill:"var(--dark)", opacity:.8});
    }

    // body outline
    let d;
    if (t10) d = `M0 ${bot} L0 -3.8 C0 -6.6 .25 -9.3 1.6 ${roof+.7} Q2.1 ${roof} 3.2 ${roof} L${L-3.2} ${roof} Q${L-2.1} ${roof} ${L-1.6} ${roof+.7} C${L-.25} -9.3 ${L} -6.6 ${L} -3.8 L${L} ${bot} Z`;
    else if (o.nose === "round") d = `M0 ${bot} L0 -4.3 C0 -7.6 .7 ${roof+.5} 2.6 ${roof} L${L-2.6} ${roof} C${L-.7} ${roof+.5} ${L} -7.6 ${L} -4.3 L${L} ${bot} Z`;
    else if (pcc) d = `M0 ${bot} L0 -4.2 C0 -7.8 1.6 ${roof} 6 ${roof} L${L-5.5} ${roof} C${L-1.4} ${roof} ${L} -7.6 ${L} -4.2 L${L} ${bot} Z`;
    else d = `M0 ${bot} L0 ${roof+1.4} Q.1 ${roof} 1.4 ${roof} L${L-1.4} ${roof} Q${L-.1} ${roof} ${L} ${roof+1.4} L${L} ${bot} Z`;
    const body = t10 ? "#3c4541" : pcc ? "#efe3c4" : "var(--body)";
    path(q, d, {fill:body, stroke:INK, "stroke-width":1.1});

    // livery
    const clipId = `clp${Math.random().toString(36).slice(2, 8)}`;
    const cp = el("clipPath", {id:clipId}, q); el("path", {d}, cp);
    const lv = el("g", {"clip-path":`url(#${clipId})`}, q);
    if (t10){
      rect(lv, 0, -4.9, L, 3.6, {fill:c.color});                       // green lower body
      rect(lv, 0, -2.0, L, .35, {fill:"#ffffff"});                     // white stripe
      rect(lv, 0, -1.65, L, .3, {fill:"#2fbf9b"});                     // turquoise stripe
      rect(lv, 0, roof, L, 1.2, {fill:"#2b322f"});                      // dark roof band
    } else if (pcc){
      rect(lv, 0, -4.4, L, 4, {fill:c.color});                         // red-orange lower
      rect(lv, 0, roof, L, 1.0, {fill:shade(c.color, 15)});
    } else {
      rect(lv, 0, -3.9, L, 1.5, {fill:c.color});                       // green belt
      rect(lv, 0, roof + .3, L, .45, {fill:c.color});                  // green roof line
      if (o.nose === "round") rect(lv, 0, -4.35, L, .25, {fill:c.color, opacity:.6});
    }

    // articulations (bellows)
    for (const j of o.joints){
      rect(q, j - .55, roof + .15, 1.1, bot - roof - .15, {fill:"var(--dark)"});
      if (fine) for (const t of [-.3, 0, .3]) line(q, j + t, roof + .4, j + t, bot - .2, {stroke:"var(--metal)", "stroke-width":.5, opacity:.8});
    }

    // windows
    const cab = pcc ? 5.4 : t10 ? 3.6 : 3.0;
    const obs = [[0, cab], [L - (o.single ? 2.4 : cab), L], ...o.doors.map(p => [p - o.dw / 2 - .45, p + o.dw / 2 + .45]), ...o.joints.map(p => [p - 1.0, p + 1.0])];
    windows(q, freeSpans(0, L, obs), wT, wB, {w:pcc ? 2.5 : 4.4, gap:pcc ? .7 : .5, split:!pcc && fine});
    if (pcc && fine) windows(q, freeSpans(0, L, obs), wT - .9, wT - .3, {w:2.5, gap:.7, fill:"var(--wind)"}); // PCC standee windows

    // doors
    for (const p of o.doors) door(q, p, o.dw, doorTop, doorBot, {fill:t10 ? c.color : pcc ? "#efe3c4" : "var(--body)", leaves:o.fold ? 4 : 2, winH:t10 ? .62 : .48});

    // cab ends
    const cabEnd = flip => {
      const X = v => flip ? L - v : v;
      if (t10){
        path(q, `M${X(.12)} -5.4 L${X(.3)} -9.0 Q${X(.9)} ${roof+.8} ${X(2.6)} ${roof+.9} L${X(3.2)} ${roof+.9} L${X(3.2)} -5.4 Z`, {fill:"var(--wind)", stroke:INK, "stroke-width":.6});
        signbox(q, Math.min(X(.6), X(3.0)), roof + 1.15, 2.4);
        headlight(q, X(.5), -3.2, flip); headlight(q, X(.5), -2.5, flip);
      } else if (pcc){
        if (!flip){
          path(q, `M${X(.3)} -5.2 C${X(.5)} -7.9 ${X(1.6)} ${roof+.9} ${X(4.2)} ${roof+1.0} L${X(4.5)} -5.2 Z`, {fill:"var(--wind)", stroke:INK, "stroke-width":.6});
          headlight(q, X(.2), -4.8, false);
          signbox(q, X(2.2), roof + .25, 2.4);
        } else {
          path(q, `M${X(.35)} -5.6 C${X(.5)} -7.8 ${X(1.2)} ${roof+1.1} ${X(2.6)} ${roof+1.2} L${X(2.8)} -5.6 Z`, {fill:"var(--wind)", stroke:INK, "stroke-width":.6});
          headlight(q, X(.3), -4.6, true);
        }
      } else {
        path(q, `M${X(.12)} -5.3 L${X(o.nose === "round" ? .35 : .15)} -9.3 Q${X(o.nose === "round" ? 1.0 : .25)} ${roof+.6} ${X(2.2)} ${roof+.7} L${X(2.7)} ${roof+.7} L${X(2.7)} -5.3 Z`, {fill:"var(--wind)", stroke:INK, "stroke-width":.6});
        signbox(q, Math.min(X(.5), X(2.6)), roof + .9, 2.1);
        headlight(q, X(.45), -3.0, flip);
      }
      rect(q, flip ? L : -.7, o.high ? -3.4 : -2.4, .7, .5, {fill:"var(--dark)"}); // coupler
    };
    cabEnd(false); cabEnd(true);

    // roof equipment
    if (!pcc){
      const edges = [0, ...o.joints, L];
      for (let i = 0; i < edges.length - 1; i++){
        const a = edges[i], b = edges[i + 1], w = Math.min(7, (b - a) * .5);
        if (b - a < 9) continue;
        rect(q, (a + b) / 2 - w / 2, roof - .75, w, .8, {rx:.3, fill:"var(--metal)", stroke:INK, "stroke-width":.6});
      }
    } else {
      rect(q, 8, roof - .4, L - 16, .45, {rx:.2, fill:shade(c.color, 15)});
    }
    pantograph(q, o.panto ?? L / 2, roof - (pcc ? .35 : .75));
  }
}

/* ---------- Heavy rail (Red, Orange, Blue, NYC, Chicago) ---------- */
function metroCar(q, L, c, fine, cabL, cabR, trainFront, trainRear){
  const o = c.o || {}, H = c.h, bot = -3.4, roof = -(H - .35);
  for (const f of [.13, .87]) bogie(q, L * f, 6.8, 1.15);
  rect(q, 0, roof, L, bot - roof, {rx:.7, fill:"var(--metal)", stroke:INK, "stroke-width":1.1});
  if (fine) for (let yy = bot - .45; yy > -5.6; yy -= .42) line(q, .3, yy, L - .3, yy, {stroke:INK, "stroke-width":.35, opacity:.18}); // fluting
  rect(q, .05, -6.2, L - .1, .8, {fill:c.color});
  rect(q, .05, roof + .75, L - .1, .3, {fill:c.color});
  const nd = o.doors ?? 3, dw = 4.2;
  const dp = Array.from({length:nd}, (_, i) => L * (i + .5) / nd);
  windows(q, freeSpans(0, L, [[0, cabL ? 3.4 : 1.4], [L - (cabR ? 3.4 : 1.4), L], ...dp.map(p => [p - dw / 2 - .45, p + dw / 2 + .45])]), -9.9, -6.7, {w:4.4, split:fine});
  for (const p of dp) door(q, p, dw, -10.2, bot - .1, {fill:"var(--metal)", winH:.45});
  const cab = flip => {
    const X = v => flip ? L - v : v;
    rect(q, Math.min(X(.6), X(2.8)), -9.9, 2.2, 3.4, {rx:.4, fill:"var(--wind)", ...THIN});        // cab side window
    rect(q, flip ? L - .35 : 0, roof + .3, .35, bot - roof - .6, {fill:"var(--dark)", opacity:.55}); // end face
    const front = flip ? trainRear : trainFront;
    if (front){ headlight(q, X(.35), -4.6, flip); signbox(q, Math.min(X(.6), X(3.0)), roof + 1.2, 2.4); }
  };
  if (cabL) cab(false);
  if (cabR) cab(true);
  for (const f of [.27, .73]) rect(q, L * f - 4, roof - .65, 8, .7, {rx:.3, fill:"var(--metal)", stroke:INK, "stroke-width":.6});
}
function metro(g, x, gy, s, c, n){
  const gap = 1.2, fine = s > .9, u = (c.o && c.o.unit) || 2;
  for (let k = 0; k < n; k++){
    const q = G(g, x + k * c.unit * s, gy, s), L = c.unit - (k < n - 1 ? gap : 0);
    const posInUnit = k % u, unitEnd = posInUnit === u - 1 || k === n - 1;
    metroCar(q, L, c, fine, posInUnit === 0, unitEnd, k === 0, k === n - 1);
    if (k < n - 1){
      rect(q, L, -3.0, gap, .55, {fill:"var(--dark)"});
      rect(q, L, -10.2, gap, 6, {fill:"var(--dark)", opacity:.55});
    }
  }
}

/* ---------- Commuter Rail ---------- */
function cr(g, x, gy, s, c, n){
  const fine = s > .9, q = G(g, x, gy, s), L = c.loco, roof = -14.9, bot = -4.3;
  for (const cx of [11.5, L - 11.5]){
    rect(q, cx - 6.4, -3.6, 12.8, 1.7, {rx:.4, fill:"var(--dark)"});
    for (const dx of [-4.3, 0, 4.3]) wheel(q, cx + dx, 1.65);
  }
  rect(q, 21, -4.6, 29, 2.7, {rx:1, fill:"var(--dark)"});            // fuel tank
  rect(q, 21.5, -4.3, 28, .4, {fill:"var(--metal)", opacity:.5});
  const d = `M0 ${bot} L0 -8.8 L1.3 -9.8 L2.3 -13.4 Q3 ${roof} 5.2 ${roof} L${L-1} ${roof} Q${L} ${roof} ${L} ${roof+1} L${L} ${bot} Z`;
  path(q, d, {fill:"var(--metal)", stroke:INK, "stroke-width":1.1});
  const cp = el("clipPath", {id:"crclip" + Math.random().toString(36).slice(2, 7)}, q); el("path", {d}, cp);
  const lv = el("g", {"clip-path":`url(#${cp.id})`}, q);
  rect(lv, 0, -8.6, L, 4.3, {fill:c.color});
  rect(lv, 0, -9.2, L, .55, {fill:"#f2c014"});
  rect(lv, 0, -4.6, L, .3, {fill:"#f2c014"});
  path(q, `M1.5 -10.1 L2.5 -13.3 Q3 -14.2 4.6 -14.2 L7 -14.2 L7 -10.1 Z`, {fill:"var(--wind)", stroke:INK, "stroke-width":.6});
  door(q, 9.3, 2.4, -14.1, -9.4, {leaves:1, fill:"var(--metal)", winH:.4});
  rect(q, 11.2, -13.4, 1.8, 2.4, {rx:.2, fill:"var(--wind)", ...THIN});
  if (fine) for (const gx0 of [19, 31, 43, 55]){
    rect(q, gx0, -14.3, 9, 4.6, {fill:"var(--dark)", opacity:.75});
    for (let t = gx0 + .55; t < gx0 + 9; t += .75) line(q, t, -14.3, t, -9.7, {stroke:"var(--metal)", "stroke-width":.5});
  }
  for (const fx of [47, 54, 61]) path(q, `M${fx-2.8} ${roof} Q${fx} ${roof-1.3} ${fx+2.8} ${roof} Z`, {fill:"var(--dark)"});
  rect(q, 14, roof - .9, 3, .9, {fill:"var(--dark)"});                 // exhaust
  headlight(q, .35, -6.4, false); headlight(q, 1.6, -13.8, false);
  rect(q, -.6, -3.3, .6, .5, {fill:"var(--dark)"});
  for (let k = 0; k < n; k++){
    const cq = G(g, x + (L + k * c.unit) * s, gy, s), CL = c.unit - (k < n - 1 ? 1.2 : 0);
    bilevel(cq, CL, c, fine, k === n - 1);
    if (k < n - 1) rect(cq, CL, -12, 1.2, 8, {fill:"var(--dark)", opacity:.55});
  }
}
function bilevel(q, L, c, fine, isLast){
  const roof = -15.3, bot = -2.7, endB = -4.3;
  for (const f of [.085, .915]) bogie(q, L * f, 8.4, 1.2);
  path(q, `M0 ${endB} L0 ${roof+.8} Q0 ${roof} 1 ${roof} L${L-1} ${roof} Q${L} ${roof} ${L} ${roof+.8} L${L} ${endB} L${L-13} ${endB} L${L-14} ${bot} L14 ${bot} L13 ${endB} Z`, {fill:"var(--metal)", stroke:INK, "stroke-width":1.1});
  if (fine) for (let yy = bot - .5; yy > -4.4; yy -= .45) line(q, 14.3, yy, L - 14.3, yy, {stroke:INK, "stroke-width":.35, opacity:.18});
  rect(q, .1, -5.0, L - .2, .8, {fill:c.color});
  rect(q, .1, -10.1, L - .2, .55, {fill:c.color});
  rect(q, .1, roof + .5, L - .2, .3, {fill:c.color});
  const doors = [L * .2, L * .8];
  windows(q, freeSpans(14, L - 14, []), -14.3, -11.2, {w:5.3});
  windows(q, freeSpans(14, L - 14, doors.map(p => [p - 2.9, p + 2.9])), -9.1, -5.9, {w:5.3});
  windows(q, [[1.4, 12.4], [L - 12.4, L - 1.4]], -12.9, -10.7, {w:4.4});
  for (const p of doors) door(q, p, 4.4, -9.3, bot - .1, {fill:"var(--metal)", winH:.55});
  if (isLast){ headlight(q, L - .35, -6.5, true); rect(q, L - 3.4, -12.8, 2.6, 2, {rx:.3, fill:"var(--wind)", ...THIN}); }
}

/* ---------- Acela ---------- */
function acela(g, x, gy, s, c){
  const q = G(g, x, gy, s), T = c.unit, pc = 70, ch = (T - 2 * pc) / 9, roof = -13.4, bot = -3.3, fine = s > .9;
  const power = (ox, flip) => {
    const X = v => flip ? ox + pc - v : ox + v, lo = v => Math.min(X(v), X(pc));
    for (const f of [.22, .8]) bogie(q, X(pc * f), 9.5, 1.4);
    path(q, `M${X(0)} ${bot} L${X(0)} -4.6 C${X(1.5)} -9.6 ${X(8)} ${roof} ${X(21)} ${roof} L${X(pc)} ${roof} L${X(pc)} ${bot} Z`, {fill:"var(--metal)", stroke:INK, "stroke-width":1.1});
    path(q, `M${X(4.2)} -9.1 C${X(6.8)} -11.5 ${X(9.6)} -12.5 ${X(13)} -12.7 L${X(13.4)} -9.9 L${X(5.4)} -8.8 Z`, {fill:"var(--wind)", stroke:INK, "stroke-width":.6});
    rect(q, lo(3.5), -5.2, pc - 3.5, .9, {fill:c.color});
    rect(q, lo(16), -6.8, pc - 16, .35, {fill:"#c9a24b"});
    door(q, X(17), 2.4, -12.4, -6.9, {leaves:1, fill:"var(--metal)", winH:.4});
    if (fine) for (const gx0 of [26, 40, 54]) rect(q, lo(gx0 + 10), -12, 10, 4, {fill:"var(--dark)", opacity:.55});
    pantograph(q, X(pc * .66), roof);
    headlight(q, X(1), -5.6, flip);
  };
  power(0, false); power(T - pc, true);
  for (let k = 0; k < 9; k++){
    const cx = pc + k * ch + .6, L = ch - 1.2;
    for (const f of [.12, .88]) bogie(q, cx + L * f, 8.5, 1.2);
    rect(q, cx, roof, L, bot - roof, {rx:1, fill:"var(--metal)", stroke:INK, "stroke-width":1.1});
    rect(q, cx, -5.2, L, .9, {fill:c.color});
    rect(q, cx, -6.8, L, .35, {fill:"#c9a24b"});
    windows(q, [[cx + 5, cx + L - 5]], -11.2, -7.6, {w:4.8});
    door(q, cx + 2.6, 3, -11.8, bot - .1, {leaves:1, fill:"var(--metal)"});
    door(q, cx + L - 2.6, 3, -11.8, bot - .1, {leaves:1, fill:"var(--metal)"});
    rect(q, cx + L, -12, 1.2, 8, {fill:"var(--dark)", opacity:.55});
  }
}

/* ---------- Buses ---------- */
function bus(g, x, gy, s, c){
  const q = G(g, x, gy, s), L = c.unit, o = c.o || {}, fine = s > .9;
  if (o.school) return schoolBus(q, L, c, fine);
  const roof = -(c.h - .2), bot = -1.25, r = 1.65;
  const segs = o.artic ? [[0, 35.2], [36.4, L]] : [[0, L]];
  const wheels = o.artic ? [6.8, 29.6, 53.6] : [6.8, 31];
  const doors = o.artic ? [3.7, 20.8, 45.5] : [3.9, 24.8];
  const body = o.artic ? "var(--body)" : c.color;
  segs.forEach(([a, b], i) => {
    const first = i === 0, last = i === segs.length - 1;
    const d = `M${a} ${bot} L${a} ${first ? -3.6 : roof} ${first ? `L${a} ${roof+1.2} Q${a} ${roof} ${a+1.1} ${roof}` : ""} L${last ? b - .7 : b} ${roof} ${last ? `Q${b} ${roof} ${b} ${roof+.7}` : ""} L${b} ${bot} Z`;
    path(q, d, {fill:body, stroke:INK, "stroke-width":1.1});
    rect(q, a + .05, -4.4, b - a - .1, 1.0, {fill:o.artic ? c.color : shade(c.color, 12)});
    if (o.artic) rect(q, a + .05, roof + .4, b - a - .1, .35, {fill:c.color});
    rect(q, first ? a + 2 : a + .5, roof - .7, Math.min(9, b - a - 4), .7, {rx:.3, fill:"var(--metal)", stroke:INK, "stroke-width":.5}); // roof pods
  });
  if (o.artic){
    rect(q, 35.2, roof + .5, 1.2, bot - roof - .5, {fill:"var(--dark)"});
    if (fine) for (const t of [35.5, 35.8, 36.1]) line(q, t, roof + .7, t, bot - .2, {stroke:"var(--metal)", "stroke-width":.5});
  }
  for (const w of wheels) path(q, `M${w-2.35} ${bot} A2.35 2.35 0 0 1 ${w+2.35} ${bot} Z`, {fill:"var(--dark)"});
  for (const w of wheels) wheel(q, w, r);
  const obs = [[0, 1.6], [L - 1.4, L], ...doors.map(p => [p - 2.2, p + 2.2]), ...(o.artic ? [[34.6, 37]] : []), ...wheels.map(w => [w - .1, w + .1]).slice(0, 0)];
  windows(q, freeSpans(0, L, obs), roof + 1.3, -5.0, {w:5.6, gap:.4, split:fine});
  for (const p of doors) door(q, p, 3.5, roof + 1.0, bot - .05, {fill:body, winH:.72});
  rect(q, 0, roof + 1.2, .5, -4.6 - roof - 1.2, {fill:"var(--wind)"});        // windshield edge
  signbox(q, .4, roof + .3, 3.6);
  line(q, -.9, -8.6, .05, -8.9, {stroke:INK, "stroke-width":1.4});             // mirror
  rect(q, -1.1, -9.2, .35, 1.1, {fill:"var(--dark)"});
  headlight(q, .3, -2.6, false); headlight(q, L - .25, -2.6, true);
  rect(q, -.25, -2.0, .5, .7, {fill:"var(--dark)"});
}
function schoolBus(q, L, c, fine){
  const roof = -10.4, bot = -1.5, Y = c.color;
  path(q, `M0 ${bot} L0 -5.6 Q.2 -6.5 1.1 -6.6 L4.7 -6.7 L6.3 ${roof+.7} Q6.5 ${roof} 7.2 ${roof} L${L-.5} ${roof} Q${L} ${roof} ${L} ${roof+.6} L${L} ${bot} Z`, {fill:Y, stroke:INK, "stroke-width":1.1});
  rect(q, -.1, -5.5, .45, 3.4, {fill:"var(--dark)"});                           // grille
  line(q, 1, -6.55, 4.6, -6.6, {stroke:INK, "stroke-width":.5});
  path(q, `M4.8 -6.6 L6.3 ${roof+.75} L7.1 ${roof+.75} L7.1 -6.6 Z`, {fill:"var(--wind)", ...THIN});
  for (const yy of [-2.3, -3.6, -5.0]) line(q, 6.5, yy, L - .1, yy, {stroke:"#1b1b1b", "stroke-width":1.4});
  line(q, 7.2, -9.6, L - .2, -9.6, {stroke:"#1b1b1b", "stroke-width":.8});
  windows(q, freeSpans(10, L - .6, [[L - 3.7, L]]), -9.2, -6.3, {w:2.5, gap:.42, split:true});
  door(q, 8.5, 2.5, -9.4, bot - .1, {fill:Y, leaves:2, winH:.8});
  rect(q, L - 3.4, -9.4, 2.6, 7.6, {fill:"none", stroke:INK, "stroke-width":.7});  // rear emergency door
  const ox = 10.7, oy = -7.4, r = .85, oct = Array.from({length:8}, (_, i) => [ox + r * Math.cos(Math.PI / 8 + i * Math.PI / 4), oy + r * Math.sin(Math.PI / 8 + i * Math.PI / 4)]);
  poly(q, oct, {fill:"#c8102e", stroke:"#fff", "stroke-width":.6});              // stop arm
  for (const [lx, col] of [[7.6, "#f5a623"], [8.4, "#e0453a"], [L - 1.2, "#f5a623"], [L - 2, "#e0453a"]]) circ(q, lx, roof + .25, .22, {fill:col, ...THIN});
  for (const w of [4.6, 30.2]){ path(q, `M${w-2.3} ${bot} A2.3 2.3 0 0 1 ${w+2.3} ${bot} Z`, {fill:"var(--dark)"}); wheel(q, w, 1.6); }
  headlight(q, .3, -4.6, false); headlight(q, L - .25, -3, true);
  rect(q, -.3, -2.3, .6, .8, {fill:"#1b1b1b"});
}

/* ---------- Truck & car ---------- */
function truck(g, x, gy, s, c){
  const q = G(g, x, gy, s), L = c.unit, fine = s > .9, tx = 18.5, top = -13.5, tb = -4.3;
  rect(q, tx, top, L - tx, tb - top, {fill:"var(--paper)", stroke:INK, "stroke-width":1.1});
  if (fine) for (let r = tx + 4; r < L - .5; r += 4) line(q, r, top + .2, r, tb - .1, {stroke:INK, "stroke-width":.4, opacity:.3});
  rect(q, tx, tb - .5, L - tx, .5, {fill:"var(--dark)"});
  rect(q, tx + 18, tb, 22, 1.4, {fill:"var(--metal)", ...THIN});                // side skirt
  line(q, tx + 9, tb, tx + 9, -.4, {stroke:INK, "stroke-width":1.4});             // landing gear
  rect(q, tx + 8.3, -.4, 1.4, .4, {fill:"var(--dark)"});
  for (const w of [L - 8.6, L - 4.6]) wheel(q, w, 1.7);
  rect(q, L - 1.2, -3.9, .25, 3, {fill:"var(--dark)"});
  const d = `M0 -1.9 L0 -6.9 Q.2 -7.7 1.4 -7.9 L7 -8.3 L8.5 -11.4 L12 -11.6 L12.6 -12.9 Q15.6 -13.6 18.6 -13.2 L19 -1.9 Z`;
  path(q, d, {fill:c.color, stroke:INK, "stroke-width":1.1});
  rect(q, -.1, -6.9, .55, 4.4, {fill:"var(--metal)", ...THIN});                  // grille
  path(q, `M7.2 -8.3 L8.65 -11.1 L10 -11.1 L10 -8.3 Z`, {fill:"var(--wind)", ...THIN});
  rect(q, 10.3, -10.9, 1.5, 2.3, {rx:.2, fill:"var(--wind)", ...THIN});
  rect(q, 9.9, -11.1, 3.4, 7.8, {fill:"none", stroke:INK, "stroke-width":.6});
  rect(q, 14.4, -11.5, 1.6, 1.2, {rx:.2, fill:"var(--wind)", ...THIN});
  rect(q, 13.6, -16.2, .45, 5, {fill:"var(--metal)", ...THIN});                  // exhaust stack
  rect(q, 9.3, -4.8, 5.2, 2.2, {rx:1.1, fill:"var(--metal)", ...THIN});           // fuel tank
  rect(q, -.4, -2.6, .8, 1.3, {fill:"var(--metal)", ...THIN});
  headlight(q, .4, -4.3, false);
  for (const w of [3.7, 14.9, 18.9]) wheel(q, w, 1.7);
}
function car(g, x, gy, s, c){
  const q = G(g, x, gy, s);
  for (const w of [2.9, 12.1]) path(q, `M${w-1.4} -.9 A1.4 1.4 0 0 1 ${w+1.4} -.9 Z`, {fill:"var(--dark)"});
  path(q, `M.15 -1.0 L0 -2.5 Q.1 -2.95 .6 -3.05 L4.2 -3.3 Q5 -3.4 5.7 -4.1 L6.9 -4.6 Q7.4 -4.75 9.4 -4.7 Q10.6 -4.6 11.6 -3.6 L14.3 -3.35 Q15 -3.2 15 -2.5 L14.85 -1.0 L13.5 -1.0 A1.45 1.45 0 0 0 10.7 -1.0 L4.3 -1.0 A1.45 1.45 0 0 0 1.5 -1.0 Z`, {fill:c.color, stroke:INK, "stroke-width":1.1});
  path(q, `M5.95 -3.95 L7.05 -4.42 Q7.5 -4.55 8.45 -4.55 L8.45 -3.5 L5.75 -3.5 Z`, {fill:"var(--glass)", ...THIN});
  path(q, `M8.75 -4.55 Q10.2 -4.52 11.05 -3.55 L8.75 -3.5 Z`, {fill:"var(--glass)", ...THIN});
  line(q, 8.6, -4.6, 8.6, -1.2, {stroke:INK, "stroke-width":.5});
  line(q, 5.8, -3.4, 5.6, -1.3, {stroke:INK, "stroke-width":.5});
  line(q, 11.2, -3.4, 11.2, -1.3, {stroke:INK, "stroke-width":.5});
  rect(q, 7.3, -3.0, .6, .15, {fill:"var(--dark)"}); rect(q, 10.0, -3.0, .6, .15, {fill:"var(--dark)"});
  path(q, `M.1 -2.6 L.9 -2.75 L.9 -2.35 L.05 -2.25 Z`, {fill:"#ffe7a0", ...THIN});
  rect(q, 14.55, -3.0, .45, .45, {fill:"#e0453a"});
  for (const w of [2.9, 12.1]) wheel(q, w, 1.05);
}

/* ---------- Planes ---------- */
function plane(g, x, gy, s, c){
  const q = G(g, x, gy, s), L = c.unit, o = c.o, fd = o.fus, H = c.h, fine = s > 1.3;
  const yb = -o.clear, yt = yb - fd, yc = (yt + yb) / 2, nl = fd * 1.15, tail = c.color;
  // far-side main gear peeks behind
  // vertical tail
  poly(q, [[.795 * L, yt + .14 * fd], [.905 * L, -H + .4], [.968 * L, -H], [.995 * L, yt + .36 * fd]], {fill:tail, stroke:INK, "stroke-width":1});
  line(q, .955 * L, -H + .3, .985 * L, yt + .25 * fd, {stroke:INK, "stroke-width":.5, opacity:.6});
  // fuselage
  const fus = `M${nl} ${yt} L${.78*L} ${yt} C${.9*L} ${yt} ${.975*L} ${yt+.12*fd} ${L} ${yt+.3*fd} L${L} ${yt+.42*fd} C${.93*L} ${yb-.25*fd} ${.86*L} ${yb} ${.72*L} ${yb} L${nl} ${yb} C${nl*.35} ${yb} 0 ${yc+.3*fd} 0 ${yc+.08*fd} C0 ${yc-.25*fd} ${nl*.35} ${yt} ${nl} ${yt} Z`;
  path(q, fus, {fill:"var(--paper)", stroke:INK, "stroke-width":1.1});
  if (o.hump){
    const hd = `M${nl*.28} ${yc-.18*fd} C${nl*.6} ${yt-.28*fd} ${.12*L} ${yt-.3*fd} ${.2*L} ${yt-.3*fd} L${.27*L} ${yt-.3*fd} C${.31*L} ${yt-.3*fd} ${.33*L} ${yt-.05*fd} ${.37*L} ${yt}`;
    path(q, hd + ` L${nl} ${yt+.3*fd} Z`, {fill:"var(--paper)"});
    path(q, hd, {fill:"none", stroke:INK, "stroke-width":1.1});
  }
  // livery: belly line + tail cone tint
  const cp = el("clipPath", {id:"pl" + Math.random().toString(36).slice(2, 7)}, q); el("path", {d:fus}, cp);
  const lv = el("g", {"clip-path":`url(#${cp.id})`}, q);
  rect(lv, 0, yc + .16 * fd, L, .07 * fd, {fill:tail});
  rect(lv, 0, yc + .3 * fd, L, fd, {fill:"var(--metal)", opacity:.35});
  // belly fairing
  path(q, `M${.33*L} ${yb} Q${.43*L} ${yb+.1*fd} ${.54*L} ${yb} Z`, {fill:"var(--metal)", stroke:INK, "stroke-width":.6});
  // cockpit
  if (o.hump) poly(q, [[nl*.55, yt-.1*fd], [nl*.78, yt-.24*fd], [nl*1.05, yt-.27*fd], [nl*1.05, yt-.12*fd]], {fill:"var(--wind)", ...THIN});
  else poly(q, [[nl*.4, yc-.1*fd], [nl*.62, yc-.3*fd], [nl*.98, yc-.33*fd], [nl*.98, yc-.12*fd]], {fill:"var(--wind)", ...THIN});
  // doors
  const doorsX = o.hump ? [nl + 1.6, .25 * L, .45 * L, .62 * L, .76 * L] : [nl + 1.4, .765 * L];
  const exits = o.hump ? [] : [.43 * L, .465 * L];
  const wy = yc - .2 * fd, wh = Math.min(1.15, .085 * fd);
  for (const dx of doorsX){ rect(q, dx - 1.4, wy - .8, 2.8, 6.3, {rx:.7, fill:"none", stroke:INK, "stroke-width":.6}); rect(q, dx - .35, wy, .7, wh, {rx:.25, fill:"var(--wind)"}); }
  for (const ex of exits) rect(q, ex - .85, wy - .5, 1.7, 3.2, {rx:.5, fill:"none", stroke:INK, "stroke-width":.5});
  // cabin windows
  const avoid = [...doorsX.map(d => [d - 2, d + 2])];
  const runWindows = (x0, x1, y) => {
    if (fine){ for (let wx = x0; wx < x1; wx += 1.75){ if (avoid.some(([a, b]) => wx + .7 > a && wx < b)) continue; rect(q, wx, y, .7, wh, {rx:.3, fill:"var(--wind)"}); } }
    else line(q, x0, y + wh / 2, x1, y + wh / 2, {stroke:"var(--wind)", "stroke-width":1.6, "stroke-dasharray":"1.2 1.4"});
  };
  runWindows(nl + 3.6, .775 * L, wy);
  if (o.hump) runWindows(.06 * L, .27 * L, yt - .17 * fd);
  // horizontal stabilizer
  poly(q, [[.86*L, yt+.5*fd], [.955*L, yt+.5*fd], [.995*L, yt+.3*fd], [.972*L, yt+.28*fd]], {fill:"var(--metal)", stroke:INK, "stroke-width":.7});
  // engines (draw outboard first)
  const engs = o.eng === 2 ? [[.395, .9, -2.2], [.3, 1, 0]] : [[.33, 1, 0]];
  const nacelle = (fx, scl, lift) => {
    const nd = o.nd * scl, nlen = o.nlen * scl, ex = fx * L;
    const ey = Math.min(yb + nd * .3, -(nd / 2 + 1.0)) + lift;
    poly(q, [[ex + nlen * .3, ey - nd * .42], [ex + nlen * .85, ey - nd * .38], [ex + nlen * 1.15, yb - .05 * fd], [ex + nlen * .55, yb - .12 * fd]], {fill:"var(--metal)", stroke:INK, "stroke-width":.6});
    path(q, `M${ex} ${ey-nd/2} L${ex+nlen*.72} ${ey-nd*.42} C${ex+nlen*.98} ${ey-nd*.36} ${ex+nlen*.98} ${ey+nd*.3} ${ex+nlen*.72} ${ey+nd*.42} L${ex} ${ey+nd/2} Z`, {fill:"var(--paper)", stroke:INK, "stroke-width":1});
    rect(q, ex + nlen * .45, ey - nd * .46, nlen * .12, nd * .92, {fill:tail, opacity:.8});
    ell(q, ex, ey, nd * .1, nd / 2, {fill:"var(--paper)", stroke:INK, "stroke-width":.8});
    ell(q, ex + nd * .04, ey, nd * .05, nd * .38, {fill:"var(--dark)"});
    poly(q, [[ex + nlen * .92, ey - nd * .2], [ex + nlen * 1.15, ey], [ex + nlen * .92, ey + nd * .2]], {fill:"var(--metal)", ...THIN});
  };
  // wing (near side, drawn over the far engine, under the near one)
  const wing = () => {
    poly(q, [[.34*L, yb-.24*fd], [.5*L, yb-.2*fd], [.63*L, yc+.16*fd], [.6*L, yc+.13*fd]], {fill:"var(--metal)", stroke:INK, "stroke-width":.8});
    poly(q, [[.6*L, yc+.13*fd], [.63*L, yc+.16*fd], [.637*L, yc-.22*fd], [.627*L, yc-.22*fd]], {fill:tail, ...THIN});
    if (fine) for (const f of [.44, .5, .55]) poly(q, [[f*L, yb-.18*fd], [(f+.03)*L, yb-.16*fd], [(f+.035)*L, yb-.06*fd]], {fill:"var(--metal)", ...THIN});
  };
  if (engs.length === 2){ nacelle(...engs[0]); wing(); nacelle(...engs[1]); }
  else { wing(); nacelle(...engs[0]); }
  // landing gear
  const gear = (gx, r, top, nb) => {
    line(q, gx, top, gx, -r, {stroke:INK, "stroke-width":1.6});
    line(q, gx - r * .9, top + 1, gx, -r * 1.6, {stroke:INK, "stroke-width":.7});
    if (nb === 2){ wheel(q, gx - r * 1.08, r); wheel(q, gx + r * 1.08, r); line(q, gx - r * 1.08, -r, gx + r * 1.08, -r, {stroke:INK, "stroke-width":1}); }
    else wheel(q, gx, r);
  };
  gear(nl * 1.25, o.nw, yb, 1);
  if (o.bogie){ gear(.47 * L, o.mw, yb, 2); gear(.53 * L, o.mw, yb, 2); }
  else gear(.49 * L, o.mw, yb - .05 * fd, 1);
  // tail cone
  poly(q, [[L, yt + .3 * fd], [L + .6, yt + .34 * fd], [L, yt + .4 * fd]], {fill:"var(--dark)"});
}

/* ---------- Things ---------- */
function slab(g, x, gy, s, c){
  const q = G(g, x, gy, s), L = c.unit, o = c.o, W = o.w, sq = o.squash, fine = s > .9;
  const pv = el("g", {transform:`translate(0 ${-W * sq}) scale(1 ${sq})`}, q);   // plan view: y = across, toward viewer
  const wl = {stroke:"#ffffff", "stroke-width":1.1, fill:"none"};
  if (o.type === "tennis"){
    rect(pv, -6, -3, L + 12, W + 6, {fill:"#4f7f62"});
    rect(pv, 0, 0, L, W, {fill:"#3a6e9a", stroke:INK, "stroke-width":.8});
    rect(pv, 0, 0, L, W, wl);
    line(pv, 0, 4.5, L, 4.5, wl); line(pv, 0, W - 4.5, L, W - 4.5, wl);
    line(pv, 18, 4.5, 18, W - 4.5, wl); line(pv, 60, 4.5, 60, W - 4.5, wl);
    line(pv, 18, W / 2, 60, W / 2, wl);
    line(pv, 0, W / 2, .8, W / 2, wl); line(pv, L - .8, W / 2, L, W / 2, wl);
    line(pv, 39, -3, 39, W + 3, {stroke:"var(--dark)", "stroke-width":2});
    // net posts (side view)
    for (const yy of [-3, W + 3]) rect(q, 38.8, yy * sq - W * sq - 3.5 + 0, .4, 3.5, {fill:"var(--dark)"});
  } else if (o.type === "court"){
    rect(pv, 0, 0, L, W, {fill:"#d9a466", stroke:INK, "stroke-width":.8});
    if (fine) for (let yy = 1; yy < W; yy += 2) line(pv, 0, yy, L, yy, {stroke:"#b98443", "stroke-width":.3, opacity:.5});
    for (const end of [0, 1]){
      const X = v => end ? L - v : v, lo = (a, b) => Math.min(X(a), X(b));
      rect(pv, lo(0, 19), W / 2 - 8, 19, 16, {fill:"#a83c2c", opacity:.85});
      rect(pv, lo(0, 19), W / 2 - 8, 19, 16, wl);
      P("circle", {cx:X(19), cy:W / 2, r:6, ...wl}, pv);
      line(pv, X(0), 3, X(14), 3, wl); line(pv, X(0), W - 3, X(14), W - 3, wl);
      path(pv, `M${X(14)} 3 A23.75 23.75 0 0 ${end ? 0 : 1} ${X(14)} ${W - 3}`, wl);
      line(pv, X(4), W / 2 - 3, X(4), W / 2 + 3, {stroke:"#fff", "stroke-width":1.4});
      P("circle", {cx:X(5.25), cy:W / 2, r:.75, fill:"none", stroke:"#f26b21", "stroke-width":1.2}, pv);
    }
    rect(pv, 0, 0, L, W, wl);
    line(pv, L / 2, 0, L / 2, W, wl);
    P("circle", {cx:L / 2, cy:W / 2, r:6, ...wl}, pv);
    // hoops (side view)
    for (const end of [0, 1]){
      const bx = end ? L - 4 : 4;
      line(q, end ? L + 1 : -1, 0, end ? L + 1 : -1, -12.5, {stroke:INK, "stroke-width":1.2});
      line(q, end ? L + 1 : -1, -12.5, bx, -12.5, {stroke:INK, "stroke-width":1});
      rect(q, bx - .1, -13.8, .2, 3.5, {fill:"var(--paper)", stroke:INK, "stroke-width":.6});
      line(q, bx + (end ? -1.5 : 0), -10, bx + (end ? 0 : 1.5), -10, {stroke:"#f26b21", "stroke-width":1.4});
    }
  } else if (o.type === "field"){
    rect(pv, -12, -10, L + 24, W + 20, {fill:"#4b8a52"});
    rect(pv, 0, 0, L, W, {fill:"#3f8a4a", stroke:INK, "stroke-width":.8});
    if (fine) for (let xx = 30; xx < 330; xx += 30) rect(pv, xx, 0, 15, W, {fill:"#459653"});
    rect(pv, 0, 0, 30, W, {fill:"#2f6e3a"}); rect(pv, 330, 0, 30, W, {fill:"#2f6e3a"});
    for (let yd = 0; yd <= 100; yd += 5){
      const xx = 30 + yd * 3;
      line(pv, xx, 0, xx, W, {stroke:"#fff", "stroke-width":yd % 10 === 0 ? 1.1 : .6});
      if (fine && yd > 0 && yd < 100) for (let h = 1; h < 5; h++){ const hx = xx + h * 3 * (yd % 5 === 0 ? 1 : 1) - 0; if (hx < 330) { line(pv, hx, 1, hx, 3, {stroke:"#fff", "stroke-width":.4}); line(pv, hx, 70.75, hx, 72.75, {stroke:"#fff", "stroke-width":.4}); line(pv, hx, 87.25, hx, 89.25, {stroke:"#fff", "stroke-width":.4}); line(pv, hx, W - 3, hx, W - 1, {stroke:"#fff", "stroke-width":.4}); } }
    }
    rect(pv, 0, 0, L, W, wl);
    // goalposts (side view, at the back of each end zone)
    for (const gxp of [0, L]){
      line(q, gxp, -W * sq * .5, gxp, -W * sq * .5 - 10, {stroke:"#f2c014", "stroke-width":2.2});
      line(q, gxp, -W * sq * .5 - 10, gxp, -W * sq * .5 - 35, {stroke:"#f2c014", "stroke-width":1.6});
    }
  } else if (o.type === "lane"){
    rect(pv, -2, 0, L + 6, W, {fill:"var(--dark)"});
    rect(pv, 0, .8, L + 3, W - 1.6, {fill:"#d8b27c", stroke:INK, "stroke-width":.6});
    if (fine) for (let yy = 1.1; yy < W - .8; yy += .22) line(pv, 0, yy, L + 3, yy, {stroke:"#b98a50", "stroke-width":.3, opacity:.6});
    line(pv, 0, .8, 0, W - .8, {stroke:"#1b1b1b", "stroke-width":1.4});           // foul line
    for (let i = 0; i < 7; i++){ const ay = 1.1 + i * (W - 2.2) / 6; poly(pv, [[15 + Math.abs(3 - i) * .9, ay], [16.3 + Math.abs(3 - i) * .9, ay - .12], [16.3 + Math.abs(3 - i) * .9, ay + .12]], {fill:"#3b2a1a"}); }
    const pins = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) pins.push([L + r * .866, W / 2 + (i - r / 2) * 1.0]);
    for (const [px, py] of pins) P("circle", {cx:px, cy:py, r:.2, fill:"#fff", stroke:INK, "stroke-width":.4}, pv);
  }
  rect(q, o.type === "lane" ? -2 : 0, -.35, (o.type === "lane" ? L + 8 : L), .35, {fill:"var(--dark)", opacity:.5}); // front edge
}

function whale(g, x, gy, s, c){
  const q = G(g, x, gy, s), L = c.unit, H = c.h, b = -.8, top = b - H, mid = b - H * .5, fine = s > .9;
  const body = `M0 ${mid+.8} C0 ${top+2.2} ${L*.07} ${top} ${L*.22} ${top} C${L*.45} ${top} ${L*.63} ${top+1.6} ${L*.79} ${mid-1.1} L${L*.865} ${mid-.4} C${L*.9} ${mid-2.6} ${L*.95} ${top-1} ${L} ${top-1.8} C${L*.975} ${mid-1.2} ${L*.955} ${mid-.1} ${L*.935} ${mid+.25} C${L*.955} ${mid+.6} ${L*.98} ${b} ${L} ${b+.7} C${L*.94} ${b+.1} ${L*.895} ${mid+1.3} ${L*.865} ${mid+.9} L${L*.79} ${mid+1.3} C${L*.6} ${b} ${L*.4} ${b} ${L*.22} ${b} C${L*.07} ${b} 0 ${mid+3.2} 0 ${mid+.8} Z`;
  path(q, body, {fill:c.color, stroke:INK, "stroke-width":1.1});
  const cp = el("clipPath", {id:"wh" + Math.random().toString(36).slice(2, 7)}, q); el("path", {d:body}, cp);
  const lv = el("g", {"clip-path":`url(#${cp.id})`}, q);
  path(lv, `M0 ${mid+1.4} C${L*.15} ${mid+2.2} ${L*.35} ${b-2.2} ${L*.5} ${b-1.8} L${L*.5} ${b+1} L0 ${b+1} Z`, {fill:soft(c.color, 55)});
  if (fine) for (let i = 0; i < 6; i++) path(lv, `M${L*.03} ${mid+1.7+i*.55} C${L*.12} ${mid+2.2+i*.55} ${L*.25} ${b-2.3+i*.35} ${L*.4} ${b-2+i*.3}`, {fill:"none", stroke:shade(c.color, 20), "stroke-width":.5, opacity:.7});
  if (fine) for (const [mx, my, mr] of [[.3, top + 2.4, .6], [.42, top + 2.9, .45], [.55, top + 3.6, .5], [.36, top + 4.2, .35], [.63, mid - .4, .4]]) ell(lv, L * mx, my, mr * 1.6, mr, {fill:"#fff", opacity:.18});
  path(q, `M.5 ${mid+.9} Q${L*.07} ${mid+1.5} ${L*.15} ${mid+.4}`, {fill:"none", stroke:shade(c.color, 45), "stroke-width":.8});
  circ(q, L * .158, mid + .05, .35, {fill:"var(--dark)"});
  path(q, `M${L*.23} ${mid+2.3} Q${L*.28} ${b+1.2} ${L*.35} ${b+1.6} Q${L*.31} ${mid+3.1} ${L*.265} ${mid+2.1} Z`, {fill:shade(c.color, 18), stroke:INK, "stroke-width":.6});
  path(q, `M${L*.655} ${top+1.75} L${L*.69} ${top+.5} L${L*.715} ${top+2.15} Z`, {fill:c.color, stroke:INK, "stroke-width":.7});
  circ(q, L * .085, top + .9, .25, {fill:"var(--dark)"});            // blowhole
}

// Upright drawing (u across, v up) laid on its side: base at left, top pointing right.
function laidDown(q, uMax){ return el("g", {transform:`matrix(0 1 -1 0 0 ${-uMax})`}, q); }
const U = (u, v) => [u, -v];
function tower(g, x, gy, s, c){
  const q = G(g, x, gy, s), fine = s > .9;
  if (c.o && c.o.statue) return statue(q, c, fine);
  // Bunker Hill Monument
  const t = laidDown(q, 17), st = {stroke:INK, "stroke-width":.9};
  poly(t, [U(-17, 0), U(17, 0), U(16, 5), U(-16, 5)], {fill:shade(c.color, 12), ...st});
  poly(t, [U(-15, 5), U(15, 5), U(7.6, 210), U(-7.6, 210)], {fill:c.color, ...st});
  poly(t, [U(-7.6, 210), U(7.6, 210), U(0, 221)], {fill:shade(c.color, 10), ...st});
  poly(t, [U(0, 210), U(7.6, 210), U(0, 221)], {fill:shade(c.color, 22)});
  const halfAt = v => 15 - (v - 5) * 7.4 / 205;
  for (let v = 15; v < 208; v += fine ? 6 : 24) line(t, -halfAt(v), -v, halfAt(v), -v, {stroke:INK, "stroke-width":.35, opacity:.35});
  poly(t, [U(0, 5), U(15, 5), U(7.6, 210), U(0, 210)], {fill:"#000", opacity:.08});
  for (const u0 of [-4, 1.2]) rect(t, u0, -206, 2.8, 2.2, {fill:"var(--dark)"});
  rect(t, -2, -4.6, 4, 4.6, {fill:"var(--dark)"});                     // entrance
}
function statue(q, c, fine){
  const t = laidDown(q, 17), col = c.color, dk = shade(col, 30), st = {stroke:INK, "stroke-width":.9};
  // robe & body
  poly(t, [U(-15.5,0),U(15.5,0),U(14,8),U(13,24),U(12.2,44),U(11.6,60),U(12.6,74),U(12.4,86),U(9.8,91.5),U(5,94.5),U(3,96.5),U(-3,96.5),U(-5.5,94.5),U(-9.5,92.5),U(-12.2,86),U(-11.6,70),U(-12.4,50),U(-13.6,26),U(-14.8,8)], {fill:col, ...st});
  // feet & hem
  path(t, `M-14 0 Q-10 -2.2 -6 0 Q-2 -2.4 2 0 Q6 -2.2 10 0 Q13 -2 15 0`, {fill:"none", stroke:dk, "stroke-width":.8});
  // drapery folds
  if (fine) for (const [a, b, cx] of [[-9, 2, -12], [-5, 4, -7], [-1, 6, -2.5], [3, 8, 2], [7, 6, 6.5], [10.5, 4, 11]]){
    path(t, `M${a} -${92 - Math.abs(a) * .4} C${cx} -60 ${cx - 1} -30 ${a + b * .3} -2`, {fill:"none", stroke:dk, "stroke-width":.6, opacity:.85});
  }
  path(t, `M-9.5 -92 C-2 -84 6 -70 12.2 -58`, {fill:"none", stroke:dk, "stroke-width":1});   // toga sash
  // raised right arm + torch
  poly(t, [U(-9.6, 92), U(-5.8, 95), U(-8.6, 128), U(-12.6, 128)], {fill:col, ...st});
  path(t, `M-7.5 -100 C-8 -110 -9 -118 -9.6 -126`, {fill:"none", stroke:dk, "stroke-width":.6});
  ell(t, -10.6, -129.5, 2.4, 2.2, {fill:col, ...st});
  rect(t, -11.6, -136, 2, 5.6, {fill:shade(col, 15), ...st});
  poly(t, [U(-14.4, 136), U(-7.4, 136), U(-8.4, 139.6), U(-13.4, 139.6)], {fill:shade(col, 10), ...st});
  line(t, -14, -137.6, -7.8, -137.6, {stroke:dk, "stroke-width":.6});
  path(t, `M-13.2 -139.6 C-14.2 -143 -12.6 -146.5 -10.9 -151 C-9.6 -147 -7.4 -144 -8.6 -139.6 Z`, {fill:"#e8b23a", stroke:"#a8741c", "stroke-width":.8});
  path(t, `M-11.8 -140 C-12.2 -143 -11.2 -145.5 -10.9 -147.5 C-10.2 -145 -9.3 -142.8 -9.8 -140 Z`, {fill:"#f8dc7a"});
  // left arm with tablet
  poly(t, [U(5.2, 63), U(13.6, 66.5), U(11.8, 89.5), U(3.6, 86.5)], {fill:shade(col, 8), ...st});
  line(t, 5, -66, 12.6, -69, {stroke:dk, "stroke-width":.5});
  if (fine) for (let v = 72; v < 86; v += 4) line(t, 6, -v, 11.3, -v - 1.4, {stroke:dk, "stroke-width":.4, opacity:.7});
  path(t, `M9.8 -91.5 C13.5 -86 14.6 -76 12.6 -68`, {fill:"none", stroke:INK, "stroke-width":.9});
  // head, face, crown
  rect(t, -2.6, -100, 5.2, 4, {fill:col, ...st});
  ell(t, 0, -104.5, 5, 7.2, {fill:col, ...st});
  if (fine){ path(t, `M-2.3 -106 Q-1.4 -106.6 -.6 -106`, {fill:"none", stroke:dk, "stroke-width":.6}); path(t, `M.6 -106 Q1.4 -106.6 2.3 -106`, {fill:"none", stroke:dk, "stroke-width":.6}); line(t, 0, -105.5, -.3, -102.6, {stroke:dk, "stroke-width":.5}); path(t, `M-1.4 -100.8 Q0 -100.1 1.4 -100.8`, {fill:"none", stroke:dk, "stroke-width":.5}); }
  path(t, `M-5 -108.5 Q0 -112.5 5 -108.5 L5.6 -110.6 Q0 -114.6 -5.6 -110.6 Z`, {fill:shade(col, 10), ...st});
  for (let i = 0; i < 7; i++){
    const a = Math.PI * (.12 + i * .76 / 6), cx = Math.cos(a), sy = Math.sin(a), bx = 0 + cx * 5.4, by = -110 - sy * 2.6;
    const tx = cx * 16.5, ty = -110 - sy * 13, px = -sy * .8, py = -cx * .8;
    poly(t, [[bx + px, by - py], [tx, ty], [bx - px, by + py]], {fill:col, ...st});
  }
  // pedestal hint
  rect(t, -17, -1, 34, 1, {fill:"var(--dark)", opacity:.5});
}

function wall(g, x, gy, s, c){
  const q = G(g, x, gy, s), L = c.unit, H = c.h, fine = s > .9, col = c.color;
  // seats on top
  rect(q, L * .06, -H - 4.4, L * .88, 4.4, {fill:shade(col, 25), stroke:INK, "stroke-width":.6});
  if (fine) for (const yy of [-H - 1.3, -H - 2.6, -H - 3.9]) line(q, L * .06, yy, L * .94, yy, {stroke:"#c7d3cb", "stroke-width":.5, opacity:.6});
  line(q, L * .06, -H - 5.4, L * .94, -H - 5.4, {stroke:INK, "stroke-width":.8});
  if (fine) for (let px = L * .06; px <= L * .94; px += 6) line(q, px, -H - 5.4, px, -H - 4.4, {stroke:INK, "stroke-width":.5});
  // the wall
  rect(q, 0, -H, L, H, {fill:col, stroke:INK, "stroke-width":1.1});
  if (fine) for (let px = 12; px < L; px += 12) line(q, px, -H, px, 0, {stroke:shade(col, 18), "stroke-width":.4, opacity:.6});
  rect(q, 0, -2, L, 2, {fill:shade(col, 20)});
  // manual scoreboard
  const sx = L * .33, sw = L * .38, sy = -H + 5.5, sh = 21;
  rect(q, sx, sy, sw, sh, {fill:shade(col, 32), stroke:"#e6ede8", "stroke-width":.8});
  rect(q, sx + 3, sy + 1.3, sw - 6, 2.2, {fill:"#eef3ef"});
  const cols = 13, cw = (sw - 8) / cols;
  for (let r = 0; r < 2; r++) for (let i = 0; i < cols; i++){
    const bx = sx + 4 + i * cw;
    rect(q, bx, sy + 5.5 + r * 6, cw - 1, 4.6, {fill:i < 9 ? "#f4f7f3" : "#f2c014", opacity:.92});
    if (fine && i < 9 && (r + i) % 3 === 0) rect(q, bx + cw * .3, sy + 6.5 + r * 6, cw * .3, 2.6, {fill:"#1d2a22"});
  }
  rect(q, sx + 4, sy + 18, sw - 8, 1.6, {fill:"#eef3ef", opacity:.8});
  // ladder
  const lx = L * .14;
  line(q, lx, -13, lx, -H, {stroke:"#dce6df", "stroke-width":.8}); line(q, lx + 1.4, -13, lx + 1.4, -H, {stroke:"#dce6df", "stroke-width":.8});
  if (fine) for (let v = -14; v > -H; v -= 1.2) line(q, lx, v, lx + 1.4, v, {stroke:"#dce6df", "stroke-width":.5});
  // foul pole + screen-side light tower base
  rect(q, -1.1, -c.dh, 1.1, c.dh, {fill:"#f2c014", stroke:INK, "stroke-width":.5});
  rect(q, -.9, -c.dh + 4, .4, 10, {fill:"#f2c014", stroke:INK, "stroke-width":.3});
  // warning track
  rect(q, -2, -.4, L + 4, .4, {fill:"#a0703e"});
}

const DRAW = {lrv, metro, cr, acela, bus, truck, car, plane, slab, whale, tower, wall};
const drawHeight = c => c.dh ?? (c.kind === "lrv" ? c.h + 4.6 : c.kind === "cr" ? 16.8 : c.h);

function addMarker(svg){
  const defs = el("defs", {}, svg);
  for (const [id, col] of [["arG","var(--accent)"],["arC","var(--cmp)"]]){
    const m = el("marker", {id, viewBox:"0 0 10 10", refX:5, refY:5, markerWidth:6, markerHeight:6, orient:"auto-start-reverse"}, defs);
    el("path", {d:"M0 1 L9 5 L0 9", fill:"none", stroke:col, "stroke-width":1.5}, m);
  }
}
function niceStep(maxFt){
  if (unit === "ft") return [5,10,25,50,100,200].find(v => maxFt / v <= 12) || 200;
  const mm = maxFt * .3048; return ([2,5,10,20,50].find(v => mm / v <= 12) || 50) / .3048;
}
function ruler(svg, gridG, X0, s, maxFt, topY, rulerY){
  const step = niceStep(maxFt);
  el("line", {x1:X0, y1:rulerY, x2:X0+maxFt*s, y2:rulerY, stroke:"var(--ink)", "stroke-width":1.2}, svg);
  for (let k = 0; k * step <= maxFt + 1e-6; k++){
    const f = k * step, gx = X0 + f * s;
    el("line", {x1:gx, y1:topY, x2:gx, y2:rulerY, stroke:"var(--grid)", "stroke-width":1}, gridG);
    el("line", {x1:gx, y1:rulerY, x2:gx, y2:rulerY+7, stroke:"var(--ink)", "stroke-width":1}, svg);
    const t = el("text", {x:gx, y:rulerY+21, "text-anchor":"middle", "font-family":"var(--f-mono)", "font-size":11, fill:"var(--muted)"}, svg);
    t.textContent = unit === "ft" ? `${Math.round(f)} ft` : `${Math.round(f * .3048)} m`;
  }
}
function dim(g, x, y, ft, s, color, marker){
  const x2 = x + ft * s;
  for (const xx of [x, x2]) el("line", {x1:xx, y1:y-5, x2:xx, y2:y+5, stroke:color, "stroke-width":1}, g);
  el("line", {x1:x, y1:y, x2:x2, y2:y, stroke:color, "stroke-width":1, "marker-start":`url(#${marker})`, "marker-end":`url(#${marker})`}, g);
  const label = fmt(ft), w = label.length * 7.4 + 12;
  const tx = Math.min(Math.max((x + x2) / 2, x + w / 2), 1000 - w / 2 - 4);
  el("rect", {x:tx-w/2, y:y-8, width:w, height:16, fill:"var(--sheet)"}, g);
  const t = el("text", {x:tx, y:y+4, "text-anchor":"middle", "font-family":"var(--f-mono)", "font-size":12, "font-weight":600, fill:color}, g);
  t.textContent = label;
}
function monoText(parent, x, y, txt, fill, opts = {}){
  const t = el("text", {x, y, "font-family":"var(--f-mono)", "font-size":opts.size || 12, "font-weight":opts.weight || 600, fill, "letter-spacing":".04em", ...(opts.anchor ? {"text-anchor":opts.anchor} : {})}, parent);
  t.textContent = txt; return t;
}

/* ============================== LINEUP (shared) ============================== */
function buildLineup(container, onPick, currentId){
  container.replaceChildren();
  const items = CAT.map(c => ({c, L: lenOf(c.id, c.cars[1])}));
  const maxL = Math.max(...items.map(i => i.L)) * 1.14, ref = T10 / maxL * 100;
  let cur = "";
  for (const {c, L} of items){
    if (c.g !== cur){ cur = c.g; const h = document.createElement("div"); h.className = "lu-group"; h.textContent = cur; container.appendChild(h); }
    const b = document.createElement("button"); b.className = "lu-row"; b.dataset.id = c.id;
    if (currentId) b.setAttribute("aria-current", c.id === currentId ? "true" : "false");
    const pct = L / maxL * 100, multi = c.cars[1] > 1 ? ` <em>×${c.cars[1]}</em>` : "";
    b.innerHTML = `<span class="nm"><i style="background:${c.color}"></i>${c.approx ? "≈ " : ""}${c.name}${multi}</span><span class="lu-track"><span class="lu-ref" style="left:${ref}%"></span><span class="lu-bar" style="width:${pct}%;background:${c.color}"></span><span class="lu-ft" style="left:${pct}%">${fmt(L)}</span></span>`;
    b.onclick = () => onPick(c);
    container.appendChild(b);
  }
}

/* ============================== MODE 1: COMPARE ============================== */
const LIST = CAT.filter(c => c.id !== "t10");
const cmpCars = Object.fromEntries(LIST.map(c => [c.id, c.cars[1]]));
let ci = Math.max(0, LIST.findIndex(c => c.id === (store.get("bt-cmp") || "t9")));
const cmpSvg = $("cmpDraw");

function renderCompare(){
  const c = LIST[ci], n = cmpCars[c.id], L = lenOf(c.id, n);
  cmpSvg.replaceChildren(); addMarker(cmpSvg);
  const X0 = 40, W = 920, maxFt = Math.max(T10, L), s = W / maxFt;
  const h1 = drawHeight(BY.t10) * s, h2 = Math.max(drawHeight(c) * s, 8);
  const top = 26, gy1 = top + Math.max(h1, 10) + 14, gy2 = gy1 + 78 + h2, rulerY = gy2 + 52;
  cmpSvg.setAttribute("viewBox", `0 0 1000 ${rulerY + 34}`);
  const gridG = el("g", {}, cmpSvg);

  monoText(cmpSvg, X0, top, "TYPE 10 SUPERCAR", "var(--accent)");
  el("line", {x1:0, y1:gy1, x2:1000, y2:gy1, stroke:"var(--rule)", "stroke-width":1.5}, cmpSvg);
  lrv(el("g", {}, cmpSvg), X0, gy1, s, BY.t10, 1);
  dim(cmpSvg, X0, gy1 + 18, T10, s, "var(--accent)", "arG");

  const g2 = el("g", {}, cmpSvg);
  const cw = carWord(c, n);
  monoText(g2, X0, gy2 - h2 - 12, `${c.approx ? "≈ " : ""}${c.name.toUpperCase()}${cw ? " · " + cw.toUpperCase() : ""}`, "var(--cmp)");
  el("line", {x1:0, y1:gy2, x2:1000, y2:gy2, stroke:"var(--rule)", "stroke-width":1.5}, g2);
  DRAW[c.kind](g2, X0, gy2, s, c, n);
  el("rect", {x:X0, y:gy2-12*s, width:T10*s, height:12*s, fill:"none", stroke:"var(--accent)", "stroke-width":1.2, "stroke-dasharray":"5 4", opacity:.85}, g2);
  dim(g2, X0, gy2 + 18, L, s, "var(--cmp)", "arC");
  ruler(cmpSvg, gridG, X0, s, maxFt, top - 12, rulerY);

  $("cmpLabel").textContent = c.name + (cw ? ` · ${cw}` : "");
  $("cmpLen").textContent = (c.approx ? "≈ " : "") + fmt(L);
  const diff = T10 - L, ratio = T10 / L;
  let v, sub;
  if (Math.abs(diff) < 2){ v = "About the same length."; sub = `${Math.abs(diff).toFixed(1)} ft apart.`; }
  else if (diff > 0){ v = ratio >= 1.95 ? `${ratio.toFixed(1)} of these fit along one Type 10.` : `The Type 10 is ${Math.round(diff)} ft longer.`; sub = `Type 10 is ${ratio.toFixed(2)}× its length · ${fmtM(L)} vs ${fmtM(T10)}`; }
  else { v = `Equal to ${(L / T10).toFixed(1)} Type 10s nose to tail.`; sub = `${Math.round(-diff)} ft longer than one Supercar · ${fmtM(L)}`; }
  $("verdict").innerHTML = `${v}<small>${sub}</small>`;
  $("itemNote").textContent = c.note;
  $("count").textContent = `${ci + 1}/${LIST.length}`;

  const [mn, , mx] = c.cars, step = $("cmpStepper");
  step.hidden = mn === mx;
  $("cmpCars").textContent = cw;
  $("cmpMinus").disabled = n <= mn; $("cmpPlus").disabled = n >= mx;

  document.querySelectorAll("#groups .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === c.id ? "true" : "false"));
  document.querySelectorAll("#cmpLineup .lu-row").forEach(b => b.setAttribute("aria-current", b.dataset.id === c.id ? "true" : "false"));
  store.set("bt-cmp", c.id);
}
function goCompare(i){ ci = (i + LIST.length) % LIST.length; renderCompare(); }

function buildChips(){
  const groups = $("groups"); groups.replaceChildren();
  [...new Set(LIST.map(c => c.g))].forEach(gname => {
    const sec = document.createElement("div"); sec.className = "group";
    const h = document.createElement("h3"); h.textContent = gname; sec.appendChild(h);
    const wrap = document.createElement("div"); wrap.className = "chips";
    LIST.forEach((c, i) => { if (c.g !== gname) return;
      const b = document.createElement("button"); b.className = "chip"; b.dataset.id = c.id;
      b.innerHTML = `<i style="background:${c.color}"></i>${c.name}<span>${c.approx ? "≈" : ""}${Math.round(lenOf(c.id, c.cars[1]))} ft</span>`;
      b.onclick = () => goCompare(i); wrap.appendChild(b); });
    sec.appendChild(wrap); groups.appendChild(sec);
  });
}
$("prev").onclick = () => goCompare(ci - 1);
$("next").onclick = () => goCompare(ci + 1);
$("cmpMinus").onclick = () => { const c = LIST[ci]; cmpCars[c.id] = Math.max(c.cars[0], cmpCars[c.id] - 1); renderCompare(); };
$("cmpPlus").onclick = () => { const c = LIST[ci]; cmpCars[c.id] = Math.min(c.cars[2], cmpCars[c.id] + 1); renderCompare(); };

/* ============================== MODE 2: SANDBOX ============================== */
let bench = [], showRef = true, keyN = 0;
const mk = (id, n) => ({key: ++keyN, id, n: n ?? BY[id].cars[1]});
const sbSvg = $("sbDraw");

function renderSandbox(){
  sbSvg.replaceChildren();
  const X0 = 36, Wd = 900;
  if (!bench.length){
    sbSvg.setAttribute("viewBox", "0 0 1000 120");
    const t = el("text", {x:500, y:64, "text-anchor":"middle", "font-family":"var(--f-body)", "font-size":16, fill:"var(--muted)"}, sbSvg);
    t.textContent = "No tracks yet. Pick a preset or add something below.";
    renderSummary(); return;
  }
  const maxFt = Math.max(...bench.map(r => lenOf(r.id, r.n)), showRef ? T10 : 0), s = Wd / maxFt;
  const gridG = el("g", {}, sbSvg), rowsG = el("g", {}, sbSvg);
  let y = 12;
  bench.forEach(r => {
    const c = BY[r.id], L = lenOf(r.id, r.n), hpx = Math.max(drawHeight(c) * s, c.kind === "slab" ? 6 : 8);
    y += 18;
    el("rect", {x:X0-14, y:y-9, width:6, height:10, rx:1, fill:c.color}, rowsG);
    const cw = carWord(c, r.n);
    monoText(rowsG, X0, y, `${c.approx ? "≈ " : ""}${c.name.toUpperCase()}${cw ? " · " + cw.toUpperCase() : ""}`, "var(--ink)");
    monoText(rowsG, X0 + Wd, y, `${fmt(L)}  ·  ${(L / T10).toFixed(2)}× Type 10`, "var(--muted)", {anchor:"end", weight:400});
    y += hpx + 10;
    el("line", {x1:X0-20, y1:y, x2:X0+Wd+20, y2:y, stroke:"var(--rule)", "stroke-width":1.2}, rowsG);
    DRAW[c.kind](el("g", {}, rowsG), X0, y, s, c, r.n);
    y += 14;
  });
  const rulerY = y + 14;
  if (showRef){
    const rx = X0 + T10 * s;
    el("line", {x1:rx, y1:6, x2:rx, y2:rulerY, stroke:"var(--ref)", "stroke-width":1.4, "stroke-dasharray":"6 4"}, sbSvg);
    monoText(sbSvg, rx + 4, rulerY - 4, "1 Type 10", "var(--ref)", {size:11, weight:400});
  }
  ruler(sbSvg, gridG, X0, s, maxFt, 6, rulerY);
  sbSvg.setAttribute("viewBox", `0 0 1000 ${rulerY + 32}`);
  renderSummary();
}
function renderSummary(){
  const sum = $("summary"), notes = $("notes");
  if (!bench.length){ sum.innerHTML = ""; notes.innerHTML = ""; return; }
  const lens = bench.map(r => lenOf(r.id, r.n)), tot = lens.reduce((a, b) => a + b, 0);
  const lo = bench[lens.indexOf(Math.min(...lens))], hi = bench[lens.indexOf(Math.max(...lens))];
  sum.innerHTML = `<span>Longest: <b>${BY[hi.id].name}</b> ${fmt(lenOf(hi.id, hi.n))}</span><span>Shortest: <b>${BY[lo.id].name}</b> ${fmt(lenOf(lo.id, lo.n))}</span><span>All tracks nose to tail: <b>${fmt(tot)}</b> = ${(tot / T10).toFixed(1)} Type 10s</span>`;
  const seen = new Set();
  notes.innerHTML = bench.filter(r => !seen.has(r.id) && seen.add(r.id)).map(r => `<p><b>${BY[r.id].name}.</b> ${BY[r.id].note}</p>`).join("");
}
function optionsHTML(sel){
  let h = "", cur = "";
  CAT.forEach(c => { if (c.g !== cur){ if (cur) h += "</optgroup>"; h += `<optgroup label="${c.g}">`; cur = c.g; }
    h += `<option value="${c.id}"${c.id === sel ? " selected" : ""}>${c.approx ? "≈ " : ""}${c.name}</option>`; });
  return h + "</optgroup>";
}
function renderRows(){
  const rowsEl = $("rows"); rowsEl.replaceChildren();
  bench.forEach((r, i) => {
    const c = BY[r.id], [mn, , mx] = c.cars, fixed = mn === mx, d = document.createElement("div");
    d.className = "row";
    d.innerHTML = `<span class="dot" style="background:${c.color}"></span>
      <select id="sel-${r.key}" aria-label="Track ${i + 1} vehicle">${optionsHTML(r.id)}</select>
      <span class="stepper${fixed ? " fixed" : ""}"><button aria-label="Fewer cars" ${fixed || r.n <= mn ? "disabled" : ""}>−</button><span>${fixed ? "—" : carWord(c, r.n)}</span><button aria-label="More cars" ${fixed || r.n >= mx ? "disabled" : ""}>+</button></span>
      <span class="len">${fmt(lenOf(r.id, r.n))}</span>
      <span class="iconbtns"><button aria-label="Move up" title="Move up" ${i === 0 ? "disabled" : ""}>↑</button><button aria-label="Move down" title="Move down" ${i === bench.length - 1 ? "disabled" : ""}>↓</button><button aria-label="Remove track" title="Remove">✕</button></span>`;
    const [minus, plus] = d.querySelectorAll(".stepper button"), [up, down, rm] = d.querySelectorAll(".iconbtns button");
    d.querySelector("select").onchange = e => { r.id = e.target.value; r.n = BY[r.id].cars[1]; updateSandbox(); };
    minus.onclick = () => { r.n = Math.max(mn, r.n - 1); updateSandbox(); };
    plus.onclick = () => { r.n = Math.min(mx, r.n + 1); updateSandbox(); };
    up.onclick = () => { [bench[i - 1], bench[i]] = [bench[i], bench[i - 1]]; updateSandbox(); };
    down.onclick = () => { [bench[i + 1], bench[i]] = [bench[i], bench[i + 1]]; updateSandbox(); };
    rm.onclick = () => { bench.splice(i, 1); updateSandbox(); };
    rowsEl.appendChild(d);
  });
  $("trackCount").textContent = `${bench.length} track${bench.length === 1 ? "" : "s"}`;
}
function saveSandbox(){ store.set("bt-bench", {b: bench.map(r => [r.id, r.n]), unit, showRef}); }
function updateSandbox(){ renderRows(); renderSandbox(); saveSandbox(); }

PRESETS.forEach(p => { const b = document.createElement("button"); b.className = "pill"; b.textContent = p.name;
  b.onclick = () => { bench = p.rows.map(([id, n]) => mk(id, n)); updateSandbox(); }; $("presets").appendChild(b); });
$("addSel").innerHTML = optionsHTML("t10");
$("addBtn").onclick = () => { const id = $("addSel").value; bench.push(mk(id)); updateSandbox(); toast(`Added ${BY[id].name}`); };
$("clearBtn").onclick = () => { bench = []; updateSandbox(); };
$("refToggle").onchange = e => { showRef = e.target.checked; renderSandbox(); saveSandbox(); };
function setUnit(u){
  unit = u;
  $("uFt").setAttribute("aria-pressed", u === "ft"); $("uM").setAttribute("aria-pressed", u === "m");
  updateSandbox(); renderCompare();
  buildLineup($("sbLineup"), addFromLineup);
  buildLineup($("cmpLineup"), pickFromLineup, LIST[ci].id);
}
$("uFt").onclick = () => setUnit("ft");
$("uM").onclick = () => setUnit("m");
function addFromLineup(c){ bench.push(mk(c.id)); updateSandbox(); toast(`Added ${c.name} as track ${bench.length}`); }
function pickFromLineup(c){
  const i = LIST.findIndex(x => x.id === c.id);
  if (i >= 0){ goCompare(i); window.scrollTo({top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); }
}

/* ============================== MODES / BOOT ============================== */
function showMode(){
  const mode = location.hash === "#sandbox" ? "sandbox" : "compare";
  $("mode-compare").hidden = mode !== "compare";
  $("mode-sandbox").hidden = mode !== "sandbox";
  $("tab-compare").toggleAttribute("aria-current", mode === "compare");
  $("tab-sandbox").toggleAttribute("aria-current", mode === "sandbox");
  if (mode === "compare") $("tab-compare").setAttribute("aria-current", "page"); else $("tab-sandbox").setAttribute("aria-current", "page");
  document.title = mode === "compare" ? "How long is a Type 10? · Boston Transit to Scale" : "Transit sandbox · Boston Transit to Scale";
  mode === "compare" ? renderCompare() : renderSandbox();
}
window.addEventListener("hashchange", showMode);
document.addEventListener("keydown", e => {
  if ($("mode-compare").hidden) return;
  if (e.target.closest && e.target.closest("input, select, textarea")) return;
  if (e.key === "ArrowRight") goCompare(ci + 1);
  if (e.key === "ArrowLeft") goCompare(ci - 1);
});

const saved = store.get("bt-bench");
if (saved && Array.isArray(saved.b)){
  bench = saved.b.filter(([id]) => BY[id]).map(([id, n]) => mk(id, Math.min(BY[id].cars[2], Math.max(BY[id].cars[0], n))));
  unit = saved.unit === "m" ? "m" : "ft"; showRef = saved.showRef !== false;
}
if (!bench.length) bench = PRESETS[0].rows.map(([id, n]) => mk(id, n));
$("refToggle").checked = showRef;
$("uFt").setAttribute("aria-pressed", unit === "ft"); $("uM").setAttribute("aria-pressed", unit === "m");

buildChips();
buildLineup($("cmpLineup"), pickFromLineup, LIST[ci].id);
buildLineup($("sbLineup"), addFromLineup);
renderRows();
renderCompare();
renderSandbox();
showMode();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(showMode);
})();
