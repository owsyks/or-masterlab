# 🎓 OR MasterLab — Operations Research (Recherche Opérationnelle) Interactive Platform

Complete interactive learning, solving, and AI tutoring platform built for **ING3-SI (Université Oran 1 / TELECOM Nancy curriculum, K. ISKAFI textbook)**, powered by **NVIDIA NIM API** (`nvidia/nemotron-3.5-super-vl-120b-a12b`).

## 🚀 Quick Start

The platform is currently running at:
👉 **[http://localhost:3456](http://localhost:3456)**

To start it manually anytime:
```powershell
cd C:\Users\VVV\.gemini\antigravity\scratch\or-study-platform
node server.js
```

## ✨ Features Included

1. **📖 Cours & "How-To" Masterclass (Chapitres 1 à 7)**
   - **Chapitre 1** : Modélisation PL & Résolution Graphique (Droites parallèles $\Delta$, polyèdre convexe, 4 cas particuliers).
   - **Chapitre 2** : Forme Standard, Variables d'écart/surplus/libres ($x_j = x_j^+ - x_j^-$) & Dénombrement des Bases $\binom{n+m}{m}$.
   - **Chapitre 3** : Algorithme du Simplexe (Tableau & Dictionnaire, les 2 conventions de signe $c_j - z_j$ vs $z_j - c_j$, test du ratio $\min b_i / a_{ie}$, pivot de Gauss-Jordan).
   - **Chapitre 4** : Initialisation (Méthode de Grand M & Deux Phases) et Cas Particuliers (Dégénérescence, Cyclage de Beale, Règle de Bland, Non borné).
   - **Chapitre 5** : Dualité, Théorème des Écarts Complémentaires & Simplexe Dual.
   - **Chapitre 6** : Analyse Post-Optimale & Sensibilité (Intervalle de stabilité de $c_k$, intervalle de validité de $b_i$, Prix Duaux $y_i^*$).
   - **Chapitre 7** : Programmation Linéaire en Nombres Entiers (PLNE), Branch-and-Bound (Sac à Dos 0/1, Affectation, Ordonnancement) & Astuces de Linéarisation ($\min\max$ et $|x_2 - 10|$).

2. **🧮 Laboratoire Interactif (Solveurs Exactement Vérifiés)**
   - **Solveur Simplexe & Grand M** : Affiche tous les tableaux successifs, les opérations sur les lignes ($R_i' \leftarrow R_i - a_{ie} R_p'$), le Programme Dual $(D)$, les Prix Duaux $y_i^*$ et les intervalles de sensibilité $[c_{\min}, c_{\max}]$ et $[b_{\min}, b_{\max}]$.
   - **Grapheur 2D Interactif** : Trace le polygone réalisable, les sommets $(A, B, C\dots)$ et permet de faire glisser la droite d'iso-profit $\Delta_Z$.
   - **Visualiseur d'Arbre Branch-and-Bound (Sac à Dos 0/1)** : Tri par ratio $c_i / a_i$ et génération de tous les nœuds de l'arbre avec règles d'élagage.

3. **📚 Banque Complète des TDs & Examen Final (Corrigés Détaillés)**
   - **TD 1** (Exercices 1 & 2), **TD 2** (Exercices 1 à 10), **TD 3** (Exercices 1 à 3), **Sheet No. 4** (Exercises 1, 2, 3), et **Examen Final Oran 1** (Exercices 1, 2, 3).

4. **🎲 AI Renew Exos (Générateur Infini d'Exercices)**
   - Combine un générateur mathématique exact avec **NVIDIA NIM AI** pour créer à l'infini de nouveaux exercices corrigés.

5. **📸 AI Corrector + Vision OCR (Scanner / Dessiner sa Copie)**
   - Importez une photo/capture de votre feuille (`Ctrl+V` ou glisser-déposer) ou dessinez sur le tableau blanc intégré. Le modèle Vision `nvidia/nemotron-3.5-super-vl-120b-a12b` transcrit vos calculs (OCR), vérifie chaque tableau/étape, pointe l'erreur exacte et attribue une note sur 20.

6. **🧑‍🏫 AI Teacher (Prof. RO — Tuteur 24/7)**
   - Posez toutes vos questions en **Français**, **Darija + Français**, ou **Anglais**.
