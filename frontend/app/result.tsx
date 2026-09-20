import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, Image, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Sparkles, ChevronDown, ChevronUp, Share2, BookOpen, ArrowLeft, FileText } from 'lucide-react-native';
import BrainHeaderLogo from '../components/BrainHeaderLogo';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showSources, setShowSources] = useState(false);
  const [showFullText, setShowFullText] = useState(false); // État pour afficher/masquer le texte complet

  // Récupération des données passées depuis l'écran de recherche
  const result = params.data ? JSON.parse(params.data as string) : null;

  // Fonction de partage
  const handleShare = async () => {
    if (!result) return;
    try {
      const title = result.work_title || 'cette œuvre';
      const author = result.author ? ` par ${result.author}` : '';
      const shareMessage = `Découvre le sous-texte décodé de "${title}"${author} sur UNVEIL !`;
      
      const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://unveil.app';

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `UNVEIL - ${title}`,
            text: shareMessage,
            url: shareUrl,
          });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`);
          Alert.alert('Succès', 'Le lien et le résumé ont été copiés dans le presse-papier !');
        }
      } else {
        await Share.share({
          message: `${shareMessage}\n${shareUrl}`,
          url: shareUrl,
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage :', error);
    }
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Aucun résultat trouvé.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <Stack.Screen options={{ headerShown: false }} />

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

          {/* RÉSUMÉ DE L'ŒUVRE */}
          <View style={styles.maskCard}>
            <Text style={styles.cardHeaderTitle}>
              {result.category?.toLowerCase() === 'livre' ? "📖 RÉSUMÉ DE L'AUTEUR" : "🎭 RÉSUMÉ CONTEXTUEL"}
            </Text>
            <Text style={styles.cardContentText}>{result.category?.toLowerCase() === 'livre' ? (result.author_summary || result.mask) : result.mask}</Text>
          </View>

          {/* ANALYSE SÉMIOTIQUE */}
          <View style={styles.realityCard}>
            <View style={styles.realityHeader}>
              <Sparkles color="#C084FC" size={18} />
              <Text style={styles.realityHeaderTitle}>🔓 ANALYSE SÉMIOTIQUE (Le sous-texte)</Text>
            </View>
            <Text style={styles.realityContentText}>{result.reality}</Text>
          </View>

          {/* POINTS CLÉS */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionBoxTitle}>💡 EN BREF</Text>
            {result.key_insights?.map((insight: string, index: number) => (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{insight}</Text>
              </View>
            ))}
          </View>

          {/* LECTURE DU TEXTE LORSQU'IL EST DISPONIBLE OU FOURNI PAR L'UTILISATEUR */}
          {result.full_text && (
            <View style={styles.fullTextContainer}>
              <TouchableOpacity 
                style={styles.fullTextHeader} 
                onPress={() => setShowFullText(!showFullText)}
              >
                <View style={styles.accordionTitleGroup}>
                  <FileText color="#7DD3FC" size={18} />
                  <Text style={styles.fullTextTitle}>
                    {result.category?.toLowerCase() === 'poésie' ? 'Lire la poésie' : 'Lire le texte / les paroles'}
                  </Text>
                </View>
                {showFullText ? <ChevronUp color="#7DD3FC" size={18} /> : <ChevronDown color="#7DD3FC" size={18} />}
              </TouchableOpacity>

              {showFullText && (
                <View style={styles.fullTextContent}>
                  <Text style={styles.fullTextBody}>{result.full_text}</Text>
                </View>
              )}
            </View>
          )}

          {!result.full_text && result.content_notice && (
            <View style={styles.contentNotice}>
              <FileText color="#FBBF24" size={18} />
              <Text style={styles.contentNoticeText}>{result.content_notice}</Text>
            </View>
          )}

          {/* CITATION DÉCODÉE */}
          {result.decoded_quote && (
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>"{result.decoded_quote.original_text}"</Text>
              <Text style={styles.quoteMeaning}>➔ {result.decoded_quote.hidden_meaning}</Text>
            </View>
          )}

          {/* CONSENSUS / SOURCES */}
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

          {/* BOUTON DE PARTAGE */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 color="#FFFFFF" size={18} />
            <Text style={styles.shareButtonText}>Partager la vérité sur cette œuvre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FOOTER WAKA'S COMPANY */}
      <View style={styles.footerCompany}>
        <Image 
          source={require('../assets/images/waka-logo.png')}
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },
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
  
  /* NOUVEAUX STYLES POUR LE TEXTE COMPLET */
  fullTextContainer: { marginBottom: 16, borderRadius: 10, backgroundColor: '#0B132B', borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden' },
  fullTextHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  fullTextTitle: { color: '#7DD3FC', fontSize: 13, fontWeight: 'bold' },
  fullTextContent: { padding: 14, borderTopWidth: 1, borderTopColor: '#1E293B', backgroundColor: '#070D19' },
  fullTextBody: { color: '#94A3B8', fontSize: 13, lineHeight: 22, fontStyle: 'italic' },
  contentNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#422006', padding: 12, borderRadius: 10, marginBottom: 16 },
  contentNoticeText: { color: '#FDE68A', flex: 1, fontSize: 12, lineHeight: 18 },

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
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#050B14', 
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