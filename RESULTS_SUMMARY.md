# Zero-Shot Medical VLM Benchmark — Results & Summary

## All 8 Models

| Pair | Model                   |       BUS-BRA Acc<br>Real (Blank) | RadImageNet Acc<br>Real (Blank) | BanglaMedVQA LAVE<br>Real (Blank) |   BanglaMedVQA<br>EM / Norm / BS | One-Line Observation                                                                                            |
| ---- | ----------------------- | --------------------------------: | ------------------------------: | --------------------------------: | -------------------------------: | --------------------------------------------------------------------------------------------------------------- |
| 1    | **Qwen2-VL-2B**         |                   50.00% (50.00%) |                 64.20% (41.60%) |                    15.14% (2.70%) |           0.00% / 2.40% / 68.60% | Good RadImageNet results, but predicted benign for every BUS-BRA image, ignoring the actual images.             |
| 1    | **MedVLM-R1**           |                   50.00% (50.00%) |             **65.00%** (43.80%) |                    15.98% (2.60%) |           0.00% / 3.40% / 68.44% | Best RadImageNet score, but little improvement over Qwen2-VL on the other two datasets.                         |
| 2    | **Gemma 3 4B**          |                   50.25% (50.00%) |                 63.00% (38.80%) |                   24.10% (11.68%) |           2.40% / 4.80% / 68.98% | Decent anatomy recognition, but some BanglaMedVQA performance came from guessing without images.                |
| 2    | **MedGemma 4B**         |               **57.50%** (50.00%) |                 61.20% (38.40%) |                **31.48%** (7.18%) |      1.60% / **12.20%** / 71.38% | Best BUS-BRA and BanglaMedVQA results, with a clear difference between real and blank images.                   |
| 3    | **Phi-3.5-Vision**      |                   50.00% (50.00%) |                 61.20% (40.20%) |                     5.36% (4.84%) |           0.00% / 0.00% / 71.22% | Followed the short-answer format but struggled with Bangla questions.                                           |
| 3    | **CheX-Phi-3.5-SFT**    | 6.75% _(53.75% 1st-word)_ (0.00%) |                 53.80% (43.40%) |                     3.40% (5.20%) |           0.00% / 0.00% / 60.83% | Performed worse than the base model on all three datasets and struggled with instructions and Bangla responses. |
| 4    | **Ministral-3B (Base)** |                    31.50% (0.00%) |                 57.80% (40.80%) |                   22.62% (18.28%) |           1.80% / 1.80% / 67.42% | Decent RadImageNet results, but struggled with BUS-BRA formatting and Bangla questions.                         |
| 4    | **Ministral-3B-MedVL**  |               **54.25%** (50.00%) |                 55.40% (38.00%) |               **29.59%** (14.32%) | **11.60%** / 11.80% / **75.08%** | Clear improvement over the base model on BUS-BRA and BanglaMedVQA, with better answer formatting.               |

_Note: BUS-BRA and RadImageNet-VQA report accuracy (%). BanglaMedVQA reports GPT-4.1-mini LAVE (%), Exact Match (EM), Normalized EM, and BERTScore F1 (BS)._

---

## Summary

- MedGemma and Ministral-MedVL improved over their base models, especially on BUS-BRA and BanglaMedVQA.
- CheX-Phi performed worse than the base Phi-3.5 across all three datasets.
- Blank-image tests showed that some models could get reasonable scores without actually using the images.
- Overall, models were better at recognizing anatomy and imaging modalities than identifying diseases.
