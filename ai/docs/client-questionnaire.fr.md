<!-- GENERATED FILE — do not edit. Source: ai/schema/question-bank.json + ai/schema/offering.json. Re-render: npm run questionnaire:render -->

# Questionnaire de discovery Shopify

> **Version:** question bank 1.7.0 · offering 3.0.0
>
> **Mode d’emploi :** parcourez les §§ 0 à 10 avec le client pendant l’atelier de discovery. Répondez à chaque
> question *required* — « TBC » est acceptable, une case vide ne l’est pas. Les questions marquées *consultant* sont
> renseignées par le lead consultant, pas par le client.
>
> **Résultat :** le questionnaire complété alimente le moteur de discovery, qui produit la spécification de la mission,
> la classification de l’offre, la capability map, le deck de clôture et le backlog.
>
> **Données personnelles :** ne consignez aucune donnée personnelle de client final. Les noms des interlocuteurs sont facultatifs.

---

## § 0 — Objectifs business

> Ce qui ne va pas avant ce qu’il faut construire. Cette section est le brief principal : chaque capacité que nous cadrons doit remonter à une réponse donnée ici.

### 0.1 Le problème central

**Q0.1.1** — Qu’est-ce qui empêche le plus votre e-commerce de croître aujourd’hui ? *(required)*

> Answer:

**Q0.1.2** — Depuis combien de temps ce problème existe-t-il, et qu’avez-vous déjà tenté pour le résoudre ? *(recommended)*

> Answer:

**Q0.1.3** — Si nous ne résolvions qu’une seule chose dans cette mission, laquelle aurait le plus fort impact business ? *(recommended)*

> Answer:

### 0.2 Chiffre d’affaires & conversion

**Q0.2.1** — Quel est votre chiffre d’affaires e-commerce mensuel actuel (fourchette et devise) ? *(required)*

- min:
- max:
- currency:

**Q0.2.2** — Quel est votre taux de conversion actuel (%) ? *(required)*

> Answer:

**Q0.2.3** — Quelles catégories de produits, quels marchés ou quels segments de clientèle sous-performent ? *(optional)*

> Answer:

**Q0.2.4** — Le principal goulet d’étranglement est-il l’acquisition (trafic), la conversion (le trafic n’achète pas) ou la rétention (les clients ne reviennent pas) ? *(required)*

*(tick one)*
- [ ] Acquisition
- [ ] Conversion
- [ ] Fidélisation
- [ ] Mixte
- [ ] Pas encore certain

**Q0.2.5** — Quelle part du chiffre d’affaires provient aujourd’hui de chaque canal (boutique en ligne, magasins, marketplaces, social commerce, vente en gros / B2B, autres) ? *(recommended)*
*Nous indique si le périmètre retail, B2B et marketplace entre en jeu.*

| Channel | Share pct | Growth |
|---|---|---|
| | | |

**Q0.2.6** — Combien de commandes par mois prévoyez-vous la première année ? *(required)*
*Les applications de retours, de suivi et d’anti-fraude sont facturées au volume de commandes.*

> Answer:

### 0.3 Points de friction opérationnels

**Q0.3.1** — Quelles tâches manuelles votre équipe effectue-t-elle aujourd’hui que la plateforme devrait automatiser, et quels processus se cassent le plus souvent ? *(required)*

> Answer:

**Q0.3.2** — Combien d’heures par semaine l’équipe consacre-t-elle à des contournements ? *(optional)*

> Answer:

### 0.4 Objectifs de croissance & KPI

**Q0.4.1** — À quoi ressemble le succès dans douze mois (chiffre d’affaires, nouveaux marchés, canaux, volume clients) ? *(required)*

> Answer:

**Q0.4.2** — Quels KPI mesureront le succès ? Pour chacun : indicateur, valeur de référence actuelle, cible, horizon en mois. *(required)*

| Metric | Baseline | Target | Horizon months |
|---|---|---|---|
| | | | |

### 0.5 Contexte plateforme

**Q0.5.1** — Qu’est-ce qui a déclenché cette mission — pourquoi Shopify, et pourquoi maintenant ? *(required)*

> Answer:

**Q0.5.2** — Si vous quittez une autre plateforme, que ne faut-il surtout pas perdre lors de la transition ? *(recommended)*

> Answer:

**Q0.5.3** — Qu’est-ce qui vous satisfait le moins dans la boutique ou la configuration actuelle ? *(recommended)*

> Answer:

**Q0.5.4** — Depuis quelle plateforme migrez-vous (ou aucune — création ex nihilo) ? *(required)*
*L’application Store Migration de Shopify importe les produits et les clients depuis certaines plateformes (par ex. WooCommerce, Wix, Square) ; les autres plateformes passent par une application de migration ou par l’API.*

*(tick one)*
- [ ] Aucun
- [ ] Shopify
- [ ] WooCommerce
- [ ] Magento / Adobe Commerce
- [ ] Shopware
- [ ] Salesforce Commerce Cloud
- [ ] BigCommerce
- [ ] Sur mesure
- [ ] Autre

### 0.6 Budget

**Q0.6.1** — Quelle est l’enveloppe budgétaire approximative pour ce projet (fourchette et devise) ? *(required)*

- Min:
- Max:
- Currency:

**Q0.6.2** — La priorité est-elle de minimiser le coût initial (applications et configuration), de posséder la solution (développement sur mesure), ou un équilibre entre les deux ? *(required)*

*(tick one)*
- [ ] Limiter l'investissement initial
- [ ] Solution propre
- [ ] Équilibré

**Q0.6.3** — Existe-t-il un plafond mensuel pour les abonnements aux applications ? *(optional)*
*De nombreux besoins sont couverts par les applications de Shopify (par ex. Subscriptions, Bundles, Search & Discovery, Translate & Adapt, Flow, Messaging). Nous les examinons en premier.*

> Answer:

---

## § 1 — Entreprise, marque & Shopify

> Configuration de la boutique, plan Shopify, positionnement de marque et éléments graphiques.

### 1.1 Identité de l’entreprise

**Q1.1.1** — Nom commercial et raison sociale (si différents). *(required)*

- Name:
- Legal name:

**Q1.1.2** — Pays d’immatriculation / siège social. *(required)*

> Answer:

**Q1.1.3** — Secteur et univers produit. *(required)*

> Answer:

**Q1.1.4** — L’activité est-elle direct-to-consumer, B2B, ou hybride ? *(required)*
*B2B ou hybride amène les questions B2B et vente en gros (§ 6.2).*

*(tick one)*
- [ ] Vente directe au consommateur (DTC)
- [ ] Entreprises (B2B)
- [ ] Hybride (DTC et B2B)

**Q1.1.5** — URL du site actuel. *(optional)*

> Answer:

**Q1.1.6** — Vendez-vous via plus d’une personne morale (par ex. une par pays ou région) ? Merci de les lister. *(required)*
*Plusieurs entités de vente dans une boutique, ou une boutique par entité, change la configuration.*

> Answer:

**Q1.1.7** — Où vendrez-vous au lancement ? *(required)*
*Boutique en ligne, Shopify POS, application Shop, marketplaces, canaux sociaux, B2B, front-ends headless ou applicatifs, agents d’achat IA.*

*(tick all that apply)*
- [ ] Boutique en ligne
- [ ] Shopify POS
- [ ] Shop app
- [ ] Places de marché
- [ ] Facebook & Instagram
- [ ] Google & YouTube
- [ ] TikTok
- [ ] B2B en ligne
- [ ] Headless ou application mobile
- [ ] Assistants d'achat IA
- [ ] Aucun
- [ ] Pas encore certain

**Q1.1.8** — Pour combien de marques distinctes, visibles par vos clients, cet engagement a-t-il besoin d’une boutique Shopify ? *(required)*
*Une marque que deux clients reconnaîtraient comme des noms, logos ou identités différents — pas un marché ni une gamme de produits sous la même marque.*

> Answer:

### 1.2 Compte Shopify

**Q1.2.1** — Existe-t-il déjà une boutique Shopify ? *(required)*

- [ ] Yes
- [ ] No

**Q1.2.2** — URL de la boutique existante, plan Shopify actuel et thème actuel. *(recommended)*
*Skip if Q1.2.1 = no.*

- Store URL:
- Current plan:
- Current theme:

**Q1.2.3** — Sur quel plan Shopify la nouvelle boutique fonctionnera-t-elle (si c’est déjà décidé) ? *(required)*
*Nous recommandons le plan une fois les exigences connues.*

*(tick one)*
- [ ] Aucun
- [ ] Starter
- [ ] Basic
- [ ] Grow
- [ ] Advanced
- [ ] Shopify Plus
- [ ] Enterprise
- [ ] Magasin
- [ ] Pas encore certain

**Q1.2.4** — Quelles applications sont installées aujourd’hui, à quoi servent-elles, et lesquelles doivent rester ? *(recommended)*
*Skip if Q1.2.1 = no.*

| App | Purpose | Decision |
|---|---|---|
| | | |

**Q1.2.5** — Audit de la boutique existante : quelles fonctionnalités Shopify retirées ou obsolètes utilise-t-elle encore ? *(required · consultant)*
*Skip if Q1.2.1 = no.*
*Shopify Scripts ne fonctionne plus depuis le 30/06/2026 ; checkout.liquid et les scripts additionnels sont retirés ; les script tags de la boutique en ligne s’arrêtent le 01/03/2027 ; les anciens comptes clients sont obsolètes ; Stocky est retiré ; l’application Geolocation est retirée.*

*(tick all that apply)*
- [ ] Shopify Scripts
- [ ] checkout.liquid ou scripts supplémentaires
- [ ] Balises de script de la boutique en ligne
- [ ] Anciens comptes clients
- [ ] Stocky
- [ ] Application de géolocalisation
- [ ] Aucun
- [ ] Pas encore certain

**Q1.2.6** — Combien de personnes auront besoin de leur propre accès à l’administration Shopify après la mise en ligne ? *(required)*
*Les comptes collaborateur et le personnel uniquement POS ne sont pas comptés.*

> Answer:

### 1.3 Marque & positionnement

**Q1.3.1** — Comment décririez-vous le positionnement de la marque : value, milieu de gamme, premium, luxe ou enterprise ? *(required)*
*Le positionnement façonne la profondeur du design et l’approche de la solution.*

*(tick one)*
- [ ] Montant
- [ ] Milieu de gamme
- [ ] Premium
- [ ] Luxe
- [ ] Enterprise

**Q1.3.2** — L’identité de marque est-elle finalisée (logo, palette de couleurs, typographie) ? *(recommended)*

- [ ] Yes
- [ ] No

**Q1.3.3** — Dans quels formats les éléments de marque sont-ils disponibles (SVG, PNG, Figma, PDF de charte) ? *(optional)*
*Skip if Q1.3.2 = no.*

> Answer:

**Q1.3.4** — Existe-t-il une charte de marque stricte à respecter ? *(recommended)*

- [ ] Yes
- [ ] No

**Q1.3.5** — Qu’est-ce qui différencie la marque — prix, qualité, exclusivité, communauté, durabilité ? *(optional)*

> Answer:

### 1.4 Contexte concurrentiel

**Q1.4.1** — Quels sont vos trois principaux concurrents en ligne ? *(optional)*

> Answer:

**Q1.4.2** — Quelles boutiques (concurrentes ou non) souhaitez-vous citer en référence d’UX ? *(optional)*

> Answer:

---

## § 2 — Catalogue & produits

> Modèle produit, variantes, métachamps, prix et stock.

### 2.1 Taille du catalogue & variantes

**Q2.1.1** — Combien de SKU actifs le catalogue compte-t-il (approximativement) ? *(required)*

> Answer:

**Q2.1.2** — Quel est le nombre maximal d'options sur un produit (par exemple taille, couleur, matière = 3) ? *(required)*
*Shopify autorise jusqu'à 3 options par produit ; au-delà, il faut un autre modèle de produit.*

> Answer:

**Q2.1.3** — Quel est le nombre maximal de variantes sur un seul produit ? *(required)*
*Shopify autorise jusqu'à 2 048 variantes par produit.*

> Answer:

**Q2.1.4** — Des variantes comme les couleurs sont-elles gérées en produits distincts (SKU, images et URL propres) qui doivent apparaître comme un seul produit sur la boutique ? *(required)*
*C'est ce que Shopify appelle les combined listings.*

- [ ] Yes
- [ ] No

### 2.2 Types de produits

**Q2.2.1** — Quels types de produits existent dans le catalogue ? *(required)*
*Shopify Bundles crée des offres groupées fixes et des lots ; les offres groupées à composition libre nécessitent une application.*

