import Constants from 'expo-constants';

const customApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const localApiFallback = 'http://192.168.1.90:5000/api';
const remoteApiFallback = 'https://unveil-vs1v.onrender.com/api';

const isNativeApp = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isLocalWeb = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const expoHost = Constants.expoConfig?.hostUri ?? '192.168.1.90:19000';
const localIp = expoHost.split(':')[0] || '192.168.1.90';
const LOCAL_API_URL = `http://${localIp}:5000/api`;

// Navigateur local : backend local. Navigateur déployé : backend distant.
// Expo native : backend local sur le même réseau.
export const API_BASE_URL = customApiUrl || (isLocalWeb ? 'http://localhost:5000/api' : (isNativeApp ? LOCAL_API_URL : remoteApiFallback));

// Pour forcer un backend local :
// EXPO_PUBLIC_API_BASE_URL=http://192.168.1.90:5000/api
// ou remplacez directement la valeur ci-dessous :
// export const API_BASE_URL = 'http://192.168.1.90:5000/api';
