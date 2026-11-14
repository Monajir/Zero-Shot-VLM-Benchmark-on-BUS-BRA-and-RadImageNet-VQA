// Re-computes every number reported in the paper from the saved result CSVs.
// Usage (Node.js, no dependencies): node paper_v3/analysis/verify_numbers.js
const load = require('./csv.js');
const R = require('path').resolve(__dirname, '../..') + '/';
const pct = x => (100 * x).toFixed(1);
function lgam(n){let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s}
const C=(n,k)=>Math.exp(lgam(n)-lgam(k)-lgam(n-k));
function mcnemar(b,c){const n=b+c,k=Math.min(b,c);let p=0;for(let i=0;i<=k;i++)p+=C(n,i)/2**n;return Math.min(1,2*p)}
function binomGE(k,n,p0){let s=0;for(let i=k;i<=n;i++)s+=C(n,i)*p0**i*(1-p0)**(n-i);return s}
function wilson(k,n,z=1.959964){const p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-h,c+h]}
let seed=42;const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
function boot(v,B=5000){const n=v.length,m=[];for(let b=0;b<B;b++){let s=0;for(let i=0;i<n;i++)s+=v[Math.floor(rnd()*n)];m.push(s/n)}m.sort((a,b)=>a-b);return [m[Math.floor(.025*B)],m[Math.floor(.975*B)]]}
const mean=v=>v.reduce((a,b)=>a+b,0)/v.length;
function rank(v){const o=v.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]);const r=Array(v.length);for(let i=0;i<o.length;){let j=i;while(j+1<o.length&&o[j+1][0]===o[i][0])j++;for(let k=i;k<=j;k++)r[o[k][1]]=(i+j)/2+1;i=j+1}return r}
function spearman(a,b){const ra=rank(a),rb=rank(b),ma=mean(ra),mb=mean(rb);let n=0,da=0,db=0;for(let i=0;i<a.length;i++){n+=(ra[i]-ma)*(rb[i]-mb);da+=(ra[i]-ma)**2;db+=(rb[i]-mb)**2}return n/Math.sqrt(da*db)}

const BB={Qwen:'Qwen/classification_results_qwen2vl_2b.csv',MedVLM:'MedVLM-R1/classification_results_medvlm_r1.csv',Gemma:'Gemma/classification_results_gemma3_4b.csv',MedGemma:'MedGemma/classification_results_medgemma_4b.csv'};
const RV={Qwen:'QWEN/vqa_results_qwen2vl_2b.csv',MedVLM:'MEDVLM/vqa_results_medvlm_r1.csv',Gemma:'GEMMA 3/vqa_results_gemma3_4b.csv',MedGemma:'MEDGEMMA/vqa_results_medgemma_4b.csv'};
const BN={Qwen:'QWEN/bnvqa_results_qwen2vl_2b.csv',MedVLM:'MEDVLM/bnvqa_results_medvlm_r1.csv',Gemma:'Gemma/bnvqa_results_gemma3_4b.csv',MedGemma:'Medgemma/bnvqa_results_medgemma_4b.csv'};
const M=['Qwen','MedVLM','Gemma','MedGemma'];
const bb={},rv={},bn={};
for(const m of M){bb[m]=load(R+'BUS_BRA/Results/Final/'+BB[m]);rv[m]=load(R+'RadImageNet_VQA/'+RV[m]);bn[m]=load(R+'BanglaMedVQA/'+BN[m]);}
const key={bb:r=>r.question_id,rv:r=>r.idx+'|'+r.question_id,bn:r=>r.idx+'|'+r.image_id+'|'+r.question};
for(const [n,d] of [['bb',bb],['rv',rv],['bn',bn]]){const k0=d.Qwen.map(key[n]).join();for(const m of M)if(d[m].map(key[n]).join()!==k0)console.log('ITEM ORDER MISMATCH',n,m);console.log(n,'n=',d.Qwen.length,'unique',new Set(d.Qwen.map(key[n])).size)}
const acc=r=>r.true_answer===r.predicted_answer?1:0;

