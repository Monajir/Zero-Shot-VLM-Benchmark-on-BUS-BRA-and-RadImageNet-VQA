"""Generate standalone result figures; never edit the manuscript or source CSVs.

Requires matplotlib, XeLaTeX and pdftoppm. Run with Python from any directory.
The forest plot preserves Table 3's rounded values and intervals (no rebootstrap).
Bangla text is typeset with XeLaTeX to preserve Bengali shaping.
"""
from pathlib import Path
import csv
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

os.environ.setdefault('MPLCONFIGDIR', '/tmp/vlm-matplotlib-config')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
MODELS = [
    ('Qwen2-VL-2B', 'QWEN', 'qwen2vl_2b'),
    ('MedVLM-R1', 'MEDVLM', 'medvlm_r1'),
    ('Gemma 3 4B', 'Gemma', 'gemma3_4b'),
    ('MedGemma 4B', 'Medgemma', 'medgemma_4b'),
]
data, sources = {}, {}
for label, folder, tag in MODELS:
    path = ROOT / 'BanglaMedVQA' / folder / f'bnvqa_results_{tag}.csv'
    rows = list(csv.DictReader(path.open(encoding='utf-8')))
    assert len(rows) == 500 and len({r['idx'] for r in rows}) == 500
    data[label] = {r['idx']: r for r in rows}
    sources[str(path.relative_to(ROOT))] = hashlib.sha256(path.read_bytes()).hexdigest()
base = data['Qwen2-VL-2B']
for records in data.values():
    for idx, r in records.items():
        assert all(r[k] == base[idx][k] for k in ['image_id', 'source', 'category', 'question', 'true_answer'])

plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11,
                     'axes.spines.top': False, 'axes.spines.right': False,
                     'pdf.fonttype': 42, 'svg.fonttype': 'none'})
def save(fig, name):
    for ext in ('png', 'pdf'):
        fig.savefig(OUT / f'{name}.{ext}', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)

# Source: current manuscript Table 3, not newly estimated bootstrap limits.
# Identical BUS-BRA answers imply an exactly zero paired difference in every resample.
forest = [
    ('BUS-BRA', 'Accuracy difference (percentage points)', [(0., 0., 0.), (7.3, -.3, 15.)]),
    ('RadImageNet-VQA', 'Accuracy difference (percentage points)', [(.8, -1.2, 2.8), (-1.8, -7.2, 3.6)]),
    ('BanglaMedVQA', 'LAVE difference (points on a 0–100 scale)', [(.8, -.3, 2.), (7.4, 4.8, 10.)]),
]
fig, axes = plt.subplots(3, 1, figsize=(9.2, 7.5))
fig.subplots_adjust(left=.28, right=.74, top=.91, bottom=.18, hspace=1.05)
fig.suptitle('Medical versus general-purpose models', fontsize=17, fontweight='bold', y=.98)
for ax, (title, xlabel, vals) in zip(axes, forest):
    ax.axvline(0, color='#68717b', lw=1, ls='--')
    for y, (point, low, high), color, marker in zip([1, 0], vals, ['#28658b', '#b55328'], ['o', 's']):
        ax.errorbar(point, y, xerr=[[point-low], [high-point]], fmt=marker,
                    color=color, capsize=5, ms=7, lw=2)
        text = f'{point:+.1f} [{low:+.1f}, {high:+.1f}]'
        if low == high == 0:
            text = '0.0 [0.0, 0.0]'
        ax.text(1.04, y, text, transform=ax.get_yaxis_transform(), va='center', fontsize=11)
    ax.set(yticks=[1, 0], yticklabels=['MedVLM-R1 − Qwen2-VL', 'MedGemma − Gemma 3'],
           ylim=(-.55, 1.55), xlim=(-9, 17), xticks=[-5, 0, 5, 10, 15], xlabel=xlabel)
    ax.set_title(title, loc='left', fontsize=12, fontweight='bold')
    ax.spines['left'].set_visible(False)
    ax.tick_params(axis='y', length=0, pad=10)
    ax.grid(axis='x', alpha=.15)
