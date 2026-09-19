import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateAnswerParams {
  question: string;
  context: string;
}

export async function generateAnswer({
  question,
  context,
}: GenerateAnswerParams): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,

    messages: [
      {
        role: "system",
        content: `
You are a document question-answering assistant.

Answer the user's question using ONLY the provided
document context.

Rules:
- Do not use outside knowledge.
- Do not make up information.
- If the answer cannot be found in the context,
  say: "I couldn't find that information in the document."
- Keep the answer concise and directly answer the question.
        `,
      },
      {
        role: "user",
        content: `
DOCUMENT CONTEXT:

${context}

QUESTION:

${question}
        `,
      },
    ],
  });
  console.log("LLM context final: ", context);
  console.log("LLM response:", response.choices[0]?.message?.content);
  return (
    response.choices[0]?.message?.content ??
    "I couldn't generate an answer."
  );
}