*(tick all that apply)*
- [ ] Simple
- [ ] Variante
- [ ] Offre groupée fixe
- [ ] Lot
- [ ] Offre groupée à composition libre
- [ ] Bundle
- [ ] Ensemble de produits
- [ ] Carte cadeau
- [ ] Numérique
- [ ] Abonnement
- [ ] Précommande
- [ ] Fabriqué sur commande
- [ ] Virtuel
- [ ] Essayer avant d'acheter
- [ ] Aucun
- [ ] Pas encore certain

**Q2.2.2** — Les abonnements passeront-ils par Shopify Subscriptions (l'application de Shopify) ou par une application tierce ? Précisez laquelle si vous la connaissez. *(recommended)*
*Skip if Q2.2.1 does not include subscription.*
*Ask if Q2.2.1 includes Subscription.*
*Shopify Subscriptions : les clients sautent, suspendent et résilient depuis leur compte ; incompatible avec les offres groupées et le B2B.*

- Approach:
- Subscription app:

**Q2.2.3** — Si vous vendez des offres groupées : que doivent-elles permettre ? *(recommended)*
*Skip if Q2.2.1 does not include fixed_bundle,multipack,mix_and_match_bundle,bundle,product_set.*
*Ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle.*
*Shopify Bundles : jusqu'à 30 composants ; incompatible avec les abonnements et les précommandes ; pas d'imbrication.*

*(tick all that apply)*
- [ ] Offre groupée à prix fixe
- [ ] Lot
- [ ] Le client compose l'offre groupée
- [ ] Offre groupée avec abonnement
- [ ] Paliers de remise sur offres groupées
- [ ] Vendre des offres groupées au point de vente
- [ ] Offres groupées sur les places de marché
- [ ] Aucun
- [ ] Pas encore certain

**Q2.2.4** — Quelles fonctionnalités d'abonnement sont nécessaires ? *(recommended)*
*Skip if Q2.2.1 does not include subscription.*
*Ask if Q2.2.1 includes Subscription.*

*(tick all that apply)*
- [ ] Paiement par livraison
- [ ] Livraisons multiples prépayées
- [ ] Composer son coffret
- [ ] Remise sur abonnement
- [ ] Offres groupées en abonnement
- [ ] Abonnements au point de vente
- [ ] Abonnements B2B
- [ ] Abonnements internationaux
- [ ] Migrer les contrats existants
- [ ] Pas encore certain

**Q2.2.5** — Pour les précommandes, à quel moment le client est-il débité ? *(recommended)*
*Skip if Q2.2.1 does not include pre_order.*
*Ask if Q2.2.1 includes Pre order.*
*Les précommandes nécessitent une application dédiée ; les paiements express (Shop Pay, Apple Pay, Google Pay) ne sont pas disponibles pour les précommandes.*

*(tick one)*
- [ ] Intégralité à la commande
- [ ] Acompte puis solde
- [ ] Débité à l'expédition

**Q2.2.6** — Les clients personnalisent-ils les produits avec des choix qui ne sont pas des variantes en stock (gravure, envoi de fichier, options payantes, configurateurs) ? *(recommended)*
*Ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order.*

*(tick all that apply)*
- [ ] Gravure de texte
- [ ] Envoi de fichier
- [ ] Options payantes
- [ ] Options conditionnelles
- [ ] Configurateur 3D
- [ ] Aucun
- [ ] Pas encore certain

### 2.3 Données catalogue

**Q2.3.1** — Combien de collections, approximativement ? *(optional)*

> Answer:

**Q2.3.2** — Les collections sont-elles manuelles, basées sur des règles (automatisées), ou mixtes ? *(optional)*

*(tick one)*
- [ ] Manuel
- [ ] Automatisé
- [ ] Mixte

**Q2.3.3** — Quels attributs produit vont au-delà des champs standards de Shopify (caractéristiques techniques, certifications, guides de taille, ingrédients) ? *(required)*
*Shopify stocke les attributs supplémentaires sous forme de métachamps et de métaobjets et utilise la taxonomie produit standard pour les attributs de catégorie (filtres, flux Google et Meta). Avec un PIM, les attributs viennent du PIM.*

> Answer:

**Q2.3.4** — Où les données de catalogue sont-elles maintenues aujourd'hui ? *(recommended)*
*Cas courant : produits et contenus depuis le PIM ; prix et stocks depuis l'ERP.*

*(tick one)*
- [ ] Interface d'administration Shopify
- [ ] Tableur
- [ ] ERP
- [ ] PIM
- [ ] Mixte

**Q2.3.5** — Sur quels attributs les clients doivent-ils pouvoir filtrer dans les pages de collection et de recherche ? *(recommended)*
*Shopify Search & Discovery : jusqu'à 25 filtres ; pas de filtres sur les collections de plus de 5 000 produits.*

> Answer:

### 2.4 Prix

**Q2.4.1** — Existe-t-il des prix particuliers pour des groupes de clients particuliers (prix VIP ou adhérents) ? *(recommended)*
*Les prix pour les clients professionnels sont traités au § 6.2. Les prix par groupe de particuliers passent par des réductions sur des segments de clientèle ou par une application.*

- [ ] Yes
- [ ] No

**Q2.4.2** — Existe-t-il des offres sur quantité pour les particuliers (par exemple 3 pour 2, remises par paliers) ? *(recommended)*
*Les réductions automatiques et « achetez X, obtenez Y » couvrent nativement la plupart des offres sur quantité. La tarification par volume en B2B est traitée au § 6.2.*

- [ ] Yes
- [ ] No

**Q2.4.3** — Les prix diffèrent-ils selon le marché (au-delà de la simple conversion de devise) ? *(recommended)*
*Shopify Markets prend en charge les ajustements en pourcentage, les prix fixes par produit et par pays, et l'arrondi des prix.*

- [ ] Yes
- [ ] No

### 2.5 Stock

**Q2.5.1** — Où se trouve la source de vérité des stocks — Shopify, ERP, WMS, autre ? *(recommended)*
*Même avec l'ERP comme source de vérité, Shopify a besoin du stock par emplacement.*

*(tick one)*
- [ ] Shopify
- [ ] ERP
- [ ] WMS
- [ ] OMS
- [ ] POS
- [ ] Autre

**Q2.5.2** — Des alertes de stock bas sont-elles nécessaires ? *(optional)*
*Shopify n'a pas d'alerte de stock bas intégrée ; nous la mettons en place avec Shopify Flow.*

- [ ] Yes
- [ ] No

**Q2.5.3** — Que doit-il se passer lorsqu'un produit est en rupture de stock ? *(optional)*
*Ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more.*
*Continuer à vendre (réapprovisionnement) est natif ; les alertes de retour en stock et les précommandes exigent des applications.*

*(tick all that apply)*
- [ ] Masquer
- [ ] Afficher comme épuisé
- [ ] Continuer à vendre (réapprovisionnement)
- [ ] Alerte de retour en stock
- [ ] Précommande
- [ ] Pas encore certain

**Q2.5.4** — Quelles tâches de gestion des stocks votre équipe réalisera-t-elle dans Shopify ? *(optional)*
*Bons de commande, transferts et ajustements de stock sont natifs dans l'interface d'administration Shopify (Stocky est retiré).*

*(tick all that apply)*
- [ ] Bons de commande
- [ ] Transferts de stock
- [ ] Inventaires au point de vente
- [ ] Endommagé, contrôle qualité et stock de sécurité
- [ ] Aucun
- [ ] Pas encore certain

---

## § 3 — Marchés & internationalisation

> Shopify Markets, devises, langues, taxes et droits de douane.

### 3.1 Marchés au lancement

**Q3.1.1** — Dans quels pays vendez-vous au lancement ? Pour chacun : le pays, la devise dans laquelle les clients paient, les langues, l'adresse web utilisée là-bas aujourd'hui, la façon dont les prix sont fixés, laquelle de vos sociétés facture le client, si la gamme est la même que dans votre pays principal, qui pilote ce pays au quotidien, et s'il a besoin d'un design de thème propre plutôt que du même design avec un contenu local. *(required)*
*Why we ask: These rows decide how many Shopify stores your business needs. Countries that share one selling company, one range and one team can run on a single store; countries that differ on those points usually need their own store, which multiplies the build, the running cost and the work of every future change.*
*Une ligne par pays. Laissez une cellule vide si vous ne savez pas — nous y reviendrons.*

| Code | Currency | Languages | Domain | Price strategy | Domain type | Selling entity | Assortment | Run by | Distinct theme design |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

**Q3.1.2** — Quels sont les marchés principaux (un ou plusieurs codes pays ou marché) ? *(required)*
*Les marchés qui portent le chiffre d'affaires et la priorité de lancement, par exemple les États-Unis et l'UE pour une marque mondiale.*

> Answer:

**Q3.1.3** — Quels pays sont prévus dans les 12 prochains mois ? *(optional)*

> Answer:

**Q3.1.4** — Préférence exprimée uniquement — le client a-t-il déjà une opinion sur le fait de piloter tous les pays depuis une seule boutique ou de donner à certains pays leur propre boutique ? Consignez-la comme son opinion, pas comme la réponse. *(optional · consultant)*
*Why we ask: If you already have a view, we will say where the evidence agrees with it and where it does not, rather than quietly designing around it.*
*Consignée comme une préférence exprimée. Elle ne décide jamais de la recommandation ; en cas d'écart, le document de clôture argumente la différence.*

*(tick one)*
- [ ] Shopify markets
- [ ] Boutiques d'expansion
- [ ] Hybride (DTC et B2B)

**Q3.1.5** — Comment les visiteurs doivent-ils rejoindre leur marché local ? *(optional)*
*La redirection automatique est native ; les visiteurs de l'UE arrivant sur un domaine pays de l'UE ne sont pas redirigés automatiquement.*

*(tick one)*
- [ ] Redirection automatique
- [ ] Sélecteur de pays seulement
- [ ] Bandeau de suggestion
- [ ] Aucun

**Q3.1.7** — Un marché doit-il avoir son propre contenu de thème, son ordre de sections, son paiement ou ses réglages de compte client ? *(required)*

- [ ] Yes
- [ ] No

**Q3.1.8** — Certains produits ne peuvent-ils pas être vendus sur certains marchés (réglementation, enregistrement, licence ou accords de distribution) ? *(recommended)*
*Listez-les dans une note. Dans Shopify, les produits sont exclus du catalogue de ce marché.*

- [ ] Yes
- [ ] No

### 3.2 Langue

**Q3.2.1** — Comment la traduction sera-t-elle gérée ? *(recommended)*
*Ask if Q3.1.1 has 3+ languages.*
*Translate & Adapt (l'application gratuite de Shopify) traduit automatiquement jusqu'à 2 langues ; au-delà, il faut du travail manuel ou une application de traduction. Le paiement est pré-traduit.*

*(tick one)*
- [ ] En interne
- [ ] Agence
- [ ] Translate & Adapt
- [ ] Application tierce
- [ ] Fourni par le PIM
- [ ] Pas encore certain

**Q3.2.2** — Une langue nécessite-t-elle une mise en page de droite à gauche ? *(optional)*

- [ ] Yes
- [ ] No

**Q3.2.3** — Le référencement par langue est-il une priorité ? *(optional)*

- [ ] Yes
- [ ] No

**Q3.2.4** — Que faut-il traduire ? *(recommended)*
*Ask if Q3.1.1 has 3+ languages.*
*Translate & Adapt ne traduit automatiquement ni les politiques ni les identifiants d'URL.*

*(tick all that apply)*
- [ ] Données produit issues du PIM
- [ ] Textes du thème
- [ ] Contenu en métaobjets
- [ ] Politiques
- [ ] Notifications
- [ ] Identifiants d'URL
- [ ] Contenu d'applications
- [ ] Aucun
- [ ] Pas encore certain

### 3.4 Taxes & droits de douane

**Q3.4.1** — Les droits de douane et taxes à l'importation doivent-ils être perçus au paiement (DDP) ? *(recommended)*
*Les droits et taxes à l'importation peuvent être facturés au paiement (DDP) ou payés par le client à la livraison (DAP), au choix par pays. Exige des codes SH (et le pays d'origine) sur les produits ; non combinable avec les surcharges fiscales, les taux manuels ou les exonérations client ; étiquettes DDP avec certains transporteurs seulement.*

- [ ] Yes
- [ ] No

**Q3.4.2** — Dans quels pays êtes-vous immatriculé à la TVA ? *(recommended)*

> Answer:

**Q3.4.3** — Vendez-vous aux États-Unis avec des obligations de taxe de vente au niveau des États ? *(optional)*

- [ ] Yes
- [ ] No

**Q3.4.4** — Les produits ont-ils des codes SH et un pays d'origine, et d'où viennent-ils ? *(recommended)*
*Skip if Q3.4.1 = no.*

*(tick one)*
- [ ] Dans le PIM
- [ ] Dans l'ERP
- [ ] À créer
- [ ] Non nécessaire

**Q3.4.5** — Les prix doivent-ils inclure la taxe (TVA) sur certains marchés et l'exclure sur d'autres ? *(required)*
*Shopify peut afficher des prix TVA incluse par marché (affichage fiscal dynamique).*

*(tick one)*
- [ ] Taxe incluse partout
- [ ] Hors taxe partout
- [ ] Dynamique par marché

**Q3.4.6** — Quel service fiscal ? *(recommended · consultant)*
*Shopify Tax couvre les États-Unis, l'UE, le Royaume-Uni et le Canada ; depuis le 13/05/2026, les nouvelles boutiques vendant dans l'UE, au Royaume-Uni ou au Canada ne peuvent plus utiliser Basic Tax.*

*(tick one)*
- [ ] Shopify Tax
- [ ] Application fiscale
- [ ] Tarifs manuels
- [ ] Pas encore certain

**Q3.4.7** — Les clients professionnels achètent-ils hors taxes (validation du numéro de TVA, autoliquidation) ? *(optional)*
*La validation du numéro de TVA au paiement est native.*

- [ ] Yes
- [ ] No

**Q3.4.8** — Dans quels pays droits et taxes à l'importation doivent-ils être perçus au paiement (DDP) ? Dans les autres, le client paie à la livraison (DAP). *(recommended)*
*Skip if Q3.4.1 = no.*
*Des pays, par exemple États-Unis, Royaume-Uni, Suisse. Un choix par pays : DDP et DAP ne peuvent pas coexister dans le même pays. Si vous n'expédiez pas au-delà des frontières, indiquez-le en commentaire.*

> Answer:

**Q3.4.9** — Lorsque vous expédiez des colis de faible valeur vers ces territoires depuis l'extérieur, êtes-vous immatriculé pour percevoir la TVA ou la GST à l'importation dès le paiement ? *(recommended)*
*Ask if Q3.1.1 has 2+ markets.*
*Colis de faible valeur vers l'UE (IOSS), le Royaume-Uni, la Suisse, la Norvège (VOEC), l'Australie et la Nouvelle-Zélande. Cochez les régimes pour lesquels vous êtes immatriculé.*

*(tick all that apply)*
- [ ] Guichet unique à l'importation de l'UE (IOSS)
- [ ] TVA britannique sur les importations de faible valeur
- [ ] TVA suisse sur les importations de faible valeur
- [ ] Norway VOEC
- [ ] GST australienne sur les importations de faible valeur
- [ ] GST néo-zélandaise sur les importations de faible valeur
- [ ] Aucun
- [ ] Pas encore certain

**Q3.4.10** — Certains produits bénéficient-ils de taux réduits, de taux zéro ou d'exonérations sur un marché (par exemple médicaments, livres, alimentation, vêtements pour enfants) ? *(recommended)*
*La direction financière confirme les taux ; Merkle ne donne pas de conseil fiscal.*

- [ ] Yes
- [ ] No

**Q3.4.11** — Qui émet les factures aux clients ? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI.*
*Shopify peut générer des factures de TVA pour les commandes de l'UE et du Royaume-Uni (affichées sur la page de statut de commande, non envoyées par e-mail, pas pour les commandes avec droits). L'application gratuite Order Printer imprime des factures à partir de modèles. Les factures peuvent aussi venir de l'ERP ou d'une application de facturation.*

*(tick one)*
- [ ] Factures de TVA Shopify (UE et Royaume-Uni)
- [ ] Shopify Order Printer
- [ ] Application de facturation
- [ ] ERP
- [ ] Service de facturation ou fiscal
- [ ] Pas encore certain

**Q3.4.12** — Quelles obligations de facturation électronique s'appliquent à vos ventes ? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU.*
*Par exemple Peppol, XRechnung ou ZUGFeRD (Allemagne), Factur-X (France), SdI (Italie), KSeF (Pologne) ou VeriFactu (Espagne). Shopify n'a pas de facturation électronique intégrée : elle vient de l'ERP ou d'une application de facturation.*

*(tick all that apply)*
- [ ] Peppol
- [ ] Allemagne : XRechnung ou ZUGFeRD
- [ ] France : Factur-X
- [ ] Italie : SdI
- [ ] Pologne : KSeF
- [ ] Espagne : VeriFactu
- [ ] Autre
- [ ] Aucun
- [ ] Pas encore certain

**Q3.4.13** — Si vendre dans un pays impliquait de s'y immatriculer fiscalement et d'y déposer des déclarations, le prendriez-vous en charge vous-même, ou préféreriez-vous qu'un partenaire soit le vendeur légal pour ces commandes ? *(recommended)*
*Why we ask: This decides who carries the tax and customs liability on cross-border orders. Keeping it yourself means registering, filing and remitting in each country; handing it to a partner removes that work and that risk, and costs a percentage of every international order.*
*Répondez pour les pays où vous vendez mais où vous n'êtes pas immatriculé aujourd'hui.*

*(tick one)*
- [ ] Immatriculations propres
- [ ] Partenaire de préférence
- [ ] Mixte
- [ ] Pas encore certain

**Q3.4.14** — Comment vendrez-vous à l’international : avec Shopify Markets et vos propres enregistrements fiscaux, avec Managed Markets de Shopify, ou avec une application tierce de merchant of record ? *(recommended)*
*Ask if Q3.1.1 has 2+ markets.*
*Avec Markets, vous vendez en votre nom et gérez la fiscalité pays par pays. Un merchant of record vend en son propre nom et prend en charge la fiscalité et la conformité pour vous. Managed Markets de Shopify (Global-e comme merchant of record) n’est disponible que pour les marchands établis dans la partie continentale des États-Unis et certaines boutiques au Canada et au Royaume-Uni — pas pour une boutique établie en Suisse.*

*(tick one)*
- [ ] Shopify Markets avec nos propres enregistrements fiscaux
- [ ] Shopify Managed Markets (Global-e comme merchant of record)
- [ ] Application tierce de merchant of record
- [ ] Pas encore certain

### 3.5 Chine continentale

**Q3.5.1** — Souhaitez-vous vendre en Chine continentale en transfrontalier (depuis l'extérieur de la Chine) ou sur place, derrière la Grande Muraille numérique ? *(required)*
*Only if the launch markets include mainland China (CN).*
*La vente sur place exige une entité en RPC, un enregistrement ou une licence ICP et un hébergement en Chine.*

*(tick one)*
- [ ] Transfrontalier, depuis l'extérieur de la Chine
- [ ] Sur place, derrière la Grande Muraille numérique
- [ ] Les deux
- [ ] Pas encore certain

**Q3.5.2** — Quels canaux pour la Chine continentale ? *(required)*
*Only if the launch markets include mainland China (CN).*
*Places de marché transfrontalières (Tmall Global, JD Worldwide, Douyin Global, RED), un mini-programme WeChat, votre propre site, ou une boutique à Hong Kong expédiant vers le continent.*

*(tick all that apply)*
- [ ] Tmall Global
- [ ] JD Worldwide
- [ ] Douyin Global
- [ ] RED (Xiaohongshu)
- [ ] Mini-programme WeChat
- [ ] Site propre hors de Chine
- [ ] Site propre en Chine
- [ ] Boutique à Hong Kong expédiant vers le continent
- [ ] Pas encore certain

**Q3.5.3** — Avez-vous une entité juridique en Chine continentale ? *(required)*
*Only if the launch markets include mainland China (CN).*
*Nécessaire pour un enregistrement ou une licence ICP et pour l'hébergement sur place.*

*(tick one)*
- [ ] Aucun
- [ ] Entreprise à capitaux entièrement étrangers (WFOE)
- [ ] Coentreprise
- [ ] Bureau de représentation
- [ ] Prévu

**Q3.5.4** — Avez-vous une entité à Hong Kong ou une autre entité à l'étranger capable de vendre en transfrontalier, et vos marques sont-elles enregistrées en Chine ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Les places de marché transfrontalières exigent les deux.*

- Overseas entity:
- Trademarks registered in china:

**Q3.5.5** — Statut ICP pour un site web chinois ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Votre conseil en RPC confirme si un enregistrement suffit ou s'il faut une licence ICP commerciale.*

*(tick one)*
- [ ] Aucun
- [ ] Enregistrement ICP
- [ ] Licence ICP commerciale
- [ ] Via un partenaire
- [ ] Non nécessaire
- [ ] Pas encore certain

**Q3.5.6** — Quel est le rôle de Shopify pour la Chine continentale ? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*Shopify peut rester la référence mondiale pour les produits, les stocks et les commandes pendant que la Chine vend par des canaux locaux.*

*(tick one)*
- [ ] Référence mondiale pour les produits, les stocks et les commandes
- [ ] Canal ou vitrine Chine
- [ ] Non impliqué
- [ ] Pas encore certain

**Q3.5.7** — Comment les marchandises entreront-elles en Chine : entrepôt sous douane (1210), envoi direct (9610), commerce général ou colis personnels ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Les canaux transfrontaliers ont des plafonds par commande et par an et par consommateur.*

*(tick all that apply)*
- [ ] Entrepôt sous douane (1210)
- [ ] Envoi direct (9610)
- [ ] Commerce général
- [ ] Colis personnels
- [ ] Pas encore certain

**Q3.5.8** — Vos produits figurent-ils sur la liste positive du commerce électronique transfrontalier chinois ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] Tous ceux de la liste
- [ ] Certains de la liste
- [ ] Aucun de la liste
- [ ] Pas encore certain

**Q3.5.9** — Comment vos produits sont-ils classés en Chine ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Les produits éclaircissants, les protections solaires et les produits antichute de cheveux sont des cosmétiques spéciaux ; les médicaments ne sont pas des marchandises transfrontalières.*

*(tick all that apply)*
- [ ] Cosmétiques ordinaires
- [ ] Cosmétiques spéciaux (par exemple éclaircissants, solaires)
- [ ] Médicaments
- [ ] Dispositifs médicaux
- [ ] Compléments alimentaires
- [ ] Marchandises générales
- [ ] Pas encore certain

**Q3.5.10** — Statut d'enregistrement ou de déclaration auprès de l'administration chinoise des produits médicaux (NMPA) ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Le commerce général exige un enregistrement ou une déclaration ; les canaux transfrontaliers en sont exemptés pour les marchandises de la liste positive.*

*(tick one)*
- [ ] Immatriculé
- [ ] Déposé
- [ ] En cours
- [ ] Pas commencé
- [ ] Non nécessaire (commerce électronique transfrontalier)
- [ ] Pas encore certain

**Q3.5.11** — Les allégations produit doivent-elles faire l'objet d'une revue pour la Chine (allégations médicales, cosméceutiques ou de traitement) ? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*La Chine n'autorise pas les allégations cosméceutiques ou médicales pour les cosmétiques.*

- [ ] Yes
- [ ] No

**Q3.5.12** — Comment les clients du continent paieront-ils ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Au sein de la place de marché, par Alipay et WeChat Pay via un compte Shopify Payments à Hong Kong (accès anticipé), via un fournisseur de portefeuille transfrontalier, ou via des comptes marchands domestiques (entité en RPC).*

*(tick all that apply)*
- [ ] Au sein de la place de marché
- [ ] Alipay / WeChat Pay via Shopify Payments (Hong Kong)
- [ ] Fournisseur de portefeuille transfrontalier
- [ ] Comptes marchands domestiques (entité en RPC)
- [ ] Pas encore certain

**Q3.5.13** — Combien de clients de Chine continentale attendez-vous par an ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*La loi chinoise sur les informations personnelles fixe des obligations d'export de données différentes selon le volume.*

*(tick one)*
- [ ] Moins de 100 000
- [ ] 100 000 à 1 million
- [ ] Plus d'un million
- [ ] Pas encore certain

**Q3.5.14** — Avez-vous un représentant en Chine pour la protection des informations personnelles (PIPL) ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Requis lorsqu'une entreprise établie hors de Chine cible des consommateurs en Chine.*

- [ ] Yes
- [ ] No

**Q3.5.15** — Où seront stockées les données des clients chinois (CRM, e-mail, analytique) ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] En Chine
- [ ] Hors de Chine
- [ ] Les deux
- [ ] Pas encore certain

