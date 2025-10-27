# 🔧 Instructions pour Corriger la Page Paramètres

## ✅ Problème Identifié

Les paramètres existent dans Supabase mais ne se chargent pas à cause des politiques RLS (Row Level Security) qui bloquent l'accès.

## 🎯 Solution

### Étape 1: Ouvrir Supabase Dashboard
1. Allez sur: https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez le projet **TechMart Haiti**

### Étape 2: Ouvrir SQL Editor
1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query**

### Étape 3: Copier et Exécuter le Script
1. Ouvrez le fichier `fix_settings_rls.sql` (dans ce dossier)
2. **Copiez TOUT le contenu** du fichier
3. **Collez** dans le SQL Editor de Supabase
4. Cliquez sur **RUN** (ou appuyez sur F5)

### Étape 4: Vérifier
1. Attendez la confirmation "Settings table fixed!"
2. Allez dans la table **settings** (Table Editor)
3. Vous devriez voir 24 paramètres

### Étape 5: Tester dans l'App
1. Retournez sur http://localhost:3000
2. Rafraîchissez la page (F5)
3. Allez dans Admin → Paramèt
4. Vous devriez maintenant voir tous les paramètres! 🎉

## 📝 Ce que le Script Fait

### 1. Crée la Table
- Si elle n'existe pas déjà
- Avec tous les champs nécessaires

### 2. Configure les Politiques RLS
- Autorise **TOUS** à LIRE les settings (public)
- Autorise les utilisateurs authentifiés à MODIFIER

### 3. Insère les Paramètres par Défaut
- 24 paramètres organisés en 8 catégories:
  - Enfòmasyon Magazen (4)
  - Peman (4)
  - Ekspedisyon (3)
  - Taks (2)
  - Envantè (2)
  - Notifikasyon (3)
  - Rezo Sosyal (3)
  - Aparans (3)

### 4. Utilise ON CONFLICT
- N'écrase PAS les données existantes
- Ajoute seulement les paramètres manquants

## ⚠️ Important

- Le script est **SANS DANGER**
- Il ne supprime PAS de données
- Il ajoute seulement les paramètres manquants
- Les valeurs existantes sont préservées

## 🎉 Après Exécution

Une fois le script exécuté:
1. ✅ Tous les paramètres seront accessibles
2. ✅ La page Paramèt sera fonctionnelle
3. ✅ Vous pourrez éditer et sauvegarder les paramètres

## 📞 Si Ça Ne Fonctionne Pas

1. Vérifiez que vous êtes connecté à Supabase
2. Vérifiez que vous êtes dans le bon projet
3. Consultez les messages d'erreur dans le SQL Editor
4. Copiez l'erreur et partagez-la avec moi

**Testez maintenant!** 🚀

