// server/src/services/imageModerationService.ts
import { GoogleGenAI, createUserContent, createPartFromBase64 } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment variables.');
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export type ModerationResult = {
  isValid: boolean;
  reason: string;
};

type ListingContext = {
  title: string;
  description: string;
  category: string;
};

function buildPrompt({ title, description, category }: ListingContext): string {
  return `אתה מערכת מודרציה לתמונות בלוח מודעות שני יד (כמו יד2).
משתמש מפרסם מודעה עם הפרטים הבאים:
קטגוריה: ${category}
כותרת: ${title}
תיאור: ${description}

בדוק את התמונה המצורפת וקבע אם היא תמונה תקינה עבור המודעה הזו. תמונה נחשבת לא תקינה אם:
1. היא מכילה עירום, תוכן מיני, אלימות, או כל תוכן פוגעני/לא הולם.
2. היא ברור שלא קשורה לקטגוריה/כותרת/תיאור של המודעה (למשל תמונה אקראית, מם, צילום מסך לא רלוונטי, או תמונה של פריט שונה לגמרי - "תמונת טרול").

תמונה כן נחשבת תקינה גם אם היא באיכות נמוכה, יש בה רקע או בלגן, או שהיא לא תואמת בצורה מושלמת לכל פרט - יש לפסול רק כאשר ברור שהתמונה לא הולמת או שהיא ברור שלא שייכת לפריט המדובר.

החזר אך ורק אובייקט JSON תקין, ללא עטיפת Markdown וללא טקסט נוסף, בפורמט המדויק הבא:
{"isValid": boolean, "reason": string}

"reason" צריך להיות משפט קצר אחד בעברית שמסביר את ההחלטה (הוא עשוי להיות מוצג למשתמש).`;
}

export async function moderateItemImage(
  imageBuffer: Buffer,
  mimeType: string,
  listing: ListingContext,
): Promise<ModerationResult> {
  try {
    const client = getAiClient();

    const result = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: createUserContent([
        buildPrompt(listing),
        createPartFromBase64(imageBuffer.toString('base64'), mimeType),
      ]),
      config: { responseMimeType: 'application/json' },
    });

    const text = result.text;
    if (!text) {
      throw new Error('Empty moderation response from Gemini');
    }

    const parsed = JSON.parse(text.trim()) as Partial<ModerationResult>;
    if (typeof parsed.isValid !== 'boolean') {
      throw new Error('Malformed moderation response');
    }

    return { isValid: parsed.isValid, reason: parsed.reason ?? '' };
  } catch (error) {
    // A misconfigured or unavailable moderation service shouldn't block
    // sellers from publishing - fail open and let the image through.
    console.error('Image moderation failed, allowing image through:', error);
    return { isValid: true, reason: '' };
  }
}