console.log('\n=== BUS-BRA ===');
{const t={};bb.Qwen.forEach(r=>t[r.true_answer]=(t[r.true_answer]||0)+1);console.log('labels',t,'unique cases',new Set(bb.Qwen.map(r=>r.question_id.split('-')[0])).size);}
for(const m of M){const d=bb[m],k=d.reduce((s,r)=>s+acc(r),0),n=d.length,w=wilson(k,n);
 const mal=d.filter(r=>r.predicted_answer==='malignant').length,tp=d.filter(r=>r.true_answer==='malignant'&&r.predicted_answer==='malignant').length,tn=d.filter(r=>r.true_answer==='benign'&&r.predicted_answer==='benign').length;
 const bad=d.filter(r=>!['benign','malignant'].includes(r.predicted_answer)).length;
 console.log(m,'acc',pct(k/n),'CI',pct(w[0]),pct(w[1]),'malig',mal,'sens',pct(tp/200),'spec',pct(tn/200),'p',binomGE(k,n,.5).toFixed(4),'unparsed',bad,'rawdiff',d.filter(r=>r.raw_output.trim().toLowerCase()!==r.predicted_answer).length)}

function pair(name,A,B,score,same=(a,b)=>a.predicted_answer===b.predicted_answer){let b=0,c=0,s=0;const d=A.map((r,i)=>{const x=score(r),y=score(B[i]);if(x>y)b++;if(y>x)c++;if(same(r,B[i]))s++;return x-y});const ci=boot(d);
 console.log(name,'diff',(100*mean(d)).toFixed(2),'CI',pct(ci[0]),pct(ci[1]),'med>base',b,'base>med',c,'McNemar',mcnemar(b,c).toFixed(4),'identical',s,'/',A.length,pct(s/A.length)+'%')}
console.log('\n=== PAIRS ===');
pair('BB MedVLM-Qwen',bb.MedVLM,bb.Qwen,acc);pair('BB MedGemma-Gemma',bb.MedGemma,bb.Gemma,acc);
pair('RV MedVLM-Qwen',rv.MedVLM,rv.Qwen,acc);pair('RV MedGemma-Gemma',rv.MedGemma,rv.Gemma,acc);
const lave=r=>+r.lave;
pair('BN MedVLM-Qwen',bn.MedVLM,bn.Qwen,lave);pair('BN MedGemma-Gemma',bn.MedGemma,bn.Gemma,lave);
pair('BN MedGemma-Gemma (identical after lowercase/trim)',bn.MedGemma,bn.Gemma,lave,(a,b)=>a.predicted_answer.trim().toLowerCase()===b.predicted_answer.trim().toLowerCase());

console.log('\n=== RadImageNet-VQA ===');
const G=['anatomy_mcq','anatomy_yesno','abnormality_yesno','pathology_yesno','pathology_mcq'];
for(const m of M){const d=rv[m];const row=G.map(g=>{const x=d.filter(r=>r.group===g);return x.reduce((s,r)=>s+acc(r),0)+'/'+x.length});
 const yn=d.filter(r=>/yesno/.test(r.group));const ys=g=>{const x=d.filter(r=>r.group===g);return pct(x.filter(r=>r.predicted_answer==='yes').length/x.length)};
 const pm=d.filter(r=>r.group==='pathology_mcq'),lc={};pm.forEach(r=>lc[r.predicted_answer]=(lc[r.predicted_answer]||0)+1);
 const am=d.filter(r=>r.group==='anatomy_mcq'),la={};am.forEach(r=>la[r.predicted_answer]=(la[r.predicted_answer]||0)+1);
 const k=d.reduce((s,r)=>s+acc(r),0);const w=wilson(k,500);
 const hip=d.filter(r=>r.anatomy==='hip');
 console.log(m,'groups',row.join(' '),'overall',pct(k/500),'CI',pct(w[0]),pct(w[1]),'p',binomGE(k,500,.4).toExponential(2),
  '| yes% anat',ys('anatomy_yesno'),'abn',ys('abnormality_yesno'),'path',ys('pathology_yesno'),'all',pct(yn.filter(r=>r.predicted_answer==='yes').length/300),
  '| pathMCQ letters',JSON.stringify(lc),'anatMCQ letters',JSON.stringify(la),'| hip',hip.reduce((s,r)=>s+acc(r),0)+'/'+hip.length,
  '| preds',JSON.stringify([...new Set(d.map(r=>r.predicted_answer))]));
 for(const g of G){const x=d.filter(r=>r.group===g),kk=x.reduce((s,r)=>s+acc(r),0),ww=wilson(kk,100);process.stdout.write(` ${g}:${kk} [${pct(ww[0])}-${pct(ww[1])}] p=${binomGE(kk,100,/mcq/.test(g)?.25:.5).toFixed(3)}`)}console.log();}
{const t={};rv.Qwen.filter(r=>r.group==='pathology_mcq').forEach(r=>t[r.true_answer]=(t[r.true_answer]||0)+1);console.log('pathMCQ true',t);
 const ty={};rv.Qwen.filter(r=>/yesno/.test(r.group)).forEach(r=>{ty[r.group+':'+r.true_answer]=(ty[r.group+':'+r.true_answer]||0)+1});console.log('yesno truth',ty);
 const allWrong=rv.Qwen.filter((r,i)=>M.every(m=>!acc(rv[m][i]))).length;console.log('all four wrong',allWrong);
 const an={};rv.Qwen.forEach(r=>an[r.anatomy]=(an[r.anatomy]||0)+1);console.log('anatomy counts',JSON.stringify(an));
 for(const g of ['anatomy_mcq','anatomy_yesno']){const A=rv.MedGemma.filter(r=>r.group===g),B=rv.Gemma.filter(r=>r.group===g);let b=0,c=0;A.forEach((r,i)=>{const x=acc(r),y=acc(B[i]);if(x>y)b++;if(y>x)c++});console.log('MedGemma vs Gemma',g,b,c,'p',mcnemar(b,c).toFixed(3))}
 const abn=rv.Gemma.filter(r=>r.group==='abnormality_yesno');console.log('Gemma yes on abnormality',abn.filter(r=>r.predicted_answer==='yes').length);
 console.log('raw outputs single token:',M.map(m=>rv[m].filter(r=>/\s/.test(r.raw_output.trim())).length).join(','));}

