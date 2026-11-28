# Zero-Shot Medical VLM Benchmark — Complete Results & Takeaways

All **8 models (4 base + medical-adapted pairs)** evaluated zero-shot across **BUS-BRA** (400 images), **RadImageNet-VQA** (500 questions), and **BanglaMedVQA** (500 questions), with **white blank-image controls** on every task.

## All 8 Models at a Glance

| Pair | Model                   |       BUS-BRA Acc<br>Real (Blank) | RadImageNet Acc<br>Real (Blank) | BanglaMedVQA LAVE<br>Real (Blank) |   BanglaMedVQA<br>EM / Norm / BS | One-Line Observation                                                                                           |
| ---- | ----------------------- | --------------------------------: | ------------------------------: | --------------------------------: | -------------------------------: | -------------------------------------------------------------------------------------------------------------- |
| 1    | **Qwen2-VL-2B**         |                   50.00% (50.00%) |                 64.20% (41.60%) |                    15.14% (2.70%) |           0.00% / 2.40% / 68.60% | Strong on anatomy VQA, but ignored images on BUS-BRA by predicting benign every time.                          |
| 1    | **MedVLM-R1**           |                   50.00% (50.00%) |             **65.00%** (43.80%) |                    15.98% (2.60%) |           0.00% / 3.40% / 68.44% | Top score on RadImageNet-VQA, but behaved almost identically to Qwen2-VL on BUS-BRA and BanglaMedVQA.          |
| 2    | **Gemma 3 4B**          |                   50.25% (50.00%) |                 63.00% (38.80%) |                   24.10% (11.68%) |           2.40% / 4.80% / 68.98% | Good anatomy and organ recognition, though blank-image Bangla guesses inflated its modality score.             |
| 2    | **MedGemma 4B**         |               **57.50%** (50.00%) |                 61.20% (38.40%) |                **31.48%** (7.18%) |      1.60% / **12.20%** / 71.38% | Best overall on BUS-BRA and BanglaMedVQA with the strongest real-vs-blank visual drop (+24.30 pp).             |
| 3    | **Phi-3.5-Vision**      |                   50.00% (50.00%) |                 61.20% (40.20%) |                     5.36% (4.84%) |           0.00% / 0.00% / 71.22% | Followed short-answer formatting, but collapsed to generic Bangla guesses with no real-vs-blank gap.           |
| 3    | **CheX-Phi-3.5-SFT**    | 6.75% _(53.75% 1st-word)_ (0.00%) |                 53.80% (43.40%) |                     3.40% (5.20%) |           0.00% / 0.00% / 60.83% | Narrow English chest X-ray fine-tuning broke instruction following and Bangla responses across all tasks.      |
| 4    | **Ministral-3B (Base)** |                    31.50% (0.00%) |                 57.80% (40.80%) |                   22.62% (18.28%) |           1.80% / 1.80% / 67.42% | Decent RadImageNet accuracy, but struggled with strict BUS-BRA formatting and relied heavily on Bangla priors. |
| 4    | **Ministral-3B-MedVL**  |               **54.25%** (50.00%) |                 55.40% (38.00%) |               **29.59%** (14.32%) | **11.60%** / 11.80% / **75.08%** | Clear improvement over base on BUS-BRA and BanglaMedVQA (2nd best overall), with strong formatting compliance. |

_Note: BUS-BRA and RadImageNet-VQA report accuracy (%), while BanglaMedVQA uses GPT-4.1-mini LAVE (%), Exact Match (EM), Normalized EM, and BERTScore F1 (BS)._

---

## Thoughts on Overall Experimentation

- MedGemma and Ministral-MedVL showed clear improvements over their base models, especially on BUS-BRA and BanglaMedVQA.
- CheX-Phi performed worse than the base Phi-3.5 across all three datasets
- Blank-image tests showed that some models were relying on question patterns rather than actually understanding the images.
- Overall, models performed better at anatomy and modality recognition than actual disease identification.
