# Zero-shot VLM benchmark: BUS-BRA and RadImageNet-VQA

Compare two general-purpose vision-language models with their medical counterparts
on breast ultrasound classification and medical visual question answering.
The primary comparisons are **within each model pair**, separately for each task.
No training, fine-tuning, or in-context examples are planned.

**Status:** BUS-BRA v7 completed all 80 BF16 smoke responses with valid labels
and verified greedy decoding. Final BUS-BRA inference is prepared in two standalone
notebooks, one per model pair, for parallel execution on two Kaggle accounts.
Both use the same frozen 400-image final sample. Final model inference has not
been run locally. The teammate per-model VQA notebooks are in `RadImageNet_VQA/`.

## Files and ownership

| File | Purpose | Owner |
| --- | --- | --- |
| `BUS_BRA.ipynb` | Completed BUS-BRA smoke-test implementation; retained for provenance | BUS-BRA lead |
| `BUS_BRA/BUS_BRA_Final_Qwen_MedVLM.ipynb` | Final Qwen2-VL and MedVLM-R1 inference | BUS-BRA lead |
| `BUS_BRA/BUS_BRA_Final_Gemma_MedGemma.ipynb` | Final Gemma 3 and MedGemma inference | BUS-BRA lead |
| `RadImageNet_VQA.ipynb` | Audit, sampling, pilots, and inference for RadImageNet-VQA | RadImageNet-VQA teammates |
| `Analyze_Results.ipynb` | Coverage validation, scoring, paired comparisons, and exports | Shared; cross-reviewed |

All inference runs on Kaggle. Each inference notebook will contain its own setup,
configuration, model adapters, prompts, parser, and incremental saving logic. It
must not import project Python modules or require another notebook to have run.
Dataset attachments, frozen manifests, model downloads/access, and Kaggle secrets
are still required external inputs. BUS-BRA can run a selected list of
model/precision jobs sequentially, with one model loaded at a time.

## Selected models

| Key | Pair | Role | Hugging Face checkpoint |
| --- | --- | --- | --- |
| `qwen2_vl` | Qwen2-VL | General | `Qwen/Qwen2-VL-2B-Instruct` |
| `medvlm_r1` | Qwen2-VL | Medical | `JZPeterPan/MedVLM-R1` |
| `gemma3` | Gemma 3 | General | `google/gemma-3-4b-it` |
| `medgemma` | Gemma 3 | Medical | `google/medgemma-4b-it` |

Pin exact model and processor commit revisions before final inference. Gemma
checkpoint terms/access must be handled by the account owner. Store tokens in
Kaggle secrets; never paste them into notebook cells, outputs, or Git.

## Datasets and sample targets

**Final dataset selection: BUS-BRA and RadImageNet-VQA.**

| Dataset | Task | Final evaluation target | Pilot |
| --- | --- | --- | --- |
| BUS-BRA | Benign/malignant classification | 400 images: 200 per class, one image per distinct source `Case` | **20 additional images**, 10 per class, shared by Pilots 1 and 2 |
| RadImageNet-VQA | Medical VQA; eligible answer formats pending inspection | Provisionally 500 eligible questions | **30 additional questions**, shared by all four models |

Use seed 42 for sampling. BUS-BRA final notebooks embed the same fixed 400 image
IDs and manifest hash: 200 eligible Cases per class, one randomly chosen eligible
image per selected Case, sorted by image ID. Sampling uses the existing audit,
excludes its 13 flagged Cases, and reserves all images from the 20 pilot Cases.
No pilot prediction or accuracy is used to select final images. `Case` is the
source dataset's grouping field; it has not been independently verified as
patient identity. Keep that limitation in downstream reporting.

Pilot and final evaluation must not share patients, images, or duplicate groups
where identifiers permit. RadImageNet-VQA uses its own task-specific selection;
its sample IDs do not correspond to the BUS-BRA sample.