console.log('\n=== BanglaMedVQA ===');
const hasBn=s=>/[\u0980-\u09FF]/.test(s);
{const t={};bn.Qwen.forEach(r=>{const k=r.source+':'+r.category;t[k]=(t[k]||0)+1});console.log('cells',JSON.stringify(t));
 const ab={};bn.Qwen.filter(r=>r.category==='abnormality').forEach(r=>{const k=r.source+':'+r.true_answer;ab[k]=(ab[k]||0)+1});console.log('abn refs',JSON.stringify(ab));}
const CATS=['modality','organ','condition','abnormality','position'];
for(const m of M){const d=bn[m];const L=d.map(lave),ci=boot(L);
 const em=d.filter(r=>r.correct==='True').length,emn=d.filter(r=>r.correct_norm==='True').length;
 console.log(m,'EM',pct(em/500),'EMnorm',pct(emn/500),'BERT',pct(mean(d.map(r=>+r.bertscore_f1))),'LAVE',pct(mean(L)),'CI',pct(ci[0]),pct(ci[1]),
  'noBangla',pct(d.filter(r=>!hasBn(r.predicted_answer)).length/500),'is_english col',pct(d.filter(r=>r.is_english==='True').length/500),'empty',d.filter(r=>r.is_empty==='True').length,
  '| cat LAVE',CATS.map(c=>c+':'+pct(mean(d.filter(r=>r.category===c).map(lave)))).join(' '),
  '| spearman BERT-LAVE',spearman(d.map(r=>+r.bertscore_f1),L).toFixed(2),
  '| BERT on LAVE=0',pct(mean(d.filter(r=>+r.lave===0).map(r=>+r.bertscore_f1))),
  '| think tags',d.filter(r=>/<think>|<answer>/.test(r.raw_output)).length,'lave fails',d.filter(r=>r.lave===''||isNaN(+r.lave)).length)}
// cell-level paired MedGemma-Gemma
for(const s of ['chest_xray','medicat'])for(const c of CATS){const idx=bn.Qwen.map((r,i)=>i).filter(i=>bn.Qwen[i].source===s&&bn.Qwen[i].category===c);
 for(const [a,b] of [['MedGemma','Gemma'],['MedVLM','Qwen']]){const d=idx.map(i=>lave(bn[a][i])-lave(bn[b][i]));const ci=boot(d);if(ci[0]>0||ci[1]<0||a==='MedGemma')console.log(' cell',s,c,a+'-'+b,(100*mean(d)).toFixed(1),'CI',pct(ci[0]),pct(ci[1]))}}
