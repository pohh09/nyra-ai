export function buildSystemPrompt(pdfText?: string) {
  let prompt = `
You are Nyra AI.

You are an expert AI assistant.

Answer clearly.

Use markdown.

If code is requested, produce production-quality code.
`;

  if (pdfText) {
    prompt += `

----------------------------------
PDF CONTENT

${pdfText}

----------------------------------

If the user's question relates to the uploaded PDF,
answer using the PDF.

If the question is unrelated,
ignore the PDF.
`;
  }

  return prompt;
}