Kaggle inference uses an attached BUS-BRA dataset. The local
`Datasets/BUS-BRA.zip` archive remains in place and is intentionally excluded from Git.
Its listing contains `BUSBRA/Images/`, masks, `BUSBRA/bus_data.csv`, supplied
cross-validation CSVs, and `BUSBRA/LICENSE.txt`. The metadata columns include
`ID`, `Case`, `Histology`, `Pathology`, `BIRADS`, `Device`, `Width`, `Height`,
`Side`, and `BBOX`. The notebook checks the attached metadata and image-file
fingerprints against either this original copy or the locally verified
`Datasets/BUSBRA_Kaggle.zip` copy from `orvile/bus-bra-a-breast-ultrasound-dataset`.
All 1,875 images and the ten shared metadata columns match exactly. The Kaggle CSV
adds `HOB`, `HOP`, `K5B`, `K5P`, `K10B`, and `K10P`, which this pilot does not use.
Each accepted CSV hash is paired with its verified combined source fingerprint;
other metadata or altered/missing images stop before sampling. The chosen variant
is recorded in audit summaries, manifest metadata, and run configurations.
Both local archives remain excluded from Git. Automated screening is preliminary;
patient identity and pathology are not independently verified from these files.
The supplied cross-validation folds do not define this zero-shot benchmark.

Audit both datasets for readable files, metadata consistency, labels/answer keys,
duplicates, group identifiers, and eligible counts. Review questionable records
using written rules before seeing model predictions. RadImageNet-VQA access,
terms, actual schema, splits, categories, and potential training-data overlap
remain to be verified. Do not assume the previous VQA dataset's schema applies.

## Three pilot groups

1. **Qwen feasibility/output:** both Qwen checkpoints on the shared 20 held-out
   BUS-BRA images, initially non-quantized FP16 (40 responses). Check loading, memory, numerical stability,
   latency, answer parsing, and 32-token completeness, especially MedVLM-R1 tags.
2. **Gemma precision/output:** both Gemma checkpoints on the same 20 held-out
   BUS-BRA images under non-quantized FP32 and 4-bit weights with FP32 compute,
   where feasible. Record failures, per-device memory, runtime, numerical/output
   validity, truncation, and within-model prediction disagreements between
   precision settings. This is up to 80 responses across both configurations.
3. **RadImageNet-VQA pipeline:** all four models on the same 30 held-out questions
   (120 responses for one configuration per model). Check image/question/options
   handling, parsing, 16-token completeness, memory, runtime, and failures.

Pilots select engineering settings, not settings that maximize pilot accuracy.
Twenty-image agreement cannot establish that quantization has no accuracy effect.
Use available free Kaggle GPUs first; do not assume a particular allocation.
The planned T4 configurations need empirical validation. FP32 sharding and any
BF16-capable fallback are unresolved; paid compute is not authorized by this plan.

## Final BUS-BRA inference: two Kaggle accounts

Use these two notebooks directly:

| Account / notebook | Sequential jobs | Final responses |
|---|---|---:|
| `BUS_BRA/BUS_BRA_Final_Qwen_MedVLM.ipynb` | Qwen2-VL, then MedVLM-R1 | 400 + 400 |
| `BUS_BRA/BUS_BRA_Final_Gemma_MedGemma.ipynb` | Gemma 3, then MedGemma | 400 + 400 |

On **each** account, attach the verified BUS-BRA dataset, select **T4 x2**, enable
Internet and the `HF_TOKEN` secret, then **Save & Run All (Commit)**. Attach the
extracted dataset containing `bus_data.csv` and `Images`; the compact final notebooks
do not extract ZIPs. The Gemma
account's token must have access to both Google model repositories. The notebooks
need no project imports, external manifests or earlier results. There is no extra
pilot inference. They run independently; models within each notebook run in order.

Both freeze v7's BF16 dtype, exact model/processor revisions, native preprocessing,
fixed BUS-BRA prompt, strict EOS-aware parser and explicit greedy/cache controls.
Each model receives only the image and prompt. The version is
`bus-bra-final-v2-compact`. Dependencies preserve Kaggle's torch/torchvision/Pillow.

