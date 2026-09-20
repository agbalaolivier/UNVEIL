import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import NodeCache from 'node-cache';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const myCache = new NodeCache({ stdTTL: 86400 });

console.log("--> Clé API chargée :", process.env.GEMINI_API_KEY ? "OUI" : "NON (VIDE !)");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const primaryModel = 'gemini-3.6-flash';
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash';

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const isRetryableError = (error) => {
  const status = error?.status;
  const message = error?.message || '';

  if (status === 429 && /quota exceeded|free.?tier/i.test(message)) {
    return false;
  }

  return [408, 429, 500, 502, 503, 504].includes(status)
    || error?.code === 'ECONNRESET'
    || error?.code === 'ETIMEDOUT'
    || error?.name === 'TypeError';
};

async function generateWithFallback(prompt) {
  const modelsToTry = [...new Set([primaryModel, fallbackModel].filter(Boolean))];
  let lastError;

  for (const modelName of modelsToTry) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        console.log(`🤖 [GEMINI] ${modelName}, tentative ${attempt}/2...`);
        return await model.generateContent(prompt);
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Échec avec ${modelName} (${error.status || error.code || 'inconnu'}).`);

        if (!isRetryableError(error) || attempt === 2) break;
        await sleep(800 * attempt);
      }
    }
  }

  throw lastError || new Error('Tous les modèles Gemini sont indisponibles pour le moment.');
}

app.post('/api/decode', async (req, res) => {
  console.log("--> Requête reçue ! Données :", req.body);
  try {
    const { query, title } = req.body;
    const searchTarget = query || title;

    if (!searchTarget) {
      return res.status(400).json({ success: false, error: 'Recherche vide' });
    }

    const cacheKey = searchTarget.trim().toLowerCase();

    const cachedResult = myCache.get(cacheKey);
    if (cachedResult) {
      console.log(`⚡ [CACHE] Réponse instantanée pour : "${cacheKey}"`);
      return res.json({ success: true, data: cachedResult, cached: true });
    }

    console.log(`🤖 [API GEMINI] Appel externe pour : "${cacheKey}"...`);

    const prompt = `Analyse l'œuvre suivante : "${searchTarget}".
    Identifie précisément son type parmi "Chanson", "Poésie", "Livre", "Discours" ou "Autre".
    Pour une chanson ou un poème, fournis le texte complet uniquement s'il est dans le domaine public.
    Si le texte est protégé par le droit d'auteur, laisse "full_text" vide et explique dans "content_notice"
    que l'utilisateur peut coller lui-même le texte dans l'onglet Texte inconnu pour le lire et l'analyser.
    Pour un livre, ne fournis jamais le texte intégral : rédige plutôt un résumé fidèle de l'œuvre et de son propos dans "author_summary".
    Génère un objet JSON strict répondant exactement à cette structure :
    {
      "category": "Chanson",
      "year": "2013",
      "work_title": "${searchTarget}",
      "author": "Artiste",
      "full_text": "Texte complet uniquement si domaine public, sinon chaîne vide",
      "content_notice": "Message court expliquant pourquoi le texte est disponible ou non",
      "author_summary": "Résumé fidèle de l'œuvre, particulièrement utile pour un livre",
      "mask": "Explication courte du sens de surface",
      "reality": "Le sous-texte réel et le contexte caché",
      "key_insights": ["Point 1", "Point 2"],
      "decoded_quote": {
        "original_text": "Citation",
        "hidden_meaning": "Sens"
      },
      "academic_consensus": {
        "consensus_rate": "90%",
        "summary": "Résumé",
        "primary_sources": ["Source 1"]
      }
    }`;

    const result = await generateWithFallback(prompt);
    const parsedData = JSON.parse(result.response.text());

    myCache.set(cacheKey, parsedData);

    res.json({ success: true, data: parsedData, cached: false });
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE BACKEND :', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/decode-raw-text', async (req, res) => {
  console.log("--> Requête texte brut reçue ! Données :", req.body);
  try {
    const { rawText, title } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, error: 'Texte vide' });
    }

    const workTitle = title || 'Texte inconnu';
    const cacheKey = `raw_${workTitle.trim().toLowerCase()}_${rawText.trim().toLowerCase()}`;

    const cachedResult = myCache.get(cacheKey);
    if (cachedResult) {
      console.log(`⚡ [CACHE] Réponse instantanée pour texte brut : "${workTitle}"`);
      return res.json({ success: true, data: cachedResult, cached: true });
    }

    const prompt = `Analyse le texte ou les paroles suivantes${title ? ` de "${title}"` : ''} :

"${rawText}"

Le texte fourni par l'utilisateur peut être affiché intégralement dans le résultat.
Identifie son type parmi "Chanson", "Poésie", "Livre", "Discours" ou "Autre".
Génère un objet JSON strict répondant exactement à cette structure :
    {
      "category": "Texte",
      "year": "2024",
      "work_title": "${workTitle}",
      "author": "Auteur inconnu",
      "full_text": "${rawText.replace(/"/g, '\\"')}",
  "content_notice": "Texte fourni par l'utilisateur",
  "author_summary": "Résumé fidèle de l'œuvre ou du passage",
      "mask": "Explication courte du sens de surface",
      "reality": "Le sous-texte réel et le contexte caché",
      "key_insights": ["Point 1", "Point 2"],
      "decoded_quote": {
        "original_text": "Citation pertinente",
        "hidden_meaning": "Sens"
      },
      "academic_consensus": {
        "consensus_rate": "75%",
        "summary": "Analyse sémiotique",
        "primary_sources": ["Analyse personnelle"]
      }
    }`;

    console.log("--> Envoi du prompt texte brut à Gemini...");
    const result = await generateWithFallback(prompt);
    const parsedData = JSON.parse(result.response.text());

    myCache.set(cacheKey, parsedData);

    res.json({ success: true, data: parsedData, cached: false });
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE BACKEND :', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Unveil actif sur le port ${PORT}`);
});