**Q3.5.16** — Les scripts bloqués en Chine (Google Fonts, Google Analytics, reCAPTCHA, pixels Meta, YouTube) doivent-ils être remplacés ? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*

- [ ] Yes
- [ ] No

**Q3.5.17** — Quels canaux marketing pour la Chine ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick all that apply)*
- [ ] Influenceurs KOL / KOC
- [ ] RED (Xiaohongshu)
- [ ] Douyin
- [ ] WeChat
- [ ] Baidu
- [ ] Publicité Tmall
- [ ] Aucun
- [ ] Pas encore certain

**Q3.5.18** — Qui assure le service client en chinois ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] En interne
- [ ] Partenaire
- [ ] Plateforme
- [ ] Pas encore certain

**Q3.5.19** — Travaillez-vous avec un partenaire local ou commercial pour la Chine ? Nommez-le. *(optional)*
*Only if the launch markets include mainland China (CN).*

> Answer:

**Q3.5.20** — Date de lancement visée pour la Chine continentale. *(optional)*
*Only if the launch markets include mainland China (CN).*

> Answer:

**Q3.5.21** — Qui fournit le conseil juridique, fiscal et douanier pour la RPC ? *(required)*
*Only if the launch markets include mainland China (CN).*
*Merkle ne fournit pas de conseil juridique en RPC.*

