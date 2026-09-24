import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react-native';
import BrainHeaderLogo from '../components/BrainHeaderLogo';
import { API_BASE_URL } from '../config';

async function parseJsonResponse(response: Response) {
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : {};
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('Adresse e-mail requise', 'Renseigne ton adresse e-mail pour recevoir un code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) throw new Error(data.error || 'Envoi du code impossible.');

      setStep('reset');
      Alert.alert('Code envoyé', 'Si un compte existe avec cette adresse, un code vient de t’être envoyé par e-mail.');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Envoi du code impossible.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      Alert.alert('Code requis', 'Renseigne le code reçu par e-mail.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mots de passe différents', 'Les deux mots de passe doivent être identiques.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: cleanCode, password }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) throw new Error(data.error || 'Réinitialisation impossible.');

      Alert.alert('Mot de passe mis à jour', 'Tu peux maintenant te connecter avec ton nouveau mot de passe.');
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Réinitialisation impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#7DD3FC" size={18} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <BrainHeaderLogo size={76} />
          <Text style={styles.logo}>UNVEIL</Text>
          <Text style={styles.subtitle}>
            {step === 'request' ? 'Réinitialise ton mot de passe' : 'Choisis un nouveau mot de passe'}
          </Text>

          <View style={styles.introBlock}>
            <Text style={styles.introText}>
              {step === 'request'
                ? 'Renseigne ton adresse e-mail pour recevoir un code de réinitialisation.'
                : `Un code a été envoyé à ${email.trim()}. Renseigne-le ci-dessous avec ton nouveau mot de passe.`}
            </Text>
          </View>

          {step === 'request' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Adresse e-mail"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TouchableOpacity style={styles.submitButton} onPress={requestCode} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : (
                    <View style={styles.submitContent}>
                      <Mail color="#FFFFFF" size={16} />
                      <Text style={styles.submitText}>Envoyer le code</Text>
                    </View>
                  )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Code reçu par e-mail"
                placeholderTextColor="#64748B"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe (8 caractères minimum)"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirme le nouveau mot de passe"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password-new"
              />

              <TouchableOpacity style={styles.submitButton} onPress={resetPassword} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : (
                    <View style={styles.submitContent}>
                      <KeyRound color="#FFFFFF" size={16} />
                      <Text style={styles.submitText}>Réinitialiser le mot de passe</Text>
                    </View>
                  )}
              </TouchableOpacity>

              <TouchableOpacity onPress={requestCode} disabled={loading}>
                <Text style={styles.resendLink}>Renvoyer le code</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#050B14' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: '#7DD3FC', fontSize: 14, fontWeight: '700' },
  logo: { color: '#7DD3FC', fontSize: 28, fontWeight: '900', letterSpacing: 5, textAlign: 'center', marginTop: 8 },
  subtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  introBlock: { backgroundColor: '#0E1726', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 12, padding: 14, marginBottom: 18 },
  introText: { color: '#A8B7C7', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  input: { backgroundColor: '#0E1726', color: '#FFFFFF', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 9, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 9, fontSize: 14 },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 9, alignItems: 'center', paddingVertical: 13, marginTop: 8 },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  resendLink: { color: '#7DD3FC', textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: 14 },
});