fig.text(.28, .035, 'Points: medical − general score; bars: 95% paired bootstrap intervals.\n'
         'Values retain Table 3 rounding. LAVE is a judge score, not clinical accuracy.', fontsize=10, color='#46505b')
save(fig, 'paired_model_forest')

counts = []
for label, _, _ in MODELS:
    rows = list(data[label].values())
    present = sum(any('\u0980' <= c <= '\u09ff' for c in r['predicted_answer']) for r in rows)
    counts.append({'model': label, 'with_bangla_script': present, 'without_bangla_script': 500-present})
assert [r['with_bangla_script'] for r in counts] == [90, 54, 50, 9]
fig, ax = plt.subplots(figsize=(10, 4.8))
fig.subplots_adjust(left=.2, right=.94, top=.78, bottom=.22)
ys = [3.3, 2.3, .9, -.1]
for y, r in zip(ys, counts):
    p = r['with_bangla_script']/5
    ax.barh(y, p, height=.64, color='#2c7d88', label='Contains Bangla script' if y == ys[0] else None)
    ax.barh(y, 100-p, left=p, height=.64, color='#dde5ec', label='No Bangla script' if y == ys[0] else None)
    ax.text(p+(100-p)/2, y, f'{100-p:.1f}%  ({r["without_bangla_script"]}/500)', ha='center', va='center', color='#243440')
    if p >= 9:
        ax.text(p/2, y, f'{p:.1f}%', ha='center', va='center', color='white', fontweight='bold', fontsize=10)
    else:
        ax.annotate(f'{p:.1f}%', xy=(p/2, y-.32), xytext=(5, y-.65), ha='center', fontsize=10,
                    arrowprops={'arrowstyle':'-', 'color':'#2c7d88'})
ax.set(yticks=ys, yticklabels=[r['model'] for r in counts], xlim=(0,100), ylim=(-1,4),
       xlabel='Share of answers (%)', xticks=[0,20,40,60,80,100])
ax.spines['left'].set_visible(False)
ax.tick_params(axis='y', length=0)
ax.legend(loc='lower left', bbox_to_anchor=(0,1.01), frameon=False, ncol=2)
fig.suptitle('Bangla-script presence in BanglaMedVQA answers', fontsize=16, fontweight='bold', y=.97)
fig.text(.2,.055,'500 answers per model. Script presence includes mixed-language answers.\n'
         'Absence of Bangla script does not by itself establish English-only output.', fontsize=10, color='#46505b')
save(fig, 'bangla_script_presence')

# Chosen examples are retrieved by stable sample idx; all text and scores below are asserted.
q = data['Qwen2-VL-2B']['352']
m = data['MedVLM-R1']['352']
yes_bn = data['MedGemma 4B']['0']
yes_en = data['MedGemma 4B']['3']
assert (q['predicted_answer'], m['predicted_answer'], q['true_answer']) == ('CT', 'CT scan', 'সিটি')
assert (float(q['lave']), float(m['lave'])) == (.3, 0.)
assert (yes_bn['predicted_answer'], yes_en['predicted_answer']) == ('হ্যাঁ', 'Yes')
assert yes_bn['true_answer'] == yes_en['true_answer'] == 'হ্যাঁ'
assert (float(yes_bn['lave']), float(yes_en['lave'])) == (1., 0.)
def esc(s):
    return ''.join({'&':r'\&', '%':r'\%', '_':r'\_', '#':r'\#', '$':r'\$'}.get(c,c) for c in s)
def bn(s):
    return r'{\bn '+esc(s)+'}'
