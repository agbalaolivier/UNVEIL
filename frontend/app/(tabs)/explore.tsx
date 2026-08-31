import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, Linking, TouchableOpacity, Image } from 'react-native';
import { Sparkles, Eye, BookOpen, Layers, Cpu, ExternalLink } from 'lucide-react-native';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Sparkles color="#C084FC" size={14} />
            <Text style={styles.badgeText}>À PROPOS</Text>
          </View>
          <Text style={styles.title}>Qu'est-ce qu'UNVEIL ?</Text>
          <Text style={styles.subtitle}>
            Une application d'analyse sémiotique propulsée par l'intelligence artificielle pour décoder l'invisible.
          </Text>
        </View>

        {/* MISSION CARD */}
        <View style={styles.card}>
          <View style={styles.cardIconHeader}>
            <Eye color="#6366F1" size={22} />
            <Text style={styles.cardTitle}>Notre Mission</Text>
          </View>
          <Text style={styles.cardText}>
            Toute œuvre culturelle — chanson, poème, discours ou texte littéraire — possède deux niveaux de lecture. UNVEIL est conçu pour mettre en lumière la différence fondamentale entre la surface et le message profond.
          </Text>
        </View>

        {/* METHODOLOGY SECTION */}
        <Text style={styles.sectionTitle}>💡 Les Deux Niveaux de Lecture</Text>
        
        <View style={styles.methodologyContainer}>
          {/* LE MASQUE */}
          <View style={styles.maskBox}>
            <Text style={styles.boxTag}>🎭 Résumé contextuel</Text>
            <Text style={styles.boxTitle}>Ce qu'on entend / lit</Text>
            <Text style={styles.boxDescription}>
              Le sens littéral, l'histoire de surface et la narrative évidente perçue au premier degré.
            </Text>
          </View>

          {/* LA REALITE */}
          <View style={styles.realityBox}>
            <Text style={styles.boxTagPurple}>🔓 LA RÉALITÉ</Text>
            <Text style={styles.boxTitlePurple}>Analyse sémiotique</Text>
            <Text style={styles.boxDescriptionPurple}>
              Le contexte historique, la critique sociale, les métaphores inconscientes et le consensus académique.
            </Text>
          </View>
        </View>

        {/* FEATURES */}
        <Text style={styles.sectionTitle}>⚡ Fonctionnalités Clés</Text>

        <View style={styles.featureItem}>
          <View style={styles.featureIconWrapper}>
            <BookOpen color="#A5B4FC" size={18} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Décodage par Œuvre</Text>
            <Text style={styles.featureSub}>Recherche une chanson, un livre ou un discours célèbre pour obtenir une déconstruction immédiate.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconWrapper}>
            <Layers color="#A5B4FC" size={18} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Analyse de Texte Brut</Text>
            <Text style={styles.featureSub}>Colle n'importe quel extrait ou poème anonyme pour en extraire le sous-texte sémiotique.</Text>
          </View>
        </View>

        {/* TECH STACK */}
        <Text style={styles.sectionTitle}>🛠️ Stack Technique</Text>
        <View style={styles.techCard}>
          <View style={styles.techRow}>
            <Cpu color="#6B7280" size={16} />
            <Text style={styles.techText}><Text style={styles.boldText}>Frontend :</Text> React Native & Expo</Text>
          </View>
          <View style={styles.techRow}>
            <Cpu color="#6B7280" size={16} />
            <Text style={styles.techText}><Text style={styles.boldText}>Backend :</Text> Node.js & Express</Text>
          </View>
          <View style={styles.techRow}>
            <Cpu color="#6B7280" size={16} />
            <Text style={styles.techText}><Text style={styles.boldText}>Moteur IA :</Text> Google Gemini API</Text>
          </View>
        </View>

        {/* GITHUB LINK */}
        {/*<TouchableOpacity 
          style={styles.githubButton} 
          onPress={() => Linking.openURL('https://github.com/agbalaolivier/UNVEIL')}
        >
          <Text style={styles.githubButtonText}>Voir le projet sur GitHub</Text>
          <ExternalLink color="#FFFFFF" size={16} />
        </TouchableOpacity>*/}

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
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  header: { marginTop: 20, marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#2E1065', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#7E22CE' },
  badgeText: { color: '#C084FC', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9CA3AF', lineHeight: 22 },

  card: { backgroundColor: '#111827', borderRadius: 16, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: '#1F2937' },
  cardIconHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  cardText: { color: '#D1D5DB', fontSize: 14, lineHeight: 22 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8, marginBottom: 14 },

  methodologyContainer: { gap: 12, marginBottom: 24 },
  maskBox: { backgroundColor: '#1F2937', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#374151' },
  boxTag: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  boxTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  boxDescription: { color: '#D1D5DB', fontSize: 13, lineHeight: 18 },

  realityBox: { backgroundColor: '#2E1065', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#7E22CE' },
  boxTagPurple: { color: '#C084FC', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  boxTitlePurple: { color: '#F3E8FF', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  boxDescriptionPurple: { color: '#E9D5FF', fontSize: 13, lineHeight: 18 },

  featureItem: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  featureIconWrapper: { backgroundColor: '#1F2937', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#374151' },
  featureContent: { flex: 1 },
  featureTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  featureSub: { color: '#9CA3AF', fontSize: 13, lineHeight: 18 },

  techCard: { backgroundColor: '#111827', padding: 16, borderRadius: 12, gap: 10, marginBottom: 24, borderWidth: 1, borderColor: '#1F2937' },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  techText: { color: '#9CA3AF', fontSize: 13 },
  boldText: { color: '#E5E7EB', fontWeight: 'bold' },

  githubButton: { backgroundColor: '#6366F1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12, marginTop: 8 },
  githubButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

  /* STYLE FOOTER WAKA'S COMPANY */
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