The common final manifest SHA256 is
`a8caa6ad39310c2871e53bc4b9f80d4b76c1b6f850b1c474c0abae8db1181283`.
It covers the ordered images, image bytes, references, source Cases, paths and
prompt. The notebooks validate the supplied selection without resampling.

Each account produces **five CSVs** in `/kaggle/working`:

- Both: `vqa_sample.csv` with the same 400 rows.
- Qwen pair: `vqa_results_qwen2vl_2b.csv`, `vqa_scores_qwen2vl_2b.csv`,
  `vqa_results_medvlm_r1.csv`, `vqa_scores_medvlm_r1.csv`.
- Gemma pair: `vqa_results_gemma3_4b.csv`, `vqa_scores_gemma3_4b.csv`,
  `vqa_results_medgemma_4b.csv`, `vqa_scores_medgemma_4b.csv`.

Column schemas match the teammate notebooks and the smoke-test CSV contract
below. There are **nine unique CSVs** when combining both accounts, with one
shared sample file. Keep account downloads and VQA downloads in separate folders.
Each results CSV must contain 400 answers; each score row must have `n=400`.
`unparsed` answers count as incorrect. Failed inferences are missing responses,
so partial scores are not final benchmark scores. An inference error stops the
run and preserves completed answers. The final cell rejects incomplete coverage.

Results and scores update after every answer. Each compact notebook contains
397 code lines, including 55 lines of shared frozen sample IDs/exclusions. Detailed
JSON/JSONL diagnostics, memory profiling, heartbeat threads and the run-recovery
framework have been removed. Dependency output still streams with a 15-minute
overall timeout; model loading and each completed image print progress.

**There is no automatic resume.** Each execution of the inference cell starts a
new run and replaces its five CSVs. Download existing results before rerunning.
Save the executed notebook and logs with the CSVs; essential package versions,
checkpoint revisions, BF16 dtype and resolved generation controls are logged.
Model weights use job-specific temporary directories and are removed after each
job. No additional output files are created by the notebooks.

## Archived BUS-BRA BF16 smoke-test workflow

`BUS_BRA.ipynb` defaults to **v7 BF16**, four sequential jobs / up to 80 responses.
It pins the checkpoint revisions and exact 20-image manifest from the completed
v4 pilot. The prompt, native preprocessing and 32-token cap stay fixed. Version v7
corrects the checkpoint-default override discovered in the v6 execution logs:
`generate()` now receives `use_model_defaults=False` plus explicit greedy/cache
controls. Two regression checks exercise the installed Transformers resolver
before model loading; each inference verifies the resolved configuration and the
first image per model logs it. Look for `greedy_search`, `do_sample=False`,
`use_cache=True` and `use_model_defaults=False`. Earlier runs remain engineering
evidence, not verified common-greedy comparisons. The nine CSV exports and EOS
boundary parser are unchanged.

T4 has no native BF16 Tensor Core support. Capability checks and actual model
inference test the available non-native execution paths. There is no automatic
precision fallback. Parameter/input dtypes, numerical checks and failures appear
in runtime state and notebook output. The configured dtype is not a profile of
all kernel arithmetic.

### Run on Kaggle

1. Import the updated `BUS_BRA.ipynb`; attach the same verified BUS-BRA dataset.
2. Enable Internet, select **T4 x2**, and enable the `HF_TOKEN` secret with access
   to both Gemma checkpoints.
3. Keep the default four BF16 jobs and choose **Save & Run All (Commit)**.
   Check that the version is `bus-bra-smoke-v7-bf16-greedy`.
4. Save the executed notebook with its logs and download the nine CSVs below.

No previous result attachment is required: the deterministic manifest must match
the previous run's embedded SHA256. If dataset discovery is ambiguous, set
`DATA_ROOT` to the directory containing the intended `bus_data.csv`.
Dependencies preserve Kaggle's torch/torchvision/Pillow; installation logs stream
with a 15-minute timeout. Long stages emit a WAIT heartbeat every 30 seconds.
Kaggle may delay session startup and log delivery.

### Exact teammate-compatible outputs

