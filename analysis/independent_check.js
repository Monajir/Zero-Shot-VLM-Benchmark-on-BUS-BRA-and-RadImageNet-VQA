// Independent re-check of v4's new statistics, written separately from verify_numbers.js:
// different RNG (xorshift), exact McNemar via a different summation, exact sign-flip enumeration
// impossible at n=500, so a 400k Monte-Carlo run with its own RNG; Holm done by hand.
const load = require('./csv.js');
const R = require('path').resolve(__dirname, '../..') + '/';
let s = 0x9e3779b9 >>> 0;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
const f = p => load(R + p);
const bb = { Q: f('BUS_BRA/Results/Final/Qwen/classification_results_qwen2vl_2b.csv'), V: f('BUS_BRA/Results/Final/MedVLM-R1/classification_results_medvlm_r1.csv'), G: f('BUS_BRA/Results/Final/Gemma/classification_results_gemma3_4b.csv'), M: f('BUS_BRA/Results/Final/MedGemma/classification_results_medgemma_4b.csv') };
const rv = { Q: f('RadImageNet_VQA/QWEN/vqa_results_qwen2vl_2b.csv'), V: f('RadImageNet_VQA/MEDVLM/vqa_results_medvlm_r1.csv'), G: f('RadImageNet_VQA/GEMMA 3/vqa_results_gemma3_4b.csv'), M: f('RadImageNet_VQA/MEDGEMMA/vqa_results_medgemma_4b.csv') };
const bn = { Q: f('BanglaMedVQA/QWEN/bnvqa_results_qwen2vl_2b.csv'), V: f('BanglaMedVQA/MEDVLM/bnvqa_results_medvlm_r1.csv'), G: f('BanglaMedVQA/Gemma/bnvqa_results_gemma3_4b.csv'), M: f('BanglaMedVQA/Medgemma/bnvqa_results_medgemma_4b.csv') };
// alignment by key, not by position
const key = { bb: r => r.question_id, rv: r => r.idx, bn: r => r.idx };
function align(d, k) { const m = {}; for (const x in d) m[x] = new Map(d[x].map(r => [k(r), r])); const ids = d.Q.map(k); for (const x in d) if (ids.some(i => !m[x].has(i))) throw 'misaligned ' + x; return ids.map(i => ({ Q: m.Q.get(i), V: m.V.get(i), G: m.G.get(i), M: m.M.get(i) })); }
const BB = align(bb, key.bb), RV = align(rv, key.rv), BN = align(bn, key.bn);
const acc = r => (r.true_answer === r.predicted_answer ? 1 : 0), lave = r => +r.lave;
// exact two-sided McNemar: P(X<=min) doubled, Binomial(b+c, .5), via log-space recursion
function mcn(b, c) { const n = b + c, k = Math.min(b, c); if (n === 0) return 1; let lp = -n * Math.LN2, p = Math.exp(lp); for (let i = 1; i <= k; i++) { lp += Math.log((n - i + 1) / i); p += Math.exp(lp); } return Math.min(1, 2 * p); }
function signflip(d, B = 400000) { const obs = Math.abs(d.reduce((a, b) => a + b, 0)); const nz = d.filter(x => x !== 0); let c = 0; for (let b = 0; b < B; b++) { let t = 0; for (const x of nz) t += rnd() < 0.5 ? -x : x; if (Math.abs(t) >= obs - 1e-9) c++; } return (c + 1) / (B + 1); }
function boot(d, B = 20000) { const n = d.length, m = new Float64Array(B); for (let b = 0; b < B; b++) { let t = 0; for (let i = 0; i < n; i++) t += d[(rnd() * n) | 0]; m[b] = t / n; } m.sort(); return [m[(0.025 * B) | 0], m[(0.975 * B) | 0]]; }
const out = [];
function cmp(name, rows, a, b, sc, binary) {
  const d = rows.map(r => sc(r[a]) - sc(r[b])); const mean = d.reduce((x, y) => x + y, 0) / d.length;
  let bb_ = 0, cc = 0; d.forEach(x => { if (x > 0) bb_++; if (x < 0) cc++; });
  const p = binary ? mcn(bb_, cc) : signflip(d); const ci = boot(d);
  const same = rows.filter(r => r[a].predicted_answer.trim().toLowerCase() === r[b].predicted_answer.trim().toLowerCase()).length;
  out.push({ name, p }); console.log(name.padEnd(28), 'diff', (100 * mean).toFixed(2), 'CI', (100 * ci[0]).toFixed(1), (100 * ci[1]).toFixed(1), binary ? `McNemar b=${bb_} c=${cc}` : 'perm', 'p', p.toPrecision(3), 'same', same, '/', rows.length);
}
cmp('BUS-BRA MedVLM-Qwen', BB, 'V', 'Q', acc, true);
cmp('BUS-BRA MedGemma-Gemma', BB, 'M', 'G', acc, true);
cmp('RIN MedVLM-Qwen', RV, 'V', 'Q', acc, true);
cmp('RIN MedGemma-Gemma', RV, 'M', 'G', acc, true);
cmp('BN MedVLM-Qwen (LAVE)', BN, 'V', 'Q', lave, false);
cmp('BN MedGemma-Gemma (LAVE)', BN, 'M', 'G', lave, false);
// Holm by hand
const sorted = out.map((o, i) => [o.p, i]).sort((x, y) => x[0] - y[0]); let run = 0; const adj = [];
sorted.forEach(([p, i], k) => { run = Math.max(run, Math.min(1, (6 - k) * p)); adj[i] = run; });
out.forEach((o, i) => console.log('Holm', o.name.padEnd(28), adj[i].toPrecision(3)));
// Rule-based modality scoring, independent regexes (word-level)
const norm = s => s.toLowerCase().replace(/[।.,()]/g, ' ');
function modality(s) { const t = norm(s); if (/(^|\s)(x-ray|xray|radiograph|radiography)(\s|$)|এক্স-রে|chest x-ray/.test(t) || /এক্স/.test(t)) return 'X'; if (/(^|\s)ct(\s|$)|computed tomography|সিটি/.test(t)) return 'CT'; if (/(^|\s)f?mri(\s|$)|এমআরআই/.test(t)) return 'MR'; if (/ultrasound|আল্?ট্রাসাউন্ড/.test(t)) return 'US'; return null; }
const ruleSc = r => r.category === 'modality' ? (modality(r.true_answer) && modality(r.true_answer) === modality(r.predicted_answer) ? 1 : 0) : +r.lave;
for (const x of ['Q', 'V', 'G', 'M']) { const m = BN.map(r => r[x]).filter(r => r.category === 'modality'); console.log('modality rule-correct', x, m.filter(r => ruleSc(r) === 1).length, '| CXR', m.filter(r => r.source === 'chest_xray' && ruleSc(r) === 1).length); }
cmp('BN MedGemma-Gemma (rule mod.)', BN, 'M', 'G', ruleSc, false);
cmp('BN MedVLM-Qwen (rule mod.)', BN, 'V', 'Q', ruleSc, false);
// cell-level claims
const cell = (x, s, c) => BN.map(r => r[x]).filter(r => r.source === s && r.category === c);
const cm = (x, s, c) => (100 * cell(x, s, c).reduce((a, r) => a + +r.lave, 0) / 50).toFixed(1);
console.log('CXR organ M-G', (cm('M', 'chest_xray', 'organ') - cm('G', 'chest_xray', 'organ')).toFixed(1), 'CXR modality M-G', (cm('M', 'chest_xray', 'modality') - cm('G', 'chest_xray', 'modality')).toFixed(1));
console.log('MedGemma CXR organ "Chest"', cell('M', 'chest_xray', 'organ').filter(r => /^chest$/i.test(r.predicted_answer.trim())).length,
  '| Gemma CXR organ lung-type answers', cell('G', 'chest_xray', 'organ').filter(r => /lung|ফুসফুস|প্লুরাল/i.test(r.predicted_answer)).length,
  '| Gemma CJK answers', cell('G', 'chest_xray', 'organ').filter(r => /[\u4e00-\u9fff]/.test(r.predicted_answer)).map(r => r.predicted_answer + '/' + r.lave).join(','));
const radio = BN.map(r => r.G).filter(r => r.category === 'modality' && /radiograph/i.test(r.predicted_answer));
console.log('Gemma Radiograph(y) answers', radio.length, 'mean LAVE', (radio.reduce((a, r) => a + +r.lave, 0) / radio.length).toFixed(3), 'all on X-ray refs', radio.every(r => modality(r.true_answer) === 'X'), 'sources', [...new Set(radio.map(r => r.source))].join(','));
const L = x => BN.map(r => +r[x].lave).reduce((a, b) => a + b, 0) / 5;
console.log('LAVE means', ['Q', 'V', 'G', 'M'].map(x => x + ' ' + L(x).toFixed(2)).join(' | '), 'share gone', ((7.38 - 4.86) / 7.38).toFixed(3));