template = r'''\documentclass[11pt]{article}
\usepackage[paperwidth=13in,paperheight=4.8in,margin=.3in]{geometry}
\usepackage{fontspec,xcolor}
\setmainfont{DejaVu Sans}
\newfontfamily\bn{Noto Serif Bengali}[Script=Bengali]
\definecolor{blue}{HTML}{28658B}
\definecolor{soft}{HTML}{EEF5F9}
\definecolor{ink}{HTML}{243440}
\pagestyle{empty}\setlength{\parindent}{0pt}\setlength{\fboxsep}{12pt}
\begin{document}\color{ink}
{\Large\bfseries Verified examples of inconsistent judge credit}\par\vspace{12pt}
\begin{minipage}[t]{.482\textwidth}
{\large\bfseries A. Equivalent answers, same item}\par\vspace{8pt}
\textbf{MedICaT · modality · sample 352}\par
Question: @Q@\par
English gloss: What is the imaging modality?\par
Reference: @REF@ (CT)\par\vspace{12pt}
\colorbox{soft}{\begin{minipage}{.9\linewidth}
\textbf{Qwen2-VL-2B}\hfill\textcolor{blue}{\textbf{LAVE: 0.3 / 1}}\par
Answer: \textbf{CT}\par\vspace{12pt}
\textbf{MedVLM-R1}\hfill\textcolor{blue}{\textbf{LAVE: 0.0 / 1}}\par
Answer: \textbf{CT scan}
\end{minipage}}\par\vspace{12pt}
Both answers name the reference modality, but receive different, partial or zero credit.
\end{minipage}\hfill
\begin{minipage}[t]{.482\textwidth}
{\large\bfseries B. Correct yes answers, different items}\par\vspace{8pt}
\textbf{Chest X-ray · abnormality · MedGemma 4B}\par
Both questions ask whether an abnormality is present.\par
Reference for both: @YESREF@ (yes)\par\vspace{12pt}
\colorbox{soft}{\begin{minipage}{.9\linewidth}
\textbf{Sample 0}\hfill\textcolor{blue}{\textbf{LAVE: 1.0 / 1}}\par
Question: @Q0@\par
Answer: \textbf{@YESBN@} (yes)\par\vspace{10pt}
\textbf{Sample 3}\hfill\textcolor{blue}{\textbf{LAVE: 0.0 / 1}}\par
Question: @Q3@\par
Answer: \textbf{Yes}
\end{minipage}}\par\vspace{12pt}
The correct English answer receives no credit. These are different items, not a controlled language intervention.
\end{minipage}\par\vfill
\hrule\vspace{7pt}
{\small Answers and scores are copied from saved outputs. The judge receives the reference and answer, not the question.\par
These examples verify scoring failures; they do not quantify their effect on the aggregate model gap.}
\end{document}
'''
for key, value in {'@Q@':bn(q['question']), '@REF@':bn(q['true_answer']),
                   '@YESREF@':bn(yes_bn['true_answer']), '@YESBN@':bn(yes_bn['predicted_answer']),
                   '@Q0@':bn(yes_bn['question']), '@Q3@':bn(yes_en['question'])}.items():
    template = template.replace(key,value)
with tempfile.TemporaryDirectory(prefix='vlm-scoring-figure-') as temp:
    tmp = Path(temp)
    (tmp/'examples.tex').write_text(template,encoding='utf-8')
    run = subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error','examples.tex'],
                         cwd=tmp,capture_output=True,text=True)
    if run.returncode:
        raise RuntimeError(run.stdout[-4000:])
    log = (tmp/'examples.log').read_text()
    assert 'Missing character:' not in log and 'Overfull' not in log, log[-5000:]
    shutil.copy2(tmp/'examples.pdf', OUT/'bangla_scoring_examples.pdf')
    subprocess.run(['pdftoppm','-png','-singlefile','-scale-to','2600',str(tmp/'examples.pdf'),
                    str(OUT/'bangla_scoring_examples')], check=True,capture_output=True)

manifest = {'source_sha256':sources, 'forest_source':'paper_v2/main.tex, Table 3; existing rounded estimates and intervals preserved',
            'forest':forest, 'language_counts':counts, 'script_rule':'Any character U+0980–U+09FF in predicted_answer',
            'examples':{'same_item':[q,m], 'different_items':[yes_bn,yes_en]}}
(OUT/'additional_figures_sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Generated three figures as PNG and PDF; saved data provenance. Manuscript unchanged.')
