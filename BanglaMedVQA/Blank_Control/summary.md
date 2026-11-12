## BanglaMedVQA — White-Blank Image Experiment
### Overall model comparison

| Model              | Exact Match (Original → Blank) | Normalized Acc. (Original → Blank) | BERTScore F1 (Original → Blank) | LAVE (Original → Blank) | Observation                                                                  |
| ------------------ | -----------------------------: | ---------------------------------: | ------------------------------: | ----------------------: | ---------------------------------------------------------------------------- |
| **Qwen2-VL-2B**    |                     0.0 → 0.0% |                         2.4 → 4.0% |                  68.60 → 68.42% |           15.14 → 2.70% | Performance dropped considerably; often gave generic answers without images. |
| **MedVLM-R1**      |                     0.0 → 0.0% |                         3.4 → 4.4% |                  68.44 → 67.48% |           15.98 → 2.60% | Behaved much like Qwen, even with medical fine-tuning.                       |
| **Gemma 3 4B-it**  |                     2.4 → 0.4% |                         4.8 → 0.8% |                  68.98 → 53.29% |          24.10 → 11.68% | Had the highest blank-image score, partly because it kept guessing “X-ray”.  |
| **MedGemma 4B-it** |                     1.6 → 0.0% |                       12.2 → 10.0% |                  71.38 → 71.23% |           31.48 → 7.18% | Best with actual images, but had the biggest drop without them.              |

### Takeaway

All four models scored lower without images. However, some blank-image scores were helped by repeated guesses and dataset answer patterns, rather than actual image understanding.
