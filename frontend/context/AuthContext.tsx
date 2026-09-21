import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (values: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

type AuthResponse = {
  success: true;
  token: string;
  user: User;
};

const TOKEN_KEY = 'unveil.auth.token';
const AuthContext = createContext<AuthContextValue | null>(null);

async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function readToken() {
  if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function clearToken() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function parseResponse(response: Response): Promise<AuthResponse> {
  const responseText = await response.text();
  let data: { success?: boolean; error?: string; token?: string; user?: User } = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {};
  }

  if (!response.ok && !data.error) {
    throw new Error(`Le serveur est indisponible (${response.status}).`);
  }
  if (!response.ok || !data.success) throw new Error(data.error || 'Une erreur est survenue.');
  if (!data.token || !data.user) throw new Error('Réponse d’authentification incomplète.');
  return { success: true, token: data.token, user: data.user };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    readToken()
      .then(async (storedToken) => {
        if (!storedToken) return;
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!response.ok) {
          await clearToken();
          return;
        }
        const data = await response.json();
        setToken(storedToken);
        setUser(data.user);
      })
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseResponse(response);
    await saveToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signUp = async (values: { firstName: string; lastName: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await parseResponse(response);
    await saveToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signOut = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!token) throw new Error('Session absente.');
    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};
    if (!response.ok || !data.success) throw new Error(data.error || 'Suppression impossible.');
    await clearToken();
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut, deleteAccount }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