// yes/no audit
const yesBn='হ্যাঁ',noBn='না';
const yn=a=>{a=a.trim().toLowerCase().replace(/[।.!]+$/,'');if(a==='yes'||a===yesBn)return 'yes';if(a==='no'||a===noBn)return 'no';return null};
for(const m of M){const d=bn[m].filter(r=>r.category==='abnormality');const ref=r=>r.true_answer.trim()===yesBn?'yes':r.true_answer.trim()===noBn?'no':'?';
 const clear=d.filter(r=>yn(r.predicted_answer));const cor=clear.filter(r=>yn(r.predicted_answer)===ref(r));
 console.log(m,'abn refs',JSON.stringify(d.reduce((o,r)=>(o[ref(r)]=(o[ref(r)]||0)+1,o),{})),'clear yn',clear.length,'yes',clear.filter(r=>yn(r.predicted_answer)==='yes').length,'correct',cor.length,'credited',cor.filter(r=>+r.lave>0).length,
  '| EN Yes correct',cor.filter(r=>r.predicted_answer.trim().toLowerCase().startsWith('yes')).length,'->lave',JSON.stringify([...new Set(cor.filter(r=>/^yes/i.test(r.predicted_answer.trim())).map(r=>r.lave))]),
  '| BN yes',d.filter(r=>r.predicted_answer.trim().startsWith(yesBn)).map(r=>r.lave+'/'+ref(r)).join(','));}
// modality audit
const modOf=s=>{s=s.toLowerCase();if(/x-?ray|এক্স|radiograph/.test(s))return 'xray';if(/\bct\b|computed tomography|সিটি/.test(s))return 'ct';if(/mri|magnetic|এমআরআই/.test(s))return 'mri';if(/ultra|sonog|আল্ট্রা/.test(s))return 'us';return null};
{const refs={};bn.Qwen.filter(r=>r.category==='modality').forEach(r=>{const k=modOf(r.true_answer)||r.true_answer;refs[k]=(refs[k]||0)+1});console.log('modality refs',JSON.stringify(refs));}
for(const m of M){const d=bn[m].filter(r=>r.category==='modality');const ok=d.filter(r=>modOf(r.true_answer)&&modOf(r.true_answer)===modOf(r.predicted_answer));
 const by=t=>{const x=ok.filter(r=>modOf(r.true_answer)===t);return x.length+'@'+(x.length?mean(x.map(lave)).toFixed(2):'-')};
 console.log(m,'modality rule-correct',ok.length,'xray',by('xray'),'ct',by('ct'),'mri',by('mri'),'us',by('us'))}
// misc claims
const top=(arr)=>{const c={};arr.forEach(x=>c[x]=(c[x]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3)};
for(const m of M){console.log(m,'CXR organ top',JSON.stringify(top(bn[m].filter(r=>r.source==='chest_xray'&&r.category==='organ').map(r=>r.predicted_answer))),
 'CXR condition top',JSON.stringify(top(bn[m].filter(r=>r.source==='chest_xray'&&r.category==='condition').map(r=>r.predicted_answer.toLowerCase()))),
 'letter answers MedICaT',bn[m].filter(r=>r.source==='medicat'&&/^[A-D]([).:]|$)/.test(r.predicted_answer.trim())).length)}

