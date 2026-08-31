import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator, SafeAreaView, StatusBar, Alert, Image
} from 'react-native';
import { Search, Sparkles, ChevronDown, ChevronUp, Share2, BookOpen, FileText } from 'lucide-react-native';
import { API_BASE_URL } from '../../config';

const INTRO_CARDS = [
  {
    tag: 'CONCEPT',
    title: 'lire entre les lignes',
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
  const [activeTab, setActiveTab] = useState<'search' | 'raw'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSources, setShowSources] = useState(false);

  const handleDecode = async (overrideQuery?: string) => {
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setShowSources(false);

    try {
      const response = await fetch(`${API_BASE_URL}/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
      else Alert.alert("Erreur", "Impossible de décoder cette œuvre.");
    } catch (e) {
      Alert.alert("Erreur réseau", "Vérifiez que le serveur backend Node.js est démarré.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecodeRawText = async () => {
    if (!rawText.trim()) return Alert.alert("Attention", "Veuillez coller un texte à analyser.");

    setLoading(true);
    setResult(null);
    setShowSources(false);

    try {
      const response = await fetch(`${API_BASE_URL}/decode-raw-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, title: rawTitle }),
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
      else Alert.alert("Erreur", "Erreur lors de l'analyse sémiotique.");
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
        <View style={styles.brandWrap}>
          <Text style={styles.logoTitle}>UNVEIL</Text>
          <View style={styles.brandDot} />
        </View>
        <Text style={styles.slogan}>Réveille-toi et prête l'oreille !</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>

        {/* CARROUSEL VERTICAL FIXE (SEULE LA CARTE 1 EST VISIBLE AU DÉPART) */}
        <View style={styles.verticalCarouselBox}>
          <FlatList
            data={INTRO_CARDS}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={130} // Hauteur d'une carte
            snapToAlignment="start"
            decelerationRate="fast"
            nestedScrollEnabled={true}
            style={{ height: 130 }}
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

        {/* MODE SELECTION */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
            onPress={() => { setActiveTab('search'); setResult(null); }}
          >
            <Search color={activeTab === 'search' ? '#FFFFFF' : '#7DD3FC'} size={16} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'raw' && styles.activeTabButton]}
            onPress={() => { setActiveTab('raw'); setResult(null); }}
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

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{result.category?.toUpperCase()} • {result.year}</Text>
            </View>
            <Text style={styles.workTitle}>{result.work_title}</Text>
            <Text style={styles.authorText}>par {result.author}</Text>

            <View style={styles.maskCard}>
              <Text style={styles.cardHeaderTitle}>🎭 RÉSUMÉ CONTEXTUEL (Ce qu'on entend)</Text>
              <Text style={styles.cardContentText}>{result.mask}</Text>
            </View>

            <View style={styles.realityCard}>
              <View style={styles.realityHeader}>
                <Sparkles color="#C084FC" size={18} />
                <Text style={styles.realityHeaderTitle}>🔓 ANALISE SÉMIOTIQUE (Le sous-texte)</Text>
              </View>
              <Text style={styles.realityContentText}>{result.reality}</Text>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionBoxTitle}>💡 EN BREF</Text>
              {result.key_insights?.map((insight: string, index: number) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{insight}</Text>
                </View>
              ))}
            </View>

            {result.decoded_quote && (
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{result.decoded_quote.original_text}"</Text>
                <Text style={styles.quoteMeaning}>➔ {result.decoded_quote.hidden_meaning}</Text>
              </View>
            )}

            {result.academic_consensus && (
              <>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setShowSources(!showSources)}>
                  <View style={styles.accordionTitleGroup}>
                    <BookOpen color="#9CA3AF" size={18} />
                    <Text style={styles.accordionTitle}>Consensus / Fondement ({result.academic_consensus.consensus_rate})</Text>
                  </View>
                  {showSources ? <ChevronUp color="#9CA3AF" size={18} /> : <ChevronDown color="#9CA3AF" size={18} />}
                </TouchableOpacity>

                {showSources && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.consensusSummary}>{result.academic_consensus.summary}</Text>
                    <Text style={styles.sourcesHeader}>Sources & Analyses :</Text>
                    {result.academic_consensus.primary_sources?.map((src: string, idx: number) => (
                      <Text key={idx} style={styles.sourceItem}>• {src}</Text>
                    ))}
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert("Story", "Fonctionnalité de partage à venir !")}>
              <Share2 color="#FFFFFF" size={18} />
              <Text style={styles.shareButtonText}>Partager la vérité sur cette œuvre</Text>
            </TouchableOpacity>
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
  container: { 
    flex: 1, 
    backgroundColor: '#050B14',
    width: '100%',
    alignSelf: 'center',
  },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 14 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoTitle: { fontSize: 26, fontWeight: '900', color: '#7DD3FC', letterSpacing: 4 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6' },
  slogan: { fontSize: 12, color: '#9DB7C9', marginTop: 6, letterSpacing: 1.1, textTransform: 'uppercase' },
  
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  /* FENÊTRE VERTICALE FIXE À 130PX POUR LE SCROLL DES CARTES */
  verticalCarouselBox: {
    height: 130,
    width: '100%',
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 16,
  },
  infoBubbleCardVertical: {
    width: '100%',
    height: 130,
    backgroundColor: '#0E1726',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    justifyContent: 'center',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bubbleTag: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  cardIndex: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
  },
  bubbleTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },

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

  resultCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  metaBadge: { alignSelf: 'flex-start', backgroundColor: '#374151', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  metaBadgeText: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold' },
  workTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  authorText: { color: '#9CA3AF', fontSize: 15, marginBottom: 16 },

  maskCard: { backgroundColor: '#1F2937', padding: 14, borderRadius: 10, marginBottom: 12 },
  cardHeaderTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  cardContentText: { color: '#E5E7EB', fontSize: 14, lineHeight: 20 },

  realityCard: { backgroundColor: '#2E1065', padding: 14, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#7E22CE' },
  realityHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  realityHeaderTitle: { color: '#C084FC', fontSize: 12, fontWeight: 'bold' },
  realityContentText: { color: '#F3E8FF', fontSize: 15, fontWeight: '600', lineHeight: 22 },

  sectionBox: { marginBottom: 16 },
  sectionBoxTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bulletDot: { color: '#6366F1', marginRight: 8, fontSize: 16 },
  bulletText: { color: '#D1D5DB', fontSize: 14, flex: 1, lineHeight: 20 },

  quoteBox: { backgroundColor: '#000000', padding: 14, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#6366F1', marginBottom: 16 },
  quoteText: { color: '#FFFFFF', fontSize: 14, fontStyle: 'italic', marginBottom: 4 },
  quoteMeaning: { color: '#A5B4FC', fontSize: 13, fontWeight: '500' },

  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1F2937' },
  accordionTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accordionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  accordionContent: { backgroundColor: '#1F2937', padding: 12, borderRadius: 8, marginBottom: 16 },
  consensusSummary: { color: '#D1D5DB', fontSize: 13, marginBottom: 8 },
  sourcesHeader: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', marginTop: 4, marginBottom: 2 },
  sourceItem: { color: '#9CA3AF', fontSize: 12 },

  shareButton: { backgroundColor: '#6366F1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderRadius: 10, marginTop: 8 },
  shareButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  footerCompany: { 
    marginTop: 32, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#1F2937', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8 
  },
  companyLogo: { 
    width: 40, 
    height: 40, 
    borderRadius: 8 
  },
  footerText: { 
    color: '#6B7280', 
    fontSize: 12, 
    textAlign: 'center' 
  },
  footerTextBold: { 
    color: '#9CA3AF', 
    fontWeight: 'bold' 
  }
});