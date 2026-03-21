import pdf from 'pdf-parse/lib/pdf-parse.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free';
const MAX_TEXT_CHARS = 100000;

function buildPrompt(examName, text, numQuestions) {
  return `You are a professional exam question writer. Based on the study material below, generate exactly ${numQuestions} multiple-choice questions for the "${examName}" exam.

RULES:
- Each question must have exactly 1 correct answer and exactly 3 incorrect answers.
- Questions must be directly based on the provided text.
- Output ONLY a valid JSON array — no explanation, no markdown, no code fences.
- Each object must have these exact fields: type, difficulty, category, question, correct_answers (array), incorrect_answers (array).
- "type" must be "multiple", "difficulty" must be one of "easy"/"medium"/"hard", "category" must be "${examName}".
- correct_answers must be an array with exactly 1 string element.
- incorrect_answers must be an array with exactly 3 string elements.

OUTPUT FORMAT (array of objects):
[
  {
    "type": "multiple",
    "difficulty": "medium",
    "category": "${examName}",
    "question": "...",
    "correct_answers": ["correct answer here"],
    "incorrect_answers": ["wrong 1", "wrong 2", "wrong 3"]
  }
]

STUDY MATERIAL:
${text}

Output the JSON array now:`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { pdfBase64, examName, numQuestions = 20 } = req.body;

  if (!pdfBase64 || !examName) {
    return res.status(400).json({ error: 'pdfBase64 and examName are required.' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OpenRouter API key not configured on server.' });
  }

  let extractedText = '';
  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const pdfData = await pdf(pdfBuffer);
    extractedText = pdfData.text || '';
  } catch (err) {
    console.error('PDF parse error:', err);
    return res.status(422).json({ error: 'Failed to parse PDF. Make sure the file is a valid PDF.' });
  }

  if (!extractedText.trim()) {
    return res.status(422).json({ error: 'No text could be extracted from the PDF. The file may be image-only.' });
  }

  const trimmedText = extractedText.trim().slice(0, MAX_TEXT_CHARS);
  const prompt = buildPrompt(examName.toUpperCase(), trimmedText, numQuestions);

  let llmResponse;
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://quiz-app-master-tau.vercel.app',
        'X-Title': 'ServiceNow Quiz App',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return res.status(502).json({ error: 'OpenRouter API call failed.', detail: errText });
    }

    llmResponse = await response.json();
  } catch (err) {
    console.error('OpenRouter fetch error:', err);
    return res.status(502).json({ error: 'Failed to reach OpenRouter API.' });
  }

  const rawContent = llmResponse?.choices?.[0]?.message?.content || '';

  let questions = [];
  try {
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    questions = JSON.parse(jsonMatch[0]);

    questions = questions.filter(
      (q) =>
        q.question &&
        Array.isArray(q.correct_answers) &&
        q.correct_answers.length > 0 &&
        Array.isArray(q.incorrect_answers) &&
        q.incorrect_answers.length > 0
    );

    if (questions.length === 0) throw new Error('No valid questions parsed');
  } catch (err) {
    console.error('JSON parse error from LLM:', err, '\nRaw content:', rawContent);
    return res.status(500).json({
      error: 'LLM returned invalid JSON. Try regenerating.',
      raw: rawContent.slice(0, 500),
    });
  }

  return res.status(200).json({
    response_code: 1,
    results: questions,
    extractedChars: extractedText.length,
    usedChars: trimmedText.length,
  });
}
