import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StyleRequestBody, OutfitReasoning } from '../types.js';

const SYSTEM_INSTRUCTION = `You are VESTA, a premium AI fashion stylist.

You analyze outfit candidates selected by VESTA's recommendation engine.

Your job is NOT to invent outfits.

Your job is to explain why each supplied outfit works for the user's context.

Consider:
- current weather
- temperature
- humidity
- occasion
- dress code
- personal style
- color harmony
- clothing warmth
- clothing formality

Never invent clothing items.
Never mention clothing that is not present in the supplied outfit.
Never invent weather conditions.
Never contradict the supplied scores.

Write concise, sophisticated, editorial-quality fashion advice.

The result should feel like advice from a premium personal stylist.

Return ONLY valid JSON matching the requested schema.`;

/**
 * High-quality deterministic fallback reasoning if AI provider is unavailable,
 * unconfigured, rate-limited, or network fails.
 */
export function generateLocalFallbackReasoning(request: StyleRequestBody): OutfitReasoning[] {
  const { weather, preferences, outfits } = request;

  return outfits.map((outfit) => {
    const top = outfit.items.find(i => i.category.toLowerCase().includes('top')) || outfit.items[0];
    const bottom = outfit.items.find(i => i.category.toLowerCase().includes('bottom')) || outfit.items[1] || outfit.items[0];

    // Thermal evaluation
    let weatherReason = '';
    if (weather.temperature >= 26) {
      weatherReason = `At ${weather.temperature}°C (${weather.condition}), the lightweight composition of the ${top ? top.name : 'ensemble'} delivers breathable ventilation without sacrificing structured poise.`;
    } else if (weather.temperature <= 16) {
      weatherReason = `In ${weather.temperature}°C cool air, this curated combination provides dependable thermal comfort and shielding against ambient humidity (${weather.humidity}%).`;
    } else {
      weatherReason = `The temperate ${weather.temperature}°C weather with ${weather.condition.toLowerCase()} skies allows effortless versatility across transitioning indoor and outdoor environments.`;
    }

    // Color harmony evaluation
    const colors = Array.from(new Set(outfit.items.map(i => i.color))).join(' and ');
    const colorReason = `The balance of ${colors || 'harmonious tones'} creates an understated tonal palette reflecting a refined ${preferences.colorPreference} aesthetic.`;

    // Dress code reason
    const dressCodeReason = `Crisp tailoring meets ${preferences.dressCode} expectations, striking a balance between effortless ease and formal decorum.`;

    // Occasion reason
    const occasionReason = `Consciously orchestrated for ${preferences.occasion}: offers natural confidence and mobility tailored to the setting.`;

    // Summary & Stylist tip
    const summary = `A balanced ${preferences.stylePreference.toLowerCase()} look anchoring the ${top?.name || 'top'} and ${bottom?.name || 'trousers'} with ${outfit.scores.overall}/100 total harmony.`;
    const stylistTip = `Roll cuffs cleanly or pair with subtle minimal jewelry to let the ${top?.color || 'primary'} tone lead the silhouette.`;

    return {
      outfitId: outfit.id,
      summary,
      weatherReason,
      colorReason,
      dressCodeReason,
      occasionReason,
      stylistTip,
    };
  });
}

/**
 * Validates and sanitizes the parsed AI output to conform strictly to OutfitReasoning[]
 */
function validateAIResponse(parsed: any, request: StyleRequestBody): OutfitReasoning[] {
  if (!parsed || !Array.isArray(parsed.outfits) || parsed.outfits.length === 0) {
    throw new Error('Missing or empty outfits array in AI response');
  }

  return parsed.outfits.map((o: any, idx: number) => {
    const matchingCandidate = request.outfits[idx] || request.outfits[0];
    return {
      outfitId: o.outfitId || matchingCandidate.id,
      summary: o.summary || 'Curated editorial ensemble tailored for your profile.',
      weatherReason: o.weatherReason || `Appropriate for ${request.weather.temperature}°C ${request.weather.condition}.`,
      colorReason: o.colorReason || 'Harmonious color contrast across the silhouette.',
      dressCodeReason: o.dressCodeReason || `Fulfills ${request.preferences.dressCode} requirements.`,
      occasionReason: o.occasionReason || `Suited for ${request.preferences.occasion}.`,
      stylistTip: o.stylistTip || 'Add personal accessories to complete this signature look.',
    };
  });
}

