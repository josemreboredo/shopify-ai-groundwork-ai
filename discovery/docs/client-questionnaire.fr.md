<!-- GENERATED FILE — do not edit. Source: discovery/schema/question-bank.json + discovery/schema/offering.json. Re-render: npm run questionnaire:render -->

# Questionnaire de discovery Shopify

> **Version:** question bank 1.2.0 · offering 1.3.0
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
- [ ] Retention
- [ ] Mixed
- [ ] Not sure yet

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
- [ ] None
- [ ] Shopify
- [ ] WooCommerce
- [ ] Magento / Adobe Commerce
- [ ] Shopware
- [ ] Salesforce Commerce Cloud
- [ ] BigCommerce
- [ ] Custom
- [ ] Other

### 0.6 Budget

**Q0.6.1** — Quelle est l’enveloppe budgétaire approximative pour ce projet (fourchette et devise) ? *(required)*

- Min:
- Max:
- Currency:

**Q0.6.2** — La priorité est-elle de minimiser le coût initial (applications et configuration), de posséder la solution (développement sur mesure), ou un équilibre entre les deux ? *(required)*

*(tick one)*
- [ ] Minimise upfront
- [ ] Own solution
- [ ] Balanced

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
- [ ] Direct to consumer (DTC)
- [ ] Business to business (B2B)
- [ ] Hybrid (DTC and B2B)

**Q1.1.5** — URL du site actuel. *(optional)*

> Answer:

**Q1.1.6** — Vendez-vous via plus d’une personne morale (par ex. une par pays ou région) ? Merci de les lister. *(required)*
*Plusieurs entités de vente dans une boutique, ou une boutique par entité, change la configuration.*

> Answer:

**Q1.1.7** — Où vendrez-vous au lancement ? *(required)*
*Boutique en ligne, Shopify POS, application Shop, marketplaces, canaux sociaux, B2B, front-ends headless ou applicatifs, agents d’achat IA.*

*(tick all that apply)*
- [ ] Online store
- [ ] Shopify POS
- [ ] Shop app
- [ ] Marketplaces
- [ ] Facebook & Instagram
- [ ] Google & YouTube
- [ ] TikTok
- [ ] B2B online
- [ ] Headless or mobile app
- [ ] AI shopping agents
- [ ] None
- [ ] Not sure yet

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
- [ ] None
- [ ] Starter
- [ ] Basic
- [ ] Grow
- [ ] Advanced
- [ ] Shopify Plus
- [ ] Enterprise
- [ ] Retail
- [ ] Not sure yet

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
- [ ] checkout.liquid or additional scripts
- [ ] Online store script tags
- [ ] Legacy customer accounts
- [ ] Stocky
- [ ] Geolocation app
- [ ] None
- [ ] Not sure yet

**Q1.2.6** — Combien de personnes auront besoin de leur propre accès à l’administration Shopify après la mise en ligne ? *(required)*
*Les comptes collaborateur et le personnel uniquement POS ne sont pas comptés.*

> Answer:

### 1.3 Marque & positionnement

**Q1.3.1** — Comment décririez-vous le positionnement de la marque : value, milieu de gamme, premium, luxe ou enterprise ? *(required)*
*Le positionnement façonne la profondeur du design et l’approche de la solution.*

*(tick one)*
- [ ] Value
- [ ] Mid market
- [ ] Premium
- [ ] Luxury
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
- [ ] Variant
- [ ] Fixed bundle
- [ ] Multipack
- [ ] Mix and match bundle
- [ ] Bundle
- [ ] Product set
- [ ] Gift card
- [ ] Digital
- [ ] Subscription
- [ ] Pre order
- [ ] Made to order
- [ ] Virtual
- [ ] Try before you buy
- [ ] None
- [ ] Not sure yet

