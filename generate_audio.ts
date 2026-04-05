import { GoogleGenAI, Modality } from "@google/genai";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAudio(text: string, filename: string) {
  console.log(`Generating audio for: ${filename}...`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Professional, energetic voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const buffer = Buffer.from(base64Audio, 'base64');
      const filepath = path.join(process.cwd(), 'public', filename);
      fs.writeFileSync(filepath, buffer);
      console.log(`Successfully saved ${filename} to public folder!`);
    } else {
      console.error(`Failed to get audio data for ${filename}`);
    }
  } catch (error) {
    console.error(`Error generating ${filename}:`, error);
  }
}

async function main() {
  const fullShowcaseScript = `
    Welcome to Scanzo, the operating system for physical businesses. We bridge your space to the digital world.
    One QR, infinite possibilities. Consolidate reviews, menus, and payments into a single touchpoint.
    Smart routing protects you. 5-star reviews go to Google; negative feedback stays private.
    Your rules. Redirect scanners instantly to your website, menu, or booking pages.
    See how Scanzo transforms operations and drives growth for business owners like you.
    Zero watermarks. Upload your logo, customize colors, and make it yours.
    Join 1 million users dominating their markets. Claim your custom QR today. Scanzo: Business, redefined.
  `;

  await generateAudio(fullShowcaseScript, 'showcase_voiceover.wav');
  console.log("All audio generation complete!");
}

main();
