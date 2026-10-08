![ChromeOptimizer : libérez la mémoire de Chrome sans y penser](assets/banner.svg)

![Manifest V3](https://img.shields.io/badge/Manifest-V3-3DD6F5?style=for-the-badge&labelColor=0E1A2B)
![Chrome](https://img.shields.io/badge/Chrome-Edge%20%C2%B7%20Brave-5EE6A8?style=for-the-badge&labelColor=0E1A2B)
![Statut](https://img.shields.io/badge/statut-en%20d%C3%A9veloppement-FFB347?style=for-the-badge&labelColor=0E1A2B)
![Réseau](https://img.shields.io/badge/requ%C3%AAtes%20r%C3%A9seau-0-3DD6F5?style=for-the-badge&labelColor=0E1A2B)

**Des onglets qui dorment, des pages ouvertes en double : ChromeOptimizer s'en occupe, sans ralentir Chrome lui-même.**

[Fonctionnalités](#fonctionnalités) · [Léger par conception](#léger-par-conception) · [Installation](#installation) · [Réglages](#réglages) · [Vie privée](#vie-privée) · [Feuille de route](#feuille-de-route) · [Développement](#développement)

![](assets/divider.svg)

> **Statut : version 0.1, en test.** L'extension fonctionne et s'installe à la main (voir plus bas). Elle n'est pas encore sur le Chrome Web Store et les gains de performance n'ont pas encore été mesurés.

![Aperçu : un clic sur Optimiser met les onglets inactifs en veille, ferme les doublons et fait baisser la mémoire utilisée](assets/demo.svg)

*Aperçu illustratif : les valeurs affichées sont des exemples.*

## C'est quoi, ChromeOptimizer ?

ChromeOptimizer est un **panneau d'optimisation pour Chrome**. Il repère les onglets que vous n'avez pas touchés depuis longtemps et les met en veille, trouve les pages ouvertes plusieurs fois et n'en garde qu'une, puis vous montre ce que ça a libéré.

Pas de compte, pas de pub, pas de collecte de données. Tout se passe dans votre navigateur.

![](assets/divider.svg)

## Fonctionnalités

![Onglets inactifs, doublons, zéro surveillance, onglets protégés](assets/features.svg)

| Et aussi                   | Détail                                                          |
| -------------------------- | --------------------------------------------------------------- |
| **Panneau d'optimisation** | Liste des onglets avec leur état : actif, inactif, doublon      |
| **Optimiser en un clic**   | Ou automatiquement, selon le mode choisi dans les réglages      |
| **Délai réglable**         | Vous décidez après combien de temps un onglet passe en veille   |
| **Sites protégés**         | Une liste de sites que l'extension ne touche jamais             |
| **Compteurs locaux**       | Onglets mis en veille et doublons fermés, gardés sur votre machine |

![](assets/divider.svg)

## Léger par conception

Une extension qui optimise Chrome ne doit pas devenir le problème. Les choix suivants servent à ce qu'elle consomme le moins possible.

![Chrome envoie des événements, ChromeOptimizer ne s'active qu'à ces moments](assets/events.svg)

| Principe                           | Ce que ça change                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Événements, pas de boucle**      | L'extension écoute `chrome.tabs` et ne scrute rien en continu                                             |
| **Une seule alarme**               | `chrome.alarms` réveille le service worker une fois par minute, le reste du temps il dort                 |
| **Pas de script dans les pages**   | Aucun *content script* : vos pages ne sont ni modifiées ni ralenties                                      |
| **Dernier accès fourni par Chrome** | Chrome expose déjà la date de dernier accès de chaque onglet (`lastAccessed`), inutile de la suivre soi-même |
| **Mesures à la demande**           | La mémoire et le processeur ne sont lus que pendant que le panneau est ouvert                             |
| **Mode manuel**                    | Si vous le choisissez, aucune alarme n'existe : rien ne se réveille en arrière-plan                       |
| **Mise en veille native**          | `chrome.tabs.discard` libère la mémoire de l'onglet, qui reste dans la barre et se recharge au clic       |

![](assets/divider.svg)

## Installation

> L'extension n'est pas encore sur le Chrome Web Store. En attendant, l'installation prend **2 minutes** avec le mode développeur de Chrome. Chrome 121 ou plus récent est nécessaire.

### 1. Télécharger

Récupérez [`ChromeOptimizer-extension.zip`](ChromeOptimizer-extension.zip), ou téléchargez le dépôt entier (**Code** puis **Download ZIP**), ou clonez-le.

### 2. Décompresser

Clic droit sur le `.zip` puis **Extraire tout** (Windows), ou double-clic (Mac).

> [!IMPORTANT]
> Chrome ne sait pas charger un `.zip` directement : il lui faut le **dossier décompressé**. Rangez-le à un endroit où il ne bougera plus (si vous le déplacez ou le supprimez, l'extension disparaît).

### 3. Charger dans Chrome

1. Ouvrez `chrome://extensions` dans la barre d'adresse
2. Activez **Mode développeur** (en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Choisissez le dossier qui contient directement le fichier `manifest.json` (la racine du dépôt, ou le dossier extrait du .zip)
5. Cliquez sur l'icône puzzle de la barre d'outils, puis épinglez **ChromeOptimizer**

**Edge, Brave, Opera, Vivaldi…**

Tous les navigateurs basés sur Chromium fonctionnent avec les mêmes étapes. Seule l'adresse change :

| Navigateur | Adresse                |
| ---------- | ---------------------- |
| Chrome     | `chrome://extensions`  |
| Edge       | `edge://extensions`    |
| Brave      | `brave://extensions`   |
| Opera      | `opera://extensions`   |
| Vivaldi    | `vivaldi://extensions` |

**Ça ne marche pas ?**

| Problème                                                       | Solution                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| *Le fichier manifeste est manquant ou illisible*               | Vous avez choisi le mauvais dossier. Sélectionnez celui qui contient `manifest.json`. |
| Un bandeau parle d'extensions en mode développeur au démarrage | Normal tant que l'extension n'est pas sur le Web Store. Vous pouvez le fermer.        |
| Vous avez mis à jour les fichiers                              | Sur `chrome://extensions`, cliquez sur **Recharger** sur la carte ChromeOptimizer.    |

![](assets/divider.svg)

## Réglages

Le panneau s'ouvre depuis l'icône de la barre d'outils. La page de réglages s'ouvre avec la roue dentée.

| Réglage                | Rôle                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **Mode**               | Automatique (une vérification par minute) ou manuel (aucun réveil, bouton **Optimiser maintenant**)   |
| **Délai d'inactivité** | Temps sans usage avant la mise en veille, 30 minutes par défaut, 5 minutes au minimum                   |
| **Doublons**           | Ignorer, fermer seulement quand vous cliquez sur **Optimiser**, ou fermer automatiquement             |
| **Sites protégés**     | Domaines que l'extension ne met jamais en veille et ne ferme jamais (sous-domaines inclus)            |

Dans le panneau, le bouton **Protéger ce site** ajoute le site de l'onglet courant à cette liste.

L'onglet actif, les onglets épinglés et ceux qui jouent du son sont **toujours** laissés tranquilles, ainsi que les pages internes de Chrome.

Par défaut, les doublons ne sont fermés que sur clic : fermer un onglet est irréversible pour le texte non enregistré qu'il contient (vous pouvez le rouvrir avec `Ctrl + Maj + T`).

![](assets/divider.svg)

## Vie privée

ChromeOptimizer ne communique avec **aucun serveur**. Le code ne contient aucune requête réseau, aucun outil de mesure d'audience, aucun traceur. Les réglages et les compteurs sont stockés uniquement sur votre machine, dans `chrome.storage`.

| Permission      | Pourquoi                                                                                |
| --------------- | --------------------------------------------------------------------------------------- |
| `tabs`          | Lire l'adresse et l'état des onglets, pour repérer les inactifs et les doublons         |
| `alarms`        | Se réveiller une fois par minute au lieu de tourner en permanence                       |
| `storage`       | Garder vos réglages et vos compteurs                                                    |
| `system.memory` | Afficher la mémoire du système dans le panneau, uniquement quand il est ouvert          |
| `system.cpu`    | Afficher la charge du processeur dans le panneau, uniquement quand il est ouvert        |

Les adresses des onglets sont lues en mémoire le temps de la comparaison. Elles ne sont ni enregistrées ni envoyées.

![](assets/divider.svg)

## Feuille de route

- [x] README et assets animés
- [x] Site de présentation (`index.html`, GitHub Pages)
- [x] Extension Manifest V3 : service worker, mise en veille, détection des doublons
- [x] Panneau d'optimisation (popup) et page de réglages
- [ ] Mesures reproductibles de la mémoire et du CPU, avec et sans l'extension
- [ ] Publication sur le Chrome Web Store

Les gains de performance seront annoncés **uniquement après mesure**, avec la méthode décrite dans le dépôt.

## Développement

```
.
├── manifest.json               # extension Manifest V3 (à la racine du dépôt)
├── background.js               # service worker : une alarme par minute en mode automatique
├── lib.js                      # réglages, analyse des onglets, optimisation
├── popup.html / .css / .js     # le panneau d'optimisation
├── options.html / .css / .js   # la page de réglages
├── ui.css                      # styles communs
├── icons/                      # icônes 16, 32, 48 et 128 px
├── ChromeOptimizer-extension.zip   # l'extension seule, prête à télécharger
├── index.html                  # site de présentation (GitHub Pages)
├── README.md
└── assets/                     # SVG animés de ce README
    ├── banner.svg
    ├── demo.svg
    ├── features.svg
    ├── events.svg
    ├── divider.svg
    └── logo.svg
```

**Tester une modification.** Modifiez les fichiers à la racine du dépôt, puis cliquez sur **Recharger** sur `chrome://extensions`. Le fichier `ChromeOptimizer-extension.zip` doit être régénéré à chaque version (il ne contient que `manifest.json`, les `.js`, `.html`, `.css` et `icons/`).

![](assets/divider.svg)

Fait par Tom.