*(tick one)*
- [ ] Conseil du client en RPC
- [ ] Partenaire
- [ ] Pas encore

---

## § 4 — Paiements & checkout

> Prestataires de paiement, périmètre PCI et personnalisation du checkout.

### 4.1 Paiements

**Q4.1.1** — Quels prestataires de paiement utiliserez-vous (Shopify Payments, Adyen, Stripe, PayPal…) ? *(required)*
*Shopify Payments est requis pour certaines fonctionnalités (Shop Pay Installments, Managed Markets, certaines options de prix de Markets) ; les passerelles tierces sont prises en charge.*

> Answer:

**Q4.1.2** — Quels moyens de paiement locaux sont nécessaires ? *(recommended)*

*(tick all that apply)*
- [ ] Klarna
- [ ] iDEAL | Wero
- [ ] Bancontact
- [ ] EPS
- [ ] Przelewy24
- [ ] BLIK
- [ ] MB WAY
- [ ] Multibanco
- [ ] MobilePay
- [ ] Swish
- [ ] TWINT
- [ ] Alipay
- [ ] WeChat Pay
- [ ] Prélèvement SEPA ou facture via une passerelle
- [ ] Autre
- [ ] Aucun
- [ ] Pas encore certain

**Q4.1.3** — Quelles options de paiement fractionné, le cas échéant ? *(optional)*
*Shop Pay Installments est disponible pour les boutiques aux États-Unis, au Canada et au Royaume-Uni.*

*(tick all that apply)*
- [ ] Shop Pay Installments
- [ ] Klarna via Shopify Payments
- [ ] Paiement fractionné via une autre passerelle
- [ ] Aucun
- [ ] Pas encore certain

**Q4.1.4** — Avez-vous besoin de versements dans plus d'une devise ? *(required)*

- [ ] Yes
- [ ] No

**Q4.1.5** — Les données de carte seront-elles traitées uniquement par le paiement hébergé par Shopify, par une page de paiement hébergée par un tiers, ou par une interface de carte sur mesure / de la tokenisation ? *(required · consultant)*
*Des données de carte traitées hors du paiement hébergé par Shopify exigent une revue de sécurité distincte.*

*(tick one)*
- [ ] Paiement hébergé par Shopify
- [ ] Page de paiement hébergée par un tiers
- [ ] Traitement de carte sur mesure

**Q4.1.6** — Quels paiements express sont nécessaires ? *(recommended)*
*Le paiement B2B et les précommandes ne prennent pas en charge les paiements express.*

*(tick all that apply)*
- [ ] Shop Pay
- [ ] Apple Pay
- [ ] Google Pay
- [ ] PayPal
- [ ] Amazon Pay
- [ ] Aucun
- [ ] Pas encore certain

**Q4.1.7** — Les moyens de paiement doivent-ils être masqués, renommés ou réordonnés selon le marché, le type de client ou le panier ? *(recommended)*
*Exige une application de personnalisation du paiement (Shopify Function).*

- [ ] Yes
- [ ] No

### 4.2 Checkout

**Q4.2.1** — Quelles modifications du paiement sont nécessaires ? *(required)*
*Le paiement Shopify se personnalise via l'éditeur de paiement et Checkout Extensibility (blocs, champs, logique via Functions). Une interface de paiement entièrement sur mesure n'est pas possible sur Shopify.*

*(tick all that apply)*
- [ ] Personnalisation dans l'éditeur de paiement
- [ ] Blocs des pages de remerciement et de statut de commande
- [ ] Blocs ou champs sur les étapes de paiement
- [ ] Mise en forme via la Checkout Branding API
- [ ] Logique côté serveur (Shopify Functions)
- [ ] Interface de paiement entièrement sur mesure
- [ ] Aucun
- [ ] Pas encore certain

**Q4.2.2** — Quelles extensions de paiement sont nécessaires ? *(optional · consultant)*
*Skip if Q4.2.1 = None.*

*(tick all that apply)*
- [ ] Champs personnalisés
- [ ] Bloc de vente additionnelle
- [ ] Message cadeau
- [ ] Labels de confiance
- [ ] Utilisation des récompenses
- [ ] Personnalisation de la livraison
- [ ] Personnalisation du paiement
- [ ] Validation du panier et du paiement
- [ ] Validation d'adresse
- [ ] Générateur de points relais
- [ ] Aucun
- [ ] Pas encore certain