**Q2.2.2** — Les abonnements passeront-ils par Shopify Subscriptions (l'application de Shopify) ou par une application tierce ? Précisez laquelle si vous la connaissez. *(recommended)*
*Ask if Q2.2.1 includes Subscription.*
*Shopify Subscriptions : les clients sautent, suspendent et résilient depuis leur compte ; incompatible avec les offres groupées et le B2B.*

- Approach:
- Subscription app:

**Q2.2.3** — Si vous vendez des offres groupées : que doivent-elles permettre ? *(recommended)*
*Ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle.*
*Shopify Bundles : jusqu'à 30 composants ; incompatible avec les abonnements et les précommandes ; pas d'imbrication.*

*(tick all that apply)*
- [ ] Fixed price bundle
- [ ] Multipack
- [ ] Customer builds bundle
- [ ] Bundle with subscription
- [ ] Bundle discount tiers
- [ ] Sell bundles on POS
- [ ] Bundles on marketplaces
- [ ] None
- [ ] Not sure yet

**Q2.2.4** — Quelles fonctionnalités d'abonnement sont nécessaires ? *(recommended)*
*Ask if Q2.2.1 includes Subscription.*

*(tick all that apply)*
- [ ] Pay per delivery
- [ ] Prepaid multi delivery
- [ ] Build a box
- [ ] Subscribe and save discount
- [ ] Subscription bundles
- [ ] Subscriptions on POS
- [ ] B2B subscriptions
- [ ] International subscriptions
- [ ] Migrate existing contracts
- [ ] Not sure yet

**Q2.2.5** — Pour les précommandes, à quel moment le client est-il débité ? *(recommended)*
*Ask if Q2.2.1 includes Pre order.*
*Les précommandes nécessitent une application dédiée ; les paiements express (Shop Pay, Apple Pay, Google Pay) ne sont pas disponibles pour les précommandes.*

*(tick one)*
- [ ] Full at order
- [ ] Deposit then balance
- [ ] Charged at fulfilment

**Q2.2.6** — Les clients personnalisent-ils les produits avec des choix qui ne sont pas des variantes en stock (gravure, envoi de fichier, options payantes, configurateurs) ? *(recommended)*
*Ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order.*

*(tick all that apply)*
- [ ] Text engraving
- [ ] File upload
- [ ] Paid add ons
- [ ] Conditional options
- [ ] 3D configurator
- [ ] None
- [ ] Not sure yet

### 2.3 Données catalogue

**Q2.3.1** — Combien de collections, approximativement ? *(optional)*

> Answer:

**Q2.3.2** — Les collections sont-elles manuelles, basées sur des règles (automatisées), ou mixtes ? *(optional)*

*(tick one)*
- [ ] Manual
- [ ] Automated
- [ ] Mixed

**Q2.3.3** — Quels attributs produit vont au-delà des champs standards de Shopify (caractéristiques techniques, certifications, guides de taille, ingrédients) ? *(required)*
*Shopify stocke les attributs supplémentaires sous forme de métachamps et de métaobjets et utilise la taxonomie produit standard pour les attributs de catégorie (filtres, flux Google et Meta). Avec un PIM, les attributs viennent du PIM.*

> Answer:

**Q2.3.4** — Où les données de catalogue sont-elles maintenues aujourd'hui ? *(recommended)*
*Cas courant : produits et contenus depuis le PIM ; prix et stocks depuis l'ERP.*

*(tick one)*
- [ ] Shopify admin
- [ ] Spreadsheet
- [ ] ERP
- [ ] PIM
- [ ] Mixed

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
- [ ] Other

**Q2.5.2** — Des alertes de stock bas sont-elles nécessaires ? *(optional)*
*Shopify n'a pas d'alerte de stock bas intégrée ; nous la mettons en place avec Shopify Flow.*

- [ ] Yes
- [ ] No

**Q2.5.3** — Que doit-il se passer lorsqu'un produit est en rupture de stock ? *(optional)*
*Ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more.*
*Continuer à vendre (réapprovisionnement) est natif ; les alertes de retour en stock et les précommandes exigent des applications.*

*(tick all that apply)*
- [ ] Hide
- [ ] Show sold out
- [ ] Continue selling (backorder)
- [ ] Back in stock alert
- [ ] Pre order
- [ ] Not sure yet

**Q2.5.4** — Quelles tâches de gestion des stocks votre équipe réalisera-t-elle dans Shopify ? *(optional)*
*Bons de commande, transferts et ajustements de stock sont natifs dans l'interface d'administration Shopify (Stocky est retiré).*

*(tick all that apply)*
- [ ] Purchase orders
- [ ] Stock transfers
- [ ] Stock counts POS
- [ ] Damaged, quality control and safety stock
- [ ] None
- [ ] Not sure yet

---

## § 3 — Marchés & internationalisation

> Shopify Markets, devises, langues, taxes et droits de douane.

### 3.1 Marchés au lancement

**Q3.1.1** — Dans quels pays vendez-vous au lancement ? Pour chacun : le pays, la devise dans laquelle les clients paient, les langues, l'adresse web utilisée là-bas aujourd'hui, la façon dont les prix sont fixés, laquelle de vos sociétés facture le client, si la gamme est la même que dans votre pays principal, et qui pilote ce pays au quotidien. *(required)*
*Why we ask: These rows decide how many Shopify stores your business needs. Countries that share one selling company, one range and one team can run on a single store; countries that differ on those points usually need their own store, which multiplies the build, the running cost and the work of every future change.*
*Une ligne par pays. Laissez une cellule vide si vous ne savez pas — nous y reviendrons.*

| Code | Currency | Languages | Domain | Price strategy | Domain type | Selling entity | Assortment | Run by |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

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
- [ ] Expansion stores
- [ ] Hybrid (DTC and B2B)

**Q3.1.5** — Comment les visiteurs doivent-ils rejoindre leur marché local ? *(optional)*
*La redirection automatique est native ; les visiteurs de l'UE arrivant sur un domaine pays de l'UE ne sont pas redirigés automatiquement.*

*(tick one)*
- [ ] Automatic redirect
- [ ] Country selector only
- [ ] Suggest banner
- [ ] None

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
- [ ] In house
- [ ] Agency
- [ ] Translate & Adapt
- [ ] Third party app
- [ ] Supplied by the PIM
- [ ] Not sure yet

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
- [ ] Product data from the PIM
- [ ] Theme texts
- [ ] Metaobject content
- [ ] Policies
- [ ] Notifications
- [ ] URL handles
- [ ] App content
- [ ] None
- [ ] Not sure yet

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
- [ ] In the PIM
- [ ] In the ERP
- [ ] To be created
- [ ] Not needed

**Q3.4.5** — Les prix doivent-ils inclure la taxe (TVA) sur certains marchés et l'exclure sur d'autres ? *(required)*
*Shopify peut afficher des prix TVA incluse par marché (affichage fiscal dynamique).*

*(tick one)*
- [ ] Include everywhere
- [ ] Exclude everywhere
- [ ] Dynamic by market

**Q3.4.6** — Quel service fiscal ? *(recommended · consultant)*
*Shopify Tax couvre les États-Unis, l'UE, le Royaume-Uni et le Canada ; depuis le 13/05/2026, les nouvelles boutiques vendant dans l'UE, au Royaume-Uni ou au Canada ne peuvent plus utiliser Basic Tax.*

*(tick one)*
- [ ] Shopify Tax
- [ ] Tax app
- [ ] Manual rates
- [ ] Not sure yet

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
- [ ] EU Import One-Stop Shop (IOSS)
- [ ] UK low-value VAT
- [ ] Switzerland low-value VAT
- [ ] Norway VOEC
- [ ] Australia GST on low-value imports
- [ ] New Zealand GST on low-value imports
- [ ] None
- [ ] Not sure yet

**Q3.4.10** — Certains produits bénéficient-ils de taux réduits, de taux zéro ou d'exonérations sur un marché (par exemple médicaments, livres, alimentation, vêtements pour enfants) ? *(recommended)*
*La direction financière confirme les taux ; Merkle ne donne pas de conseil fiscal.*

- [ ] Yes
- [ ] No

**Q3.4.11** — Qui émet les factures aux clients ? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI.*
*Shopify peut générer des factures de TVA pour les commandes de l'UE et du Royaume-Uni (affichées sur la page de statut de commande, non envoyées par e-mail, pas pour les commandes avec droits). L'application gratuite Order Printer imprime des factures à partir de modèles. Les factures peuvent aussi venir de l'ERP ou d'une application de facturation.*

*(tick one)*
- [ ] Shopify VAT invoices (EU and UK)
- [ ] Shopify Order Printer
- [ ] Invoicing app
- [ ] ERP
- [ ] Billing or tax service
- [ ] Not sure yet

**Q3.4.12** — Quelles obligations de facturation électronique s'appliquent à vos ventes ? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU.*
*Par exemple Peppol, XRechnung ou ZUGFeRD (Allemagne), Factur-X (France), SdI (Italie), KSeF (Pologne) ou VeriFactu (Espagne). Shopify n'a pas de facturation électronique intégrée : elle vient de l'ERP ou d'une application de facturation.*

*(tick all that apply)*
- [ ] Peppol
- [ ] Germany: XRechnung or ZUGFeRD
- [ ] France: Factur-X
- [ ] Italy: SdI
- [ ] Poland: KSeF
- [ ] Spain: VeriFactu
- [ ] Other
- [ ] None
- [ ] Not sure yet

**Q3.4.13** — Si vendre dans un pays impliquait de s'y immatriculer fiscalement et d'y déposer des déclarations, le prendriez-vous en charge vous-même, ou préféreriez-vous qu'un partenaire soit le vendeur légal pour ces commandes ? *(recommended)*
*Why we ask: This decides who carries the tax and customs liability on cross-border orders. Keeping it yourself means registering, filing and remitting in each country; handing it to a partner removes that work and that risk, and costs a percentage of every international order.*
*Répondez pour les pays où vous vendez mais où vous n'êtes pas immatriculé aujourd'hui.*

*(tick one)*
- [ ] Own registrations
- [ ] Prefer partner
- [ ] Mixed
- [ ] Not sure yet

### 3.5 Chine continentale

**Q3.5.1** — Souhaitez-vous vendre en Chine continentale en transfrontalier (depuis l'extérieur de la Chine) ou sur place, derrière la Grande Muraille numérique ? *(required)*
*Only if the launch markets include mainland China (CN).*
*La vente sur place exige une entité en RPC, un enregistrement ou une licence ICP et un hébergement en Chine.*

*(tick one)*
- [ ] Cross-border, from outside China
- [ ] Onshore, behind the Great Firewall
- [ ] Both
- [ ] Not sure yet

**Q3.5.2** — Quels canaux pour la Chine continentale ? *(required)*
*Only if the launch markets include mainland China (CN).*
*Places de marché transfrontalières (Tmall Global, JD Worldwide, Douyin Global, RED), un mini-programme WeChat, votre propre site, ou une boutique à Hong Kong expédiant vers le continent.*

*(tick all that apply)*
- [ ] Tmall Global
- [ ] JD Worldwide
- [ ] Douyin Global
- [ ] RED (Xiaohongshu)
- [ ] WeChat mini-program
- [ ] Own site outside China
- [ ] Own site inside China
- [ ] Hong Kong store shipping to the mainland
- [ ] Not sure yet

**Q3.5.3** — Avez-vous une entité juridique en Chine continentale ? *(required)*
*Only if the launch markets include mainland China (CN).*
*Nécessaire pour un enregistrement ou une licence ICP et pour l'hébergement sur place.*

*(tick one)*
- [ ] None
- [ ] Wholly foreign-owned enterprise (WFOE)
- [ ] Joint venture
- [ ] Representative office
- [ ] Planned

**Q3.5.4** — Avez-vous une entité à Hong Kong ou une autre entité à l'étranger capable de vendre en transfrontalier, et vos marques sont-elles enregistrées en Chine ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Les places de marché transfrontalières exigent les deux.*

- Overseas entity:
- Trademarks registered in china:

**Q3.5.5** — Statut ICP pour un site web chinois ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Votre conseil en RPC confirme si un enregistrement suffit ou s'il faut une licence ICP commerciale.*

*(tick one)*
- [ ] None
- [ ] ICP filing
- [ ] Commercial ICP licence
- [ ] Via a partner
- [ ] Not needed
- [ ] Not sure yet

**Q3.5.6** — Quel est le rôle de Shopify pour la Chine continentale ? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*Shopify peut rester la référence mondiale pour les produits, les stocks et les commandes pendant que la Chine vend par des canaux locaux.*

*(tick one)*
- [ ] Global master for products, inventory and orders
- [ ] China channel or storefront
- [ ] Not involved
- [ ] Not sure yet

**Q3.5.7** — Comment les marchandises entreront-elles en Chine : entrepôt sous douane (1210), envoi direct (9610), commerce général ou colis personnels ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Les canaux transfrontaliers ont des plafonds par commande et par an et par consommateur.*

*(tick all that apply)*
- [ ] Bonded warehouse (1210)
- [ ] Direct mail (9610)
- [ ] General trade
- [ ] Personal parcels
- [ ] Not sure yet

**Q3.5.8** — Vos produits figurent-ils sur la liste positive du commerce électronique transfrontalier chinois ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] All on the list
- [ ] Some on the list
- [ ] None on the list
- [ ] Not sure yet

**Q3.5.9** — Comment vos produits sont-ils classés en Chine ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Les produits éclaircissants, les protections solaires et les produits antichute de cheveux sont des cosmétiques spéciaux ; les médicaments ne sont pas des marchandises transfrontalières.*

*(tick all that apply)*
- [ ] Ordinary cosmetics
- [ ] Special cosmetics (e.g. whitening, sunscreen)
- [ ] Drugs
- [ ] Medical devices
- [ ] Food supplements
- [ ] General goods
- [ ] Not sure yet

**Q3.5.10** — Statut d'enregistrement ou de déclaration auprès de l'administration chinoise des produits médicaux (NMPA) ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Le commerce général exige un enregistrement ou une déclaration ; les canaux transfrontaliers en sont exemptés pour les marchandises de la liste positive.*

*(tick one)*
- [ ] Registered
- [ ] Filed
- [ ] In progress
- [ ] Not started
- [ ] Not needed (cross-border e-commerce)
- [ ] Not sure yet

**Q3.5.11** — Les allégations produit doivent-elles faire l'objet d'une revue pour la Chine (allégations médicales, cosméceutiques ou de traitement) ? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*La Chine n'autorise pas les allégations cosméceutiques ou médicales pour les cosmétiques.*

- [ ] Yes
- [ ] No

**Q3.5.12** — Comment les clients du continent paieront-ils ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Au sein de la place de marché, par Alipay et WeChat Pay via un compte Shopify Payments à Hong Kong (accès anticipé), via un fournisseur de portefeuille transfrontalier, ou via des comptes marchands domestiques (entité en RPC).*

*(tick all that apply)*
- [ ] Inside the marketplace
- [ ] Alipay / WeChat Pay via Shopify Payments (Hong Kong)
- [ ] Cross-border wallet provider
- [ ] Domestic merchant accounts (PRC entity)
- [ ] Not sure yet

**Q3.5.13** — Combien de clients de Chine continentale attendez-vous par an ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*La loi chinoise sur les informations personnelles fixe des obligations d'export de données différentes selon le volume.*

*(tick one)*
- [ ] Under 100,000
- [ ] 100,000 to 1 million
- [ ] Over 1 million
- [ ] Not sure yet

**Q3.5.14** — Avez-vous un représentant en Chine pour la protection des informations personnelles (PIPL) ? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Requis lorsqu'une entreprise établie hors de Chine cible des consommateurs en Chine.*

- [ ] Yes
- [ ] No

**Q3.5.15** — Où seront stockées les données des clients chinois (CRM, e-mail, analytique) ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] Inside China
- [ ] Outside China
- [ ] Both
- [ ] Not sure yet

