import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Tentative de récupération des modèles disponibles...");
    
    // Essayer d'utiliser directement l'API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("Modèles disponibles :");
    if (data.models) {
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Erreur :", error.message);
  }
}

listModels();
