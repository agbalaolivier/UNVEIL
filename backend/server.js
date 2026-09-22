import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import NodeCache from 'node-cache';
import { initializeDatabase } from './db.js';
import { registerAuthRoutes, requireAuth } from './auth.js';
import { pool } from './db.js';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
registerAuthRoutes(app);

app.post('/api/share', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ success: false, error: 'Partage non configuré.' });

  try {
    if (!req.body?.result || typeof req.body.result !== 'object') {
      return res.status(400).json({ success: false, error: 'Résultat invalide.' });
    }

    const shareId = crypto.randomBytes(12).toString('base64url');
    await pool.query('INSERT INTO shared_results (id, result) VALUES ($1, $2)', [shareId, req.body.result]);
    return res.status(201).json({ success: true, shareId });
  } catch (error) {
    console.error('❌ ERREUR CRÉATION PARTAGE :', error);
    return res.status(500).json({ success: false, error: 'Partage impossible pour le moment.' });
  }
});

app.get('/api/share/:shareId', async (req, res) => {
  if (!pool) return res.status(503).json({ success: false, error: 'Partage non configuré.' });

  try {
    const result = await pool.query(
      'SELECT result FROM shared_results WHERE id = $1 AND expires_at > NOW()',
      [req.params.shareId],
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Partage introuvable ou expiré.' });
    return res.json({ success: true, data: result.rows[0].result });
  } catch (error) {
    console.error('❌ ERREUR LECTURE PARTAGE :', error);
    return res.status(500).json({ success: false, error: 'Partage indisponible pour le moment.' });
  }
});

const myCache = new NodeCache({ stdTTL: 86400 });

console.log("--> Clé API chargée :", process.env.GEMINI_API_KEY ? "OUI" : "NON (VIDE !)");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Noms de modèles Gemini officiels
const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-pro';

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

// Fonction utilitaire pour nettoyer le JSON retourné par Gemini
function parseGeminiJsonResponse(responseText) {
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

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
        console.warn(`⚠️ Échec avec ${modelName} (${error.status || error.code || error.message || 'inconnu'}).`);

        if (!isRetryableError(error) || attempt === 2) break;
        await sleep(800 * attempt);
      }
    }
  }

  throw lastError || new Error('Tous les modèles Gemini sont indisponibles pour le moment.');
}

app.post('/api/decode', requireAuth, async (req, res) => {
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

Génère un objet JSON strict correspondant à ce schéma :
{
  "category": "Chanson",
  "year": "2013",
  "work_title": "${searchTarget}",
  "author": "Nom de l'auteur / artiste",
  "full_text": "",
  "content_notice": "Notice informative",
  "author_summary": "Résumé de l'œuvre",
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
    const parsedData = parseGeminiJsonResponse(result.response.text());

    myCache.set(cacheKey, parsedData);

    res.json({ success: true, data: parsedData, cached: false });
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE BACKEND (/api/decode) :', error);
    const status = error?.status === 401 ? 503 : 500;
    const message = error?.status === 401
      ? 'Le service d’analyse est mal authentifié. Vérifiez GEMINI_API_KEY.'
      : (error.message || 'Erreur lors du décodage');
    res.status(status).json({ success: false, error: message });
  }
});

app.post('/api/decode-raw-text', requireAuth, async (req, res) => {
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

    // Sécurisation du prompt pour éviter de casser la structure JSON
    const prompt = `Tu es un expert en sémiotique et analyse littéraire.
Analyse le texte suivant (Titre suggéré: "${workTitle}") :

--- TEXTE À ANALYSER ---
${rawText}
--- FIN DU TEXTE ---

Remplis la propriété "full_text" du JSON avec la valeur exacte du texte fourni.
Identifie son type parmi "Chanson", "Poésie", "Livre", "Discours" ou "Autre".

Formate la réponse sous forme d'un objet JSON strict respectant cette structure :
{
  "category": "Texte",
  "year": "2024",
  "work_title": "${workTitle}",
  "author": "Auteur inconnu",
  "full_text": "Le texte fourni doit être placé ici",
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
    const parsedData = parseGeminiJsonResponse(result.response.text());

    // On garantit que le texte brut original reste bien conservé dans l'objet final
    parsedData.full_text = rawText;

    myCache.set(cacheKey, parsedData);

    res.json({ success: true, data: parsedData, cached: false });
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE BACKEND (/api/decode-raw-text) :', error);
    const status = error?.status === 401 ? 503 : 500;
    const message = error?.status === 401
      ? 'Le service d’analyse est mal authentifié. Vérifiez GEMINI_API_KEY.'
      : (error.message || 'Erreur lors du décodage du texte brut');
    res.status(status).json({ success: false, error: message });
  }
});

const PORT = process.env.PORT || 5000;
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend Unveil actif sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Impossible d’initialiser la base utilisateurs :', error);
    process.exit(1);
  });