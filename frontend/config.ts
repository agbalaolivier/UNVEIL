// Configuration de l'API backend
// ⚠️ IMPORTANT : Remplacez 192.168.X.X par votre adresse IP locale !
// Pour trouver votre IP : ouvrez terminal et tapez 'ipconfig' (Windows) ou 'ifconfig' (Mac/Linux)
// Cherchez l'adresse IPv4 de votre connexion réseau

// Détectez automatiquement le mode développement
const isDevelopment = __DEV__; // Cette variable est disponible dans Expo

// Configuration pour le développement local
const LOCAL_API_URL = 'http://192.168.1.90:5000/api'; // ✅ IP configurée: 192.168.1.90

// Configuration pour la production
const PRODUCTION_API_URL = 'https://api.example.com/api'; // À remplacer par votre URL de production

export const API_BASE_URL = isDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;

// Instructions pour configurer l'IP :
// 1. Ouvrez PowerShell/Terminal
// 2. Tapez : ipconfig (Windows) ou ifconfig (Mac/Linux)
// 3. Cherchez "IPv4 Address" sous votre adaptateur réseau actif
// 4. Remplacez "192.168.X.X" par cette adresse ci-dessus
// 5. Assurez-vous que votre mobile/émulateur est sur le MÊME réseau WiFi que votre ordinateur
