import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';
import BrainHeaderLogo from '../components/BrainHeaderLogo';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Informations manquantes', 'Renseigne ton adresse e-mail et ton mot de passe.');
      return;
    }
    if (mode === 'register' && (!firstName.trim() || !lastName.trim())) {
      Alert.alert('Informations manquantes', 'Renseigne ton prénom et ton nom.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await signUp({ firstName, lastName, email, password });
      } else {
        await signIn(email, password);
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Impossible de continuer', error instanceof Error ? error.message : 'Vérifie les informations saisies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrainHeaderLogo size={76} />
          <Text style={styles.logo}>UNVEIL</Text>
          <Text style={styles.subtitle}>{mode === 'register' ? 'Crée ton espace de lecture' : 'Retrouve ton espace de lecture'}</Text>
          <View style={styles.introBlock}>
            <Text style={styles.introTitle}>Lire entre les lignes</Text>
            <Text style={styles.introText}>
              UNVEIL est une application d'analyse sémiotique qui révèle les sens cachés des œuvres culturelles : chansons, poésies, discours et textes littéraires.
            </Text>
            <Text style={styles.introPrompt}>
              Crée ton compte ou connecte-toi pour commencer à décrypter.
            </Text>
          </View>

          <View style={styles.switcher}>
            <TouchableOpacity style={[styles.switchButton, mode === 'register' && styles.switchActive]} onPress={() => setMode('register')}>
              <UserPlus color={mode === 'register' ? '#FFFFFF' : '#7DD3FC'} size={16} />
              <Text style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>Inscription</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.switchButton, mode === 'login' && styles.switchActive]} onPress={() => setMode('login')}>
              <LogIn color={mode === 'login' ? '#FFFFFF' : '#7DD3FC'} size={16} />
              <Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>Connexion</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <>
              <TextInput style={styles.input} placeholder="Prénom" placeholderTextColor="#64748B" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              <TextInput style={styles.input} placeholder="Nom" placeholderTextColor="#64748B" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </>
          )}
          <TextInput style={styles.input} placeholder="Adresse e-mail" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <TextInput style={styles.input} placeholder="Mot de passe (8 caractères minimum)" placeholderTextColor="#64748B" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />

          <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{mode === 'register' ? 'Créer mon compte' : 'Se connecter'}</Text>}
          </TouchableOpacity>
          <Text style={styles.privacy}>Tes données servent uniquement à gérer ton compte et ta session UNVEIL.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#050B14' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  logo: { color: '#7DD3FC', fontSize: 28, fontWeight: '900', letterSpacing: 5, textAlign: 'center', marginTop: 8 },
  subtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  introBlock: { backgroundColor: '#0E1726', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 12, padding: 14, marginBottom: 18 },
  introTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800', textAlign: 'center', marginBottom: 7 },
  introText: { color: '#A8B7C7', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  introPrompt: { color: '#7DD3FC', fontSize: 12, fontWeight: '700', lineHeight: 18, textAlign: 'center', marginTop: 8 },
  switcher: { flexDirection: 'row', backgroundColor: '#0E1726', borderRadius: 10, padding: 3, marginBottom: 14, borderWidth: 1, borderColor: '#1E3A5F' },
  switchButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  switchActive: { backgroundColor: '#1D4ED8' },
  switchText: { color: '#7DD3FC', fontWeight: '700', fontSize: 12 },
  switchTextActive: { color: '#FFFFFF' },
  input: { backgroundColor: '#0E1726', color: '#FFFFFF', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 9, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 9, fontSize: 14 },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 9, alignItems: 'center', paddingVertical: 13, marginTop: 8 },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  privacy: { color: '#64748B', textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 16 },
});
