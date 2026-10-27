/* Boston Transit to Scale
   Mode 1 (#compare): one Type 10 vs one item.  Mode 2 (#sandbox): any number of tracks on one scale. */
(() => {
"use strict";

const T10 = 113.7; // ft (113 ft 8.4 in)

/* ============================== CATALOG ============================== */
const C = { green:"#00843d", red:"#da291c", orange:"#ed8b00", blue:"#003da5", silver:"#7c878e", cr:"#80276c", bus:"#ffc72c", air:"#2f5d99" };
// unit = length of one car/unit in ft; cars = [min, default, max]
const CAT = [
  {g:"Green Line",id:"t10",name:"Type 10 Supercar",unit:113.7,cars:[1,1,2],h:12,kind:"lrv",o:{sections:5},color:C.green,note:"CAF, 113 ft 8 in. One car carries about what a two-car Type 7/8 train does."},
  {g:"Green Line",id:"t9",name:"Type 9",unit:72,cars:[1,2,3],h:12,kind:"lrv",o:{sections:3},color:C.green,note:"CAF, 72 ft 0 in. Built for the Green Line Extension, in service since 2018. Usually runs as a two-car train."},
  {g:"Green Line",id:"t8",name:"Type 8",unit:74,cars:[1,2,3],h:11.8,kind:"lrv",o:{sections:3,boxy:true},color:C.green,note:"AnsaldoBreda low-floor car, 74 ft 0 in. Being replaced by the Type 10."},
  {g:"Green Line",id:"t7",name:"Type 7",unit:74,cars:[1,2,3],h:11.8,kind:"lrv",o:{sections:2,boxy:true},color:C.green,note:"Kinki Sharyo high-floor car, 74 ft 0 in. Being replaced by the Type 10."},
  {g:"Mattapan",id:"pcc",name:"Mattapan PCC trolley",unit:46.5,cars:[1,1,2],h:10,kind:"lrv",o:{sections:1,pcc:true},color:C.red,approx:true,note:"1940s PCC streetcar, roughly 46 ft (PCCs run 46–50 ft)."},
  {g:"Red Line",id:"rl19",name:"Red Line 1900-series",unit:69.81,cars:[1,6,8],h:12,kind:"metro",color:C.red,note:"CRRC car, 69 ft 9¾ in. Six-car trains are about 419 ft, close to 3.7 Supercars."},
  {g:"Red Line",id:"rl18",name:"Red Line 1800-series",unit:69.5,cars:[1,6,8],h:12,kind:"metro",color:C.red,note:"Bombardier car, 69 ft 6 in."},
  {g:"Red Line",id:"rl17",name:"Red Line 1700-series",unit:69.5,cars:[1,6,8],h:12,kind:"metro",color:C.red,note:"UTDC car, 69 ft 6 in."},
  {g:"Orange Line",id:"ol14",name:"Orange Line 1400-series",unit:65,cars:[1,6,8],h:12,kind:"metro",color:C.orange,note:"CRRC car, 65 ft. Six-car trains, 390 ft."},
  {g:"Blue Line",id:"bl7",name:"Blue Line 700-series",unit:48,cars:[1,6,8],h:11.5,kind:"metro",color:C.blue,note:"Siemens car, 48 ft. Six-car trains, 288 ft. The shortest T rapid-transit car."},
  {g:"Bus & Silver Line",id:"sl",name:"Silver Line articulated bus",unit:60,cars:[1,1,1],h:11,kind:"bus",o:{artic:true},color:C.silver,note:"60 ft articulated bus with three doors."},
  {g:"Bus & Silver Line",id:"bus40",name:"MBTA 40 ft bus",unit:40,cars:[1,1,1],h:10.5,kind:"bus",color:C.bus,approx:true,note:"Standard local bus, about 40 ft."},
  {g:"Commuter Rail",id:"cr",name:"Commuter Rail (HSP46 + bilevels)",unit:85.33,loco:71,cars:[1,6,9],h:15.5,kind:"cr",color:C.cr,note:"HSP46 locomotive 71 ft plus bilevel coaches at 85 ft 4 in each. The count is coaches."},
  {g:"Other cities",id:"r211",name:"NYC Subway R211",unit:60.21,cars:[1,10,11],h:12,kind:"metro",color:"#6b7b8c",note:"New York B Division car, 60.2 ft. A full train is usually 10 cars."},
  {g:"Other cities",id:"cta",name:"Chicago 'L' 7000-series",unit:48,cars:[1,8,8],h:12,kind:"metro",color:"#00a1de",note:"48 ft, the same as a Blue Line car. Up to 8 cars."},
  {g:"Other cities",id:"acela",name:"Amtrak NextGen Acela",unit:698.5,cars:[1,1,1],h:13.5,kind:"acela",color:"#1c5d8c",note:"Alstom Avelia Liberty, 698.5 ft: two power cars and nine coaches. Calls at South Station and Back Bay."},
  {g:"On the road",id:"sedan",name:"Sedan",unit:15,cars:[1,1,1],h:4.7,kind:"car",color:"#2f5d99",approx:true,note:"Compact sedan, about 15 ft. Roughly 7½ fit along one Supercar."},
  {g:"On the road",id:"school",name:"School bus",unit:40,cars:[1,1,1],h:10.5,kind:"bus",color:"#f2b705",o:{school:true},approx:true,note:"Full-size school bus, about 40 ft."},
  {g:"On the road",id:"semi",name:"Tractor-trailer",unit:72,cars:[1,1,1],h:13.5,kind:"truck",color:"#2f5d99",approx:true,note:"Sleeper cab with a 53 ft trailer, about 72 ft. Nearly a Type 9."},
  {g:"In the air",id:"a320",name:"Airbus A320",unit:123.25,cars:[1,1,1],h:38.6,kind:"plane",o:{fus:13},color:C.air,note:"123 ft 3 in. A Supercar is only about 10 ft shorter than the jet you'd fly out of Logan."},
  {g:"In the air",id:"b738",name:"Boeing 737-800",unit:129.5,cars:[1,1,1],h:41.2,kind:"plane",o:{fus:13},color:C.air,note:"129 ft 6 in."},
  {g:"In the air",id:"b748",name:"Boeing 747-8",unit:250.2,cars:[1,1,1],h:63.5,kind:"plane",o:{fus:21,hump:true},color:C.air,note:"250 ft 2 in, the longest passenger jet. About 2.2 Supercars."},
  {g:"Places & things",id:"bowl",name:"Bowling lane",unit:60,cars:[1,1,1],h:0,kind:"slab",o:{fill:"#c9a26a"},color:"#c9a26a",note:"60 ft from foul line to head pin."},
  {g:"Places & things",id:"tennis",name:"Tennis court",unit:78,cars:[1,1,1],h:0,kind:"slab",o:{fill:"#3d7a5c"},color:"#3d7a5c",note:"78 ft baseline to baseline."},
  {g:"Places & things",id:"bball",name:"NBA court",unit:94,cars:[1,1,1],h:0,kind:"slab",o:{fill:"#c98b4a"},color:"#c98b4a",note:"94 ft long. A Supercar overhangs it by almost 20 ft."},
  {g:"Places & things",id:"whale",name:"Blue whale",unit:82,cars:[1,1,1],h:14,kind:"whale",color:"#2f5d99",approx:true,note:"A large adult blue whale, about 80–90 ft."},
  {g:"Places & things",id:"liberty",name:"Statue of Liberty",unit:151,cars:[1,1,1],h:35,kind:"tower",o:{statue:true},color:"#5fa792",note:"Heel to torch, 151 ft, laid on its side. Pedestal not included."},
  {g:"Places & things",id:"bunker",name:"Bunker Hill Monument",unit:221,cars:[1,1,1],h:30,kind:"tower",color:"#8a8f8c",note:"221 ft granite obelisk in Charlestown, laid on its side."},
  {g:"Places & things",id:"monster",name:"Fenway's Green Monster",unit:231,cars:[1,1,1],h:37.2,kind:"wall",color:"#24563a",note:"About 231 ft long and 37 ft tall. Two Supercars nose to tail just about cover it."},
  {g:"Places & things",id:"field",name:"Football field",unit:360,cars:[1,1,1],h:0,kind:"slab",o:{fill:"#3f8a4a",yards:true},color:"#3f8a4a",note:"120 yards including end zones. About 3.2 Supercars."},
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

/* ============================== DRAWING ============================== */
const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const soft = c => `color-mix(in srgb, ${c} 26%, var(--paper))`;
const SW = 1;

function lrv(g, x, gy, s, c, n){
  const o = c.o, carLen = c.unit * s, gap = n > 1 ? Math.max(1, 1.2 * s) : 0, h = c.h;
  for (let k = 0; k < n; k++){
    const cx = x + k * carLen, L = carLen - (k < n - 1 ? gap : 0), bot = gy - 1.2 * s, top = gy - h * s;
    const nose = o.pcc ? Math.min(6 * s, L * .14) : Math.min(o.boxy ? 1.2 * s : 3 * s, L * .08);
    const d = o.pcc
      ? `M${cx} ${bot-(bot-top)*.25} Q${cx} ${top} ${cx+nose} ${top} L${cx+L-nose} ${top} Q${cx+L} ${top} ${cx+L} ${bot-(bot-top)*.25} L${cx+L} ${bot} L${cx} ${bot} Z`
      : `M${cx} ${bot} L${cx} ${top+nose*1.4} Q${cx+nose*.2} ${top} ${cx+nose} ${top} L${cx+L-nose} ${top} Q${cx+L-nose*.2} ${top} ${cx+L} ${top+nose*1.4} L${cx+L} ${bot} Z`;
    el("path", {d, fill: o.pcc ? "#efe3c4" : soft(c.color), stroke:"var(--ink)", "stroke-width":SW}, g);
    el("rect", {x:cx+.5, y:bot-(bot-top)*.24, width:L-1, height:(bot-top)*.14, fill:c.color}, g);
    el("rect", {x:cx+nose*.9, y:top+(bot-top)*.2, width:Math.max(0, L-nose*1.8), height:(bot-top)*.32, fill:"var(--glass)", stroke:"var(--ink)", "stroke-width":.5}, g);
    const ns = o.sections;
    for (let j = 1; j < ns; j++){ const ax = cx + L * j / ns; el("line", {x1:ax, y1:top, x2:ax, y2:bot, stroke:"var(--ink)", "stroke-width":1.3, "stroke-dasharray":"2 1.5"}, g); }
    const dW = Math.max(1.6, 4 * s), per = ns >= 5 ? 1 : 2;
    for (let j = 0; j < ns; j++){ const sx = cx + L * j / ns, sl = L / ns;
      for (let dd = 0; dd < per; dd++){ const dx = sx + sl * (dd + 1) / (per + 1) - dW / 2;
        el("rect", {x:dx, y:top+(bot-top)*.14, width:dW, height:(bot-top)*.84, fill:"var(--paper)", stroke:"var(--ink)", "stroke-width":.6, opacity:.9}, g); } }
    const tw = Math.max(3, 6 * s);
    const trucks = o.pcc ? [.2, .8] : Array.from({length: ns + 1}, (_, j) => j / ns);
    for (const f of trucks){ let tx = cx + L * f; tx = Math.min(Math.max(tx, cx + tw * .7), cx + L - tw * .7);
      el("rect", {x:tx-tw/2, y:bot-.2*s, width:tw, height:1.4*s+.6, rx:1, fill:"var(--dark)"}, g); }
    const px = cx + L * .5;
    el("path", {d:`M${px-3*s} ${top} L${px} ${top-2.2*s} L${px+3*s} ${top}`, fill:"none", stroke:"var(--ink)", "stroke-width":1}, g);
  }
}
function metroCar(g, cx, gy, s, L, h, color, bilevel){
  const bot = gy - 2.6 * s, top = gy - h * s, H = bot - top;
  el("rect", {x:cx, y:top, width:L, height:H, rx:Math.min(1.5*s, 4), fill:"var(--metal)", stroke:"var(--ink)", "stroke-width":SW}, g);
  el("rect", {x:cx, y:top+H*.68, width:L, height:Math.max(1.4, H*.1), fill:color}, g);
  if (!bilevel) el("rect", {x:cx, y:top+H*.06, width:L, height:Math.max(1, H*.06), fill:color}, g);
  const rows = bilevel ? 2 : 1;
  for (let r = 0; r < rows; r++){ const wy = top + H * (rows === 1 ? .2 : (.1 + r * .34)), wh = H * (rows === 1 ? .32 : .2);
    el("rect", {x:cx+L*.04, y:wy, width:L*.92, height:wh, fill:"var(--glass)", stroke:"var(--ink)", "stroke-width":.4}, g); }
  const nd = bilevel ? 2 : (L / s < 55 ? 2 : 3), dW = Math.max(1.5, 4.2 * s);
  for (let d = 0; d < nd; d++){ const dx = cx + L * (d + 1) / (nd + 1) - dW / 2;
    el("rect", {x:dx, y:top+H*.12, width:dW, height:H*.86, fill:"var(--paper)", stroke:"var(--ink)", "stroke-width":.5, opacity:.9}, g); }
  for (const f of [.14, .86]){ const tx = cx + L * f; for (const dd of [-2.6, 2.6]) el("circle", {cx:tx+dd*s, cy:gy-1.3*s, r:Math.max(1, 1.3*s), fill:"var(--dark)"}, g); }
}
function metro(g, x, gy, s, c, n){ const L0 = c.unit * s, gap = Math.max(.8, .9 * s); for (let k = 0; k < n; k++) metroCar(g, x + k * L0, gy, s, L0 - (k < n - 1 ? gap : 0), c.h, c.color, false); }
function cr(g, x, gy, s, c, n){
  const L = c.loco * s, bot = gy - 3 * s, top = gy - 15.4 * s, H = bot - top;
  el("path", {d:`M${x} ${bot} L${x} ${top+H*.32} L${x+L*.08} ${top} L${x+L-1} ${top} L${x+L-1} ${bot} Z`, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
  el("rect", {x:x+L*.05, y:top+H*.18, width:L*.12, height:H*.2, fill:"var(--glass)"}, g);
  el("rect", {x, y:top+H*.62, width:L-1, height:H*.08, fill:"#e6e6e6"}, g);
  for (const f of [.16, .84]) for (const dd of [-3.5, 0, 3.5]) el("circle", {cx:x+L*f+dd*s, cy:gy-1.5*s, r:Math.max(1, 1.5*s), fill:"var(--dark)"}, g);
  const L0 = c.unit * s, gap = Math.max(.8, .9 * s);
  for (let k = 0; k < n; k++) metroCar(g, x + L + k * L0, gy, s, L0 - (k < n - 1 ? gap : 0), c.h, c.color, true);
}
function acela(g, x, gy, s, c){
  const tot = c.unit * s, pc = 70 * s, coach = (tot - 2 * pc) / 9, bot = gy - 2.6 * s, top = gy - c.h * s, H = bot - top, gap = Math.max(.8, .9 * s);
  const power = (px, flip) => { const nose = pc * .35;
    const d = flip ? `M${px+pc} ${bot} L${px+pc} ${top+H*.55} Q${px+pc-nose*.2} ${top} ${px+pc-nose} ${top} L${px} ${top} L${px} ${bot} Z`
                   : `M${px} ${bot} L${px} ${top+H*.55} Q${px+nose*.2} ${top} ${px+nose} ${top} L${px+pc} ${top} L${px+pc} ${bot} Z`;
    el("path", {d, fill:"var(--metal)", stroke:"var(--ink)", "stroke-width":SW}, g);
    el("rect", {x:px, y:top+H*.62, width:pc, height:H*.1, fill:c.color}, g); };
  power(x, false);
  for (let k = 0; k < 9; k++){ const cx = x + pc + k * coach + gap / 2;
    el("rect", {x:cx, y:top, width:coach-gap, height:H, rx:2, fill:"var(--metal)", stroke:"var(--ink)", "stroke-width":SW}, g);
    el("rect", {x:cx, y:top+H*.62, width:coach-gap, height:H*.1, fill:c.color}, g);
    el("rect", {x:cx+coach*.05, y:top+H*.22, width:coach*.85, height:H*.26, fill:"var(--glass)"}, g); }
  power(x + tot - pc, true);
}
function bus(g, x, gy, s, c){
  const len = c.unit * s, o = c.o || {}, bot = gy - 1.6 * s, top = gy - c.h * s;
  const parts = o.artic ? [[0, .58], [.6, 1]] : [[0, 1]];
  parts.forEach(([a, b], i) => { const bx = x + len * a, L = len * (b - a);
    el("rect", {x:bx, y:top, width:L, height:bot-top, rx:Math.min(2*s, 6), fill:o.artic ? "var(--metal)" : c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
    if (o.artic) el("rect", {x:bx, y:top+(bot-top)*.66, width:L, height:(bot-top)*.1, fill:c.color}, g);
    el("rect", {x:bx+L*.05, y:top+(bot-top)*.14, width:L*.9, height:(bot-top)*.34, fill:"var(--glass)", stroke:"var(--ink)", "stroke-width":.5}, g);
    const ws = o.artic ? (i === 0 ? [.2, .8] : [.75]) : [.18, .8];
    for (const w of ws) el("circle", {cx:bx+L*w, cy:gy-1.6*s, r:Math.max(1.5, 1.6*s), fill:"var(--dark)"}, g); });
  if (o.artic) el("rect", {x:x+len*.58, y:top+(bot-top)*.1, width:len*.02, height:(bot-top)*.85, fill:"var(--dark)"}, g);
  if (o.school) el("rect", {x:x+len*.02, y:top+(bot-top)*.6, width:len*.96, height:Math.max(1, (bot-top)*.05), fill:"#1b1b1b"}, g);
}
function truck(g, x, gy, s, c){
  const T = c.unit * s, cabL = 19 * s, tx = x + cabL + s, tl = T - cabL - s, bot = gy - 4 * s, top = gy - c.h * s;
  el("rect", {x:tx, y:top, width:tl, height:bot-top, fill:"var(--paper)", stroke:"var(--ink)", "stroke-width":SW}, g);
  el("path", {d:`M${x} ${gy-2*s} L${x} ${gy-9*s} L${x+3*s} ${gy-11.5*s} L${x+cabL} ${gy-11.5*s} L${x+cabL} ${gy-2*s} Z`, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
  el("rect", {x:x+1*s, y:gy-10.5*s, width:3*s, height:3*s, fill:"var(--glass)"}, g);
  for (const w of [x+3.5*s, x+cabL-4*s, x+cabL+1*s, tx+tl-7*s, tx+tl-3*s]) el("circle", {cx:w, cy:gy-1.7*s, r:Math.max(1.4, 1.7*s), fill:"var(--dark)"}, g);
}
function car(g, x, gy, s, c){
  const L = c.unit * s, H = c.h * s;
  el("path", {d:`M${x} ${gy-.8*s} L${x} ${gy-H*.55} Q${x+L*.05} ${gy-H*.62} ${x+L*.22} ${gy-H*.62} L${x+L*.35} ${gy-H} L${x+L*.72} ${gy-H} L${x+L*.88} ${gy-H*.62} Q${x+L} ${gy-H*.6} ${x+L} ${gy-H*.4} L${x+L} ${gy-.8*s} Z`, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
  for (const w of [.2, .78]) el("circle", {cx:x+L*w, cy:gy-.9*s, r:Math.max(1.2, 1.1*s), fill:"var(--dark)"}, g);
}
function plane(g, x, gy, s, c){
  const L = c.unit * s, h = c.h, o = c.o, fus = o.fus * s, clear = Math.max(6 * s, h * s * .12), fb = gy - clear, ft = fb - fus, cy = (fb + ft) / 2;
  el("path", {d:`M${x+L*.78} ${ft+1} L${x+L*.9} ${gy-h*s} L${x+L*.975} ${gy-h*s} L${x+L*.99} ${cy}`, fill:soft(c.color), stroke:"var(--ink)", "stroke-width":SW}, g);
  el("path", {d:`M${x+fus*.9} ${ft} L${x+L*.82} ${ft} Q${x+L*.96} ${ft} ${x+L} ${cy-fus*.15} L${x+L*.9} ${fb} L${x+fus*.9} ${fb} Q${x} ${fb} ${x} ${cy+fus*.1} Q${x+fus*.15} ${ft} ${x+fus*.9} ${ft} Z`, fill:"var(--paper)", stroke:"var(--ink)", "stroke-width":SW}, g);
  if (o.hump) el("path", {d:`M${x+fus*.6} ${ft+fus*.05} Q${x+L*.1} ${ft-fus*.4} ${x+L*.3} ${ft-fus*.25} L${x+L*.32} ${ft}`, fill:"var(--paper)", stroke:"var(--ink)", "stroke-width":SW}, g);
  el("line", {x1:x+fus*.9, y1:cy-fus*.12, x2:x+L*.8, y2:cy-fus*.12, stroke:c.color, "stroke-width":Math.max(1, fus*.06), "stroke-dasharray":"2 2"}, g);
  el("path", {d:`M${x+fus*.35} ${cy-fus*.2} L${x+fus*.75} ${cy-fus*.2} L${x+fus*.8} ${cy-fus*.02} L${x+fus*.25} ${cy-fus*.02} Z`, fill:"var(--glass)"}, g);
  el("path", {d:`M${x+L*.36} ${cy+fus*.15} L${x+L*.55} ${cy+fus*.25} L${x+L*.5} ${cy+fus*.3} Z`, fill:"var(--metal)", stroke:"var(--ink)", "stroke-width":.7}, g);
  el("ellipse", {cx:x+L*.38, cy:fb+fus*.08, rx:Math.max(3, L*.045), ry:Math.max(2, fus*.22), fill:"var(--metal)", stroke:"var(--ink)", "stroke-width":.8}, g);
  el("path", {d:`M${x+L*.86} ${cy} L${x+L*.97} ${cy-fus*.05} L${x+L*.98} ${cy+fus*.08} Z`, fill:"var(--metal)"}, g);
  for (const gx of [x+L*.1, x+L*.48]){ el("line", {x1:gx, y1:fb, x2:gx, y2:gy-1.5*s, stroke:"var(--ink)", "stroke-width":1}, g); el("circle", {cx:gx, cy:gy-1.5*s, r:Math.max(1.4, 1.5*s), fill:"var(--dark)"}, g); }
}
function slab(g, x, gy, s, c){
  const L = c.unit * s, th = Math.max(5, 2.6 * s), o = c.o;
  el("rect", {x, y:gy-th, width:L, height:th, fill:o.fill, stroke:"var(--ink)", "stroke-width":SW}, g);
  if (o.yards) for (let yd = 10; yd < 120; yd += 10) el("line", {x1:x+yd*3*s, y1:gy-th, x2:x+yd*3*s, y2:gy, stroke:"#fff", "stroke-width": yd === 10 || yd === 110 ? 2 : 1}, g);
  el("line", {x1:x+L/2, y1:gy-th, x2:x+L/2, y2:gy, stroke:"#fff", "stroke-width":1.2}, g);
}
function whale(g, x, gy, s, c){
  const L = c.unit * s, H = c.h * s, b = gy - 1 * s, mid = b - H / 2;
  el("path", {d:`M${x} ${mid+H*.1} Q${x} ${b-H} ${x+L*.25} ${b-H} Q${x+L*.55} ${b-H*.95} ${x+L*.8} ${mid} L${x+L*.88} ${mid-H*.05} L${x+L} ${b-H*1.1} L${x+L*.96} ${mid+H*.05} L${x+L} ${b+H*.05} L${x+L*.88} ${mid+H*.12} Q${x+L*.5} ${b} ${x+L*.2} ${b} Q${x} ${b} ${x} ${mid+H*.1} Z`, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
  el("circle", {cx:x+L*.07, cy:mid, r:Math.max(1.2, .6*s), fill:"var(--paper)"}, g);
}
function tower(g, x, gy, s, c){
  const L = c.unit * s, H = c.h * s, b = gy - .5 * s;
  if (c.o && c.o.statue){
    el("path", {d:`M${x} ${b} L${x} ${b-H} L${x+L*.55} ${b-H*.85} L${x+L*.7} ${b-H*.75} Q${x+L*.78} ${b-H*.9} ${x+L*.82} ${b-H*.55} L${x+L*.97} ${b-H*.62} L${x+L} ${b-H*.48} L${x+L*.82} ${b-H*.38} L${x+L*.72} ${b-H*.15} L${x+L*.55} ${b-H*.1} Z`, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
    el("circle", {cx:x+L*.985, cy:b-H*.55, r:Math.max(2, 1.6*s), fill:"#e1a83a"}, g);
  } else {
    const tip = Math.min(L * .06, H * .9);
    el("path", {d:`M${x} ${b} L${x} ${b-H} L${x+L-tip} ${b-H*.8} L${x+L} ${b-H*.4} L${x+L-tip} ${b} Z`, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
  }
}
function wall(g, x, gy, s, c){
  const L = c.unit * s, H = c.h * s;
  el("rect", {x, y:gy-H, width:L, height:H, fill:c.color, stroke:"var(--ink)", "stroke-width":SW}, g);
  el("rect", {x:x+L*.28, y:gy-H*.85, width:L*.42, height:H*.6, fill:"#1c4430", stroke:"#d9e6dc", "stroke-width":.6}, g);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) el("rect", {x:x+L*.3+k*L*.038, y:gy-H*.78+r*H*.17, width:L*.028, height:H*.1, fill:"#eaf2ec", opacity:.75}, g);
}
const DRAW = {lrv, metro, cr, acela, bus, truck, car, plane, slab, whale, tower, wall};
const drawHeight = c => c.kind === "cr" ? 15.5 : c.h;

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
  const h1 = 12 * s, h2 = Math.max(drawHeight(c) * s, 8);
  const top = 26, gy1 = top + Math.max(h1, 10) + 30, gy2 = gy1 + 84 + h2, rulerY = gy2 + 52;
  cmpSvg.setAttribute("viewBox", `0 0 1000 ${rulerY + 34}`);
  const gridG = el("g", {}, cmpSvg);

  monoText(cmpSvg, X0, top, "TYPE 10 SUPERCAR", "var(--accent)");
  el("line", {x1:0, y1:gy1, x2:1000, y2:gy1, stroke:"var(--rule)", "stroke-width":1.5}, cmpSvg);
  lrv(el("g", {}, cmpSvg), X0, gy1, s, BY.t10, 1);
  dim(cmpSvg, X0, gy1 + 18, T10, s, "var(--accent)", "arG");

  const g2 = el("g", {}, cmpSvg);
  const cw = carWord(c, n);
  monoText(g2, X0, gy1 + 56, `${c.approx ? "≈ " : ""}${c.name.toUpperCase()}${cw ? " · " + cw.toUpperCase() : ""}`, "var(--cmp)");
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
