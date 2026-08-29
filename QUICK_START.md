## 🚀 GUIDE DE DÉMARRAGE RAPIDE

### ✅ Prérequis (déjà configurés)
- ✅ Backend Node.js
- ✅ Frontend React Native + Expo
- ✅ API Gemini configurée
- ✅ Adresse IP: 192.168.1.90

---

## 🎬 Démarrer l'application

### Étape 1: Ouvrez deux terminaux (PowerShell)

**Terminal 1 - Backend:**
```powershell
cd C:\Users\ronni\OneDrive\Documents\UNVEIL_PROJECT\backend
node server.js
```

Attendez: `🚀 Backend Unveil actif sur le port 5000`

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\ronni\OneDrive\Documents\UNVEIL_PROJECT\frontend
npm start
```

Attendez: `Web is waiting on http://localhost:8081`

### Étape 2: Ouvrez l'application

Appuyez sur **`w`** dans Terminal 2 pour ouvrir dans le navigateur  
→ http://localhost:8081 s'ouvre automatiquement

---

## 🧪 Utiliser l'application

### Onglet "Rechercher" 🔍
1. Tapez le nom d'une œuvre: "Bohemian Rhapsody", "Macbeth", "La Joconde"
2. Cliquez sur 🔍 ou appuyez sur Entrée
3. Attendez 3-8 secondes pour l'analyse IA

### Onglet "Texte inconnu" 📄
1. Entrez un titre (optionnel)
2. Collez le texte/les paroles à analyser
3. Cliquez sur "Décoder le sous-texte du texte"
4. Résultat s'affiche en quelques secondes

---

## 📱 Tester sur téléphone

### iOS (avec iPhone):
1. Ouvrez l'appli **Appareil photo** sur votre iPhone
2. Scannez le QR code depuis Terminal 2 (exp://...)
3. L'app s'ouvre dans **Expo Go**

### Android:
1. Installez **Expo Go** depuis Google Play
2. Appuyez sur **`a`** dans Terminal 2
3. Scannez le QR code ou attendez que ça se lance
4. L'app s'ouvre automatiquement

---

## 🛠️ Dépannage rapide

| Problème | Solution |
|----------|----------|
| "Erreur réseau" | Vérifiez que backend est actif (Terminal 1) |
| "Port 5000 occupé" | Fermez autre processus Node ou changez le port |
| "Impossible de décoder" | Attendez 10 secondes et réessayez (API peut être lente) |
| "Page blanche" | Rafraîchissez le navigateur (Ctrl+R) |

---

## 📊 Vérifier que tout fonctionne

### Via PowerShell (dans n'importe quel terminal):
```powershell
# Test 1: Backend répond
$body = @{ query = "test" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/decode" `
  -Method POST -ContentType "application/json" -Body $body

# Résultat attendu: {"success": true, "data": {...}}
```

```powershell
# Test 2: Frontend est accessible
Invoke-WebRequest http://localhost:8081 -UseBasicParsing | 
  Select-Object -ExpandProperty StatusCode

# Résultat attendu: 200
```

---

## 🎨 Exemple d'utilisation

### Rechercher "Imagine" de John Lennon
1. Onglet "Rechercher"
2. Tapez: `Imagine John Lennon`
3. Résultat:
   ```
   🎭 Masque: Une chanson utopique sur la paix mondiale
   🔓 Réalité: Critique du matérialisme et appel à l'idéalisme
   💡 Points clés: 
      • Déconstruction des institutions
      • Vision communiste voilée
      • Appel à l'introspection personnelle
   ```

---

## ⏸️ Arrêter l'application

1. **Backend:** Appuyez sur `Ctrl+C` dans Terminal 1
2. **Frontend:** Appuyez sur `Ctrl+C` dans Terminal 2

---

**Bon test ! 🎉 Votre app UNVEIL est prête!**