/**
 * Calls generative AI to analyze all 3 outfits in ONE request.
 * Prioritizes Groq (openai/gpt-oss-120b or qwen/qwen3.8-27b), then Gemini, then deterministic fallback.
 */
export async function generateOutfitAIReasoning(request: StyleRequestBody): Promise<{ outfits: OutfitReasoning[]; source: 'ai' | 'fallback' }> {
  const groqKey = process.env.GROQ_API_KEY || (process.env.AI_API_KEY?.startsWith('gsk_') ? process.env.AI_API_KEY : undefined);
  const geminiKey = process.env.GEMINI_API_KEY || (!process.env.AI_API_KEY?.startsWith('gsk_') ? process.env.AI_API_KEY : undefined);

  const promptContent = `Context:
Weather: ${request.weather.city}, ${request.weather.temperature}°C (Feels like: ${request.weather.feelsLike ?? request.weather.temperature}°C), Humidity: ${request.weather.humidity}%, Wind: ${request.weather.windSpeed} km/h, Condition: ${request.weather.condition}.
Preferences: Occasion: ${request.preferences.occasion}, Dress Code: ${request.preferences.dressCode}, Style: ${request.preferences.stylePreference}, Color: ${request.preferences.colorPreference}.

Candidate Outfits to evaluate:
${JSON.stringify(request.outfits, null, 2)}

Requirements:
Analyze all ${request.outfits.length} outfits. Return valid JSON matching:
{
  "outfits": [
    {
      "outfitId": "string (must match outfit id)",
      "summary": "Short editorial explanation",
      "weatherReason": "Why the outfit fits the weather",
      "colorReason": "Why the colors work",
      "dressCodeReason": "Why the outfit matches the dress code",
      "occasionReason": "Why it suits the occasion",
      "stylistTip": "One useful styling tip"
    }
  ]
}`;

  // 1. Try Groq (ultra fast model available on user's key: openai/gpt-oss-120b or openai/gpt-oss-20b)
  if (groqKey && groqKey.startsWith('gsk_')) {
    const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
    
    for (const model of candidateModels) {
      try {
        console.log(`[VESTA AI] Invoking Groq AI (${model}) for stylist reasoning...`);
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: promptContent },
          ],
          model: model,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          const validated = validateAIResponse(parsed, request);
          console.log(`[VESTA AI] Groq reasoning generated successfully with ${model} for ${validated.length} outfits.`);
          return {
            outfits: validated,
            source: 'ai',
          };
        }
      } catch (groqError: any) {
        console.warn(`[VESTA AI] Groq ${model} attempt failed:`, groqError?.message || groqError);
      }
    }
  }

  // 2. Try Gemini as alternative AI provider if configured
  if (geminiKey && !geminiKey.startsWith('gsk_') && !geminiKey.includes('YOUR_SECRET')) {
    try {
      console.log('[VESTA AI] Invoking Gemini (gemini-1.5-flash)...');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const result = await model.generateContent(promptContent);
      const textResponse = result.response.text();
      const parsed = JSON.parse(textResponse);
      const validated = validateAIResponse(parsed, request);
      return {
        outfits: validated,
        source: 'ai',
      };
    } catch (geminiError: any) {
      console.warn('[VESTA AI] Gemini call encountered error:', geminiError?.message || geminiError);
    }
  }

  // 3. Guaranteed zero-crash deterministic fallback
  console.log('[VESTA AI] Utilizing deterministic editorial stylist engine fallback.');
  return {
    outfits: generateLocalFallbackReasoning(request),
    source: 'fallback',
  };
}
