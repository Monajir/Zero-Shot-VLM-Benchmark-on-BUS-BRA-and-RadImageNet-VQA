## RadImageNet-VQA — White-Blank Image Experiment

### Overall model comparison

| Model              | Original Accuracy | White-Blank Accuracy |  Change | Observation                                                                                    |
| ------------------ | ----------------: | -------------------: | ------: | ---------------------------------------------------------------------------------------------- |
| **Qwen2-VL-2B**    |            64.20% |               41.60% | −22.60% | Lost accuracy without images; frequently defaulted to answering "No".                          |
| **MedVLM-R1**      |        **65.00%** |           **43.80%** | −21.20% | Had the highest original and blank-image accuracy, but showed similar response biases to Qwen. |
| **Gemma 3 4B-it**  |            63.00% |               38.80% | −24.20% | Had the largest overall drop and a strong preference for option "B".                           |
| **MedGemma 4B-it** |            61.20% |               38.40% | −22.80% | Experienced a substantial drop, particularly on Anatomy MCQ (80% to 15%).                      |

### Takeaway

All four models relied more on images for anatomical questions. However, pathology and abnormality performance remained weak even with images, while answer biases affected the blank-image results.
