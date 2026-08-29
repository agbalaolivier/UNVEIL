## Configuration du Frontend - Guide Rapide

### 🎯 Avant de lancer l'app

1. **Trouvez votre adresse IP locale** (voir CORRECTIONS.md)

2. **Mettez à jour `config.ts`**:
   ```bash
   # Ouvrez frontend/config.ts
   # Remplacez la ligne:
   const LOCAL_API_URL = 'http://192.168.X.X:5000/api';
   # Par votre adresse IP, par exemple:
   const LOCAL_API_URL = 'http://192.168.1.90:5000/api';
   ```

3. **Assurez-vous que le backend fonctionne**:
   ```bash
   cd backend
   node server.js
   # Devrait afficher: 🚀 Backend Unveil actif sur le port 5000
   ```

### ▶️ Lancer l'application

```bash
cd frontend
npm start
```

Appuyez sur:
- **i** pour iOS
- **a** pour Android
- **w** pour web

### ✅ Tester l'application

1. Recherchez une œuvre (chanson, poème, film, etc.)
2. Ou collez du texte brut dans l'onglet "Texte inconnu"
3. L'app devrait afficher l'analyse sémiotique générée par Gemini

### 🆘 Résolution des problèmes

| Erreur | Solution |
|--------|----------|
| "Impossible de décoder" | Vérifiez que le backend est en cours d'exécution |
| "Erreur réseau" | Vérifiez l'adresse IP dans `config.ts` |
| "Connexion refusée" | Le backend n'écoute pas sur le port 5000 |
| API ne répond pas | Vérifiez que vous êtes sur le même réseau WiFi |

---

**Le backend doit toujours être en cours d'exécution pour que l'app fonctionne!**