**Q3.5.16** — Les scripts bloqués en Chine (Google Fonts, Google Analytics, reCAPTCHA, pixels Meta, YouTube) doivent-ils être remplacés ? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*

- [ ] Yes
- [ ] No

**Q3.5.17** — Quels canaux marketing pour la Chine ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick all that apply)*
- [ ] KOL / KOC influencers
- [ ] RED (Xiaohongshu)
- [ ] Douyin
- [ ] WeChat
- [ ] Baidu
- [ ] Tmall advertising
- [ ] None
- [ ] Not sure yet

**Q3.5.18** — Qui assure le service client en chinois ? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] In house
- [ ] Partner
- [ ] Platform
- [ ] Not sure yet

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
- [ ] Client's PRC counsel
- [ ] Partner
- [ ] Not yet

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
- [ ] SEPA direct debit or invoice via a gateway
- [ ] Other
- [ ] None
- [ ] Not sure yet

**Q4.1.3** — Quelles options de paiement fractionné, le cas échéant ? *(optional)*
*Shop Pay Installments est disponible pour les boutiques aux États-Unis, au Canada et au Royaume-Uni.*

*(tick all that apply)*
- [ ] Shop Pay Installments
- [ ] Klarna via Shopify Payments
- [ ] Buy now, pay later via another gateway
- [ ] None
- [ ] Not sure yet

**Q4.1.4** — Avez-vous besoin de versements dans plus d'une devise ? *(required)*

- [ ] Yes
- [ ] No

**Q4.1.5** — Les données de carte seront-elles traitées uniquement par le paiement hébergé par Shopify, par une page de paiement hébergée par un tiers, ou par une interface de carte sur mesure / de la tokenisation ? *(required · consultant)*
*Des données de carte traitées hors du paiement hébergé par Shopify exigent une revue de sécurité distincte.*

*(tick one)*
- [ ] Shopify-hosted checkout
- [ ] Third-party hosted payment page
- [ ] Custom card handling

**Q4.1.6** — Quels paiements express sont nécessaires ? *(recommended)*
*Le paiement B2B et les précommandes ne prennent pas en charge les paiements express.*

