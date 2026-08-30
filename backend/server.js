import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("--> Clé API chargée :", process.env.GEMINI_API_KEY ? "OUI" : "NON (VIDE !)");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/decode', async (req, res) => {
  console.log("--> Requête reçue ! Données :", req.body);
  try {
    const { query, title } = req.body;
    const searchTarget = query || title;

    if (!searchTarget) {
      console.log("--> Erreur : Recherche vide");
      return res.status(400).json({ success: false, error: 'Recherche vide' });
    }

    // Utilisation du modèle gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyse l'œuvre suivante : "${searchTarget}".
    Génère un objet JSON strict répondant exactement à cette structure TypeScript sans markdown :
    {
      "category": "Musique",
      "year": "2013",
      "work_title": "${searchTarget}",
      "author": "Artiste",
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

    console.log("--> Envoi du prompt à Gemini...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("--> Réponse de Gemini reçue !");
    console.timeEnd("⏱️ Temps de décodage texte brut");

    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    res.json({ success: true, data: parsedData });
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
      console.log("--> Erreur : Texte vide");
      return res.status(400).json({ success: false, error: 'Texte vide' });
    }

    // Utilisation du modèle gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const workTitle = title || 'Texte inconnu';
    const prompt = `Analyse le texte ou les paroles suivantes${title ? ` de "${title}"` : ''} :
    
"${rawText}"`

Génère un objet JSON strict répondant exactement à cette structure TypeScript sans markdown :
    {
      "category": "Texte",
      "year": "2024",
      "work_title": "${workTitle}",
      "author": "Auteur inconnu",
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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("--> Réponse de Gemini reçue !");

    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE BACKEND :', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Unveil actif sur le port ${PORT}`);
});