![ChromeOptimizer : libérez la mémoire de Chrome sans y penser](assets/banner.svg)

![Manifest V3](https://img.shields.io/badge/Manifest-V3-3DD6F5?style=for-the-badge&labelColor=0E1A2B)
![Chrome](https://img.shields.io/badge/Chrome-Edge%20%C2%B7%20Brave-5EE6A8?style=for-the-badge&labelColor=0E1A2B)
![Statut](https://img.shields.io/badge/statut-en%20d%C3%A9veloppement-FFB347?style=for-the-badge&labelColor=0E1A2B)
![Réseau](https://img.shields.io/badge/requ%C3%AAtes%20r%C3%A9seau-0-3DD6F5?style=for-the-badge&labelColor=0E1A2B)

**Des onglets qui dorment, des pages ouvertes en double : ChromeOptimizer s'en occupe, sans ralentir Chrome lui-même.**

[Fonctionnalités](#fonctionnalités) · [Léger par conception](#léger-par-conception) · [Installation](#installation) · [Réglages](#réglages) · [Vie privée](#vie-privée) · [Feuille de route](#feuille-de-route) · [Développement](#développement)

![](assets/divider.svg)

> **Statut : en développement.** Ce README décrit l'extension telle qu'elle est prévue. Le code de l'extension et le site de présentation arrivent ensuite.

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
| **Mise en veille native**          | `chrome.tabs.discard` libère la mémoire de l'onglet, qui reste dans la barre et se recharge au clic       |

![](assets/divider.svg)

## Installation

> L'extension n'est pas encore publiée. Cette section sera valable dès la première version. Elle ne sera pas sur le Chrome Web Store au départ : l'installation se fait avec le mode développeur de Chrome, en **2 minutes**.

### 1. Télécharger

Récupérez `ChromeOptimizer-extension.zip` depuis la page des *Releases* du dépôt, ou clonez le dépôt.

### 2. Décompresser

Clic droit sur le `.zip` puis **Extraire tout** (Windows), ou double-clic (Mac).

> [!IMPORTANT]
> Chrome ne sait pas charger un `.zip` directement : il lui faut le **dossier décompressé**. Rangez-le à un endroit où il ne bougera plus (si vous le déplacez ou le supprimez, l'extension disparaît).

### 3. Charger dans Chrome

1. Ouvrez `chrome://extensions` dans la barre d'adresse
2. Activez **Mode développeur** (en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Choisissez le dossier qui contient directement le fichier `manifest.json`
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

| Réglage                | Rôle                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| **Délai d'inactivité** | Temps sans usage avant qu'un onglet soit mis en veille                     |
| **Doublons**           | Fermer automatiquement, ou seulement les signaler dans le panneau          |
| **Mode**               | Manuel (bouton **Optimiser**) ou automatique                               |
| **Sites protégés**     | Adresses que l'extension ne met jamais en veille et ne ferme jamais        |

L'onglet actif, les onglets épinglés et ceux qui jouent du son sont **toujours** laissés tranquilles.

![](assets/divider.svg)

## Vie privée

ChromeOptimizer ne communique avec **aucun serveur**. Le code ne contient aucune requête réseau, aucun outil de mesure d'audience, aucun traceur. Les réglages et les compteurs sont stockés uniquement sur votre machine, dans `chrome.storage`.

| Permission | Pourquoi                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| `tabs`     | Lire l'adresse et l'état des onglets, pour repérer les inactifs et les doublons   |
| `alarms`   | Se réveiller une fois par minute au lieu de tourner en permanence                 |
| `storage`  | Garder vos réglages et vos compteurs                                              |

Les adresses des onglets sont lues en mémoire le temps de la comparaison. Elles ne sont ni enregistrées ni envoyées.

![](assets/divider.svg)

## Feuille de route

- [x] README et assets animés
- [ ] Extension Manifest V3 : service worker, mise en veille, détection des doublons
- [ ] Panneau d'optimisation (popup)
- [ ] Page de réglages
- [ ] Mesures reproductibles de la mémoire et du CPU, avec et sans l'extension
- [ ] Site de présentation (GitHub Pages)
- [ ] Publication sur le Chrome Web Store

Les gains de performance seront annoncés **uniquement après mesure**, avec la méthode décrite dans le dépôt.

## Développement

```
.
├── README.md
├── index.html                  # site de présentation (GitHub Pages), à venir
├── assets/                     # SVG animés de ce README
│   ├── banner.svg
│   ├── demo.svg
│   ├── features.svg
│   ├── events.svg
│   ├── divider.svg
│   └── logo.svg
└── ChromeOptimizer/            # le code de l'extension, à venir
    ├── manifest.json
    ├── background.js           # service worker : alarme, mise en veille, doublons
    ├── popup.html / .css / .js # le panneau d'optimisation
    ├── options.html / .js      # les réglages
    └── icons/
```

**Tester une modification.** Modifiez les fichiers du dossier `ChromeOptimizer/`, puis cliquez sur **Recharger** sur `chrome://extensions`.

![](assets/divider.svg)

Fait par Tom.
