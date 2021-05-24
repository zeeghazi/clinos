/* eslint-disable */

export const getMarkerInterpretation = (marker) => {
  const data = {
    high: [],
    low: [],
  };

  // Glucose
  if (marker === 866) {
    data.high = [
      {
        condition: "Insulin resistance",
        prevalence: "Common in general population",
        comment: `Insulin is released by the pancreas in response to carbohydrates consumed in the diet. In states of insulin resistance, the same amount of insulin does not have the same effect on glucose transport and blood sugar levels, and the pancreas makes extra insulin to make up for it. For a while, this will work and the blood sugar levels will stay normal. Over time, though, the pancreas won't be able to keep up and the blood sugar levels will go up.
        <br />
        https://doi.org/10.1111/j.1749-6632.2002.tb04262.x
        https://www.ncbi.nlm.nih.gov/books/NBK507839/
        https://doi.org/10.1038/s41598-019-42700-1
        `,
        evidence: "Strong",
      },
      {
        condition: "Acute stress",
        prevalance: "Common in people who have experienced a recent traumatic life event.",
        comment: `The neuroendocrine response to stress is characterized by excessive gluconeogenesis, glycogenolysis and insulin resistance. Stress hyperglycemia, however, appears to be caused predominantly by increased hepatic output of glucose rather than impaired tissue glucose extraction.
        <br />
        https://doi.org/10.1016/s0749-0704(05)70154-8
        https://doi.org/10.1038/s41598-020-58679-z
        https://doi.org/10.1186/cc12514
        `,
        evidence: "Strong",
      },
      {
        condition: "Hyperadrenal function/ Cushing syndrome",
        prevalance: "Common in general population",
        comment: `Cushing’s disease is a severe clinical condition caused by a pituitary adenoma hypersecreting adrenocorticotropic hormone (ACTH). The persistently high levels of ACTH lead to chronic hypersecretion of cortisol by the adrenal glands, which negatively affects many tissues and organs in the body. Chronic hypercortisolism blocks or impedes the action of insulin on peripheral tissues, such as liver, muscle and adipose tissue, leading to increased insulin resistance, and it partially inhibits insulin release by the pancreatic beta-cells.
        <br />
        https://doi.org/10.1007/s11102-013-0483-3
        https://doi.org/10.3389/fendo.2018.00284
        https://doi.org/10.1159/000314319
        `,
        evidence: "Strong",
      },
      {
        condition: "Overactive thyroid (hyperthyroidism)",
        prevalance: "Common in general population",
        comment: `The elevated plasma glucose levels in hyperthyroidism may be explained by increased rates of endogenous glucose production, due mainly to increased gluconeogenesis.
        <br />
        https://doi.org/10.1210/jcem-63-1-62
        https://doi.org/10.1155/2013/390534
        https://doi.org/10.4061/2011/439463
        `,
        evidence: "Strong",
      },
      {
        condition: "Pancreatitis",
        prevalance: "Common in general population",
        comment: `High blood sugar (Hyperglycemia) during acute pancreatitis (AP) can be due to abnormalities in insulin secretion, increase in counterregulatory hormones release, or decrease in glucose utilization by peripheral tissues.
        <br />
        https://doi.org/10.1016/j.jpeds.2010.09.066
        https://doi.org/10.1016/j.sjbs.2018.11.012
        https://pubmed.ncbi.nlm.nih.gov/12653076/
        `,
        evidence: "Strong",
      },
    ];
    data.low = [
      {
        condition: "Hypothyroidism",
        prevalance: "Common in general population",
        comment: `Hypothyroidism is linked with various hormonal biochemical and nervous system abnormalities, which may contribute to hypoglycemia.
        <br />
        https://doi.org/10.4103/2230-8210.126517
        https://www.thetrp.net/text.asp?2017/14/3/127/216212
       `,
        evidence: "Strong",
      },
    ];
  }
  return data;
};
