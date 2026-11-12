Conference Management Toolkit - View review 

11/9/26, 3:26 PM 

# **View Reviews** 

### **Paper ID** 

55 

### **Paper Title** 

Does Medical Adaptation Help Small Vision-Language Models? A Paired Zero-Shot Study 

#### **Reviewer #4** 

## **Questions** 

**1. Originality and Novelty [To what extent does the paper present original ideas, methods, findings, or applications? For Review/Survey paper, if it has depth - you decide based on this. ]** 

Weak 

**2. Technical Quality and Soundness [Evaluate the technical correctness, methodological soundness, and rigour of the work.]** Adequate 

**3. Significance and Contribution [How significant is the contribution to the relevant research area or application domain?]** 

Limited 

**4. Methodology and Validation [Are the methodology, experimental design, datasets, evaluation metrics, comparisons, and/or validation appropriate and sufficiently described? For Review/Survey paper - you decide as per the depth. ]** Adequate 

**6. Comments to the Authors [Please clearly indicate the paper’s main strengths and the key issues that should be addressed. If the authors are given approximately one month to revise the paper, please identify the most important improvements that they should or must make, particularly regarding contribution,** 

https://cmt3.research.microsoft.com/ICIEV2026/Submission/Reviews/55 

1/4 

Conference Management Toolkit - View review 

11/9/26, 3:26 PM 

**methodology, validation/results, related work/references, and clarity of presentation.] Reviewer note on AI: Please do not copy and paste AI-generated review text. If AI tools are used for language support, reviewers remain fully responsible for the accuracy, relevance and originality of their comments, and confidential manuscript content must not be shared with external AI tools. Please provide concise but constructive comments covering, where relevant: - Main contribution and novelty: What is new, useful, or significant in the paper? Is the contribution clearly stated? - Technical/methodological quality: Are the methods appropriate, sufficiently explained, and technically sound? Are experiments, datasets, comparisons, or validation adequate? - Results and interpretation: Are the results convincing and properly discussed? Are the conclusions supported by the evidence? - Related work and references: Is the relevant literature adequately covered? Are important recent or closely related works missing, and is the paper clearly positioned against existing work? - Presentation and improvement: Comment on clarity, organisation, figures/tables, language, and the most important revisions needed to strengthen the paper. Thanks a lot indeed for your great support to build the young researchers.** A good study on VLM. The concern is their size being too small? 

#### **Reviewer #9** 

## **Questions** 

**1. Originality and Novelty [To what extent does the paper present original ideas, methods, findings, or applications? For Review/Survey paper, if it has depth - you decide based on this. ]** Good 

**2. Technical Quality and Soundness [Evaluate the technical correctness, methodological soundness, and rigour of the work.]** Good 

**3. Significance and Contribution [How significant is the contribution to the relevant research area or application domain?]** Moderate 

**4. Methodology and Validation [Are the methodology, experimental design, datasets, evaluation metrics, comparisons, and/or validation appropriate and sufficiently described? For Review/Survey paper - you decide as per the depth. ]** Good 

**6. Comments to the Authors [Please clearly indicate the paper’s main strengths and the key issues that should be addressed. If the authors are given approximately one month to revise the paper, please identify the most important improvements that they should or must make, particularly regarding contribution, methodology, validation/results, related work/references, and clarity of** 

https://cmt3.research.microsoft.com/ICIEV2026/Submission/Reviews/55 

2/4 

Conference Management Toolkit - View review 

11/9/26, 3:26 PM 

**presentation.] Reviewer note on AI: Please do not copy and paste AI-generated review text. If AI tools are used for language support, reviewers remain fully responsible for the accuracy, relevance and originality of their comments, and confidential manuscript content must not be shared with external AI tools. Please provide concise but constructive comments covering, where relevant: - Main contribution and novelty: What is new, useful, or significant in the paper? Is the contribution clearly stated? - Technical/methodological quality: Are the methods appropriate, sufficiently explained, and technically sound? Are experiments, datasets, comparisons, or validation adequate? - Results and interpretation: Are the results convincing and properly discussed? Are the conclusions supported by the evidence? - Related work and references: Is the relevant literature adequately covered? Are important recent or closely related works missing, and is the paper clearly positioned against existing work? - Presentation and improvement: Comment on clarity, organisation, figures/tables, language, and the most important revisions needed to strengthen the paper. Thanks a lot indeed for your great support to build the young researchers.** 

