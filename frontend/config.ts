import Constants from 'expo-constants';

const customApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const remoteApiFallback = 'https://unveil-vs1v.onrender.com/api';

const isLocalWeb = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

// En mode web local -> localhost
// En mode APK / Production -> backend distant sur Render
export const API_BASE_URL = customApiUrl || (isLocalWeb ? 'http://localhost:5000/api' : remoteApiFallback);