The fresh saved run writes only these nine CSVs under `/kaggle/working`:

- `vqa_sample.csv`
- `vqa_results_qwen2vl_2b.csv`, `vqa_scores_qwen2vl_2b.csv`
- `vqa_results_medvlm_r1.csv`, `vqa_scores_medvlm_r1.csv`
- `vqa_results_gemma3_4b.csv`, `vqa_scores_gemma3_4b.csv`
- `vqa_results_medgemma_4b.csv`, `vqa_scores_medgemma_4b.csv`

Names and column order match the teammate notebooks. Keep BUS-BRA and VQA outputs
in separate download folders to avoid overwriting same-named files.

| File type | Columns |
|---|---|
| Sample | `idx,question_id,group` |
| Results | `idx,question_id,group,anatomy,question,true_answer,predicted_answer,raw_output` |
| Scores | `group,correct,n,accuracy` |

For BUS-BRA, `idx` is the zero-based original metadata row, `question_id` is the
image ID, `group` is `lesion_classification`, and `anatomy` is `breast`. Ground
truth is joined for export/scoring only; inference receives the original image
and common prompt. Predictions use the strict parser after removal of configured
terminal EOS IDs from a copy of generated tokens; `raw_output` is unchanged.
Fragments such as `ben` remain `unparsed`, which counts as incorrect.

Each response refreshes its model's CSVs. Scores use saved responses as denominator,
matching the teammate code; missing/failed inferences have no fabricated rows.
Always check coverage against the 20-row sample file. An empty job has a header-only
results file and a score row with `n=0`, `correct=0`, and blank accuracy.
These are engineering pilot scores, not final benchmark results.

Detailed configuration, raw token diagnostics, logs, audits, model caches and
extracted images stay under `/tmp`. The notebook creates no output ZIP or extra
JSON/audit CSV files under `/kaggle/working`. These temporary records permit exact
reuse within the same live session; downloading the nine CSVs alone does not
support resuming in a fresh session. Preserve the executed notebook/logs for review.

## Shared inference and scoring rules

- Use the same frozen test manifest and task wording for all four models.
- Use each checkpoint's native processor/chat template and record preprocessing.
- Initial decoding: greedy (`do_sample=False`), batch size 1, sampling seed 42.
- Initial `max_new_tokens`: **32 for BUS-BRA; 16 for RadImageNet-VQA**.
- Resolve truncation and any token-cap changes on pilot evidence before final
  evaluation. Record changes here before freezing configurations.
- BUS-BRA inputs: original ultrasound image and the fixed classification prompt.
  Masks, diagnosis, BI-RADS, bounding boxes, and patient metadata are not inputs.
- VQA inputs: image, original question, and supplied options where applicable.
  Exact templates and eligible answer formats await dataset inspection.
- Keep reference answers and privileged metadata outside model-facing inputs;
  join references during scoring. Decode only newly generated tokens.
- Parse a complete, unambiguous final answer (including a valid `<answer>` field).
  Never search arbitrary reasoning for the first label or choice letter. Freeze
  exact normalization/marker rules using pilot outputs and synthetic parser checks.
- Missing, contradictory, malformed, or incomplete final answers are `unparsed`.
  Count them as incorrect in headline accuracy and report invalid rates separately.
- Record token-limit stops separately from whether a final answer is complete.
  Specify the exact treatment before freezing the parser.
- Infrastructure failures are execution events, not completed invalid answers.
  Retry/resume according to a recorded policy; never silently drop failed cases.

## Internal diagnostic schema (archived smoke workflow)

The following describes the detailed smoke-test records. The compact final
notebooks use only the CSV contract above and execution logs; they do not create
these diagnostic files. Store IDs as strings and missing values explicitly as
null (or empty fields in CSV). Model keys are those in the selected-model table.

**Frozen manifest CSV:** `dataset`, `sample_id`, `image_id`, `image_path`,
`group_id`, `split`, `task_type`, `question`, `options_json`, `reference_answer`,
`category`, `image_sha256`.

