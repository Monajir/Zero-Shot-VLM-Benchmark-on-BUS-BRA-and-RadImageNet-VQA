# Zero-shot VLM benchmark: BUS-BRA and RadImageNet-VQA

Compare two general-purpose vision-language models with their medical counterparts
on breast ultrasound classification and medical visual question answering.
The primary comparisons are **within each model pair**, separately for each task.
No training, fine-tuning, or in-context examples are planned.

**Status:** initial experiment specification and notebook scaffolds. Dataset
eligibility, checkpoint access, GPU compatibility, and full inference have not
been validated. The notebooks deliberately stop before unimplemented execution;
they are not yet complete, ready-to-run experiments.

## Files and ownership

| File | Purpose | Owner |
| --- | --- | --- |
| `BUS_BRA.ipynb` | Audit, sampling, pilots, and inference for BUS-BRA | BUS-BRA lead (repository owner) |
| `RadImageNet_VQA.ipynb` | Audit, sampling, pilots, and inference for RadImageNet-VQA | RadImageNet-VQA teammates |
| `Analyze_Results.ipynb` | Coverage validation, scoring, paired comparisons, and exports | Shared; cross-reviewed |

All inference runs on Kaggle. Each inference notebook will contain its own setup,
configuration, model adapters, prompts, parser, and saving/resumption logic. It
must not import project Python modules or require another notebook to have run.
Dataset attachments, frozen manifests, model downloads/access, and Kaggle secrets
are still required external inputs. One model/configuration runs per execution.

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
| BUS-BRA | Benign/malignant classification | 400 images: 200 per class, one image per distinct patient | Gemma: 20 additional images, 10 per class; Qwen pilot count pending |
| RadImageNet-VQA | Medical VQA; eligible answer formats pending inspection | Provisionally 500 eligible questions | **30 additional questions**, shared by all four models |

Use seed 42 for sampling. Audit eligibility before fixing manifests. Pilot and
test sets must not share patients, images, or near-duplicate groups wherever
identifiers permit; document missing identifiers and resulting limitations.
For BUS-BRA, sample patients first and select one eligible image per patient
using a documented rule. Qwen may reuse the held-out BUS-BRA pilot if the team
records that decision. Do not infer patient identity from filenames without
verifying the metadata.

The local `Datasets/BUS-BRA.zip` archive is intentionally excluded from Git.
Its listing contains `BUSBRA/Images/`, masks, `BUSBRA/bus_data.csv`, supplied
cross-validation CSVs, and `BUSBRA/LICENSE.txt`. The metadata columns include
`ID`, `Case`, `Histology`, `Pathology`, `BIRADS`, `Device`, `Width`, `Height`,
`Side`, and `BBOX`. This is a layout inspection, not an integrity/label audit.
The supplied cross-validation folds do not define this zero-shot benchmark.

Audit both datasets for readable files, metadata consistency, labels/answer keys,
duplicates, group identifiers, and eligible counts. Review questionable records
using written rules before seeing model predictions. RadImageNet-VQA access,
terms, actual schema, splits, categories, and potential training-data overlap
remain to be verified. Do not assume the previous VQA dataset's schema applies.

## Three pilot groups

1. **Qwen feasibility/output:** both Qwen checkpoints on held-out BUS-BRA samples,
   initially non-quantized FP16. Check loading, memory, numerical stability,
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

## Shared data and output contract

Both inference notebooks must use the same field names. Additional diagnostic
fields are allowed. Store IDs as strings and missing values explicitly as null
(or empty fields in CSV). Model keys are those in the selected-model table.

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

Save execution outputs under `/kaggle/working/` and retain them outside transient
sessions. Planned local exports are `manifests/`, `results/pilots/`,
`results/final/<dataset>/<model_key>.jsonl`, and
`results/final/run_metadata.json` (one entry per accepted run).
Only permitted, reviewed exports should enter Git. These folders are created
when real artifacts exist; raw/private data stays in excluded local/private storage.

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

Next: implement the BUS-BRA audit/manifest preparation, inspect RadImageNet-VQA
access/schema, implement parser checks, then validate GPU pilots. No feasibility
test, full inference, or accuracy result is claimed by this initial commit.

Results describe these released checkpoint pairs under the frozen protocol.
Different adaptation histories, preprocessing, quantization, and incompletely
disclosed training data limit causal and contamination claims. This is a research
benchmark; clinical deployment is outside its scope.