The work presented in the paper has some potential scientific merits. However, please answer the following queries. 

1. How did the author execute BF16 inference on NVIDIA T4 GPUs, given their lack of native BF16 arithmetic support? 

2. Why did you omit the question from the LAVE judge when the original LAVE methodology includes it? 

3. How many unique images are represented in the 500 BanglaMedVQA questions and 500 RadImageNet-VQA questions? 

4. Did you conduct blank-image or shuffled-image experiments to verify actual visual understanding? 

5. Can you provide the complete inference scripts, saved predictions, sampling IDs and statistical analysis code? 

#### **Reviewer #11** 

## **Questions** 

**1. Originality and Novelty [To what extent does the paper present original ideas, methods, findings, or applications? For Review/Survey paper, if it has depth - you decide based on this. ]** Adequate 

**2. Technical Quality and Soundness [Evaluate the technical correctness, methodological soundness, and rigour of the work.]** Weak 

**3. Significance and Contribution [How significant is the contribution to the relevant research area or application domain?]** 

https://cmt3.research.microsoft.com/ICIEV2026/Submission/Reviews/55 

3/4 

Conference Management Toolkit - View review 

11/9/26, 3:26 PM 

Limited 

**4. Methodology and Validation [Are the methodology, experimental design, datasets, evaluation metrics, comparisons, and/or validation appropriate and sufficiently described? For Review/Survey paper - you decide as per the depth. ]** Weak 

**6. Comments to the Authors [Please clearly indicate the paper’s main strengths and the key issues that should be addressed. If the authors are given approximately one month to revise the paper, please identify the most important improvements that they should or must make, particularly regarding contribution, methodology, validation/results, related work/references, and clarity of presentation.] Reviewer note on AI: Please do not copy and paste AI-generated review text. If AI tools are used for language support, reviewers remain fully responsible for the accuracy, relevance and originality of their comments, and confidential manuscript content must not be shared with external AI tools. Please provide concise but constructive comments covering, where relevant: - Main contribution and novelty: What is new, useful, or significant in the paper? Is the contribution clearly stated? - Technical/methodological quality: Are the methods appropriate, sufficiently explained, and technically sound? Are experiments, datasets, comparisons, or validation adequate? - Results and interpretation: Are the results convincing and properly discussed? Are the conclusions supported by the evidence? - Related work and references: Is the relevant literature adequately covered? Are important recent or closely related works missing, and is the paper clearly positioned against existing work? - Presentation and improvement: Comment on clarity, organisation, figures/tables, language, and the most important revisions needed to strengthen the paper. Thanks a lot indeed for your great support to build the young researchers.** 

The authors present a careful and methodologically valuable, paired evaluation of two medically adapted small vision-language models against their own base models under identical zero-shot conditions. I have the following observations 

#The authors use only one shared prompt per task, which is appropriate for isolating weight changes. However, it may disadvantage models such as MedVLM-R1 that were specifically trained with a reasoning format. 

# The evaluation is based on two model pairs, relatively small task samples, and a single deterministic run. Larger samples, additional medically adapted/base-model pairs, and repeated evaluations would improve the robustness and generalizability of the conclusions. 

# The paper would benefit from blank-image or shuffled-image controls to quantify how much each model actually depends on the visual input rather than language priors or answer biases. Given the strong constant-answer behavior observed in BUS-BRA and RadImageNet-VQA, such controls would make the diagnosis of model behavior more convincing. 

https://cmt3.research.microsoft.com/ICIEV2026/Submission/Reviews/55 

4/4 