// ---- Table 6 (LAVE audit) and the modality-LAVE sentence, with the exact rules stated in the paper ----
console.log('\n=== LAVE audit (Table 6) ===');
const refYN=s=>s.replace(/[।.\s]/g,'')===yesBn?'yes':s.replace(/[।.\s]/g,'')===noBn?'no':null;
const enYN=s=>{s=s.trim().toLowerCase().replace(/^a: /,'');if(/^there is no abnormal/.test(s))return'no';if(s.startsWith('yes'))return'yes';if(s.startsWith('no')&&!s.startsWith('none')&&!s.startsWith('not '))return'no';return null};
const mod2=s=>{s=s.toLowerCase();if(/x-?ray|এক্স|radiograph/.test(s))return'xray';if(/\bct\b|computed tomography|সিটি/.test(s))return'ct';if(/\bf?mri\b|magnetic resonance|এমআরআই/.test(s))return'mri';if(/ultrasound|sonograph|আল্?ট্রাসাউন্ড/.test(s))return'us';return null};
for(const m of M){const ab=bn[m].filter(r=>r.category==='abnormality');
 const enOK=ab.filter(r=>enYN(r.predicted_answer)&&enYN(r.predicted_answer)===refYN(r.true_answer));
 const bnAns=ab.filter(r=>/^(হ্যাঁ|না)[।.]?$/.test(r.predicted_answer.trim()));
 const enAll=ab.filter(r=>enYN(r.predicted_answer));
 const md=bn[m].filter(r=>r.category==='modality');const ok=md.filter(r=>mod2(r.true_answer)===mod2(r.predicted_answer));
 const avg=t=>{const x=ok.filter(r=>mod2(r.true_answer)===t&&(t!=='xray'||/x-?ray/i.test(r.predicted_answer)));return x.length+'@'+(x.reduce((s,r)=>s+ +r.lave,0)/x.length).toFixed(2)};
 const rad=md.filter(r=>/radiograph/i.test(r.predicted_answer));
 console.log(m,'correct EN yes/no',enOK.length,'credited',enOK.filter(r=>+r.lave>0).length,'| EN yes/no answers',enAll.length,'of which yes',enAll.filter(r=>enYN(r.predicted_answer)==='yes').length,
  '| Bangla yes/no answers',bnAns.map(r=>r.predicted_answer.trim()+'/'+refYN(r.true_answer)+'/'+r.lave).join(','),
  '| modality correct',ok.length,'X-ray',avg('xray'),'CT',avg('ct'),'MRI',avg('mri'),'| radiograph answers',rad.length+'@'+(rad.length?(rad.reduce((s,r)=>s+ +r.lave,0)/rad.length).toFixed(2):'-'))}

// ---- Paired sign-flip permutation test (two-sided) for every medical-minus-base comparison, and Holm correction ----
console.log('\n=== Paired permutation tests (100,000 sign flips) + Holm ===');
seed=7;
function signflip(d,B=100000){const n=d.length,obs=Math.abs(d.reduce((a,b)=>a+b,0));let c=0;for(let b=0;b<B;b++){let s=0;for(let i=0;i<n;i++)s+=rnd()<0.5?-d[i]:d[i];if(Math.abs(s)>=obs-1e-12)c++}return (c+1)/(B+1)}
const comps=[['BUS-BRA MedVLM-Qwen',bb.MedVLM,bb.Qwen,acc],['BUS-BRA MedGemma-Gemma',bb.MedGemma,bb.Gemma,acc],['RIN MedVLM-Qwen',rv.MedVLM,rv.Qwen,acc],['RIN MedGemma-Gemma',rv.MedGemma,rv.Gemma,acc],['BN MedVLM-Qwen',bn.MedVLM,bn.Qwen,lave],['BN MedGemma-Gemma',bn.MedGemma,bn.Gemma,lave]];
const ps=comps.map(([n,A,B,f])=>{const d=A.map((r,i)=>f(r)-f(B[i]));return [n,d.every(x=>x===0)?1:signflip(d)]});
const order=ps.map((p,i)=>i).sort((a,b)=>ps[a][1]-ps[b][1]);let run=0;const holm=Array(ps.length);
order.forEach((i,k)=>{run=Math.max(run,Math.min(1,(ps.length-k)*ps[i][1]));holm[i]=run});
ps.forEach(([n,p],i)=>console.log(n,'perm p',p.toFixed(5),'Holm',holm[i].toFixed(4)));

// ---- Sensitivity analysis: BanglaMedVQA medical-minus-base with modality answers scored by the rule instead of LAVE ----
console.log('\n=== Bangla gain with modality rule-scored ===');
seed=42;
const scRule=r=>r.category==='modality'?(mod2(r.true_answer)&&mod2(r.true_answer)===mod2(r.predicted_answer)?1:0):+r.lave;
for(const [n,A,B] of [['MedGemma-Gemma',bn.MedGemma,bn.Gemma],['MedVLM-Qwen',bn.MedVLM,bn.Qwen]]){
 const d=A.map((r,i)=>scRule(r)-scRule(B[i]));const ci=boot(d);
 console.log(n,'diff',(100*mean(d)).toFixed(2),'CI',pct(ci[0]),pct(ci[1]),'perm p',signflip(d).toFixed(5),
  '| modality only rule-correct diff',A.filter((r,i)=>r.category==='modality').length,
  '| CXR modality rule-correct',A.filter(r=>r.source==='chest_xray'&&r.category==='modality'&&mod2(r.true_answer)===mod2(r.predicted_answer)).length,'vs',B.filter(r=>r.source==='chest_xray'&&r.category==='modality'&&mod2(r.true_answer)===mod2(r.predicted_answer)).length);}
