import Constants from 'expo-constants';

// Détectez automatiquement le mode développement
const isDevelopment = __DEV__;

// Sur téléphone physique, 127.0.0.1 / localhost pointe vers le téléphone lui-même.
// Il faut utiliser l'IP du PC sur le même réseau Wi‑Fi.
const expoHost = Constants.expoConfig?.hostUri ?? '192.168.1.90:19000';
const localIp = expoHost.split(':')[0] || '192.168.1.90';

// Configuration pour le développement local
const LOCAL_API_URL = `http://${localIp}:5000/api`;

// Configuration pour la production
const PRODUCTION_API_URL = 'https://api.example.com/api';

export const API_BASE_URL = isDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;

// Si l'IP détectée par Expo est incorrecte, remplacez la valeur ci-dessus :
// const LOCAL_API_URL = 'http://192.168.1.90:5000/api';