**Q4.2.3** — Quels champs de paiement supplémentaires sont nécessaires (société, numéro de TVA, numéro de commande d'achat, consignes de livraison) ? *(optional)*

> Answer:

**Q4.2.4** — Des ventes additionnelles après achat sont-elles nécessaires ? *(optional)*
*Les ventes additionnelles sur la page de remerciement sont natives ; une page dédiée après achat est une bêta de Shopify.*

- [ ] Yes
- [ ] No

**Q4.2.6** — Un avoir en boutique est-il nécessaire ? *(optional)*
*L'avoir en boutique est natif : rembourser en avoir ou émettre un avoir ; les clients le dépensent une fois connectés.*

- [ ] Yes
- [ ] No

### 4.3 Fraude & risque

**Q4.3.1** — Une revue manuelle de la fraude est-elle nécessaire pour les commandes à forte valeur ? *(optional)*
*Natif : l'analyse de fraude et l'application Shopify Fraud Control.*

- [ ] Yes
- [ ] No

**Q4.3.2** — Quelles restrictions de commande sont nécessaires ? *(optional)*
*Bloquer des pays est natif (marchés et zones d'expédition) ; les autres règles exigent une application de validation du panier et du paiement (Shopify Function).*

*(tick all that apply)*
- [ ] Bloquer des pays
- [ ] Montant de commande min./max.
- [ ] Limites de quantité
- [ ] Restrictions par type de client
- [ ] Règles de combinaison de produits
- [ ] Aucun
- [ ] Pas encore certain

**Q4.3.3** — Souhaitez-vous une garantie de remboursement des rétrofacturations pour fraude ? *(optional)*
*Ask if Q1.3.1 is Premium, Luxury or Enterprise.*
*En dehors de Shopify Protect (commandes Shop Pay aux États-Unis), cela exige une application de lutte contre la fraude.*

- [ ] Yes
- [ ] No

---

## § 5 — Livraison & fulfillment

> Comment les commandes parviennent aux clients et reviennent : fulfillment, livraison, retours, annulations, remboursements et expérience après achat — et si le natif Shopify (règles de retour et d’annulation, retours en autonomie, page de statut de commande, dates de livraison) suffit ou s’il faut une application.

### 5.1 Modèle de fulfillment

**Q5.1.1** — Assurez-vous la préparation des commandes en interne, via un prestataire 3PL, ou les deux ? *(required)*

*(tick one)*
- [ ] En interne
- [ ] Prestataire logistique (3PL)
- [ ] Hybride (DTC et B2B)

**Q5.1.2** — Quel prestataire 3PL ? *(recommended)*
*Skip if Q5.1.1 = In house.*

> Answer:

**Q5.1.3** — Combien d'emplacements préparent les commandes en ligne (entrepôts, emplacements 3PL et magasins qui expédient), et dans quels pays se trouvent-ils ? *(required)*
*Why we ask: Where stock sits decides what a customer pays at the border, which tax schemes are open to you, and whether a country can be served from the same store as the others or needs its own operation.*
*Les magasins physiques qui vendent en personne sont comptés séparément au § 5.6.*

- Fulfilment locations:
- Fulfilment countries:

**Q5.1.4** — Comment Shopify doit-il choisir l'emplacement qui prépare la commande ? *(required)*
*Les règles de routage de Shopify : limiter les expéditions fractionnées, rester dans le marché, emplacement le plus proche, emplacements classés, métachamps d'emplacement. Tout le reste exige une Function de routage sur mesure ou l'ERP / OMS.*

*(tick all that apply)*
- [ ] Limiter les expéditions fractionnées
- [ ] Rester dans le marché
- [ ] Emplacement le plus proche
- [ ] Emplacements classés
- [ ] Métachamps d'emplacement
- [ ] Function de routage sur mesure
- [ ] L'ERP ou l'OMS décide
- [ ] Pas encore certain

**Q5.1.5** — Quels transporteurs utilisez-vous ? *(recommended)*

> Answer:

**Q5.1.6** — Comment les frais de port sont-ils calculés ? *(required)*
*Forfaitaires, selon le poids ou le montant, gratuits au-delà d'un seuil, tarifs transporteur en temps réel, ou tarifs venant d'une application.*

*(tick all that apply)*
- [ ] Forfaitaire
- [ ] Selon le poids ou le montant
- [ ] Offert au-delà d'un seuil
- [ ] Tarifs transporteur en temps réel
- [ ] Tarifs venant d'une application
- [ ] Pas encore certain

**Q5.1.7** — Existe-t-il des règles d'expédition propres à certains produits (lourds, dangereux, sous température dirigée) ? *(optional)*

> Answer:

**Q5.1.9** — Vers quels pays n'expédiez-vous pas ? *(optional)*

> Answer:

**Q5.1.10** — Seuils de livraison offerte par marché (marché, seuil, devise, quels tarifs). *(recommended)*
*Natif : une condition de tarif fondée sur le montant de la commande, ou une réduction automatique de livraison offerte.*

| Market | Threshold | Currency | Rates |
|---|---|---|---|
| | | | |

**Q5.1.11** — Quels modes de livraison proposez-vous ? *(required)*
*La livraison locale et le retrait en magasin sont natifs. Les points relais ne sont natifs que pour les boutiques en France, en Italie, en Espagne et au Royaume-Uni (avec certains transporteurs) ; ailleurs, ils exigent une application de livraison ou une solution sur mesure. Les créneaux de livraison exigent une application ; l'expédition depuis le magasin exige Shopify POS.*

*(tick all that apply)*
- [ ] Livraison standard
- [ ] Express
- [ ] Livraison locale
- [ ] Retrait en magasin
- [ ] Points relais
- [ ] Créneaux de livraison programmés
- [ ] Expédition depuis le magasin
- [ ] Aucun
- [ ] Pas encore certain

**Q5.1.12** — Comment les étiquettes d'expédition sont-elles créées ? *(optional)*

*(tick one)*
- [ ] Shopify Shipping
- [ ] Système du 3PL
- [ ] Logiciel du transporteur
- [ ] Application de livraison

**Q5.1.13** — Tous les produits ont-ils des poids exacts (et des dimensions de colis), et d'où viennent ces données ? *(recommended)*
*Ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app.*
*Les tarifs au poids et calculés par le transporteur, les étiquettes d'expédition et certains calculs de droits exigent le poids des produits.*

*(tick one)*
- [ ] Depuis le PIM ou l'ERP
- [ ] Maintenu dans Shopify
- [ ] Seulement pour certains produits
- [ ] Pas encore disponible
- [ ] Pas encore certain

**Q5.1.14** — Certains produits comptent-ils comme marchandises dangereuses à l'expédition ? *(recommended)*
*Par exemple aérosols (sprays, certaines protections solaires), liquides inflammables (parfums, produits à base d'alcool), batteries au lithium, glace carbonique. Ils exigent en général leur propre profil de livraison et des accords transporteurs dédiés.*

*(tick all that apply)*
- [ ] Aérosols
- [ ] Liquides inflammables
- [ ] Batteries au lithium
- [ ] Glace carbonique
- [ ] Autres matières dangereuses
- [ ] Aucun
- [ ] Pas encore certain

**Q5.1.15** — Une même commande doit-elle parfois partir vers plusieurs adresses — des cadeaux à plusieurs destinataires, ou une commande de gros répartie entre succursales ? *(recommended)*
*Différent d'une commande qui arrive en plusieurs colis, ce que Shopify fait tout seul.*

- [ ] Yes
- [ ] No

### 5.2 Retours & échanges

**Q5.2.1** — Résumez la politique de retours (délai, conditions, qui paie le retour). *(recommended)*

> Answer:

**Q5.2.2** — Shopify inclut les demandes de retour dans les comptes clients, pilotées par des règles de retour (délai, frais de retour, frais de remise en stock, vente ferme). Est-ce suffisant ? *(recommended)*

*(tick one)*
- [ ] Les retours en autonomie de Shopify suffisent
- [ ] Une application de retours est nécessaire
- [ ] Retours créés par les équipes uniquement
- [ ] Pas encore certain

**Q5.2.3** — Traitez-vous des échanges (et pas seulement des remboursements) ? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.4** — Quelles applications de retours, de suivi ou d'après-achat utilisez-vous ou préférez-vous ? *(optional)*
*Ask if Q1.2.1 is yes, or Q0.2.6 is 500 or more.*

> Answer:

**Q5.2.5** — De combien de jours les clients disposent-ils pour retourner une commande ? *(recommended)*

> Answer:

**Q5.2.6** — Quelle part des commandes est retournée aujourd'hui (%) ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Des taux ou des volumes de retour élevés justifient en général une plateforme de retours plutôt que les retours en autonomie natifs de Shopify.*

> Answer:

**Q5.2.7** — Comment les clients renvoient-ils les articles : étiquette prépayée, dépôt par QR code, leur propre envoi, ou un mélange ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Shopify ne crée des étiquettes de retour que pour des emplacements de préparation aux États-Unis ; les autres pays, ou le dépôt par QR code, exigent une application de retours.*

*(tick one)*
- [ ] Étiquette prépayée
- [ ] Dépôt par QR code
- [ ] Organisé par le client
- [ ] Mixte

**Q5.2.8** — Qui paie le retour : vous, le client, ou cela dépend du marché ? *(recommended)*

*(tick one)*
- [ ] Marchand
- [ ] Client
- [ ] Selon le marché

**Q5.2.9** — Quels échanges proposez-vous : le même produit dans une autre variante, n'importe quel autre produit, ou un avoir en priorité ? *(optional)*
*Skip if Q5.2.3 = no.*
*Ask if Q0.2.6 is 500 or more.*
*Les clients ne peuvent pas choisir un échange dans le formulaire de retour de Shopify ; les équipes ajoutent les articles d'échange à la validation. Les échanges choisis par le client exigent une application.*

*(tick all that apply)*
- [ ] Même produit, autre variante
- [ ] N'importe quel produit
- [ ] Avoir en priorité
- [ ] Aucun
- [ ] Pas encore certain

**Q5.2.10** — Acceptez-vous les retours internationaux (y compris le remboursement des droits) ? *(optional)*
*Ask if Q3.1.1 has 2+ markets.*

- [ ] Yes
- [ ] No

**Q5.2.11** — Les articles retournés doivent-ils être contrôlés avant l'émission du remboursement ou de l'échange ? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.2.12** — Avez-vous besoin de recueillir et d'analyser les motifs de retour ? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.13** — Les clients professionnels doivent-ils demander leurs retours en ligne (si vous vendez en B2B) ? *(optional)*
*Les demandes de retour de Shopify fonctionnent aussi pour les commandes B2B.*

- [ ] Yes
- [ ] No

**Q5.2.14** — Les délais ou conditions de retour diffèrent-ils selon le marché ou le produit (par exemple les articles en vente ferme) ? *(optional)*
*La vente ferme par produit ou par collection est native.*

- [ ] Yes
- [ ] No

### 5.3 Notifications

**Q5.3.1** — Les notifications de commande, d'expédition et de livraison ont-elles besoin d'un design ou d'un contenu sur mesure ? *(optional)*
*Les notifications Shopify sont modifiables ; les notifications d'expédition par SMS sont natives.*

- [ ] Yes
- [ ] No

**Q5.3.2** — Les notifications sont-elles envoyées par Shopify, par la plateforme e-mail, ou par les deux ? *(optional)*

*(tick one)*
- [ ] Shopify
- [ ] Plateforme d’e-mailing (ESP)
- [ ] Mixte

### 5.4 Annulations & remboursements

**Q5.4.2** — Les clients doivent-ils pouvoir annuler leurs commandes eux-mêmes ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Les clients peuvent demander l'annulation de commandes non expédiées depuis leur compte ; vous validez. L'annulation immédiate sans validation exige une application.*

- [ ] Yes
- [ ] No

**Q5.4.3** — Jusqu'à quand une commande peut-elle être annulée ? *(recommended)*

*(tick one)*
- [ ] Aucune annulation
- [ ] Jusqu'à l'expédition
- [ ] Sous 15 minutes
- [ ] Sous 1 heure
- [ ] Sous 24 heures
- [ ] Équipes uniquement

**Q5.4.4** — Autorisez-vous les annulations partielles (certains articles d'une commande) ? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.5** — Les clients doivent-ils pouvoir modifier une commande après l'avoir passée (adresse, articles) ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Les équipes peuvent modifier les commandes nativement ; que les clients modifient les leurs exige une application.*

- [ ] Yes
- [ ] No

**Q5.4.6** — Comment les remboursements sont-ils versés : sur le moyen de paiement d'origine, en avoir, ou en carte cadeau ? *(recommended)*

*(tick all that apply)*
- [ ] Moyen de paiement d'origine
- [ ] Avoir en boutique
- [ ] Carte cadeau
- [ ] Pas encore certain

**Q5.4.7** — Quand le remboursement est-il émis : à la demande, au scan du transporteur, à réception, ou après contrôle ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Les remboursements au scan du transporteur exigent une plateforme de retours connectée au suivi transporteur.*

*(tick one)*
- [ ] À la demande
- [ ] Au scan du transporteur
- [ ] À réception
- [ ] Après contrôle

**Q5.4.8** — Les frais de port initiaux sont-ils remboursés : toujours, uniquement en cas de faute de votre part, ou jamais ? *(optional)*

*(tick one)*
- [ ] Toujours
- [ ] Uniquement en cas de faute de notre part
- [ ] Jamais

**Q5.4.9** — Facturez-vous des frais de remise en stock ? *(optional)*
*Les frais de remise en stock sont une règle de retour native (pourcentage du retour).*

- [ ] Yes
- [ ] No

**Q5.4.10** — Émettez-vous des remboursements partiels (par exemple pièces endommagées ou manquantes) ? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.11** — Les remboursements doivent-ils être validés par quelqu'un avant d'être versés ? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.4.12** — Les annulations et les remboursements doivent-ils être transmis à votre ERP ou à votre système financier ? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.4.13** — Les annulations doivent-elles être immédiates, sans votre validation ? *(optional)*
*Skip if Q5.4.2 = no.*
*Ask if Q5.4.2 is yes.*

- [ ] Yes
- [ ] No

### 5.5 Expérience après achat

**Q5.5.1** — Souhaitez-vous une page de suivi de commande à votre marque sur votre propre site ? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*
*Shopify inclut une page de statut de commande et des e-mails d'expédition. Une page de suivi à votre marque, des alertes transporteur proactives ou des estimations de livraison exigent en général une application d'après-achat.*

- [ ] Yes
- [ ] No

**Q5.5.2** — Sur quels canaux les clients doivent-ils recevoir des informations proactives de livraison (retards, en cours de livraison) ? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*

*(tick all that apply)*
- [ ] E-mail
- [ ] SMS
- [ ] WhatsApp
- [ ] Push
- [ ] Aucun
- [ ] Pas encore certain

**Q5.5.3** — Les pages produit ou le paiement doivent-ils afficher des dates de livraison estimées ? *(optional)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*
*Shopify peut afficher des dates de livraison au paiement : des dates manuelles partout, des dates automatiques uniquement pour les emplacements de préparation aux États-Unis.*

- [ ] Yes
- [ ] No

**Q5.5.4** — Les clients doivent-ils pouvoir ouvrir en ligne des demandes de garantie, de réparation ou d'entretien ? *(recommended)*
*Ask if Q1.1.3 mentions watch, jewel, electronic, appliance, furniture, bike, bicycle, tool, device or luxury.*

- [ ] Yes
- [ ] No

### 5.6 Retail & POS

**Q5.6.1** — Combien de magasins physiques (y compris éphémères) vendront avec Shopify ? *(required)*
*0 s'il n'y en a aucun.*

> Answer:

**Q5.6.2** — Point de vente au lancement ? *(required)*
*Skip if Q5.6.1 = 0.*

*(tick one)*
- [ ] Shopify POS
- [ ] Un autre point de vente, intégré
- [ ] Un autre point de vente, non intégré
- [ ] Pas encore certain

**Q5.6.3** — Quels services omnicanaux sont nécessaires en magasin ? *(required)*
*Skip if Q5.6.1 = 0.*
*Retrait en magasin, expédition depuis le magasin, retours en magasin de commandes web, rayon infini, transferts de stock, prix magasin.*

*(tick all that apply)*
- [ ] Acheter en ligne, retirer en magasin
- [ ] Expédier au client depuis le magasin
- [ ] Retours et échanges en magasin des commandes en ligne
- [ ] Rayon infini (commande en magasin)
- [ ] Avoir et cartes cadeaux en magasin
- [ ] Transferts et inventaires de stock
- [ ] Prix ou catalogues magasin
- [ ] Rôles et permissions des équipes
- [ ] Aucun
- [ ] Pas encore certain

**Q5.6.4** — Dans quels pays se trouvent les magasins ? *(recommended)*
*Skip if Q5.6.1 = 0.*

> Answer:

---

## § 6 — Clients, B2B & confidentialité

> Comptes clients, B2B, fidélité, segmentation et obligations liées aux données personnelles.

### 6.1 Comptes clients

**Q6.1.1** — Le paiement en tant qu'invité est-il la norme, les comptes sont-ils facultatifs, ou l'inscription est-elle obligatoire ? *(recommended)*

*(tick one)*
- [ ] Paiement en tant qu'invité par défaut
- [ ] Facultatif
- [ ] Obligatoire

**Q6.1.3** — Que doit contenir l'espace compte (historique des commandes, adresses, retours, liste d'envies, abonnements) ? *(required)*

*(tick all that apply)*
- [ ] Historique des commandes
- [ ] Racheter
- [ ] Demandes de retour
- [ ] Demandes d'annulation
- [ ] Avoir en boutique
- [ ] Adresses
- [ ] Gestion des abonnements
- [ ] Emplacements d'entreprise B2B
- [ ] Widget de fidélité
- [ ] Liste d'envies
- [ ] Champs de profil supplémentaires
- [ ] Aucun
- [ ] Pas encore certain

**Q6.1.4** — Comment les clients doivent-ils se connecter ? *(required)*
*Le code à usage unique par e-mail et la connexion via Google ou Facebook sont natifs.*

*(tick all that apply)*
- [ ] Code à usage unique par e-mail
- [ ] Connexion via Google ou Facebook
- [ ] Shop (Shop Pay)
- [ ] Authentification unique de l'entreprise (fournisseur d'identité)
- [ ] Connexion depuis un autre site
- [ ] Pas encore certain

### 6.2 B2B & vente en gros

**Q6.2.2** — Les clients professionnels ont-ils besoin de comptes d'entreprise avec leur propre connexion ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.3** — Les clients professionnels ont-ils des listes de prix propres à leur entreprise ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Les listes de prix professionnelles sont des catalogues B2B.*

- [ ] Yes
- [ ] No

**Q6.2.4** — Existe-t-il des remises sur quantité ou des règles de quantité en B2B ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.5** — Quelles conditions de paiement sont nécessaires (30 jours nets, facture, bon de commande) ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

*(tick all that apply)*
- [ ] Délais de paiement
- [ ] Exigible à l'expédition
- [ ] Carte enregistrée
- [ ] Prélèvement ACH (États-Unis)
- [ ] Facture via une commande provisoire
- [ ] Acomptes
- [ ] Paiements partiels
- [ ] Paiement par expédition
- [ ] Aucun
- [ ] Pas encore certain

**Q6.2.6** — Existe-t-il un processus de demande de devis, ou les prix sont-ils négociés acheteur par acheteur ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify n'a pas de demande de devis intégrée : les commandes peuvent être soumises en provisoire pour revue, ou une application de devis gère la négociation.*

- [ ] Yes
- [ ] No

**Q6.2.7** — Les comptes B2B doivent-ils être validés avant de pouvoir commander ? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Natif : un formulaire de demande de compte de gros (Shopify Forms) plus Flow pour créer et valider les entreprises.*

- [ ] Yes
- [ ] No

**Q6.2.8** — B2B Shopify natif ou une application ? *(recommended · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

*(tick one)*
- [ ] Shopify B2B
- [ ] Shopify B2B plus apps
- [ ] Une application B2B seulement
- [ ] Boutique d'expansion B2B distincte
- [ ] Pas encore certain

**Q6.2.9** — Combien de comptes B2B sont attendus sous 12 mois ? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

> Answer:

**Q6.2.10** — De combien de listes de prix B2B distinctes (catalogues) avez-vous besoin, et l'une d'elles doit-elle être propre à une seule entreprise ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- Catalog count:
- Company specific catalogs:

**Q6.2.11** — Les acheteurs professionnels doivent-ils voir une vitrine ou un paiement différents de ceux des particuliers ? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.12** — Les commandes B2B ont-elles besoin de l'un de ces éléments : abonnements, livraison locale ou points relais, paiements express, plus de 500 lignes, cartes cadeaux ? *(required · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Le B2B Shopify ne les prend pas en charge.*

*(tick all that apply)*
- [ ] Abonnements
- [ ] Livraison locale ou points relais
- [ ] Paiements express
- [ ] Plus de 500 lignes
- [ ] Cartes cadeaux
- [ ] Aucun
- [ ] Pas encore certain

**Q6.2.13** — Quelles règles d'expédition diffèrent pour les acheteurs professionnels ? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Par défaut, acheteurs professionnels et particuliers voient les mêmes modes de livraison. Des options différentes exigent Checkout Blocks, une application ou une Function de personnalisation de la livraison ; les commandes peuvent aussi être soumises en provisoire pour chiffrer la livraison avant le paiement.*

*(tick all that apply)*
- [ ] Tarifs ou modes de livraison distincts
- [ ] Livraison offerte au-delà d'un montant
- [ ] Fret ou livraison sur palette
- [ ] Compte transporteur propre à l'acheteur
- [ ] Livraison chiffrée après la commande
- [ ] Aucun
- [ ] Pas encore certain

**Q6.2.14** — L'activité de gros est-elle pilotée par sa propre équipe, avec ses propres objectifs ou son propre compte de résultat ? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Ask if Q1.1.4 is Business to business (B2B), or Q1.1.4 is Hybrid (DTC and B2B).*
*Why we ask: A wholesale business with its own team, targets and customers usually wants to move at its own pace — its own campaigns, its own releases, its own data. That is the difference between wholesale living alongside the consumer store and wholesale having a store of its own.*
*Nous interrogeons l'organisation de l'entreprise, pas le site web.*

- [ ] Yes
- [ ] No

### 6.3 Fidélité & segmentation

**Q6.3.1** — Quels éléments de fidélité sont prévus ? *(recommended)*
*Ask if Q1.1.4 is Direct to consumer (DTC) or Hybrid (DTC and B2B).*
*Shopify n'a pas de programme de points natif ; l'avoir en boutique peut servir de monnaie de récompense. La fidélité exige une application.*

*(tick all that apply)*
- [ ] Points pour des achats
- [ ] Points pour des actions
- [ ] Paliers VIP
- [ ] Parrainage
- [ ] Accès anticipé VIP
- [ ] Remise d'abonnement
- [ ] Avoir en boutique
- [ ] Aucun
- [ ] Pas encore certain

**Q6.3.2** — La fidélité est-elle nécessaire au lancement ou dans une phase ultérieure ? *(recommended)*

*(tick one)*
- [ ] Au lancement
- [ ] Phase 2
- [ ] Aucun

**Q6.3.3** — Quelle application de fidélité est utilisée ou préférée ? *(optional)*

> Answer:

**Q6.3.4** — Le statut de fidélité doit-il être synchronisé avec la plateforme e-mail ou le CRM ? *(optional)*

- [ ] Yes
- [ ] No

**Q6.3.5** — Quels segments de clientèle utilisez-vous aujourd'hui ? *(optional)*

> Answer:

**Q6.3.6** — D'où la segmentation est-elle pilotée — Shopify, la plateforme e-mail, une CDP, ou un mélange ? *(optional)*
*Les segments de clientèle sont natifs dans Shopify ; la plateforme e-mail ou une CDP peuvent les détenir à la place.*

*(tick one)*
- [ ] Shopify
- [ ] Plateforme d’e-mailing (ESP)
- [ ] CDP
- [ ] Mixte
- [ ] Aucun

**Q6.3.7** — Quelles étiquettes client pilotent aujourd'hui une logique sur mesure (prix, accès, réductions) ? *(optional)*

> Answer:

### 6.4 Confidentialité & consentement

**Q6.4.1** — Quelles lois sur la protection des données s'appliquent à vos clients (RGPD, RGPD britannique, CCPA, nLPD suisse, autres) ? *(required)*

*(tick all that apply)*
- [ ] RGPD (UE)
- [ ] UK GDPR
- [ ] CCPA (États-Unis)
- [ ] nLPD suisse
- [ ] Autre
- [ ] Aucun
- [ ] Pas encore certain

**Q6.4.2** — Consentement aux cookies : la bannière de Shopify ou une plateforme de gestion du consentement ? Nommez l'outil si vous le connaissez. *(recommended)*
*Ask if Q6.4.1 includes GDPR (EU), UK GDPR, Swiss nFADP or CCPA (US).*
*La bannière de cookies de Shopify est native ; une plateforme tierce doit intégrer la Customer Privacy API de Shopify.*

- Consent approach:
- Cookie consent tool:

**Q6.4.3** — Un consentement explicite est-il requis pour les e-mails marketing ? *(recommended)*

- [ ] Yes
- [ ] No

**Q6.4.4** — Recueillez-vous des données personnelles sensibles (santé, âge, biométrie, finances) ? *(required)*
*Les données sensibles exigent une analyse d'impact relative à la protection des données et une validation juridique.*

- [ ] Yes
- [ ] No

**Q6.4.5** — Les demandes d'accès ou de suppression doivent-elles atteindre des systèmes au-delà de Shopify (ERP, plateforme e-mail) ou s'exécuter sans intervention humaine ? *(required)*
*Shopify traite les demandes d'export et d'effacement dans l'interface d'administration ; d'autres systèmes ou l'automatisation exigent une conception supplémentaire et une validation juridique.*

- [ ] Yes
- [ ] No

**Q6.4.6** — Les lois des États américains sur la vie privée imposent-elles une page « Do not sell or share my personal information » ? *(optional)*
*Une page d'opposition native respecte le Global Privacy Control.*

- [ ] Yes
- [ ] No

**Q6.4.7** — Où recueillez-vous le consentement marketing ? *(optional)*

*(tick all that apply)*
- [ ] Checkout
- [ ] Connexion par compte client
- [ ] Formulaires et fenêtres surgissantes
- [ ] POS
- [ ] Aucun
- [ ] Pas encore certain

### 6.5 Customer service

**Q6.5.1** — Où les questions des clients seront-elles traitées après le lancement : Shopify Inbox, une application de helpdesk, un helpdesk hors de Shopify, l'e-mail seul, ou nulle part encore ? *(required)*
*Shopify Inbox est gratuit et vit dans l'admin. Un helpdesk comme Gorgias ou Zendesk fait venir le contexte de commande et demande en général une connexion construite.*

*(tick one)*
- [ ] Shopify inbox
- [ ] Helpdesk app
- [ ] External helpdesk
- [ ] Email only
- [ ] Aucun
- [ ] Pas encore certain

**Q6.5.2** — Quel helpdesk, si un nom est arrêté ? *(recommended)*
*Le nom du produit, pas une personne.*

> Answer:

**Q6.5.3** — Où le formulaire de contact de la vitrine doit-il aboutir : une boîte e-mail, le helpdesk, un CRM — ou n'y a-t-il pas de formulaire ? *(required)*
*Les thèmes Shopify fournissent un formulaire de contact qui envoie un e-mail. Tout le reste est une connexion que quelqu'un construit et entretient.*

*(tick one)*
- [ ] Email only
- [ ] Into the helpdesk
- [ ] Into a CRM
- [ ] Aucun
- [ ] Pas encore certain

**Q6.5.4** — Votre équipe crée-t-elle des commandes pour les clients — par téléphone, en showroom, ou pour des acheteurs grossistes ? *(required)*
*Dans Shopify c'est une commande provisoire : l'équipe construit la commande dans l'admin et envoie une facture à régler.*

- [ ] Yes
- [ ] No

**Q6.5.5** — Vos clients réservent-ils un créneau chez vous — rendez-vous en magasin, conseil à distance, ou les deux ? *(recommended)*
*Ask if Q5.6.1 is 1 or more, or Q2.2.1 includes Virtual or Made to order, or Q0.3.1 mentions appointment, booking, consultation, fitting, showroom or reservation.*
*La réservation n’est pas une fonction Shopify : c’est une catégorie de l’App Store, et c’est l’application qui tient le calendrier.*

*(tick one)*
- [ ] Rendez-vous en magasin
- [ ] Conseil à distance
- [ ] Les deux
- [ ] Aucun
- [ ] Pas encore certain

---

## § 7 — Marketing & promotions

> SEO, analytics, e-mail, avis, affiliation, remises, campagnes et commerce piloté par l’IA.

### 7.1 SEO

**Q7.1.1** — La recherche organique est-elle un canal de trafic important ? *(recommended)*

- [ ] Yes
- [ ] No

**Q7.1.2** — Des structures d'URL sur mesure sont-elles nécessaires ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.1.3** — Qui pilote le référencement ? *(optional)*

*(tick one)*
- [ ] En interne
- [ ] Agence
- [ ] Aucun

**Q7.1.4** — Les produits doivent-ils être trouvables dans les assistants d'achat par IA ? *(optional)*
*Shopify Catalog et les canaux agentiques (Spring '26).*

- [ ] Yes
- [ ] No

### 7.2 Analytics & tracking

**Q7.2.1** — Quelles plateformes d'analytique utilisez-vous (GA4, Adobe, autre) ? *(recommended)*

> Answer:

**Q7.2.2** — Une mesure côté serveur est-elle nécessaire ? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.1.1 mentions conversion, tracking, attribution, advert, ads, roas or acquisition.*
*Les customer events de Shopify mesurent la boutique et le paiement avec consentement ; les applications Facebook & Instagram et Google & YouTube envoient des événements côté serveur. Au-delà, il faut une application de mesure. Les événements serveur peuvent partager des données client avec les régies (seuil PII).*

- [ ] Yes
- [ ] No

**Q7.2.3** — Quels pixels publicitaires sont nécessaires (Meta, TikTok, Pinterest, Google Ads) ? *(recommended)*

> Answer:

**Q7.2.4** — Un gestionnaire de balises est-il déjà configuré ? *(recommended)*
*Les gestionnaires de balises fonctionnent dans Shopify comme un pixel personnalisé en bac à sable ; les scripts dans le paiement ne sont plus possibles.*

- [ ] Yes
- [ ] No

**Q7.2.5** — Quels événements sur mesure doivent être mesurés au-delà des événements e-commerce standards ? *(recommended)*

> Answer:

### 7.3 E-mail & CRM

**Q7.3.1** — Quelle plateforme e-mail ou CRM utilisez-vous ou prévoyez-vous : Shopify Messaging ou une autre plateforme (à nommer) ? *(recommended)*
*Shopify Messaging couvre les campagnes et automatisations par e-mail, SMS et WhatsApp.*

- Type:
- Platform:

**Q7.3.2** — Quels parcours automatisés sont nécessaires (bienvenue, panier abandonné, après-achat, réactivation) ? *(recommended)*

> Answer:

**Q7.3.3** — Où les segments de clientèle sont-ils gérés : dans Shopify ou dans la plateforme d’e-mailing ? *(recommended)*
*Le système qui possède les segments est celui où ils sont construits et d’où l’autre les lit.*

*(tick one)*
- [ ] Shopify
- [ ] Plateforme d’e-mailing (ESP)

**Q7.3.4** — Envoyez-vous du marketing par SMS, et vers quels pays ? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.4.1 mentions sms, retention or repeat.*

- Enabled:
- Countries:

**Q7.3.5** — Envoyez-vous du marketing par WhatsApp ? *(optional)*
*Natif dans Shopify Messaging.*

- [ ] Yes
- [ ] No

### 7.4 Avis & affiliation

**Q7.4.1** — Quelle application d'avis produit est utilisée ou préférée ? *(optional)*
*Ask if Q1.2.1 is yes, or Q0.5.4 is not None.*
*Les avis produit exigent une application.*

> Answer:

**Q7.4.2** — Les contenus créés par les clients sont-ils importants (photos clients, intégrations sociales) ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.4.3** — Quelle plateforme d'affiliation, le cas échéant ? *(optional)*

> Answer:

**Q7.4.4** — Utilisez-vous Shopify Collabs pour les influenceurs ? *(optional)*
*Shopify Collabs n'accepte plus de nouvelles inscriptions de créateurs ; vous pouvez toujours en inviter.*

- [ ] Yes
- [ ] No

**Q7.4.5** — Les ventes d'affiliation et d'influence sont-elles suivies par codes de réduction, par paramètres UTM, ou les deux ? *(optional)*

*(tick one)*
- [ ] Codes de réduction
- [ ] Paramètres UTM
- [ ] Les deux
- [ ] Aucun

### 7.5 Remises & codes promo

**Q7.5.1** — Quels types de réductions sont utilisés ? *(recommended)*

*(tick all that apply)*
- [ ] Pourcentage
- [ ] Montant fixe
- [ ] Un acheté, un offert (BOGO)
- [ ] Livraison offerte
- [ ] Paliers par volume
- [ ] Automatique
- [ ] Par code
- [ ] Opération programmée
- [ ] Cumulable
- [ ] Point de vente seulement
- [ ] Aucun
- [ ] Pas encore certain

**Q7.5.2** — Quelles réductions doivent se combiner sur une même commande ? *(required)*
*Shopify combine nativement les réductions produit, commande et livraison (jusqu'à 5 codes plus 1 code de livraison, et jusqu'à 25 réductions automatiques). Une logique sur mesure exige une Function de réduction.*

*(tick one)*
- [ ] Aucun
- [ ] Les combinaisons natives de Shopify
- [ ] Plusieurs réductions sur le même article
- [ ] Logique sur mesure (Function de réduction)

**Q7.5.3** — Les codes promotionnels sont-ils à usage unique, à usages multiples, ou générés en masse ? *(optional)*

*(tick all that apply)*
- [ ] À usage unique
- [ ] À usages multiples
- [ ] En masse
- [ ] Aucun
- [ ] Pas encore certain

**Q7.5.4** — Les codes doivent-ils porter le nom de la marque (par exemple WELCOME20) ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.5** — Les codes ont-ils besoin de montants ou de quantités minimum ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.6** — Les codes expirent-ils à une date fixe, après une période glissante, ou jamais ? *(optional)*

*(tick one)*
- [ ] Aucun
- [ ] Fixe
- [ ] Glissant

**Q7.5.7** — Comment les codes sont-ils distribués (e-mail, SMS, imprimé, influenceurs) ? *(optional)*

> Answer:

**Q7.5.8** — Les promotions diffèrent-elles selon le marché, le segment de clientèle, le canal de vente ou l'entreprise B2B ? *(recommended)*

*(tick all that apply)*
- [ ] Marché
- [ ] Segment de clientèle
- [ ] Point de vente seulement
- [ ] Entreprise B2B
- [ ] Aucun
- [ ] Pas encore certain

### 7.6 Cartes cadeaux & campagnes

**Q7.6.1** — Les cartes cadeaux sont-elles vendues comme un produit ? *(optional)*
*Les cartes cadeaux sont natives : cartes numériques par e-mail, cartes physiques au point de vente ; elles n'expirent jamais par défaut. Couvre aussi les cartes cadeaux acceptées au paiement.*

- [ ] Yes
- [ ] No

**Q7.6.2** — Des cartes cadeaux sont-elles émises en récompense ou en dédommagement ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.3** — Cartes cadeaux numériques, physiques, ou les deux ? *(optional)*

*(tick one)*
- [ ] Numérique
- [ ] Physique
- [ ] Les deux

**Q7.6.4** — Les cartes cadeaux doivent-elles expirer ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.5** — Les promotions sont-elles déclenchées depuis des campagnes e-mail ou SMS ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.6** — Chaque campagne a-t-elle besoin de sa propre page d'atterrissage ? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.7** — Des comptes à rebours ou des éléments d'urgence sont-ils nécessaires ? *(optional)*
*Les comptes à rebours exigent une application ou du travail de thème.*

- [ ] Yes
- [ ] No

**Q7.6.8** — Les promotions diffèrent-elles selon le marché — une campagne ou une remise valable dans un seul pays ? *(optional)*
*Ask if Q3.1.1 has 2+ markets.*

- [ ] Yes
- [ ] No

**Q7.6.9** — Organisez-vous des sorties programmées ou des ventes flash à fort trafic ? *(optional)*
*Les modifications programmées du thème et du paiement sont natives (Rollouts).*

- [ ] Yes
- [ ] No

### 7.7 IA & commerce agentique

**Q7.7.1** — Souhaitez-vous que vos produits soient trouvés et achetés dans des assistants IA comme ChatGPT, Google AI ou Copilot ? *(recommended)*
*Les assistants IA deviennent un canal de vente. Shopify active déjà par défaut les boutiques éligibles : c'est donc une décision à confirmer ou à annuler, pas à repousser.*

- [ ] Yes
- [ ] No

**Q7.7.2** — Shopify doit-il vous inscrire automatiquement aux nouveaux canaux IA à mesure qu'ils apparaissent, ou voulez-vous valider chacun d'eux ? *(recommended)*
*Le réglage par défaut vous inscrit aussi à des canaux qui n'existent pas encore.*

*(tick one)*
- [ ] Géré par Shopify
- [ ] Par canal
- [ ] Désactivé
- [ ] Pas encore certain

**Q7.7.3** — Les acheteurs doivent-ils pouvoir payer dans l'assistant IA, ou venir payer sur votre boutique ? *(recommended)*
*Payer dans l'assistant convertit mieux ; les renvoyer vers votre boutique préserve tout le parcours, les ventes additionnelles et l'analytique.*

*(tick one)*
- [ ] Tous les canaux
- [ ] Canaux sélectionnés
- [ ] Désactivé
- [ ] Pas encore certain

**Q7.7.4** — Vendez-vous à des clients aux États-Unis ? *(recommended)*
*Certains canaux IA ne sont ouverts qu'aux marchands vendant à des acheteurs américains, où que l'entreprise soit établie.*

- [ ] Yes
- [ ] No

**Q7.7.5** — Qui peut accepter les conditions supplémentaires de Shopify pour la vente via les canaux IA ? *(recommended)*
*Vendre via ces canaux exige d'accepter des conditions distinctes — en général le juridique ou les achats, pas l'équipe e-commerce.*

> Answer:

**Q7.7.6** — Êtes-vous à l'aise avec le partage du nom, de l'e-mail, du téléphone et de l'adresse du client avec un canal IA lorsqu'il y achète ? *(recommended)*
*C'est une décision de protection des données. Sous le RGPD, elle exige en général une revue documentée avant le lancement.*

*(tick one)*
- [ ] Validé
- [ ] Refusé
- [ ] Nécessite une revue juridique

**Q7.7.7** — Vos données produit sont-elles complètes — titres, images, prix, descriptions et variantes ? *(recommended)*
*Les canaux IA ne listent que les produits dont les données sont complètes. Les manques rendent les produits invisibles, pas mal présentés.*

*(tick one)*
- [ ] Complet
- [ ] Seulement pour certains produits
- [ ] Pas encore certain

**Q7.7.8** — Des informations produit importantes vivent-elles dans des champs personnalisés, des enregistrements séparés ou dans le titre du produit (par exemple « Acier 40 mm — Automatique ») ? *(optional)*
*Les données logées dans des champs personnalisés ou dans le titre exigent une correspondance avant que les canaux IA puissent les lire.*

- [ ] Yes
- [ ] No

**Q7.7.9** — Les robots d'exploration IA doivent-ils être autorisés, restreints ou bloqués sur votre site ? *(optional)*
*Bloquer les robots ne retire pas vos produits des canaux d'achat IA ; cela n'affecte que ce qu'ils lisent de votre site public.*

*(tick one)*
- [ ] Tout autoriser
- [ ] Sélectif
- [ ] Bloquer
- [ ] Pas encore certain

**Q7.7.10** — Voulez-vous maîtriser les réponses que les assistants IA donnent sur la livraison, les retours et les tailles ? *(optional)*
*Shopify propose une application gratuite qui publie vos questions fréquentes pour les assistants et enregistre ce que les acheteurs demandent.*

- [ ] Yes
- [ ] No

**Q7.7.11** — Prévoyez-vous de proposer votre propre assistant d'achat IA, ou de connecter vous-même la boutique à des plateformes d'agents ? *(optional)*
*Une partie est encore en accès anticipé chez Shopify — traitez-le comme une exploration et non comme un périmètre arrêté.*

*(tick one)*
- [ ] Maintenant
- [ ] Plus tard
- [ ] Non
- [ ] Pas encore certain

**Q7.7.12** — Quels outils IA de Shopify voulez-vous que votre équipe utilise au quotidien ? *(optional)*
*Ce sont des outils internes pour votre équipe, pas destinés aux clients.*

*(tick all that apply)*
- [ ] Sidekick
- [ ] Shopify magic
- [ ] Recherche sémantique
- [ ] Base de connaissances
- [ ] Aucun
- [ ] Pas encore certain

**Q7.7.13** — Boutique Shopify existante : qu'affichent aujourd'hui les réglages des canaux de vente agentiques (Canaux de vente → Agentic) ? *(recommended · consultant)*
*Skip if Q1.2.1 = no.*
*Regardez l'interface d'administration avec le client : mode d'inscription, canaux actifs, et si le paiement dans l'assistant est activé.*

*(tick one)*
- [ ] Géré par Shopify
- [ ] Par canal
- [ ] Désactivé
- [ ] Pas encore certain

---

## § 8 — Intégrations & migration

> Tout système qui échange des données avec la boutique, et ce qui vient de la plateforme actuelle.

### 8.1 Systèmes connectés

**Q8.1.1** — Énumérez chaque système qui échange des données de produit, de stock, de commande, de client ou de finance avec la boutique. Pour chacun : système, catégorie, sens, objets de données, fréquence, connecteur (application native / iPaaS / sur mesure / aucun), responsable, statut, et s'il dispose d'un environnement de test auquel nous pouvons nous connecter avant la mise en ligne. *(required)*
*Répartition courante : le PIM fournit produits, attributs et traductions ; l'ERP fournit les prix (y compris les catalogues B2B), le stock par emplacement et le statut des commandes. Shopify n'a besoin d'aucune instance séparée pour la préproduction : la seule chose à organiser est de votre côté — un système sans environnement de test signifie que l'intégration est testée contre votre système en production.*

| System | Category | Direction | Objects | Frequency | Connector | Middleware | Owner | Status | Daily updates | Latency minutes | Test environment |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

**Q8.1.2** — Existe-t-il une couche de middleware / iPaaS, ou des connecteurs sur mesure ? *(optional)*

> Answer:

**Q8.1.3** — À quelle fréquence prix et stocks changent-ils (mises à jour par jour), et les changements doivent-ils être visibles en quelques minutes ? *(recommended)*
*Dimensionne la conception de la synchronisation (Bulk Operations contre webhooks).*

- Daily updates:
- Latency minutes:

### 8.2 Migration des données

**Q8.2.2** — Quelles données doivent être migrées ? *(recommended)*
*Skip if Q0.5.4 = None.*
*Les mots de passe des clients ne peuvent pas être migrés ; la connexion se fait par code à usage unique.*

*(tick all that apply)*
- [ ] Produits
- [ ] Clients
- [ ] Commandes
- [ ] Contenu
- [ ] Redirections
- [ ] Avis
- [ ] Cartes cadeaux
- [ ] Avoir en boutique
- [ ] Métachamps et métaobjets
- [ ] Entreprises B2B
- [ ] Contrats d'abonnement
- [ ] Articles de blog et pages
- [ ] Aucun
- [ ] Pas encore certain

**Q8.2.3** — Volumes approximatifs : produits, clients, commandes, redirections d'URL. *(required)*
*Skip if Q0.5.4 = None.*

- Products:
- Customers:
- Orders:
- Redirects:

**Q8.2.4** — L'historique des commandes doit-il être consultable dans Shopify ? *(required)*
*Skip if Q0.5.4 = None.*

- [ ] Yes
- [ ] No

**Q8.2.5** — Quelle part du capital de référencement (positions, liens entrants) doit être préservée ? *(required · consultant)*
*Skip if Q0.5.4 = None.*

*(tick one)*
- [ ] Aucun
- [ ] Modéré
- [ ] Important

**Q8.2.6** — Les abonnements actifs doivent-ils migrer vers la nouvelle boutique sans que les clients ressaisissent leur carte ? *(required)*
*Skip if Q0.5.4 = None.*

- [ ] Yes
- [ ] No

---

## § 9 — Design & expérience

> Source du design, approche de la vitrine, accessibilité et performance.

### 9.1 Matière de design

**Q9.1.1** — Existe-t-il un fichier Figma ou une maquette pour la nouvelle boutique ? *(required)*

- [ ] Yes
- [ ] No

**Q9.1.2** — Quel est son degré d'achèvement — marque seulement, écrans clés, ou tous les gabarits ? *(required)*
*Skip if Q9.1.1 = no.*

*(tick one)*
- [ ] Aucun
- [ ] Marque seulement
- [ ] Écrans clés
- [ ] Tous les gabarits

**Q9.1.3** — Le fichier Figma contient-il un système de design complet (tokens et composants) ? *(required)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.4** — Le design est-il projeté sur les sections et blocs Shopify ? *(optional · consultant)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.5** — Un design entièrement sur mesure est-il exigé, plutôt qu'un thème avec personnalisation de marque ? *(recommended)*

- [ ] Yes
- [ ] No

**Q9.1.6** — Combien de sections ou de blocs sur mesure la vitrine nécessite-t-elle, au-delà de ceux que le thème possède déjà ? *(recommended)*
*Une section conçue et construite pour vous — pas une des sections du thème, simplement configurée. Comptez les sections distinctes, pas le nombre de pages qui les utilisent.*

> Answer:

### 9.2 Vitrine

**Q9.2.1** — Une vitrine headless est-elle exigée (Hydrogen, un autre framework, ou le front d'une application native) ? *(required)*
*Headless signifie un front sur mesure bâti sur Shopify ; le paiement reste le paiement Shopify.*

- [ ] Yes
- [ ] No

**Q9.2.2** — Une licence de thème à conserver ? *(optional)*
*Les nouvelles constructions partent du thème Horizon de Shopify ; une licence de thème tiers ne compte que pour une base autre qu'Horizon.*

> Answer:

**Q9.2.3** — Quelle est la direction esthétique (minimale, éditoriale, luxe, ludique, fonctionnelle) ? *(optional)*

> Answer:

**Q9.2.4** — Quels motifs interactifs sont exigés (méga-menu, ajout rapide, nuanciers, recherche prédictive, lookbook, vidéo en bannière) ? *(required)*

*(tick all that apply)*
- [ ] Méga-menu
- [ ] Recherche prédictive
- [ ] Nuanciers de variantes
- [ ] Ajout rapide
- [ ] Combined listings
- [ ] Filtres
- [ ] Liste de commande rapide et prix par volume
- [ ] Liste d'envies
- [ ] Localisateur de magasins
- [ ] Lookbook
- [ ] Vidéo en bannière
- [ ] Aucun
- [ ] Pas encore certain

**Q9.2.5** — De l'animation sur mesure est-elle exigée ? *(recommended)*

- [ ] Yes
- [ ] No

**Q9.2.6** — Pourquoi le headless ? *(required)*
*Skip if Q9.2.1 = no.*
*Aide à vérifier si les theme blocks d'Horizon suffiraient.*

*(tick all that apply)*
- [ ] Expérience impossible dans un thème
- [ ] Performance
- [ ] CMS ou plateforme de contenu existante
- [ ] Application mobile native
- [ ] Plusieurs fronts, un seul back
- [ ] Maîtrise de la structure des URL
- [ ] Autre
- [ ] Pas encore certain

**Q9.2.7** — Hébergement du headless ? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Oxygen (hébergement Shopify)
- [ ] Environnement JavaScript auto-hébergé
- [ ] Pas encore certain

**Q9.2.8** — Où le contenu éditorial est-il géré pour la vitrine headless ? *(recommended)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Shopify metaobjects
- [ ] Headless CMS
- [ ] PIM
- [ ] Pas encore certain

**Q9.2.11** — Quel front end : Shopify Hydrogen, ou un autre framework ? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Hydrogen
- [ ] Other framework
- [ ] Pas encore certain

**Q9.2.9** — Quelles fonctionnalités de plateforme sont nécessaires en headless ? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick all that apply)*
- [ ] Comptes clients (Customer Account API)
- [ ] Markets et routes linguistiques
- [ ] Entreprises (B2B)
- [ ] Abonnements
- [ ] Offres groupées et combined listings
- [ ] Analytique et consentement Shopify
- [ ] Plusieurs vitrines
- [ ] Aucun
- [ ] Pas encore certain

**Q9.2.10** — Souhaitez-vous faire des tests A/B sur les thèmes ou les configurations de paiement ? *(required)*
*Natif avec les expériences Shopify Rollouts.*

- [ ] Yes
- [ ] No

**Q9.2.12** — Souhaitez-vous une présence dans l’application Shop de Shopify — un Shop Mini ? *(recommended)*
*Une expérience d’achat plein écran à l’intérieur de l’application Shop. Ce n’est ni votre propre application, ni une vitrine headless.*

*(tick one)*
- [ ] Maintenant
- [ ] Plus tard
- [ ] Non
- [ ] Pas encore certain

**Q9.2.13** — Au-delà de la première, combien de vitrines ont besoin d’un design véritablement différent — une autre mise en page et une autre structure de pages, et non d’un autre contenu, d’autres images ou d’autres traductions ? *(recommended)*
*Le contenu, les images et les traductions par marché sont inclus dans chaque offre. Un design différent, c’est un second thème, et ce n’est pas la même chose : la personnalisation par marché de Shopify va jusqu’au contenu des sections, à la visibilité et à l’ordre des blocs, et aux réglages de section — jamais les réglages du thème, jamais les templates Liquid. Répondez 0 si un seul design sert tous les marchés et tous les stores.*

> Answer:

**Q9.2.14** — Chaque marque a-t-elle besoin de son propre design system — ses propres tokens et composants — plutôt que d’un seul design system avec un thème par marque ? *(recommended)*
*Ask if Q1.1.8 is 2 or more.*
*Un design system peut porter plusieurs marques : les mêmes composants, avec les couleurs, la typographie et l’imagerie de chaque marque en tokens, et une autre mise en page là où une marque en a besoin. Un design system par marque, ce sont des tokens et des composants séparés, conçus et maintenus à part.*

- [ ] Yes
- [ ] No

### 9.3 Accessibilité

**Q9.3.1** — Quelle norme d'accessibilité s'applique ? *(required)*
*Le paiement Shopify est testé au regard de WCAG 2.2 AA ; le thème et les applications relèvent de votre responsabilité (par exemple au titre de l'European Accessibility Act).*

*(tick one)*
- [ ] WCAG 2.1 AA
- [ ] WCAG 2.2 AA
- [ ] EN 301 549
- [ ] Section 508
- [ ] Aucun

**Q9.3.2** — Un audit d'accessibilité a-t-il été réalisé sur le site actuel ? *(optional)*

- [ ] Yes
- [ ] No

### 9.4 Performance

**Q9.4.1** — Objectifs Core Web Vitals : LCP (secondes), CLS, INP (millisecondes). *(optional)*

- Lcp s:
- Cls:
- Inp ms:

**Q9.4.2** — La vitesse des pages est-elle un problème connu aujourd'hui ? *(recommended)*
*Le rapport de performance web de Shopify montre les Core Web Vitals de la boutique actuelle.*

- [ ] Yes
- [ ] No

**Q9.4.3** — Quels scripts tiers doivent se charger (chat, personnalisation, cartes de chaleur) ? *(optional)*

> Answer:

---

## § 10 — Réalisation, gouvernance & conformité

> Calendrier, prise de décision, support, juridique et outillage projet.

### 10.1 Calendrier

**Q10.1.1** — Quelle est la date de mise en ligne visée ? *(required)*
*Une date plus proche que le délai de livraison qu'exige le périmètre conduit à un plan par phases, MVP d'abord.*

> Answer:

**Q10.1.2** — Qu'est-ce qui impose l'échéance (haute saison, lancement produit, fin de contrat) ? *(recommended)*

> Answer:

**Q10.1.3** — Un lancement par phases est-il prévu ? *(optional)*

- [ ] Yes
- [ ] No

**Q10.1.4** — Date souhaitée de lancement des travaux. *(recommended)*

> Answer:

### 10.2 Équipe & décisions

**Q10.2.1** — Qui intervient côté client ? Pour chacun : rôle, RACI (R/A/C/I), décideur (oui/non). Les noms sont facultatifs. *(required)*

| Role | Raci | Decision maker | Name |
|---|---|---|---|
| | | | |

**Q10.2.2** — Y a-t-il un décideur unique pour le périmètre, les validations et les retours ? *(required · consultant)*
*Un décideur unique doit être nommé avant le cahier des charges.*

- [ ] Yes
- [ ] No

**Q10.2.3** — Sait-on clairement qui a l'autorité d'engager le budget ? *(required · consultant)*

- [ ] Yes
- [ ] No

**Q10.2.4** — Quels rôles feront tourner la boutique au quotidien — par exemple merchandising, service client, finance, marketing — chacun avec ses propres droits d’accès ? *(recommended)*
*Des rôles, pas des noms. Chaque rôle reçoit ses propres droits plutôt qu’un identifiant partagé.*

> Answer:

### 10.3 Support & formation

**Q10.3.1** — Quelles formations sont nécessaires (produits, commandes, réductions, rapports) ? *(optional)*

> Answer:

**Q10.3.2** — Des procédures écrites sont-elles exigées ? *(optional)*

- [ ] Yes
- [ ] No

**Q10.3.3** — Quel modèle de support après lancement est attendu ? *(recommended)*

*(tick one)*
- [ ] Hypercare seulement
- [ ] Forfait de maintenance
- [ ] Autonome
- [ ] Tiers

**Q10.3.4** — Le forfait Grow est-il signé ? *(required · consultant)*

- [ ] Yes
- [ ] No

**Q10.3.5** — Durée du forfait, en mois. *(recommended · consultant)*
*Skip if Q10.3.4 = no.*

> Answer:

**Q10.3.6** — Le client revérifiera-t-il applications et fonctionnalités Shopify à chaque Shopify Edition après le lancement ? *(optional · consultant)*

- [ ] Yes
- [ ] No

**Q10.3.7** — De combien de jours ouvrés d’hypercare avez-vous besoin après la mise en ligne ? *(recommended)*
*L’hypercare est la période qui suit la mise en ligne : un canal désigné, une réponse sous un jour ouvré et les défauts triés avec vous. Un nombre de jours est compris dans l’offre ; ne répondez que si vous en avez besoin de plus.*

> Answer:

### 10.4 Juridique & secteurs réglementés

**Q10.4.1** — L'entreprise évolue-t-elle dans un secteur réglementé (pharmacie, alcool, armes, produits soumis à un âge minimum, produits financiers, dispositifs médicaux) ? Si oui, lequel ? *(required)*
*Un secteur réglementé exige une revue juridique. Shopify a ses propres règles : l'alcool exige par exemple une vérification de l'âge ; certains types d'activité ne peuvent pas utiliser Shopify Payments.*

- Active:
- Category:

**Q10.4.2** — Les pages légales (conditions, confidentialité, cookies, retours) sont-elles prêtes, à mettre à jour, ou encore à rédiger ? *(recommended)*

*(tick one)*
- [ ] Prêt
- [ ] À mettre à jour
- [ ] À rédiger

**Q10.4.3** — Y a-t-il d'autres exigences de conformité propres au secteur ? *(optional)*

> Answer:

**Q10.4.4** — L'activité et la gamme de produits sont-elles éligibles à Shopify Payments (aucune catégorie restreinte ou interdite) ? *(required · consultant)*

- [ ] Yes
- [ ] No

### 10.5 Mise en place du projet (consultant)

**Q10.5.1** — Lead consultant (responsable de l'engagement). *(required · consultant)*

> Answer:

**Q10.5.2** — Le client a-t-il accepté que les réponses soient traitées par le moteur de discovery IA (aucune donnée personnelle de client incluse) ? *(required · consultant)*
*ADR 0007 — le moteur refuse de fonctionner sans consentement enregistré.*

- [ ] Yes
- [ ] No

**Q10.5.3** — Instance Jira et clé de projet pour le backlog. *(recommended · consultant)*

- Site:
- Project key:

**Q10.5.4** — Composants Jira à utiliser. *(optional · consultant)*

> Answer:

---

## Liste de contrôle

- [ ] Chaque question *required* des §§ 0 à 10 a une réponse ou « TBC »
- [ ] Au moins un KPI a une valeur de référence et une cible (Q0.4.2)
- [ ] Chaque système connecté est listé en Q8.1.1 avec sens d’échange et connecteur
- [ ] Le consentement au traitement par IA est consigné (Q10.5.2)
