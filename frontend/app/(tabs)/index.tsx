import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator, SafeAreaView, StatusBar, Alert, Image, useWindowDimensions
} from 'react-native';
import { Search, Sparkles, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config';
import BrainHeaderLogo from '../../components/BrainHeaderLogo';

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
  const { width } = useWindowDimensions();
  const isWebOrTablet = width > 768; // Détection écran large / PC

  const [activeTab, setActiveTab] = useState<'search' | 'raw'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDecode = async (overrideQuery?: string) => {
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.success) {
        router.push({
          pathname: '/result',
          params: { data: JSON.stringify(data.data) },
        });
      } else {
        Alert.alert("Erreur", "Impossible de décoder cette œuvre.");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Vérifiez que le serveur backend Node.js est démarré.");
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, title: rawTitle }),
      });
      const data = await response.json();
      if (data.success) {
        router.push({
          pathname: '/result',
          params: { data: JSON.stringify(data.data) },
        });
      } else {
        Alert.alert("Erreur", "Erreur lors de l'analyse sémiotique.");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Vérifiez le serveur backend Node.js.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050B14" />

      {/* HEADER */}
      <View style={styles.header}>
        <BrainHeaderLogo size={120} />
        <View style={styles.brandWrap}>
          <Text style={styles.logoTitle}>UNVEIL</Text>
          <View style={styles.brandDot} />
        </View>
        <Text style={styles.slogan}>Réveille-toi et prête l'oreille !</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>

        {/* AFFICHAGE CARTES */}
        {isWebOrTablet ? (
          /* VUE PC : 5 CARTES ALIGNÉES ET FIXES SUR UNE SEULE LIGNE */
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
          /* VUE MOBILE : CARROUSEL VERTICAL FLUIDE */
          <View style={styles.verticalCarouselBox}>
            <FlatList
              data={INTRO_CARDS}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
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

        {/* MODE SELECTION */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
            onPress={() => setActiveTab('search')}
          >
            <Search color={activeTab === 'search' ? '#FFFFFF' : '#7DD3FC'} size={16} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'raw' && styles.activeTabButton]}
            onPress={() => setActiveTab('raw')}
          >
            <FileText color={activeTab === 'raw' ? '#FFFFFF' : '#7DD3FC'} size={16} />
            <Text style={[styles.tabText, activeTab === 'raw' && styles.activeTabText]}>Texte inconnu</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH MODE */}
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
              <Search color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        )}

        {/* RAW TEXT MODE */}
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
              placeholder="Collez ici les paroles ou le texte complet à déchiffrer..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
              value={rawText}
              onChangeText={setRawText}
            />
            <TouchableOpacity style={styles.decodeRawButton} onPress={handleDecodeRawText}>
              <Sparkles color="#FFFFFF" size={18} />
              <Text style={styles.decodeRawButtonText}>Décoder le sous-texte du texte</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Analyse sémiotique et recoupement en cours...</Text>
          </View>
        )}

        {/* FOOTER WAKA'S COMPANY */}
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B14', width: '100%', alignSelf: 'center' },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 14 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoTitle: { fontSize: 26, fontWeight: '900', color: '#7DD3FC', letterSpacing: 4 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6' },
  slogan: { fontSize: 12, color: '#9DB7C9', marginTop: 6, letterSpacing: 1.1, textTransform: 'uppercase' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  /* STYLE CARTES SUR PC (GRILLE SUR 1 LIGNE FIXE) */
  webCardsGridContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  webCard: {
    flex: 1, // Répartit l'espace à parts égales entre les 5 cartes
    height: 145,
    backgroundColor: '#0E1726',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    justify: 'space-between',
  },

  /* STYLE CARTES SUR MOBILE */
  verticalCarouselBox: { height: 130, width: '100%', marginBottom: 16, overflow: 'hidden', borderRadius: 16 },
  infoBubbleCardVertical: { width: '100%', height: 130, backgroundColor: '#0E1726', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E3A5F', justifyContent: 'center', marginBottom: 10 },

  /* ELEMENTS DE LA CARTE */
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  bubbleTag: { color: '#38BDF8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardIndex: { color: '#475569', fontSize: 10, fontWeight: '700' },
  bubbleTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  bubbleDesc: { color: '#94A3B8', fontSize: 11, lineHeight: 15 },

  /* RECHERCHE ET ONGLETS */
  tabContainer: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#0E1726', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#1F3A4D' },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  activeTabButton: { backgroundColor: '#1D4ED8' },
  tabText: { color: '#7DD3FC', fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#FFFFFF' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#0E1726', borderRadius: 14, padding: 5, borderWidth: 1, borderColor: '#1E3A5F' },
  searchInput: { flex: 1, color: '#FFFFFF', paddingHorizontal: 16, fontSize: 15 },
  searchButton: { backgroundColor: '#2563EB', padding: 12, borderRadius: 10, justifyContent: 'center' },
  rawInputWrapper: { gap: 8 },
  rawTitleInput: { backgroundColor: '#0E1726', color: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1E3A5F' },
  rawTextInput: { backgroundColor: '#0E1726', color: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1E3A5F', height: 90, textAlignVertical: 'top' },
  decodeRawButton: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10 },
  decodeRawButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  loadingContainer: { marginTop: 40, alignItems: 'center' },
  loadingText: { color: '#9CA3AF', marginTop: 16, fontSize: 14 },

  /* FOOTER */
  footerCompany: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1F2937', alignItems: 'center', justifyContent: 'center', gap: 8 },
  companyLogo: { width: 40, height: 40, borderRadius: 8 },
  footerText: { color: '#6B7280', fontSize: 12, textAlign: 'center' },
  footerTextBold: { color: '#9CA3AF', fontWeight: 'bold' }
});