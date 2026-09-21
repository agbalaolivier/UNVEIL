import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, LogOut, Trash2, UserRound } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const SEARCH_HISTORY_KEY = '@unveil/search-history';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      await deleteAccount();
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Suppression impossible', error instanceof Error ? error.message : 'Réessaie plus tard.');
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#7DD3FC" size={18} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Paramètres du compte</Text>
        <Text style={styles.subtitle}>Gère ta session et tes données UNVEIL.</Text>

        <View style={styles.profileCard}>
          <UserRound color="#7DD3FC" size={22} />
          <View style={styles.profileText}>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SESSION</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <LogOut color="#FBBF24" size={18} />
          <Text style={styles.actionText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>DONNÉES LOCALES</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => AsyncStorage.removeItem(SEARCH_HISTORY_KEY)}>
          <Text style={styles.actionIcon}>×</Text>
          <Text style={styles.actionText}>Effacer mon historique de recherche</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>ZONE DANGEREUSE</Text>
        <View style={styles.dangerBox}>
          <Text style={styles.dangerTitle}>Supprimer définitivement mon compte</Text>
          <Text style={styles.dangerText}>Cette action supprime ton profil et ta session. Elle est irréversible.</Text>
          <TouchableOpacity style={[styles.deleteButton, confirmDelete && styles.deleteButtonConfirm]} onPress={handleDelete} disabled={loading}>
            <Trash2 color="#FFFFFF" size={17} />
            <Text style={styles.deleteText}>{loading ? 'Suppression...' : confirmDelete ? 'Confirmer la suppression' : 'Supprimer mon compte'}</Text>
          </TouchableOpacity>
          {confirmDelete && <Text style={styles.confirmHint}>Appuie une seconde fois pour confirmer.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B14' },
  content: { padding: 22, maxWidth: 620, width: '100%', alignSelf: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 26 },
  backText: { color: '#7DD3FC', fontSize: 13, fontWeight: '700' },
  title: { color: '#F8FAFC', fontSize: 26, fontWeight: '900' },
  subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 6, marginBottom: 22 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0E1726', borderColor: '#1E3A5F', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 },
  profileText: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  email: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  sectionLabel: { color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0E1726', borderColor: '#1E3A5F', borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 8 },
  actionIcon: { color: '#7DD3FC', fontSize: 22, width: 18, textAlign: 'center' },
  actionText: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  dangerBox: { backgroundColor: '#2A1115', borderColor: '#7F1D1D', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 2 },
  dangerTitle: { color: '#FCA5A5', fontSize: 14, fontWeight: '800' },
  dangerText: { color: '#FDA4AF', fontSize: 12, lineHeight: 18, marginTop: 7, marginBottom: 14 },
  deleteButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#991B1B', borderRadius: 8, padding: 12 },
  deleteButtonConfirm: { backgroundColor: '#DC2626' },
  deleteText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  confirmHint: { color: '#FCA5A5', fontSize: 11, textAlign: 'center', marginTop: 8 },
});