*(tick all that apply)*
- [ ] Shop Pay
- [ ] Apple Pay
- [ ] Google Pay
- [ ] PayPal
- [ ] Amazon Pay
- [ ] None
- [ ] Not sure yet

**Q4.1.7** — Les moyens de paiement doivent-ils être masqués, renommés ou réordonnés selon le marché, le type de client ou le panier ? *(recommended)*
*Exige une application de personnalisation du paiement (Shopify Function).*

- [ ] Yes
- [ ] No

### 4.2 Checkout

**Q4.2.1** — Quelles modifications du paiement sont nécessaires ? *(required)*
*Le paiement Shopify se personnalise via l'éditeur de paiement et Checkout Extensibility (blocs, champs, logique via Functions). Une interface de paiement entièrement sur mesure n'est pas possible sur Shopify.*

*(tick all that apply)*
- [ ] Branding in the checkout editor
- [ ] Thank you / Order status page blocks
- [ ] Blocks or fields on checkout steps
- [ ] Checkout Branding API styling
- [ ] Back-end logic (Shopify Functions)
- [ ] Fully custom checkout UI
- [ ] None
- [ ] Not sure yet

**Q4.2.2** — Quelles extensions de paiement sont nécessaires ? *(optional · consultant)*
*Skip if Q4.2.1 = None.*

*(tick all that apply)*
- [ ] Custom fields
- [ ] Upsell block
- [ ] Gift message
- [ ] Trust badges
- [ ] Loyalty redemption
- [ ] Delivery customization
- [ ] Payment customization
- [ ] Cart checkout validation
- [ ] Address validation
- [ ] Pickup point generator
- [ ] None
- [ ] Not sure yet

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
- [ ] Block countries
- [ ] Order value min max
- [ ] Quantity limits
- [ ] Customer type restrictions
- [ ] Product combination rules
- [ ] None
- [ ] Not sure yet

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
- [ ] In house
- [ ] Third-party logistics (3PL)
- [ ] Hybrid (DTC and B2B)

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
- [ ] Minimise split shipments
- [ ] Stay within the market
- [ ] Closest location
- [ ] Ranked locations
- [ ] Location metafields
- [ ] Custom routing function
- [ ] The ERP or OMS decides
- [ ] Not sure yet

**Q5.1.5** — Quels transporteurs utilisez-vous ? *(recommended)*

> Answer:

**Q5.1.6** — Comment les frais de port sont-ils calculés ? *(required)*
*Forfaitaires, selon le poids ou le montant, gratuits au-delà d'un seuil, tarifs transporteur en temps réel, ou tarifs venant d'une application.*

*(tick all that apply)*
- [ ] Flat
- [ ] Weight or price based
- [ ] Free above a threshold
- [ ] Live carrier rates
- [ ] Rates from an app
- [ ] Not sure yet

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
- [ ] Standard shipping
- [ ] Express
- [ ] Local delivery
- [ ] Pickup in store
- [ ] Pickup points
- [ ] Scheduled delivery slots
- [ ] Ship from store
- [ ] None
- [ ] Not sure yet

**Q5.1.12** — Comment les étiquettes d'expédition sont-elles créées ? *(optional)*

*(tick one)*
- [ ] Shopify Shipping
- [ ] 3PL system
- [ ] Carrier software
- [ ] Shipping app

**Q5.1.13** — Tous les produits ont-ils des poids exacts (et des dimensions de colis), et d'où viennent ces données ? *(recommended)*
*Ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app.*
*Les tarifs au poids et calculés par le transporteur, les étiquettes d'expédition et certains calculs de droits exigent le poids des produits.*

*(tick one)*
- [ ] From the PIM or ERP
- [ ] Maintained in Shopify
- [ ] Only for some products
- [ ] Not available yet
- [ ] Not sure yet

