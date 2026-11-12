## BUS_BRA — White-Blank Image Experiment

### Overall model comparison

| Model              | Original Accuracy | White-Blank Accuracy |     Change | Observation                                                                        |
| ------------------ | ----------------: | -------------------: | ---------: | ---------------------------------------------------------------------------------- |
| **Qwen2-VL-2B**    |            50.00% |               50.00% |      0.00% | Predicted every case as benign, even with the original images.                     |
| **MedVLM-R1**      |            50.00% |               50.00% |      0.00% | Showed the same behaviour as Qwen, with no discrimination between the two classes. |
| **Gemma 3 4B-it**  |            50.25% |               50.00% |     −0.25% | Strongly favoured malignant with real images but switched to benign without them.  |
| **MedGemma 4B-it** |        **57.50%** |               50.00% | **−7.50%** | Best original-image accuracy, but defaulted to benign when images were removed.    |

### Takeaway

Only MedGemma showed some ability to distinguish between benign and malignant cases with real images, although its performance remained limited. Without images, all four models defaulted to predicting benign.
