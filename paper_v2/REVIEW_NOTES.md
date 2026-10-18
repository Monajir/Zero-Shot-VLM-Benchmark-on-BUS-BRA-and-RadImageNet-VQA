# Review notes for the revised draft (v2)

`paper/` (first draft) is unchanged. This folder, `paper_v2/`, is the revised version.
Compile with **XeLaTeX** (Overleaf: Menu → Settings → Compiler). Local check with Tectonic
(XeTeX): no errors, no undefined references, no overfull lines above 5 pt, **8 pages** including
references. A preview is in `main_preview.pdf`.

## 1. Format: what ICIEV 2026 actually requires (checked 17 Oct 2026)

Sources: cennser.org/ICIEV (home, dates, submission pages), the one-page CFP PDF, the IJCVSP author
guide and submission pages.

- Accepted ICIEV papers are published **directly in open-access journals**: IJCVSP (regular papers,
  **6–10 pages, two-column IJCVSP template**) or IJABC (10–20 pages, one column). There is no separate
  conference-proceedings template, so the IJCVSP class is the correct one. Regular-paper deadline:
  **20 October 2026**.
- Submission: PDF via Microsoft CMT, **double-blind** (no names, affiliations or acknowledgements;
  all authors entered correctly in CMT at first submission, since authors can't be changed later).
- The class hard-codes publication-only placeholders: "Received ../../2026", "Accepted: 1/11/2026",
  "Published Online: 11/11/2026", volume 16(1) and a page range in the running head, and a
  copyright line. The class comments say these are changed by the editors on publication. They are
  misleading on a manuscript under review, so v2 hides them with `\reviewversiontrue` in the preamble.
  The official `.cls` file is still unmodified. The logo/ISSN block and the two-column layout stay.
  For camera-ready, set `\reviewversionfalse`.
- The draft went from 11 pages (over the limit) to 8.

## 2. Main problems found in the first draft, and what changed

| Problem in v1 | Change in v2 |
| --- | --- |
| Story spread out; the main finding only appeared in Sec. 4.4, after all three tasks | Results now **open with the paired medical-vs-base table** (Sec. 4.1); each task subsection is titled by what it adds to the argument (constant answers / anatomy vs disease / the one gain and why it needs care) |
| Same numbers repeated in abstract, intro, results, discussion and conclusion (e.g. 100/93/72% identical answers appeared 4 times) | Numbers stated once in Results; intro, discussion and conclusion summarise without repeating them |
| Intro listed detailed results | Intro now says what each task adds and states the finding in one sentence |
| Duplicate displays: BUS-BRA bar chart = BUS-BRA table; Bangla per-category table = Bangla figure | Both duplicates removed; the RadImageNet table was split so the figure shows accuracy and a small table shows only answer preferences |
| Long LAVE-audit paragraph | Replaced by a small audit table (Table 8) plus a short paragraph |
| Prompts and example questions in two full-width tables | Merged into one table (Table 3); prompts now show the **real line breaks** (v1 had silently added a full stop to the BUS-BRA prompt) |
| Four-panel image figure with a MedICaT journal figure of unknown licence | One-row, three-panel figure (BUS-BRA benign/malignant, ChestX-ray8); MedICaT image dropped |
| Red TODO notes in the PDF | Resolved in text with verifiable wording, or moved to the list below. No TODOs in the PDF |
| Paired comparisons mixed sources (McNemar from reports, CIs only for Bangla) | All six medical-vs-base differences recomputed from the raw CSVs with one method (paired bootstrap, 5,000 resamples, items resampled) plus exact McNemar |
| Some implementation details stated too broadly ("SDPA attention" for all runs; "repository processor failed" for all tasks) | Now precise: the processor fallback and `use_cache` fix applied only to the VQA notebooks; the attention detail was dropped because it wasn't uniform across notebooks |
| "Supervisor said…" attribution in a double-blind paper | Removed; the point (need for dedicated training methods/data) is stated as the paper's interpretation |
| Related work had five subsections, some of them thin | Three subsections matching the supervisor's request: (2.1) medical VLMs and their base models, (2.2) evaluations of medical VLMs, (2.3) multilingual medical VQA and answer biases |

## 3. Accuracy checks done for v2

Re-verified from the notebooks and result CSVs (scripts in the session scratchpad, not in the repo):

- All accuracies, answer distributions, yes-shares, top letters and correct-letter distribution
  (A 25, B 22, C 25, D 28), Wilson CIs, BUS-BRA sensitivity/specificity.
- Paired tests recomputed: BUS-BRA McNemar p = 0.082 (144 vs 115); RadImageNet p = 0.57 (MedVLM-R1)
  and 0.56 (MedGemma); MedGemma anatomy groups p = 0.39 and 0.79; identical answers 400/400, 141/400,
  465/500, 277/500, 362/500, 180/500.
- Bootstrap CIs (new, same method for all): BUS-BRA MedGemma +7.3 (−0.3, 15.0); RadImageNet +0.8
  (−1.2, 2.8) and −1.8 (−7.2, 3.6); Bangla +0.8 (−0.3, 2.0) and +7.4 (4.8, 10.0).
  *Note:* the MedVLM-R1 report in the repo gives (−0.2, 2.0) for the Bangla difference; the small gap
  comes from bootstrap randomness. The conclusion is the same either way.
- BUS-BRA full metadata: 1,268 benign / 607 malignant (from `bus_data.csv` in the Zenodo archive),
  so the "about 68%" for an always-benign model on the natural mix is now supported by the data.
- Bangla claims re-checked from CSVs: 34 English "Yes" → LAVE 0; 3 Bangla হ্যাঁ → 1.0; CT ≈ 0.31 vs
  X-ray ≈ 0.87; 56/100 modality references are X-ray; Qwen's most common CXR organ answer is লাইন
  ("line", 13/50); option-letter answers on MedICaT: 39 (Qwen2-VL) and 27 (MedVLM-R1), counted as a
  bare A–D or A–D followed by `)`, `.` or `:`.
- MedVLM-R1 training details confirmed in the arXiv paper: format reward + accuracy reward; 600 MRI
  multiple-choice pairs; tests on 300 MRI/CT/X-ray each.
- References: venues and pages confirmed via ACL Anthology BibTeX (Jeong et al. EMNLP 2024,
  pp. 12143–12170; ProbMed, Findings of ACL 2025, pp. 19188–19205; MedICaT, Findings of EMNLP 2020,
  pp. 2112–2120), CVF (OmniMedVQA, CVPR 2024, pp. 22170–22183), OpenReview (Zheng et al., ICLR 2024),
  Semantic Scholar (LLaVA-Med and GMAI-MMBench at NeurIPS; VQA-RAD, SLAKE, RadImageNet DOIs). The
  MedICaT author order was wrong in v1 and is now fixed. Unverifiable or unused entries (PMC-VQA,
  WorldMedQA-V, the LLM-as-judge paper) were removed. Seven entries have no page numbers (ICLR/NeurIPS
  and two CVPR 2017 papers), which BibTeX reports as warnings only.

## 3b. Pipeline figure (Fig. 1), added after v2 review

A full-width, four-panel pipeline figure (TikZ, `figures/pipeline.tex`) now opens the Methodology:
(a) tasks and samples → (b) zero-shot inference → (c) task-specific scoring → (d) analysis.
Every box was checked against the notebooks: fixed seeded samples (seed 42; BUS-BRA frozen ID list
with SHA-256 check), greedy decoding in all 10 notebooks, bf16, batch size 1, the parsers used,
and the GPT-4.1-mini judge at temperature 0. No notebook contains any training code. The figure
marks the base → medical arrows as "adapted by the model authors", and both panel (b) and the
caption say that no model was trained in this study. The paired bootstrap/McNemar analysis and the
rule-based LAVE checks in panel (d)/(c) were done on the saved result files after inference, as
described in Sec. 3.5. Because panels (a) and (c) repeat the old task/sample table, that table was
removed and its one extra point (balanced labels make a constant answer score exactly chance) moved
into the text of Sec. 3.2. The paper is now 9 pages (limit 10).

## 4. Things to confirm with the supervisor before submitting

1. **Abstract and conclusion.** Both are short drafts written from the results; the supervisor said
   he would write these.
2. **Title.** The current title is a question built around the main finding (~125 characters,
   within IJCVSP's 150-character rule). Confirm it, or choose a declarative title.
3. **Why the BanglaMedVQA train split was used.** The paper only states the facts (we sampled from
   train; the original paper used test with 200/source) and that no model was trained on the dataset.
   If there was a reason (e.g. the 250-per-source design), add one sentence.
4. **Software versions and GPU for the RadImageNet-VQA and BanglaMedVQA runs.** These weren't saved.
   If anyone still has the Colab/Kaggle sessions, add them; otherwise the limitation stays as written.
5. **Review-mode header.** The site doesn't say how placeholder metadata should be handled at
   submission. Hiding it is the safe choice for double-blind review, but a one-line email to the
   organisers would settle it. Camera-ready: `\reviewversionfalse`.
6. **Bangla reference quality.** Some ChestX-ray8 references look mistranslated, e.g. "Effusion,
   infiltration, mass, and infiltrate (middle right)" became প্রলেপ, অনুপ্রবেশ, গন্ড এবং অনুপ্রবেশ.
   This is not claimed in the paper. If a Bangla speaker confirms it, it would strengthen the
   "metrics and references need care" point.
7. **Training-data overlap statement.** The paper notes that MedVLM-R1's model-card examples use
   RadImageNet-style labels (e.g. "flexor pathology"). This is stated as a possibility only. Keep or
   drop it?
8. **Author list in CMT** (including the supervisor). Make sure nothing identifying, such as the
   GitHub repository link, goes into the PDF.