**Q5.1.14** — Certains produits comptent-ils comme marchandises dangereuses à l'expédition ? *(recommended)*
*Par exemple aérosols (sprays, certaines protections solaires), liquides inflammables (parfums, produits à base d'alcool), batteries au lithium, glace carbonique. Ils exigent en général leur propre profil de livraison et des accords transporteurs dédiés.*

*(tick all that apply)*
- [ ] Aerosols
- [ ] Flammable liquids
- [ ] Lithium batteries
- [ ] Dry ice
- [ ] Other hazardous materials
- [ ] None
- [ ] Not sure yet

### 5.2 Retours & échanges

**Q5.2.1** — Résumez la politique de retours (délai, conditions, qui paie le retour). *(recommended)*

> Answer:

**Q5.2.2** — Shopify inclut les demandes de retour dans les comptes clients, pilotées par des règles de retour (délai, frais de retour, frais de remise en stock, vente ferme). Est-ce suffisant ? *(recommended)*

*(tick one)*
- [ ] Shopify self-serve returns are enough
- [ ] A returns app is needed
- [ ] Staff create returns only
- [ ] Not sure yet

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
- [ ] Prepaid label
- [ ] QR code drop-off
- [ ] Customer arranged
- [ ] Mixed

**Q5.2.8** — Qui paie le retour : vous, le client, ou cela dépend du marché ? *(recommended)*

*(tick one)*
- [ ] Merchant
- [ ] Customer
- [ ] Depends on market

**Q5.2.9** — Quels échanges proposez-vous : le même produit dans une autre variante, n'importe quel autre produit, ou un avoir en priorité ? *(optional)*
*Skip if Q5.2.3 = no.*
*Ask if Q0.2.6 is 500 or more.*
*Les clients ne peuvent pas choisir un échange dans le formulaire de retour de Shopify ; les équipes ajoutent les articles d'échange à la validation. Les échanges choisis par le client exigent une application.*

*(tick all that apply)*
- [ ] Same product variant
- [ ] Any product
- [ ] Store credit first
- [ ] None
- [ ] Not sure yet

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
- [ ] ESP
- [ ] Mixed

### 5.4 Annulations & remboursements

**Q5.4.2** — Les clients doivent-ils pouvoir annuler leurs commandes eux-mêmes ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Les clients peuvent demander l'annulation de commandes non expédiées depuis leur compte ; vous validez. L'annulation immédiate sans validation exige une application.*

- [ ] Yes
- [ ] No

**Q5.4.3** — Jusqu'à quand une commande peut-elle être annulée ? *(recommended)*

*(tick one)*
- [ ] No cancellations
- [ ] Until fulfilled
- [ ] Within 15 minutes
- [ ] Within 1 hour
- [ ] Within 24 hours
- [ ] Staff only

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
- [ ] Original payment
- [ ] Store credit
- [ ] Gift card
- [ ] Not sure yet

**Q5.4.7** — Quand le remboursement est-il émis : à la demande, au scan du transporteur, à réception, ou après contrôle ? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Les remboursements au scan du transporteur exigent une plateforme de retours connectée au suivi transporteur.*

*(tick one)*
- [ ] On request
- [ ] On carrier scan
- [ ] On receipt
- [ ] After inspection

**Q5.4.8** — Les frais de port initiaux sont-ils remboursés : toujours, uniquement en cas de faute de votre part, ou jamais ? *(optional)*

*(tick one)*
- [ ] Always
- [ ] On fault only
- [ ] Never

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
- [ ] Email
- [ ] SMS
- [ ] WhatsApp
- [ ] Push
- [ ] None
- [ ] Not sure yet

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
- [ ] Another POS, integrated
- [ ] Another POS, not integrated
- [ ] Not sure yet

**Q5.6.3** — Quels services omnicanaux sont nécessaires en magasin ? *(required)*
*Skip if Q5.6.1 = 0.*
*Retrait en magasin, expédition depuis le magasin, retours en magasin de commandes web, rayon infini, transferts de stock, prix magasin.*

*(tick all that apply)*
- [ ] Buy online, pick up in store
- [ ] Ship to customer from store
- [ ] In-store returns and exchanges of online orders
- [ ] Endless aisle (order in store)
- [ ] Store credit and gift cards in store
- [ ] Stock transfers counts
- [ ] Retail prices or catalogs
- [ ] Staff roles permissions
- [ ] None
- [ ] Not sure yet

**Q5.6.4** — Dans quels pays se trouvent les magasins ? *(recommended)*
*Skip if Q5.6.1 = 0.*

> Answer:

---

## § 6 — Clients, B2B & confidentialité

> Comptes clients, B2B, fidélité, segmentation et obligations liées aux données personnelles.

### 6.1 Comptes clients

**Q6.1.1** — Is guest checkout the default, are accounts optional, or is registration required? *(recommended)*

*(tick one)*
- [ ] Guest default
- [ ] Optional
- [ ] Required

**Q6.1.3** — What should the account area include (order history, addresses, returns, wishlist, subscriptions)? *(required)*

*(tick all that apply)*
- [ ] Order history
- [ ] Buy again
- [ ] Return requests
- [ ] Cancellation requests
- [ ] Store credit
- [ ] Addresses
- [ ] Subscription management
- [ ] B2B company locations
- [ ] Loyalty widget
- [ ] Wishlist
- [ ] Extra profile fields
- [ ] None
- [ ] Not sure yet

**Q6.1.4** — How should customers sign in? *(required)*
*One-time email code and Google or Facebook sign-in are native.*

*(tick all that apply)*
- [ ] One-time email code
- [ ] Google or Facebook sign-in
- [ ] Shop (Shop Pay)
- [ ] Company single sign-on (identity provider)
- [ ] Sign in from another site
- [ ] Not sure yet

### 6.2 B2B & vente en gros

**Q6.2.2** — Do B2B customers need company accounts with their own login? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.3** — Do B2B customers get company-specific price lists? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Business price lists are B2B catalogs.*

- [ ] Yes
- [ ] No

**Q6.2.4** — Are there B2B volume discounts or quantity rules? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.5** — Which payment terms are needed (net 30, invoice, purchase order)? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

*(tick all that apply)*
- [ ] Net terms
- [ ] Due on fulfilment
- [ ] Vaulted card
- [ ] ACH direct debit (US)
- [ ] Invoice via draft order
- [ ] Deposits
- [ ] Partial payments
- [ ] Pay per fulfilment
- [ ] None
- [ ] Not sure yet

**Q6.2.6** — Is there a request-for-quote workflow, or is pricing negotiated per buyer? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify has no built-in request-for-quote: orders can be submitted for review as drafts, or a quote app handles negotiation.*

- [ ] Yes
- [ ] No

**Q6.2.7** — Must B2B accounts be approved before they can order? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Native: a wholesale application form (Shopify Forms) plus Flow to create and approve companies.*

- [ ] Yes
- [ ] No

**Q6.2.8** — Native Shopify B2B or an app? *(recommended · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

*(tick one)*
- [ ] Shopify B2B
- [ ] Shopify B2B plus apps
- [ ] A B2B app only
- [ ] Separate B2B expansion store
- [ ] Not sure yet

**Q6.2.9** — How many B2B accounts are expected within 12 months? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

> Answer:

**Q6.2.10** — How many distinct B2B price lists (catalogs) do you need, and must any be specific to one company? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- Catalog count:
- Company specific catalogs:

**Q6.2.11** — Should B2B buyers see a different storefront or checkout from consumers? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.12** — Do B2B orders need any of these: subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards? *(required · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify B2B does not support these.*

*(tick all that apply)*
- [ ] Subscriptions
- [ ] Local delivery or pickup points
- [ ] Express checkouts
- [ ] More than 500 line items
- [ ] Gift cards
- [ ] None
- [ ] Not sure yet

**Q6.2.13** — Which shipping rules differ for B2B buyers? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*By default B2B and consumer buyers see the same shipping methods. Different options need Checkout Blocks, an app or a delivery customization function; orders can also be submitted as drafts so shipping is quoted before payment.*

*(tick all that apply)*
- [ ] Separate rates or methods
- [ ] Free shipping above an order value
- [ ] Freight or pallet delivery
- [ ] Buyer's own carrier account
- [ ] Shipping quoted after the order
- [ ] None
- [ ] Not sure yet

**Q6.2.14** — Is the wholesale side of the business run by its own team, with its own targets or its own profit and loss? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B), or Q1.1.4 is Hybrid (DTC and B2B).*
*Why we ask: A wholesale business with its own team, targets and customers usually wants to move at its own pace — its own campaigns, its own releases, its own data. That is the difference between wholesale living alongside the consumer store and wholesale having a store of its own.*
*We are asking about how the business is organised, not about the website.*

- [ ] Yes
- [ ] No

### 6.3 Fidélité & segmentation

**Q6.3.1** — Which loyalty components are planned? *(recommended)*
*Ask if Q1.1.4 is Direct to consumer (DTC) or Hybrid (DTC and B2B).*
*Shopify has no native points programme; store credit can be a reward currency. Loyalty needs an app.*

*(tick all that apply)*
- [ ] Points purchase
- [ ] Points actions
- [ ] VIP tiers
- [ ] Referral
- [ ] VIP early access
- [ ] Subscription discount
- [ ] Store credit
- [ ] None
- [ ] Not sure yet

**Q6.3.2** — Is loyalty needed at launch or in a later phase? *(recommended)*

*(tick one)*
- [ ] Launch
- [ ] Phase 2
- [ ] None

**Q6.3.3** — Which loyalty app is used or preferred? *(optional)*

> Answer:

**Q6.3.4** — Must loyalty status sync to the email platform or CRM? *(optional)*

- [ ] Yes
- [ ] No

**Q6.3.5** — Which customer segments do you use today? *(optional)*

> Answer:

**Q6.3.6** — Where is segmentation driven from — Shopify, the email platform, a CDP, or a mix? *(optional)*
*Customer segments are native in Shopify; the email platform or CDP may own them instead.*

*(tick one)*
- [ ] Shopify
- [ ] ESP
- [ ] CDP
- [ ] Mixed
- [ ] None

**Q6.3.7** — Which customer tags drive custom logic today (pricing, access, discounts)? *(optional)*

> Answer:

### 6.4 Confidentialité & consentement

**Q6.4.1** — Which privacy laws apply to your customers (GDPR, UK GDPR, CCPA, Swiss nFADP, other)? *(required)*

*(tick all that apply)*
- [ ] GDPR (EU)
- [ ] UK GDPR
- [ ] CCPA (US)
- [ ] Swiss nFADP
- [ ] Other
- [ ] None
- [ ] Not sure yet

**Q6.4.2** — Cookie consent: Shopify's cookie banner or a consent management platform? Name the tool if known. *(recommended)*
*Ask if Q6.4.1 includes GDPR (EU), UK GDPR, Swiss nFADP or CCPA (US).*
*Shopify's cookie banner is native; a third-party platform must integrate Shopify's Customer Privacy API.*

- Consent approach:
- Cookie consent tool:

**Q6.4.3** — Is explicit opt-in required for marketing emails? *(recommended)*

- [ ] Yes
- [ ] No

**Q6.4.4** — Do you collect sensitive personal data (health, age, biometric, financial)? *(required)*
*Sensitive data needs a data protection impact assessment and legal sign-off.*

- [ ] Yes
- [ ] No

**Q6.4.5** — Must data-access or deletion requests reach systems beyond Shopify (ERP, email platform) or run without staff involvement? *(required)*
*Shopify handles export and erasure requests in admin; other systems or automation need extra design and legal sign-off.*

- [ ] Yes
- [ ] No

**Q6.4.6** — Do US state privacy laws require a 'Do not sell or share my personal information' page? *(optional)*
*A native opt-out page honours Global Privacy Control.*

- [ ] Yes
- [ ] No

**Q6.4.7** — Where do you collect marketing consent? *(optional)*

*(tick all that apply)*
- [ ] Checkout
- [ ] Customer account sign in
- [ ] Forms popups
- [ ] POS
- [ ] None
- [ ] Not sure yet

---

## § 7 — Marketing & promotions

> SEO, analytics, e-mail, avis, affiliation, remises, campagnes et commerce piloté par l’IA.

### 7.1 SEO

**Q7.1.1** — Is organic search a significant traffic channel? *(recommended)*

- [ ] Yes
- [ ] No

**Q7.1.2** — Are custom URL structures needed? *(optional)*

- [ ] Yes
- [ ] No

**Q7.1.3** — Who manages SEO? *(optional)*

*(tick one)*
- [ ] In house
- [ ] Agency
- [ ] None

**Q7.1.4** — Should products be discoverable in AI shopping assistants? *(optional)*
*Shopify Catalog and agentic channels (Spring '26).*

- [ ] Yes
- [ ] No

### 7.2 Analytics & tracking

**Q7.2.1** — Which analytics platforms do you use (GA4, Adobe, other)? *(recommended)*

> Answer:

**Q7.2.2** — Is server-side tracking needed? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.1.1 mentions conversion, tracking, attribution, advert, ads, roas or acquisition.*
*Shopify's customer events track storefront and checkout with consent; the Facebook & Instagram and Google & YouTube apps send server-side events. Anything beyond needs a tracking app. Server-side events can share customer data with ad platforms (PII gate).*

- [ ] Yes
- [ ] No

**Q7.2.3** — Which advertising pixels are needed (Meta, TikTok, Pinterest, Google Ads)? *(recommended)*

> Answer:

**Q7.2.4** — Is a tag manager already configured? *(recommended)*
*Tag managers run as a custom pixel in Shopify's sandbox; scripts in checkout are no longer possible.*

- [ ] Yes
- [ ] No

**Q7.2.5** — Which custom events must be tracked beyond standard ecommerce events? *(recommended)*

> Answer:

### 7.3 E-mail & CRM

**Q7.3.1** — Which email / CRM platform do you use or plan to use: Shopify Messaging or another platform (name)? *(recommended)*
*Shopify Messaging covers email, SMS and WhatsApp campaigns and automations.*

- Type:
- Platform:

**Q7.3.2** — Which automated flows are needed (welcome, abandoned cart, post-purchase, win-back)? *(recommended)*

> Answer:

**Q7.3.4** — Do you send SMS marketing, and to which countries? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.4.1 mentions sms, retention or repeat.*

- Enabled:
- Countries:

**Q7.3.5** — Do you send WhatsApp marketing? *(optional)*
*Native in Shopify Messaging.*

- [ ] Yes
- [ ] No

### 7.4 Avis & affiliation

**Q7.4.1** — Which product reviews app is used or preferred? *(optional)*
*Ask if Q1.2.1 is yes, or Q0.5.4 is not None.*
*Product reviews need an app.*

> Answer:

**Q7.4.2** — Is user-generated content important (customer photos, social embeds)? *(optional)*

- [ ] Yes
- [ ] No

**Q7.4.3** — Which affiliate platform, if any? *(optional)*

> Answer:

**Q7.4.4** — Do you use Shopify Collabs for influencers? *(optional)*
*Shopify Collabs isn't accepting new creator sign-ups; you can still invite creators.*

- [ ] Yes
- [ ] No

**Q7.4.5** — Are affiliate and influencer sales tracked via discount codes, UTM parameters, or both? *(optional)*

*(tick one)*
- [ ] Discount codes
- [ ] UTM parameters
- [ ] Both
- [ ] None

### 7.5 Remises & codes promo

**Q7.5.1** — Which discount types are used? *(recommended)*

*(tick all that apply)*
- [ ] Percentage
- [ ] Fixed amount
- [ ] Buy one, get one (BOGO)
- [ ] Free shipping
- [ ] Volume tiered
- [ ] Automatic
- [ ] Code based
- [ ] Scheduled sale
- [ ] Stackable
- [ ] POS only
- [ ] None
- [ ] Not sure yet

**Q7.5.2** — Which discounts must combine on one order? *(required)*
*Shopify combines product, order and shipping discounts natively (up to 5 codes plus 1 shipping code, and up to 25 automatic discounts). Custom logic needs a discount function.*

*(tick one)*
- [ ] None
- [ ] Shopify's native combinations
- [ ] Several discounts on the same item
- [ ] Custom logic (discount function)

**Q7.5.3** — Are coupon codes single-use, multi-use, or bulk-generated? *(optional)*

*(tick all that apply)*
- [ ] Single use
- [ ] Multi use
- [ ] Bulk
- [ ] None
- [ ] Not sure yet

**Q7.5.4** — Must codes be brand-named (e.g. WELCOME20)? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.5** — Do codes need minimum order values or quantities? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.6** — Do codes expire on a fixed date, a rolling period, or never? *(optional)*

*(tick one)*
- [ ] None
- [ ] Fixed
- [ ] Rolling

**Q7.5.7** — How are codes distributed (email, SMS, print, influencers)? *(optional)*

> Answer:

**Q7.5.8** — Do promotions differ by market, customer segment, sales channel or B2B company? *(recommended)*

*(tick all that apply)*
- [ ] Market
- [ ] Customer segment
- [ ] POS only
- [ ] B2B company
- [ ] None
- [ ] Not sure yet

### 7.6 Cartes cadeaux & campagnes

**Q7.6.1** — Are gift cards sold as a product? *(optional)*
*Gift cards are native: digital cards by email, physical cards on POS; they never expire by default. Also covers gift cards accepted at checkout.*

- [ ] Yes
- [ ] No

**Q7.6.2** — Are gift cards issued as rewards or compensation? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.3** — Digital gift cards, physical, or both? *(optional)*

*(tick one)*
- [ ] Digital
- [ ] Physical
- [ ] Both

**Q7.6.4** — Must gift cards expire? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.5** — Are promotions triggered from email or SMS campaigns? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.6** — Does each campaign need its own landing page? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.7** — Are countdown timers or urgency elements needed? *(optional)*
*Countdown timers need an app or theme work.*

- [ ] Yes
- [ ] No

**Q7.6.9** — Do you run scheduled drops or flash sales with high traffic? *(optional)*
*Scheduled theme and checkout changes are native (Rollouts).*

- [ ] Yes
- [ ] No

### 7.7 IA & commerce agentique

**Q7.7.1** — Do you want your products to be found and bought inside AI assistants such as ChatGPT, Google AI or Copilot? *(recommended)*
*AI assistants are becoming a shopping channel. Shopify already switches eligible stores on by default, so this is a decision to confirm or reverse, not one to postpone.*

- [ ] Yes
- [ ] No

**Q7.7.2** — Should Shopify enrol you automatically in new AI channels as they appear, or do you want to approve each one? *(recommended)*
*The default setting also enrols you in channels that do not exist yet.*

*(tick one)*
- [ ] Shopify managed
- [ ] Per channel
- [ ] Off
- [ ] Not sure yet

**Q7.7.3** — Should shoppers be able to pay inside the AI assistant, or should they come to your store to check out? *(recommended)*
*Paying in the assistant converts better; sending them to your store keeps the full journey, the upsells and the analytics.*

*(tick one)*
- [ ] All channels
- [ ] Selected channels
- [ ] Off
- [ ] Not sure yet

**Q7.7.4** — Do you sell to customers in the United States? *(recommended)*
*Some AI channels are only open to merchants selling to US buyers, wherever the business is based.*

- [ ] Yes
- [ ] No

**Q7.7.5** — Who can accept Shopify's additional terms for selling through AI channels? *(recommended)*
*Selling through these channels requires accepting separate terms — usually legal or procurement, not the ecommerce team.*

> Answer:

**Q7.7.6** — Are you comfortable sharing the customer's name, e-mail, phone and address with an AI channel when they buy inside it? *(recommended)*
*This is a data-protection decision. Under GDPR it usually needs a documented review before launch.*

*(tick one)*
- [ ] Approved
- [ ] Refused
- [ ] Needs legal review

**Q7.7.7** — How complete is your product data — titles, images, prices, descriptions and variants? *(recommended)*
*AI channels only list products whose data is complete. Gaps make products invisible rather than badly presented.*

*(tick one)*
- [ ] Complete
- [ ] Only for some products
- [ ] Not sure yet

**Q7.7.8** — Is important product information kept in custom fields, separate records or inside the product title (for example “Steel 40mm — Automatic”)? *(optional)*
*Data that lives in custom fields or in the title needs mapping before AI channels can read it.*

- [ ] Yes
- [ ] No

**Q7.7.9** — Should AI crawlers be allowed, restricted or blocked on your website? *(optional)*
*Blocking crawlers does not remove your products from AI shopping channels; it only affects what they read from your public site.*

*(tick one)*
- [ ] Allow all
- [ ] Selective
- [ ] Block
- [ ] Not sure yet

**Q7.7.10** — Do you want to control the answers AI assistants give about shipping, returns and sizing? *(optional)*
*Shopify has a free app that publishes your FAQs for assistants and logs what shoppers ask.*

- [ ] Yes
- [ ] No

**Q7.7.11** — Do you plan to offer your own AI shopping assistant, or connect the store to agent platforms yourself? *(optional)*
*Parts of this are still early access at Shopify, so treat it as exploration rather than fixed scope.*

*(tick one)*
- [ ] Now
- [ ] Later
- [ ] No
- [ ] Not sure yet

**Q7.7.12** — Which Shopify AI tools do you want your team to use in day-to-day work? *(optional)*
*These are back-office tools for your team, not customer-facing.*

*(tick all that apply)*
- [ ] Sidekick
- [ ] Shopify magic
- [ ] Semantic search
- [ ] Knowledge base
- [ ] None
- [ ] Not sure yet

**Q7.7.13** — Existing Shopify store: what do the agentic sales-channel settings show today (Sales channels → Agentic)? *(recommended · consultant)*
*Skip if Q1.2.1 = no.*
*Check the admin with the client: enrolment mode, which channels are on, and whether checkout inside the assistant is enabled.*

*(tick one)*
- [ ] Shopify managed
- [ ] Per channel
- [ ] Off
- [ ] Not sure yet

---

## § 8 — Intégrations & migration

> Tout système qui échange des données avec la boutique, et ce qui vient de la plateforme actuelle.

### 8.1 Systèmes connectés

**Q8.1.1** — List every system that exchanges product, inventory, order, customer or financial data with the store. For each: system, category, direction, data objects, frequency, connector (native app / iPaaS / custom / none), owner, status. *(required)*
*Typical ownership: the PIM supplies products, attributes and translations; the ERP supplies prices (including B2B catalogs), inventory per location and order status.*

| System | Category | Direction | Objects | Frequency | Connector | Middleware | Owner | Status | Daily updates | Latency minutes |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

**Q8.1.2** — Is there a middleware / iPaaS layer, or custom connectors? *(optional)*

> Answer:

**Q8.1.3** — How often do prices and stock change (updates per day), and must changes be live within minutes? *(recommended)*
*Sizes the sync design (bulk operations vs webhooks).*

- Daily updates:
- Latency minutes:

### 8.2 Migration des données

**Q8.2.2** — Which data must be migrated? *(recommended)*
*Skip if Q0.5.4 = None.*
*Customer passwords can't be migrated; customers sign in with a one-time code.*

*(tick all that apply)*
- [ ] Products
- [ ] Customers
- [ ] Orders
- [ ] Content
- [ ] Redirects
- [ ] Reviews
- [ ] Gift cards
- [ ] Store credit
- [ ] Metafields metaobjects
- [ ] B2B companies
- [ ] Subscription contracts
- [ ] Blog posts pages
- [ ] None
- [ ] Not sure yet

**Q8.2.3** — Approximate volumes: products, customers, orders, URL redirects. *(required)*
*Skip if Q0.5.4 = None.*

- Products:
- Customers:
- Orders:
- Redirects:

**Q8.2.4** — Must historical orders be available inside Shopify? *(required)*
*Skip if Q0.5.4 = None.*

- [ ] Yes
- [ ] No

**Q8.2.5** — How much SEO equity (rankings, backlinks) must be preserved? *(required · consultant)*
*Skip if Q0.5.4 = None.*

*(tick one)*
- [ ] None
- [ ] Moderate
- [ ] Significant

**Q8.2.6** — Must active subscriptions move to the new store without customers re-entering cards? *(required)*
*Skip if Q0.5.4 = None.*

- [ ] Yes
- [ ] No

---

## § 9 — Design & expérience

> Source du design, approche de la vitrine, accessibilité et performance.

### 9.1 Matière de design

**Q9.1.1** — Is there a Figma file or design mockup for the new store? *(required)*

- [ ] Yes
- [ ] No

**Q9.1.2** — How complete is it — brand only, key screens, or every template? *(required)*
*Skip if Q9.1.1 = no.*

*(tick one)*
- [ ] None
- [ ] Brand only
- [ ] Key screens
- [ ] All templates

**Q9.1.3** — Does the Figma file contain a full design system (tokens and components)? *(required)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.4** — Is the design mapped to Shopify sections and blocks? *(optional · consultant)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.5** — Is a fully custom design required, rather than a theme with brand customisation? *(recommended)*

- [ ] Yes
- [ ] No

### 9.2 Vitrine

**Q9.2.1** — Is a headless storefront required (Hydrogen, another framework, or a native app front end)? *(required)*
*Headless means a custom front end built on Shopify; checkout stays Shopify checkout.*

- [ ] Yes
- [ ] No

**Q9.2.2** — Any theme licence to keep? *(optional)*
*New builds start from Shopify's Horizon theme; a third-party theme licence only matters for a non-Horizon base.*

> Answer:

**Q9.2.3** — What is the aesthetic direction (minimal, editorial, luxury, playful, utilitarian)? *(optional)*

> Answer:

**Q9.2.4** — Which interactive patterns are required (mega-menu, quick-add, swatches, predictive search, lookbook, video hero)? *(required)*

*(tick all that apply)*
- [ ] Mega menu
- [ ] Predictive search
- [ ] Variant swatches
- [ ] Quick add
- [ ] Combined listings
- [ ] Filters
- [ ] Quick order list and volume pricing
- [ ] Wishlist
- [ ] Store locator
- [ ] Lookbook
- [ ] Video hero
- [ ] None
- [ ] Not sure yet

**Q9.2.5** — Is custom motion or animation required? *(recommended)*

- [ ] Yes
- [ ] No

**Q9.2.6** — Why headless? *(required)*
*Skip if Q9.2.1 = no.*
*Helps check whether Horizon theme blocks would do.*

*(tick all that apply)*
- [ ] UX not possible in a theme
- [ ] Performance
- [ ] Existing CMS or content platform
- [ ] Native mobile app
- [ ] Several front ends, one back end
- [ ] Control over URL structure
- [ ] Other
- [ ] Not sure yet

**Q9.2.7** — Headless hosting? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Oxygen (Shopify hosting)
- [ ] Self-hosted JavaScript runtime
- [ ] Not sure yet

**Q9.2.8** — Where is editorial content managed for the headless storefront? *(recommended)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Shopify metaobjects
- [ ] Headless CMS
- [ ] PIM
- [ ] Not sure yet

**Q9.2.9** — Headless platform features required? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick all that apply)*
- [ ] Customer accounts (Customer Account API)
- [ ] Markets and language routes
- [ ] Business to business (B2B)
- [ ] Subscriptions
- [ ] Bundles and combined listings
- [ ] Shopify analytics and consent
- [ ] Multiple storefronts
- [ ] None
- [ ] Not sure yet

**Q9.2.10** — Do you want to A/B test themes or checkout configurations? *(required)*
*Native with Shopify Rollouts experiments.*

- [ ] Yes
- [ ] No

### 9.3 Accessibilité

**Q9.3.1** — Which accessibility standard applies? *(required)*
*Shopify checkout is tested against WCAG 2.2 AA; the theme and apps are your responsibility (e.g. under the European Accessibility Act).*

*(tick one)*
- [ ] WCAG 2.1 AA
- [ ] WCAG 2.2 AA
- [ ] EN 301 549
- [ ] Section 508
- [ ] None

**Q9.3.2** — Has an accessibility audit been done on the current site? *(optional)*

- [ ] Yes
- [ ] No

### 9.4 Performance

**Q9.4.1** — Core Web Vitals targets: LCP (seconds), CLS, INP (milliseconds). *(optional)*

- Lcp s:
- Cls:
- Inp ms:

**Q9.4.2** — Is page speed a known problem today? *(recommended)*
*Shopify's web performance report shows Core Web Vitals for the current store.*

- [ ] Yes
- [ ] No

**Q9.4.3** — Which third-party scripts must load (chat, personalisation, heatmaps)? *(optional)*

> Answer:

---

## § 10 — Réalisation, gouvernance & conformité

> Calendrier, prise de décision, support, juridique et outillage projet.

### 10.1 Calendrier

**Q10.1.1** — What is the target go-live date? *(required)*
*A date sooner than the delivery time the scope needs leads to a phased, MVP-first plan.*

> Answer:

**Q10.1.2** — What drives the deadline (peak season, product launch, contract end)? *(recommended)*

> Answer:

**Q10.1.3** — Is a phased launch planned? *(optional)*

- [ ] Yes
- [ ] No

**Q10.1.4** — Preferred project kick-off date. *(recommended)*

> Answer:

### 10.2 Équipe & décisions

**Q10.2.1** — Who is involved on the client side? For each: role, RACI (R/A/C/I), decision-maker (yes/no). Names are optional. *(required)*

| Role | Raci | Decision maker | Name |
|---|---|---|---|
| | | | |

**Q10.2.2** — Is there a single decision-maker for scope, approvals and feedback? *(required · consultant)*
*A single decision-maker must be named before the statement of work.*

- [ ] Yes
- [ ] No

**Q10.2.3** — Is budget approval authority clear? *(required · consultant)*

- [ ] Yes
- [ ] No

### 10.3 Support & formation

**Q10.3.1** — Which training is needed (products, orders, discounts, reports)? *(optional)*

> Answer:

**Q10.3.2** — Are written SOPs required? *(optional)*

- [ ] Yes
- [ ] No

**Q10.3.3** — What post-launch support model is expected? *(recommended)*

*(tick one)*
- [ ] Hypercare only
- [ ] Retainer
- [ ] Self sufficient
- [ ] Third party

**Q10.3.4** — Is the Grow retainer signed? *(required · consultant)*

- [ ] Yes
- [ ] No

**Q10.3.5** — Retainer length in months. *(recommended · consultant)*
*Skip if Q10.3.4 = no.*

> Answer:

**Q10.3.6** — Will the client re-verify apps and Shopify features at each Shopify Edition after launch? *(optional · consultant)*

- [ ] Yes
- [ ] No

### 10.4 Juridique & secteurs réglementés

**Q10.4.1** — Is the business in a regulated industry (pharma, alcohol, firearms, age-restricted goods, financial products, medical devices)? If yes, which? *(required)*
*A regulated industry needs legal review. Shopify has its own rules: e.g. alcohol needs age verification; some business types can't use Shopify Payments.*

- Active:
- Category:

**Q10.4.2** — Are legal pages (terms, privacy, cookies, returns) ready, in need of updates, or still to be drafted? *(recommended)*

*(tick one)*
- [ ] Ready
- [ ] Needs update
- [ ] Needs drafting

**Q10.4.3** — Any other industry-specific compliance requirements? *(optional)*

> Answer:

**Q10.4.4** — Is the business and product range eligible for Shopify Payments (no restricted or prohibited categories)? *(required · consultant)*

- [ ] Yes
- [ ] No

### 10.5 Mise en place du projet (consultant)

**Q10.5.1** — Lead consultant. *(required · consultant)*

> Answer:

**Q10.5.2** — Has the client agreed that answers may be processed by the AI discovery engine (no customer personal data included)? *(required · consultant)*
*ADR 0007 — the engine refuses to run without recorded consent.*

- [ ] Yes
- [ ] No

**Q10.5.3** — Jira site and project key for the backlog. *(recommended · consultant)*

- Site:
- Project key:

**Q10.5.4** — Jira components to use. *(optional · consultant)*

> Answer:

---

## Liste de contrôle

- [ ] Chaque question *required* des §§ 0 à 10 a une réponse ou « TBC »
- [ ] Au moins un KPI a une valeur de référence et une cible (Q0.4.2)
- [ ] Chaque système connecté est listé en Q8.1.1 avec sens d’échange et connecteur
- [ ] Le consentement au traitement par IA est consigné (Q10.5.2)
