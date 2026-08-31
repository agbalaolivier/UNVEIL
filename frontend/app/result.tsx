import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles, ChevronDown, ChevronUp, Share2, BookOpen, ArrowLeft } from 'lucide-react-native';
import BrainHeaderLogo from '../components/BrainHeaderLogo'; // Ajuste le chemin si besoin

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showSources, setShowSources] = useState(false);

  // Récupération des données passées depuis l'écran de recherche
  const result = params.data ? JSON.parse(params.data as string) : null;

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Aucun résultat trouvé.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050B14" />

      {/* HEADER FIXE (LOGO + TITRE + RETOUR) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#7DD3FC" size={18} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <BrainHeaderLogo size={80} />
        <View style={styles.brandWrap}>
          <Text style={styles.logoTitle}>UNVEIL</Text>
          <View style={styles.brandDot} />
        </View>
        <Text style={styles.slogan}>Réveille-toi et prête l'oreille !</Text>
      </View>

      {/* CONTENU DE LA LECTURE SCROLLABLE */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Text style={styles.realityHeaderTitle}>🔓 ANALYSE SÉMIOTIQUE (Le sous-texte)</Text>
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
      </ScrollView>

      {/* FOOTER WAKA'S COMPANY (FIXE EN BAS DE PAGE) */}
      <View style={styles.footerCompany}>
        <Image 
          source={require('../assets/images/waka-logo.png')} // Assure-toi que l'image existe
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
  container: { flex: 1, backgroundColor: '#050B14', width: '100%', maxWidth: 800, alignSelf: 'center' },
  header: { alignItems: 'center', marginTop: 12, marginBottom: 14, position: 'relative' },
  backButton: { position: 'absolute', left: 16, top: 12, flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 10 },
  backText: { color: '#7DD3FC', fontSize: 13, fontWeight: '600' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -5 },
  logoTitle: { fontSize: 24, fontWeight: '900', color: '#7DD3FC', letterSpacing: 4 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6' },
  slogan: { fontSize: 11, color: '#9DB7C9', marginTop: 4, letterSpacing: 1.1, textTransform: 'uppercase' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 }, // Padding pour laisser place au footer fixe
  resultCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937', marginBottom: 20 },
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

  /* STYLE FOOTER (FIXE EN BAS) */
  footerCompany: { 
    position: 'absolute', // Indispensable pour fixer
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#050B14', // Fond pour cacher le scroll dessous
    paddingVertical: 16,
    borderTopWidth: 1, 
    borderTopColor: '#1F2937', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10 
  },
  companyLogo: { width: 32, height: 32, borderRadius: 6 },
  footerText: { color: '#6B7280', fontSize: 12, textAlign: 'center' },
  footerTextBold: { color: '#9CA3AF', fontWeight: 'bold' }
});