import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator, SafeAreaView, StatusBar, Alert, Image, useWindowDimensions
} from 'react-native';
import { Search, Sparkles, FileText, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';
import BrainHeaderLogo from '../../components/BrainHeaderLogo';
import { useAuth } from '../../context/AuthContext';

const SEARCH_HISTORY_KEY = '@unveil/search-history';

const INTRO_CARDS = [
  {
    tag: 'CONCEPT',
    title: 'Lire entre les lignes',
    desc: 'UNVEIL analyse une chanson, une poésie ou un discours pour en révéler le sens caché.'
  },
  {
    tag: 'SOURCES',
    title: 'Formats pris en charge',
    desc: 'Musiques, Discours politiques, Textes littéraires, ou contenus inconnus.'
  },
  {
    tag: 'ÉTAPE 1',
    title: 'Recherche',
    desc: 'Saisissez un titre connu, ou collez directement le texte à analyser.'
  },
  {
    tag: 'ÉTAPE 2',
    title: 'Décryptage',
    desc: 'UNVEIL décortique le sens apparent et le sous-texte implicite.'
  },
  {
    tag: 'ÉTAPE 3',
    title: 'Interprétation',
    desc: 'Obtenez une lecture plus claire, profonde et étayée par des sources.'
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { width } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isWebOrTablet = isMounted && width > 768;

  const [activeTab, setActiveTab] = useState<'search' | 'raw'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SEARCH_HISTORY_KEY)
      .then((storedHistory) => {
        if (!storedHistory) return;
        const parsedHistory: unknown = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setSearchHistory(parsedHistory.filter((title): title is string => typeof title === 'string'));
        }
      })
      .catch((error) => console.warn('Impossible de charger l’historique de recherche :', error));
  }, []);

  const matchingTitles = searchHistory
    .filter((title) => title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .slice(0, 5);

  const rememberTitle = async (title: string) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const updatedHistory = [
      normalizedTitle,
      ...searchHistory.filter((item) => item.toLowerCase() !== normalizedTitle.toLowerCase()),
    ].slice(0, 20);

    setSearchHistory(updatedHistory);
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('Impossible d’enregistrer l’historique de recherche :', error);
    }
  };

  const handleDecode = async (overrideQuery?: string) => {
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.success) {
        await rememberTitle(data.data?.work_title || query);
        router.push({
          pathname: '/result',
          params: { data: JSON.stringify(data.data) },
        });
      } else {
        Alert.alert("Erreur", data.error || data.message || "Impossible de décoder cette œuvre.");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Vérifiez que le serveur backend est démarré.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecodeRawText = async () => {
    if (!rawText.trim()) return Alert.alert("Attention", "Veuillez coller un texte à analyser.");

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/decode-raw-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rawText, title: rawTitle }),
      });
      const data = await response.json();
      if (data.success) {
        await rememberTitle(data.data?.work_title || rawTitle);
        router.push({
          pathname: '/result',
          params: { data: JSON.stringify(data.data) },
        });
      } else {
        Alert.alert("Erreur", data.error || "Erreur lors de l'analyse sémiotique.");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Vérifiez le serveur backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050B14" />

      <TouchableOpacity
        accessibilityLabel="Ouvrir les paramètres du compte"
        style={styles.settingsButton}
        onPress={() => router.push('/settings')}
      >
        <Settings color="#7DD3FC" size={19} />
        <Text style={styles.settingsName}>{user?.firstName || 'Compte'}</Text>
      </TouchableOpacity>

      {/* HEADER COMPACT (DESIGN MODERNE ET COMPACT POUR GAIN D'ESPACE) */}
      <View style={isWebOrTablet ? styles.headerWeb : styles.headerMobile}>
        <BrainHeaderLogo size={isWebOrTablet ? 90 : 50} />
        <View style={styles.headerTextCol}>
          <View style={styles.brandWrap}>
            <Text style={styles.logoTitle}>UNVEIL</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.slogan}>Réveille-toi et prête l'oreille !</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>

        {/* AFFICHAGE CARTES */}
        {isWebOrTablet ? (
          /* VUE PC : 5 CARTES EN LIGNE FIXE */
          <View style={styles.webCardsGridContainer}>
            {INTRO_CARDS.map((item, index) => (
              <View key={index} style={styles.webCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.bubbleTag}>{item.tag}</Text>
                  <Text style={styles.cardIndex}>{index + 1}/5</Text>
                </View>
                <Text style={styles.bubbleTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.bubbleDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        ) : (
          /* VUE MOBILE : CARROUSEL COMPACT COMPATIBLE ECRAN TÉLÉPHONE */
          <View style={styles.mobileCarouselBox}>
            <FlatList
              data={INTRO_CARDS}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              snapToInterval={137}
              renderItem={({ item, index }) => (
                <View style={styles.infoBubbleCardVertical}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.bubbleTag}>{item.tag}</Text>
                    <Text style={styles.cardIndex}>{index + 1}/5</Text>
                  </View>
                  <Text style={styles.bubbleTitle}>{item.title}</Text>
                  <Text style={styles.bubbleDesc}>{item.desc}</Text>
                </View>
              )}
            />
          </View>
        )}

        {/* ONGLETS RECHERCHE / TEXTE INCONNU */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
            onPress={() => setActiveTab('search')}
          >
            <Search color={activeTab === 'search' ? '#FFFFFF' : '#7DD3FC'} size={15} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'raw' && styles.activeTabButton]}
            onPress={() => setActiveTab('raw')}
          >
            <FileText color={activeTab === 'raw' ? '#FFFFFF' : '#7DD3FC'} size={15} />
            <Text style={[styles.tabText, activeTab === 'raw' && styles.activeTabText]}>Texte inconnu</Text>
          </TouchableOpacity>
        </View>

        {/* MODE RECHERCHE */}
        {activeTab === 'search' && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Chanson, poème, discours..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleDecode()}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => handleDecode()}>
              <Search color="#FFFFFF" size={18} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'search' && searchQuery.trim() && matchingTitles.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Déjà recherchées</Text>
            {matchingTitles.map((title) => (
              <TouchableOpacity
                key={title}
                style={styles.suggestionRow}
                onPress={() => {
                  setSearchQuery(title);
                  handleDecode(title);
                }}
              >
                <Search color="#7DD3FC" size={15} />
                <Text style={styles.suggestionText} numberOfLines={1}>{title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* MODE TEXTE BRUT */}
        {activeTab === 'raw' && (
          <View style={styles.rawInputWrapper}>
            <TextInput
              style={styles.rawTitleInput}
              placeholder="Titre de l'œuvre (optionnel)"
              placeholderTextColor="#6B7280"
              value={rawTitle}
              onChangeText={setRawTitle}
            />
            <TextInput
              style={styles.rawTextInput}
              placeholder="Collez ici les paroles ou le texte complet..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
              value={rawText}
              onChangeText={setRawText}
            />
            <TouchableOpacity style={styles.decodeRawButton} onPress={handleDecodeRawText}>
              <Sparkles color="#FFFFFF" size={16} />
              <Text style={styles.decodeRawButtonText}>Décoder le sous-texte</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={styles.loadingText}>Analyse sémiotique en cours...</Text>
          </View>
        )}
      </ScrollView>
       {/* FOOTER EN BAS */}
        <View style={styles.footerCompany}>
          <Image 
            source={require('../../assets/images/waka-logo.png')} 
            style={styles.companyLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerText}>
            Application développée par <Text style={styles.footerTextBold}>Waka's Company</Text>
          </Text>
        </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B14', width: '100%', alignSelf: 'center' },
  settingsButton: { position: 'absolute', top: 12, left: 14, zIndex: 10, minWidth: 38, height: 38, borderRadius: 19, paddingHorizontal: 11, backgroundColor: '#0E1726', borderWidth: 1, borderColor: '#1E3A5F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  settingsName: { color: '#7DD3FC', fontSize: 11, fontWeight: '700', maxWidth: 90 },
  
  /* HEADER PC VS MOBILE */
  headerWeb: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  headerMobile: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 10, paddingHorizontal: 16, gap: 12 },
  headerTextCol: { flexDirection: 'column' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoTitle: { fontSize: 20, fontWeight: '900', color: '#7DD3FC', letterSpacing: 3 },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8B5CF6' },
  slogan: { fontSize: 10, color: '#9DB7C9', marginTop: 2, letterSpacing: 0.8, textTransform: 'uppercase' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },

  /* STYLE PC (CARTES ALIGNÉES) */
  webCardsGridContainer: { flexDirection: 'row', width: '100%', gap: 8, marginBottom: 16 },
  webCard: { flex: 1, height: 135, backgroundColor: '#0E1726', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1E3A5F', justifyContent: 'space-between' },

  /* STYLE MOBILE (CARROUSEL ULTRA COMPACT POUR TOUT FAIRE TENIR SANS SCROLL) */
  mobileCarouselBox: { height: 270, width: '100%', marginBottom: 16, overflow: 'hidden', borderRadius: 14 },
  infoBubbleCardVertical: { width: '100%', height: 125, backgroundColor: '#0E1726', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1E3A5F', justifyContent: 'space-between', marginBottom: 12 },

  /* CARTES CONTENT */
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  bubbleTag: { color: '#38BDF8', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  cardIndex: { color: '#475569', fontSize: 9, fontWeight: '700' },
  bubbleTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  bubbleDesc: { color: '#94A3B8', fontSize: 11, lineHeight: 14 },

  /* ONGLETS & RECHERCHE */
  tabContainer: { flexDirection: 'row', marginBottom: 8, backgroundColor: '#0E1726', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#1F3A4D' },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingVertical: 7, borderRadius: 8 },
  activeTabButton: { backgroundColor: '#1D4ED8' },
  tabText: { color: '#7DD3FC', fontSize: 12, fontWeight: '700' },
  activeTabText: { color: '#FFFFFF' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#0E1726', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#1E3A5F' },
  searchInput: { flex: 1, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  searchButton: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  suggestionsContainer: { backgroundColor: '#0E1726', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 10, marginTop: 6, paddingVertical: 5 },
  suggestionsLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 5, textTransform: 'uppercase', letterSpacing: 0.7 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  suggestionText: { color: '#E2E8F0', flex: 1, fontSize: 13 },
  
  /* TEXTE BRUT */
  rawInputWrapper: { gap: 6 },
  rawTitleInput: { backgroundColor: '#0E1726', color: '#FFFFFF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1E3A5F', fontSize: 12 },
  rawTextInput: { backgroundColor: '#0E1726', color: '#FFFFFF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1E3A5F', height: 70, textAlignVertical: 'top', fontSize: 12 },
  decodeRawButton: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 9, borderRadius: 8 },
  decodeRawButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  loadingContainer: { marginTop: 12, alignItems: 'center' },
  loadingText: { color: '#9CA3AF', marginTop: 8, fontSize: 12 },

  /* FOOTER COMPACT */
  footerCompany: { marginTop: 'auto', paddingTop: 24, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#1F2937', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  companyLogo: { width: 22, height: 22, borderRadius: 4 },
  footerText: { color: '#6B7280', fontSize: 10, textAlign: 'center' },
  footerTextBold: { color: '#9CA3AF', fontWeight: 'bold' }
});