- `dataset`: `bus_bra` or `radimagenet_vqa`; IDs are unique within a dataset.
- `image_path`: relative to the configured data root; no machine-specific paths.
- `group_id`: verified patient ID, otherwise image/group ID with its meaning and
  limitations recorded. Never fabricate unavailable patient identifiers.
- `split`: `pilot` or `test`; `task_type`: `classification`, `mcq`, or `yes_no`
  for the initial planned scope. VQA eligibility must first be confirmed.
- `options_json`: JSON mapping of choice letters to option text; `{}` when absent.
- BUS-BRA references are `benign` or `malignant`; VQA normalization is pending.
- `category` is optional. Labels/group identifiers may require private storage.

**Completed generation JSONL:** `run_id`, `dataset`, `sample_id`, `model_key`,
`model_id`, `model_revision`, `manifest_sha256`, `config_sha256`, `raw_output`,
`parsed_answer`, `parse_status`, `generated_tokens`, `stop_reason`, `latency_ms`.

- One JSON object per completed sample; preserve the raw response.
- `parse_status`: `parsed` or `unparsed`; `parsed_answer` is null if unparsed.
- Stopping diagnostics should distinguish EOS, token limit, other, and unknown.
- Resumption keys include dataset/sample ID, model revision, manifest hash, and
  resolved configuration hash. Resolved configuration includes processor revision,
  prompt/parser versions, preprocessing, precision, and generation settings.
- Save incrementally with crash-safe records; detect partial or duplicate records.
  Recovery across Kaggle sessions requires persisting and reattaching outputs.

**Run metadata:** `run_id`, run purpose (`pilot`/`final`), model/processor revisions,
code commit and notebook hash, complete resolved configuration, manifest/prompt
hashes, package versions, GPU/CUDA details, actual dtypes/quantization/device map,
timings, memory diagnostics, execution/retry events, and completion validation.
Do not overwrite an existing run with different settings. Retain per-run metadata;
combine accepted final-run metadata for analysis.

## Outputs and analysis

Final notebook outputs are the teammate-compatible CSVs listed above, accompanied
by the executed notebooks and execution logs. Retain downloaded results outside
transient sessions. Detailed JSONL/JSON diagnostics are temporary implementation
state, not additional promised download files. Only reviewed exports should enter
Git; raw data stays in excluded local storage.

`Analyze_Results.ipynb` will load completed outputs and references without loading
models. Validate exact manifest coverage and compatible configurations first.
Then export `all_predictions.csv`, `metrics.csv`, `paired_comparisons.csv`,
`validation.json`, and diagnostic figures. At target sizes, final predictions
contain 3,600 rows (400 x 4 plus 500 x 4), excluding pilots.

Report accuracy and invalid rates, BUS-BRA class metrics and a confusion display
with an invalid-prediction column, and VQA question/category breakdowns where
supported. Invalid predictions remain in accuracy and class-recall denominators.
Compare medical minus general within each pair, with paired 95% confidence
intervals. Respect patient/image clustering in both uncertainty and tests;
ordinary McNemar assumes independent matched pairs. Freeze the exact statistical
method, bootstrap settings, and multiple-comparison correction before final runs.
Holm correction across the four pair-by-task primary comparisons is proposed.

## Collaboration and next steps

- Work on feature branches and open draft PRs early; each push updates the review.
- Obtain another teammate's review before merging to `main` (team convention;
  repository enforcement has not been configured).
- Cross-review shared output fields, parsing, and model settings across notebooks.
- Clear notebook outputs before committing, especially paths/metadata or secrets.
- Add small meaningful checks inside notebooks alongside working implementations.
- Freeze a common code version and manifests before distributed final runs.

Next: run the two final BUS-BRA notebooks on separate Kaggle accounts, then bring
both five-CSV downloads and execution logs back for final analysis. The successful
v7 smoke run validates technical feasibility; it does not establish final accuracy.

Results describe these released checkpoint pairs under the frozen protocol.
Different adaptation histories, preprocessing, quantization, and incompletely
disclosed training data limit causal and contamination claims. This is a research
benchmark; clinical deployment is outside its scope.
