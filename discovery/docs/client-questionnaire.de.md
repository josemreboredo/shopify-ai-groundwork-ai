<!-- GENERATED FILE — do not edit. Source: discovery/schema/question-bank.json + discovery/schema/offering.json. Re-render: npm run questionnaire:render -->

# Shopify Discovery — Fragebogen

> **Version:** question bank 1.2.0 · offering 1.3.0
>
> **So nutzen Sie ihn:** Gehen Sie §§ 0–10 im Discovery-Termin gemeinsam mit dem Kunden durch. Beantworten Sie jede
> *erforderliche* Frage — „TBC“ ist zulässig, eine Lücke nicht. Mit *consultant* markierte Fragen beantwortet
> der Lead Consultant, nicht der Kunde.
>
> **Ergebnis:** Der ausgefüllte Fragebogen ist der Input für die Discovery-Engine, die daraus Engagement-Spezifikation,
> Angebotsklassifizierung, Capability Map, Abschlussdeck und Backlog erzeugt.
>
> **Personenbezogene Daten:** Erfassen Sie keine personenbezogenen Daten von Endkundinnen und Endkunden. Namen von Ansprechpersonen sind optional.

---

## § 0 — Geschäftsziele

> Erst was nicht funktioniert, dann was gebaut wird. Dieser Abschnitt ist das eigentliche Briefing: Jede Fähigkeit, die wir in den Umfang nehmen, muss sich auf eine Antwort hier zurückführen lassen.

### 0.1 Das Kernproblem

**Q0.1.1** — Was hindert Ihren E-Commerce derzeit am stärksten am Wachstum? *(required)*

> Answer:

**Q0.1.2** — Seit wann besteht dieses Problem, und was haben Sie bereits versucht, um es zu lösen? *(recommended)*

> Answer:

**Q0.1.3** — Wenn wir in diesem Projekt nur eine einzige Sache lösen würden: Was hätte den größten geschäftlichen Effekt? *(recommended)*

> Answer:

### 0.2 Umsatz & Conversion

**Q0.2.1** — Wie hoch ist Ihr aktueller monatlicher E-Commerce-Umsatz (Spanne und Währung)? *(required)*

- min:
- max:
- currency:

**Q0.2.2** — Wie hoch ist Ihre aktuelle Conversion Rate (%)? *(required)*

> Answer:

**Q0.2.3** — Welche Produktkategorien, Märkte oder Kundensegmente bleiben hinter den Erwartungen zurück? *(optional)*

> Answer:

**Q0.2.4** — Liegt der Engpass vor allem bei der Akquise (Traffic), der Conversion (Traffic kauft nicht) oder der Bindung (Kundinnen und Kunden kommen nicht zurück)? *(required)*

*(tick one)*
- [ ] Acquisition
- [ ] Conversion
- [ ] Retention
- [ ] Mixed
- [ ] Not sure yet

**Q0.2.5** — Welchen Umsatzanteil hat heute jeder Kanal (Onlineshop, Filialen, Marktplätze, Social Commerce, Großhandel / B2B, sonstige)? *(recommended)*
*Zeigt uns, ob Retail-, B2B- und Marktplatz-Umfang im Spiel sind.*

| Channel | Share pct | Growth |
|---|---|---|
| | | |

**Q0.2.6** — Wie viele Bestellungen pro Monat erwarten Sie im ersten Jahr? *(required)*
*Apps für Retouren, Sendungsverfolgung und Betrugsprüfung werden nach Bestellvolumen abgerechnet.*

> Answer:

### 0.3 Operative Schmerzpunkte

**Q0.3.1** — Welche manuelle Arbeit leistet Ihr Team heute, die die Plattform automatisieren sollte, und welche Prozesse brechen am häufigsten? *(required)*

> Answer:

**Q0.3.2** — Wie viele Stunden pro Woche verbringt das Team mit Workarounds? *(optional)*

> Answer:

### 0.4 Wachstumsziele & KPIs

**Q0.4.1** — Wie sieht Erfolg in zwölf Monaten aus (Umsatz, neue Märkte, Kanäle, Kundenvolumen)? *(required)*

> Answer:

**Q0.4.2** — Welche KPIs messen den Erfolg? Bitte je KPI: Kennzahl, heutiger Ausgangswert, Zielwert, Zeithorizont in Monaten. *(required)*

| Metric | Baseline | Target | Horizon months |
|---|---|---|---|
| | | | |

### 0.5 Plattform-Kontext

**Q0.5.1** — Was war der Auslöser für dieses Projekt — warum Shopify, und warum jetzt? *(required)*

> Answer:

**Q0.5.2** — Falls Sie von einer anderen Plattform wechseln: Was darf beim Übergang keinesfalls verloren gehen? *(recommended)*

> Answer:

**Q0.5.3** — Womit sind Sie im heutigen Shop oder Setup am unzufriedensten? *(recommended)*

> Answer:

**Q0.5.4** — Von welcher Plattform migrieren Sie (oder keine — Neuaufbau)? *(required)*
*Shopifys Store-Migration-App importiert Produkte und Kundinnen und Kunden von einigen Plattformen (z. B. WooCommerce, Wix, Square); andere Plattformen benötigen eine Migrations-App oder die API.*

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

**Q0.6.1** — Welcher Budgetrahmen steht für dieses Projekt ungefähr zur Verfügung (Spanne und Währung)? *(required)*

- Min:
- Max:
- Currency:

**Q0.6.2** — Liegt die Priorität darauf, die Anfangskosten gering zu halten (Apps und Konfiguration), die Lösung zu besitzen (Individualentwicklung), oder auf einer Balance? *(required)*

*(tick one)*
- [ ] Minimise upfront
- [ ] Own solution
- [ ] Balanced

**Q0.6.3** — Gibt es eine monatliche Obergrenze für App-Abos? *(optional)*
*Viele Anforderungen decken Shopifys eigene Apps ab (z. B. Subscriptions, Bundles, Search & Discovery, Translate & Adapt, Flow, Messaging). Diese prüfen wir zuerst.*

> Answer:

---

## § 1 — Unternehmen, Marke & Shopify

> Shop-Setup, Shopify-Plan, Markenpositionierung und Assets.

### 1.1 Unternehmensidentität

**Q1.1.1** — Firmenname im Markt und Name der juristischen Person (falls abweichend). *(required)*

- Name:
- Legal name:

**Q1.1.2** — Land der Gesellschaftsgründung / Hauptsitz. *(required)*

> Answer:

**Q1.1.3** — Branche und Produktsegment. *(required)*

> Answer:

**Q1.1.4** — Ist das Geschäft Direct-to-Consumer, B2B oder hybrid? *(required)*
*B2B oder hybrid bringt die Fragen zu B2B und Großhandel mit sich (§ 6.2).*

*(tick one)*
- [ ] Direct to consumer (DTC)
- [ ] Business to business (B2B)
- [ ] Hybrid (DTC and B2B)

**Q1.1.5** — Aktuelle Website-URL. *(optional)*

> Answer:

**Q1.1.6** — Verkaufen Sie über mehr als eine juristische Person (z. B. eine je Land oder Region)? Bitte auflisten. *(required)*
*Mehrere verkaufende Einheiten in einem Shop oder ein Shop je Einheit verändern das Shop-Setup.*

> Answer:

**Q1.1.7** — Wo werden Sie zum Launch verkaufen? *(required)*
*Onlineshop, Shopify POS, Shop-App, Marktplätze, Social-Kanäle, B2B, Headless- oder App-Frontends, KI-Shopping-Agenten.*

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

### 1.2 Shopify-Konto

**Q1.2.1** — Gibt es bereits einen Shopify-Shop? *(required)*

- [ ] Yes
- [ ] No

**Q1.2.2** — URL des bestehenden Shops, aktueller Shopify-Plan und aktuelles Theme. *(recommended)*
*Skip if Q1.2.1 = no.*

- Store URL:
- Current plan:
- Current theme:

**Q1.2.3** — Auf welchem Shopify-Plan soll der neue Shop laufen (falls bereits entschieden)? *(required)*
*Wir empfehlen den Plan, sobald die Anforderungen bekannt sind.*

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

**Q1.2.4** — Welche Apps sind heute installiert, was leisten sie, und welche müssen bleiben? *(recommended)*
*Skip if Q1.2.1 = no.*

| App | Purpose | Decision |
|---|---|---|
| | | |

**Q1.2.5** — Audit des bestehenden Shops: Welche eingestellten oder abgekündigten Shopify-Funktionen nutzt er noch? *(required · consultant)*
*Skip if Q1.2.1 = no.*
*Shopify Scripts laufen seit dem 30.06.2026 nicht mehr; checkout.liquid und Additional Scripts sind eingestellt; Script Tags im Onlineshop enden am 01.03.2027; Legacy-Kundenkonten sind abgekündigt; Stocky ist eingestellt; die Geolocation-App ist eingestellt.*

*(tick all that apply)*
- [ ] Shopify Scripts
- [ ] checkout.liquid or additional scripts
- [ ] Online store script tags
- [ ] Legacy customer accounts
- [ ] Stocky
- [ ] Geolocation app
- [ ] None
- [ ] Not sure yet

**Q1.2.6** — Wie viele Personen benötigen nach dem Go-live einen eigenen Shopify-Admin-Zugang? *(required)*
*Mitarbeit über Collaborator-Konten und reines POS-Personal zählen nicht mit.*

> Answer:

### 1.3 Marke & Positionierung

**Q1.3.1** — Wie würden Sie die Positionierung der Marke beschreiben: Value, Mid-Market, Premium, Luxus oder Enterprise? *(required)*
*Die Positionierung prägt Designtiefe und Lösungsansatz.*

*(tick one)*
- [ ] Value
- [ ] Mid market
- [ ] Premium
- [ ] Luxury
- [ ] Enterprise

**Q1.3.2** — Ist die Markenidentität final (Logo, Farbpalette, Typografie)? *(recommended)*

- [ ] Yes
- [ ] No

**Q1.3.3** — In welchen Formaten liegen die Markenassets vor (SVG, PNG, Figma, Guidelines-PDF)? *(optional)*
*Skip if Q1.3.2 = no.*

> Answer:

**Q1.3.4** — Gibt es strikte Markenrichtlinien, die eingehalten werden müssen? *(recommended)*

- [ ] Yes
- [ ] No

**Q1.3.5** — Was unterscheidet die Marke — Preis, Qualität, Exklusivität, Community, Nachhaltigkeit? *(optional)*

> Answer:

### 1.4 Wettbewerbsumfeld

**Q1.4.1** — Wer sind Ihre drei wichtigsten Online-Wettbewerber? *(optional)*

> Answer:

**Q1.4.2** — Welche Shops (von Wettbewerbern oder nicht) möchten Sie als UX-Referenz heranziehen? *(optional)*

> Answer:

---

## § 2 — Katalog & Produkte

> Produktmodell, Varianten, Metafelder, Preise und Bestand.

### 2.1 Katalogumfang & Varianten

**Q2.1.1** — Wie viele aktive SKUs umfasst der Katalog (ungefähr)? *(required)*

> Answer:

**Q2.1.2** — Wie viele Optionen hat ein Produkt maximal (z. B. Größe, Farbe, Material = 3)? *(required)*
*Shopify erlaubt bis zu 3 Optionen je Produkt; mehr Optionen erfordern ein anderes Produktmodell.*

> Answer:

**Q2.1.3** — Wie viele Varianten hat ein einzelnes Produkt maximal? *(required)*
*Shopify erlaubt bis zu 2.048 Varianten je Produkt.*

> Answer:

**Q2.1.4** — Werden Varianten wie Farben als eigene Produkte geführt (eigene SKUs, Bilder, URLs), die im Shop aber als ein Produkt erscheinen sollen? *(required)*
*Das nennt Shopify Combined Listings.*

- [ ] Yes
- [ ] No

### 2.2 Produktarten

**Q2.2.1** — Welche Produktarten gibt es im Katalog? *(required)*
*Shopify Bundles erstellt feste Bundles und Multipacks; Mix-and-Match-Bundles brauchen eine App.*

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

**Q2.2.2** — Laufen Abos über Shopify Subscriptions (Shopifys eigene App) oder über eine Drittanbieter-App? Bitte die App nennen, falls bekannt. *(recommended)*
*Ask if Q2.2.1 includes Subscription.*
*Shopify Subscriptions: Kundinnen und Kunden überspringen, pausieren und kündigen im eigenen Konto; nicht mit Bundles oder B2B.*

- Approach:
- Subscription app:

**Q2.2.3** — Falls Sie Bundles verkaufen: Was müssen diese können? *(recommended)*
*Ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle.*
*Shopify Bundles: bis zu 30 Komponenten; nicht mit Abos oder Vorbestellungen; keine verschachtelten Bundles.*

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

**Q2.2.4** — Welche Abo-Funktionen werden benötigt? *(recommended)*
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

**Q2.2.5** — Wann wird bei Vorbestellungen abgerechnet? *(recommended)*
*Ask if Q2.2.1 includes Pre order.*
*Vorbestellungen brauchen eine Pre-Order-App; Express-Checkouts (Shop Pay, Apple Pay, Google Pay) stehen für Vorbestellungen nicht zur Verfügung.*

*(tick one)*
- [ ] Full at order
- [ ] Deposit then balance
- [ ] Charged at fulfilment

**Q2.2.6** — Personalisieren Kundinnen und Kunden Produkte mit Angaben, die keine Lagervarianten sind (Gravur, Datei-Upload, kostenpflichtige Zusatzoptionen, Konfiguratoren)? *(recommended)*
*Ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order.*

*(tick all that apply)*
- [ ] Text engraving
- [ ] File upload
- [ ] Paid add ons
- [ ] Conditional options
- [ ] 3D configurator
- [ ] None
- [ ] Not sure yet

### 2.3 Katalogdaten

**Q2.3.1** — Wie viele Kategorien (Collections) gibt es ungefähr? *(optional)*

> Answer:

**Q2.3.2** — Sind die Kategorien manuell, regelbasiert (automatisiert) oder gemischt? *(optional)*

*(tick one)*
- [ ] Manual
- [ ] Automated
- [ ] Mixed

**Q2.3.3** — Welche Produktattribute gehen über Shopifys Standardfelder hinaus (technische Daten, Zertifikate, Passform-Hinweise, Inhaltsstoffe)? *(required)*
*Shopify speichert zusätzliche Attribute als Metafelder und Metaobjekte und nutzt die Standard-Produkttaxonomie für Kategorieattribute (Filter, Google- und Meta-Feeds). Mit einem PIM kommen die Attribute aus dem PIM.*

> Answer:

**Q2.3.4** — Wo werden die Katalogdaten heute gepflegt? *(recommended)*
*Typisch: Produkte und Inhalte aus dem PIM; Preise und Bestände aus dem ERP.*

*(tick one)*
- [ ] Shopify admin
- [ ] Spreadsheet
- [ ] ERP
- [ ] PIM
- [ ] Mixed

**Q2.3.5** — Nach welchen Attributen sollen Kundinnen und Kunden auf Kategorie- und Suchseiten filtern können? *(recommended)*
*Shopify Search & Discovery: bis zu 25 Filter; keine Filter auf Kategorien mit mehr als 5.000 Produkten.*

> Answer:

### 2.4 Preise

**Q2.4.1** — Gibt es Sonderpreise für Endkundengruppen (VIP- oder Mitgliederpreise)? *(recommended)*
*Preise für Geschäftskunden behandelt § 6.2. Preise für Endkundengruppen laufen über Rabatte auf Kundensegmente oder über eine App.*

- [ ] Yes
- [ ] No

**Q2.4.2** — Gibt es Mengenangebote für Endkunden (z. B. 3 für 2, Staffelrabatte)? *(recommended)*
*Automatische Rabatte und Kaufe X, erhalte Y decken die meisten Mengenangebote nativ ab. Mengenpreise für Geschäftskunden behandelt § 6.2.*

- [ ] Yes
- [ ] No

**Q2.4.3** — Unterscheiden sich die Preise je Markt (über die reine Währungsumrechnung hinaus)? *(recommended)*
*Shopify Markets unterstützt prozentuale Anpassungen, feste Preise je Produkt und Land sowie Preisrundung.*

- [ ] Yes
- [ ] No

### 2.5 Bestand

**Q2.5.1** — Wo liegt die führende Quelle für Bestände — Shopify, ERP, WMS oder ein anderes System? *(recommended)*
*Auch wenn das ERP führend ist, braucht Shopify den Bestand je Standort.*

*(tick one)*
- [ ] Shopify
- [ ] ERP
- [ ] WMS
- [ ] OMS
- [ ] POS
- [ ] Other

**Q2.5.2** — Werden Benachrichtigungen bei niedrigem Bestand benötigt? *(optional)*
*Shopify hat keine eingebaute Benachrichtigung bei niedrigem Bestand; wir richten sie mit Shopify Flow ein.*

- [ ] Yes
- [ ] No

**Q2.5.3** — Was soll passieren, wenn ein Produkt nicht auf Lager ist? *(optional)*
*Ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more.*
*Weiterverkaufen (Nachbestellung) ist nativ; Benachrichtigungen bei Wiederverfügbarkeit und Vorbestellungen brauchen Apps.*

*(tick all that apply)*
- [ ] Hide
- [ ] Show sold out
- [ ] Continue selling (backorder)
- [ ] Back in stock alert
- [ ] Pre order
- [ ] Not sure yet

**Q2.5.4** — Welche Bestandsaufgaben wird Ihr Team in Shopify erledigen? *(optional)*
*Einkaufsbestellungen, Transfers und Bestandskorrekturen sind im Shopify Admin nativ (Stocky ist eingestellt).*

*(tick all that apply)*
- [ ] Purchase orders
- [ ] Stock transfers
- [ ] Stock counts POS
- [ ] Damaged, quality control and safety stock
- [ ] None
- [ ] Not sure yet

---

## § 3 — Märkte & Internationalisierung

> Shopify Markets, Währungen, Sprachen, Steuern und Zölle.

### 3.1 Märkte zum Launch

**Q3.1.1** — In welche Länder verkaufen Sie zum Launch? Je Land: das Land, die Währung, in der Kundinnen und Kunden zahlen, die Sprachen, die Internetadresse, die dort heute genutzt wird, wie die Preise gebildet werden, welche Ihrer Gesellschaften die Kundschaft fakturiert, ob das Sortiment dem Ihres Hauptmarkts entspricht, und wer dieses Land operativ verantwortet. *(required)*
*Why we ask: These rows decide how many Shopify stores your business needs. Countries that share one selling company, one range and one team can run on a single store; countries that differ on those points usually need their own store, which multiplies the build, the running cost and the work of every future change.*
*Eine Zeile je Land. Lassen Sie ein Feld leer, wenn Sie es nicht wissen — wir kommen darauf zurück.*

| Code | Currency | Languages | Domain | Price strategy | Domain type | Selling entity | Assortment | Run by |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

**Q3.1.2** — Welches sind die Primärmärkte (ein oder mehrere Länder- oder Marktcodes)? *(required)*
*Die Märkte, die Umsatz und Launch-Priorität anführen, z. B. USA und EU bei einer globalen Marke.*

> Answer:

**Q3.1.3** — Welche Länder sind in den nächsten 12 Monaten geplant? *(optional)*

> Answer:

**Q3.1.4** — Nur als geäußerte Präferenz — hat der Kunde bereits eine Meinung dazu, ob alle Länder aus einem Store laufen oder einzelne Länder einen eigenen Store bekommen? Erfassen Sie sie als seine Sicht, nicht als die Antwort. *(optional · consultant)*
*Why we ask: If you already have a view, we will say where the evidence agrees with it and where it does not, rather than quietly designing around it.*
*Wird als geäußerte Präferenz erfasst. Sie entscheidet nie über die Empfehlung; weicht sie ab, begründet das Abschlussdokument den Unterschied.*

*(tick one)*
- [ ] Shopify markets
- [ ] Expansion stores
- [ ] Hybrid (DTC and B2B)

**Q3.1.5** — Wie sollen Besucherinnen und Besucher in ihren lokalen Markt gelangen? *(optional)*
*Die automatische Weiterleitung ist nativ; EU-Besucher auf EU-Länderdomains werden nicht automatisch weitergeleitet.*

*(tick one)*
- [ ] Automatic redirect
- [ ] Country selector only
- [ ] Suggest banner
- [ ] None

**Q3.1.7** — Soll ein Markt eigene Theme-Inhalte, eine eigene Abschnittsreihenfolge, einen eigenen Checkout oder eigene Einstellungen für Kundenkonten haben? *(required)*

- [ ] Yes
- [ ] No

**Q3.1.8** — Gibt es Produkte, die in bestimmten Märkten nicht verkauft werden dürfen (Regulierung, Registrierung, Lizenzen oder Vertriebsvereinbarungen)? *(recommended)*
*Bitte in einer Notiz auflisten. In Shopify werden die Produkte aus dem Katalog dieses Markts ausgeschlossen.*

- [ ] Yes
- [ ] No

### 3.2 Sprache

**Q3.2.1** — Wie wird die Übersetzung gehandhabt? *(recommended)*
*Ask if Q3.1.1 has 3+ languages.*
*Translate & Adapt (Shopifys kostenlose App) übersetzt bis zu 2 Sprachen automatisch; mehr Sprachen brauchen Handarbeit oder eine Übersetzungs-App. Der Checkout ist vorübersetzt.*

*(tick one)*
- [ ] In house
- [ ] Agency
- [ ] Translate & Adapt
- [ ] Third party app
- [ ] Supplied by the PIM
- [ ] Not sure yet

**Q3.2.2** — Braucht eine der Sprachen ein Layout von rechts nach links? *(optional)*

- [ ] Yes
- [ ] No

**Q3.2.3** — Ist SEO je Sprache eine Priorität? *(optional)*

- [ ] Yes
- [ ] No

**Q3.2.4** — Was muss übersetzt werden? *(recommended)*
*Ask if Q3.1.1 has 3+ languages.*
*Translate & Adapt übersetzt Richtlinien und URL-Handles nicht automatisch.*

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

### 3.4 Steuern & Zölle

**Q3.4.1** — Sollen Zölle und Einfuhrsteuern im Checkout erhoben werden (DDP)? *(recommended)*
*Zölle und Einfuhrsteuern können im Checkout erhoben (DDP) oder von der Kundschaft bei Zustellung bezahlt werden (DAP) — wählbar je Land. Erfordert HS-Codes (und Ursprungsland) an den Produkten; nicht kombinierbar mit Steuerüberschreibungen, manuellen Steuersätzen oder Steuerbefreiungen von Kunden; DDP-Labels nur bei bestimmten Carriern.*

- [ ] Yes
- [ ] No

**Q3.4.2** — In welchen Ländern sind Sie umsatzsteuerlich registriert? *(recommended)*

> Answer:

**Q3.4.3** — Verkaufen Sie in die USA mit Pflichten zur State Sales Tax? *(optional)*

- [ ] Yes
- [ ] No

**Q3.4.4** — Haben die Produkte HS-Codes und ein Ursprungsland, und woher stammen diese Angaben? *(recommended)*
*Skip if Q3.4.1 = no.*

*(tick one)*
- [ ] In the PIM
- [ ] In the ERP
- [ ] To be created
- [ ] Not needed

**Q3.4.5** — Sollen die Preise in manchen Märkten inklusive Steuer (MwSt.) und in anderen exklusive Steuer angezeigt werden? *(required)*
*Shopify kann Preise je Markt inklusive Steuer anzeigen (dynamische Steueranzeige).*

*(tick one)*
- [ ] Include everywhere
- [ ] Exclude everywhere
- [ ] Dynamic by market

**Q3.4.6** — Welcher Steuerdienst? *(recommended · consultant)*
*Shopify Tax deckt USA, EU, UK und Kanada ab; seit dem 13.05.2026 können neue Stores, die in der EU, in UK oder Kanada verkaufen, Basic Tax nicht mehr nutzen.*

*(tick one)*
- [ ] Shopify Tax
- [ ] Tax app
- [ ] Manual rates
- [ ] Not sure yet

**Q3.4.7** — Kaufen Geschäftskunden steuerbefreit ein (Prüfung der USt-IdNr., Reverse Charge)? *(optional)*
*Die Prüfung der USt-IdNr. im Checkout ist nativ.*

- [ ] Yes
- [ ] No

**Q3.4.8** — In welchen Ländern sollen Zölle und Einfuhrsteuern im Checkout erhoben werden (DDP)? In den übrigen zahlt die Kundschaft bei Zustellung (DAP). *(recommended)*
*Skip if Q3.4.1 = no.*
*Länder, z. B. Vereinigte Staaten, Vereinigtes Königreich, Schweiz. Eine Wahl je Land: DDP und DAP lassen sich im selben Land nicht parallel anbieten. Falls Sie nicht grenzüberschreitend versenden, halten Sie das bitte in einem Kommentar fest.*

> Answer:

**Q3.4.9** — Wenn Sie geringwertige Sendungen von außerhalb in diese Gebiete versenden: Sind Sie registriert, um die Einfuhrumsatzsteuer oder GST bereits im Checkout zu erheben? *(recommended)*
*Ask if Q3.1.1 has 2+ markets.*
*Geringwertige Sendungen in die EU (IOSS), nach UK, in die Schweiz, nach Norwegen (VOEC), Australien und Neuseeland. Bitte die Verfahren ankreuzen, für die Sie registriert sind.*

*(tick all that apply)*
- [ ] EU Import One-Stop Shop (IOSS)
- [ ] UK low-value VAT
- [ ] Switzerland low-value VAT
- [ ] Norway VOEC
- [ ] Australia GST on low-value imports
- [ ] New Zealand GST on low-value imports
- [ ] None
- [ ] Not sure yet

**Q3.4.10** — Gibt es Produkte mit ermäßigten oder Nullsteuersätzen oder mit Steuerbefreiungen in einem Markt (z. B. Arzneimittel, Bücher, Lebensmittel, Kinderbekleidung)? *(recommended)*
*Die Sätze bestätigt die Finanzabteilung; Merkle erteilt keine Steuerberatung.*

- [ ] Yes
- [ ] No

**Q3.4.11** — Wer stellt die Rechnungen an die Kundschaft aus? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI.*
*Shopify kann MwSt.-Rechnungen für EU- und UK-Bestellungen erzeugen (auf der Bestellstatusseite sichtbar, nicht per E-Mail, nicht für Bestellungen mit Zöllen). Die kostenlose App Order Printer druckt Rechnungen aus Vorlagen. Rechnungen können auch aus dem ERP oder einer Rechnungs-App kommen.*

*(tick one)*
- [ ] Shopify VAT invoices (EU and UK)
- [ ] Shopify Order Printer
- [ ] Invoicing app
- [ ] ERP
- [ ] Billing or tax service
- [ ] Not sure yet

**Q3.4.12** — Welche Pflichten zur elektronischen Rechnungsstellung (E-Invoicing) gelten für Ihre Umsätze? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU.*
*Zum Beispiel Peppol, XRechnung oder ZUGFeRD (Deutschland), Factur-X (Frankreich), SdI (Italien), KSeF (Polen) oder VeriFactu (Spanien). Shopify hat kein eingebautes E-Invoicing: Es kommt aus dem ERP oder einer Rechnungs-App.*

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

**Q3.4.13** — Wenn der Verkauf in einem Land bedeutete, sich dort steuerlich registrieren und Erklärungen abgeben zu müssen: Würden Sie das selbst übernehmen, oder wäre Ihnen lieber, ein Partner wäre für diese Bestellungen der rechtliche Verkäufer? *(recommended)*
*Why we ask: This decides who carries the tax and customs liability on cross-border orders. Keeping it yourself means registering, filing and remitting in each country; handing it to a partner removes that work and that risk, and costs a percentage of every international order.*
*Bitte für die Länder antworten, in die Sie verkaufen, in denen Sie heute aber nicht registriert sind.*

*(tick one)*
- [ ] Own registrations
- [ ] Prefer partner
- [ ] Mixed
- [ ] Not sure yet

### 3.5 Festlandchina

**Q3.5.1** — Möchten Sie grenzüberschreitend (von außerhalb Chinas) oder onshore, hinter der Großen Firewall, an das chinesische Festland verkaufen? *(required)*
*Only if the launch markets include mainland China (CN).*
*Der Onshore-Verkauf setzt eine Gesellschaft in der VR China, eine ICP-Registrierung oder -Lizenz und Hosting in China voraus.*

*(tick one)*
- [ ] Cross-border, from outside China
- [ ] Onshore, behind the Great Firewall
- [ ] Both
- [ ] Not sure yet

**Q3.5.2** — Welche Kanäle für das chinesische Festland? *(required)*
*Only if the launch markets include mainland China (CN).*
*Grenzüberschreitende Marktplätze (Tmall Global, JD Worldwide, Douyin Global, RED), ein WeChat-Mini-Programm, die eigene Website oder ein Hongkong-Store, der auf das Festland versendet.*

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

**Q3.5.3** — Haben Sie eine juristische Person auf dem chinesischen Festland? *(required)*
*Only if the launch markets include mainland China (CN).*
*Erforderlich für eine ICP-Registrierung oder -Lizenz und für Onshore-Hosting.*

*(tick one)*
- [ ] None
- [ ] Wholly foreign-owned enterprise (WFOE)
- [ ] Joint venture
- [ ] Representative office
- [ ] Planned

**Q3.5.4** — Haben Sie eine Gesellschaft in Hongkong oder anderswo im Ausland, die grenzüberschreitend verkaufen kann, und sind Ihre Marken in China eingetragen? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Grenzüberschreitende Marktplätze verlangen beides.*

- Overseas entity:
- Trademarks registered in china:

**Q3.5.5** — ICP-Status für eine China-Website? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Ihre Rechtsberatung in der VR China bestätigt, ob eine Registrierung genügt oder eine kommerzielle ICP-Lizenz nötig ist.*

*(tick one)*
- [ ] None
- [ ] ICP filing
- [ ] Commercial ICP licence
- [ ] Via a partner
- [ ] Not needed
- [ ] Not sure yet

**Q3.5.6** — Welche Rolle spielt Shopify für das chinesische Festland? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*Shopify kann global führend für Produkte, Bestände und Bestellungen bleiben, während China über lokale Kanäle verkauft.*

*(tick one)*
- [ ] Global master for products, inventory and orders
- [ ] China channel or storefront
- [ ] Not involved
- [ ] Not sure yet

**Q3.5.7** — Wie gelangen die Waren nach China: Zolllager (1210), Direktversand (9610), allgemeiner Handel oder Privatsendungen? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Grenzüberschreitende Kanäle haben Grenzen je Bestellung und je Jahr und Verbraucher.*

*(tick all that apply)*
- [ ] Bonded warehouse (1210)
- [ ] Direct mail (9610)
- [ ] General trade
- [ ] Personal parcels
- [ ] Not sure yet

**Q3.5.8** — Stehen Ihre Produkte auf Chinas Positivliste für den grenzüberschreitenden E-Commerce? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] All on the list
- [ ] Some on the list
- [ ] None on the list
- [ ] Not sure yet

**Q3.5.9** — Wie sind Ihre Produkte in China eingestuft? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Aufhellende Produkte, Sonnenschutz und Mittel gegen Haarausfall gelten als besondere Kosmetika; Arzneimittel sind keine grenzüberschreitenden Waren.*

*(tick all that apply)*
- [ ] Ordinary cosmetics
- [ ] Special cosmetics (e.g. whitening, sunscreen)
- [ ] Drugs
- [ ] Medical devices
- [ ] Food supplements
- [ ] General goods
- [ ] Not sure yet

**Q3.5.10** — Status der Registrierung oder Anmeldung bei Chinas Arzneimittelbehörde (NMPA)? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Der allgemeine Handel verlangt Registrierung oder Anmeldung; grenzüberschreitende Kanäle sind für Waren auf der Positivliste befreit.*

*(tick one)*
- [ ] Registered
- [ ] Filed
- [ ] In progress
- [ ] Not started
- [ ] Not needed (cross-border e-commerce)
- [ ] Not sure yet

**Q3.5.11** — Müssen Produktaussagen für China geprüft werden (medizinische, kosmezeutische oder Behandlungsaussagen)? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*China lässt kosmezeutische oder medizinische Aussagen für Kosmetika nicht zu.*

- [ ] Yes
- [ ] No

**Q3.5.12** — Wie werden Kundinnen und Kunden auf dem Festland bezahlen? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Innerhalb des Marktplatzes, mit Alipay und WeChat Pay über ein Shopify-Payments-Konto in Hongkong (Early Access), über einen grenzüberschreitenden Wallet-Anbieter oder über inländische Händlerkonten (Gesellschaft in der VR China).*

*(tick all that apply)*
- [ ] Inside the marketplace
- [ ] Alipay / WeChat Pay via Shopify Payments (Hong Kong)
- [ ] Cross-border wallet provider
- [ ] Domestic merchant accounts (PRC entity)
- [ ] Not sure yet

**Q3.5.13** — Wie viele Kundinnen und Kunden vom chinesischen Festland erwarten Sie pro Jahr? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Chinas Gesetz zum Schutz personenbezogener Daten sieht je nach Volumen unterschiedliche Pflichten beim Datenexport vor.*

*(tick one)*
- [ ] Under 100,000
- [ ] 100,000 to 1 million
- [ ] Over 1 million
- [ ] Not sure yet

**Q3.5.14** — Haben Sie in China eine vertretungsberechtigte Person für den Schutz personenbezogener Daten (PIPL)? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Erforderlich, wenn ein ausländisches Unternehmen Verbraucherinnen und Verbraucher in China anspricht.*

- [ ] Yes
- [ ] No

**Q3.5.15** — Wo werden die China-Kundendaten (CRM, E-Mail, Analytics) gespeichert? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] Inside China
- [ ] Outside China
- [ ] Both
- [ ] Not sure yet

**Q3.5.16** — Müssen in China blockierte Skripte (Google Fonts, Google Analytics, reCAPTCHA, Meta-Pixel, YouTube) ersetzt werden? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*

- [ ] Yes
- [ ] No

**Q3.5.17** — Welche Marketingkanäle für China? *(optional)*
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

**Q3.5.18** — Wer leistet den Kundenservice auf Chinesisch? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] In house
- [ ] Partner
- [ ] Platform
- [ ] Not sure yet

**Q3.5.19** — Arbeiten Sie für China mit einem lokalen Partner oder Handelspartner? Bitte nennen. *(optional)*
*Only if the launch markets include mainland China (CN).*

> Answer:

**Q3.5.20** — Ziel-Launchdatum für das chinesische Festland. *(optional)*
*Only if the launch markets include mainland China (CN).*

> Answer:

**Q3.5.21** — Wer berät rechtlich, steuerlich und zollrechtlich zur VR China? *(required)*
*Only if the launch markets include mainland China (CN).*
*Merkle erbringt keine Rechtsberatung zur VR China.*

*(tick one)*
- [ ] Client's PRC counsel
- [ ] Partner
- [ ] Not yet

---

## § 4 — Zahlungen & Checkout

> Zahlungsanbieter, PCI-Umfang und Checkout-Anpassung.

### 4.1 Zahlungen

**Q4.1.1** — Welche Zahlungsanbieter werden Sie einsetzen (Shopify Payments, Adyen, Stripe, PayPal …)? *(required)*
*Shopify Payments ist für einige Funktionen erforderlich (Shop Pay Installments, Managed Markets, bestimmte Preisfunktionen in Markets); Gateways von Drittanbietern werden unterstützt.*

> Answer:

**Q4.1.2** — Welche lokalen Zahlungsarten werden benötigt? *(recommended)*

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

**Q4.1.3** — Welche Buy-now-pay-later-Optionen, falls überhaupt? *(optional)*
*Shop Pay Installments steht Stores in den USA, Kanada und dem Vereinigten Königreich zur Verfügung.*

*(tick all that apply)*
- [ ] Shop Pay Installments
- [ ] Klarna via Shopify Payments
- [ ] Buy now, pay later via another gateway
- [ ] None
- [ ] Not sure yet

**Q4.1.4** — Brauchen Sie Auszahlungen in mehr als einer Währung? *(required)*

- [ ] Yes
- [ ] No

**Q4.1.5** — Werden Kartendaten ausschließlich vom Shopify-gehosteten Checkout verarbeitet, von einer gehosteten Zahlungsseite eines Drittanbieters, oder von einer eigenen Karten-Oberfläche bzw. Tokenisierung? *(required · consultant)*
*Kartendaten außerhalb des Shopify-gehosteten Checkouts erfordern eine eigene Sicherheitsprüfung.*

*(tick one)*
- [ ] Shopify-hosted checkout
- [ ] Third-party hosted payment page
- [ ] Custom card handling

**Q4.1.6** — Welche Express-Checkouts werden benötigt? *(recommended)*
*B2B-Checkout und Vorbestellungen unterstützen keine Express-Checkouts.*

*(tick all that apply)*
- [ ] Shop Pay
- [ ] Apple Pay
- [ ] Google Pay
- [ ] PayPal
- [ ] Amazon Pay
- [ ] None
- [ ] Not sure yet

**Q4.1.7** — Müssen Zahlungsarten je Markt, Kundentyp oder Warenkorb ausgeblendet, umbenannt oder umsortiert werden? *(recommended)*
*Erfordert eine App zur Zahlungsanpassung (Shopify Function).*

- [ ] Yes
- [ ] No

### 4.2 Checkout

**Q4.2.1** — Welche Änderungen am Checkout werden benötigt? *(required)*
*Der Shopify-Checkout wird über den Checkout-Editor und Checkout Extensibility angepasst (Blöcke, Felder, Logik über Functions). Eine vollständig eigene Checkout-Oberfläche ist auf Shopify nicht möglich.*

*(tick all that apply)*
- [ ] Branding in the checkout editor
- [ ] Thank you / Order status page blocks
- [ ] Blocks or fields on checkout steps
- [ ] Checkout Branding API styling
- [ ] Back-end logic (Shopify Functions)
- [ ] Fully custom checkout UI
- [ ] None
- [ ] Not sure yet

**Q4.2.2** — Welche Checkout-Erweiterungen werden benötigt? *(optional · consultant)*
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

**Q4.2.3** — Welche zusätzlichen Checkout-Felder werden benötigt (Firma, USt-IdNr., Bestellnummer des Kunden, Lieferhinweise)? *(optional)*

> Answer:

**Q4.2.4** — Werden Upsells nach dem Kauf benötigt? *(optional)*
*Upsells auf der Dankesseite sind nativ; eine eigene Post-Purchase-Seite ist eine Shopify-Beta.*

- [ ] Yes
- [ ] No

**Q4.2.6** — Wird ein Guthaben im Shop benötigt? *(optional)*
*Shop-Guthaben ist nativ: Erstattung als Guthaben oder direkte Gutschrift; eingelöst wird es im angemeldeten Zustand.*

- [ ] Yes
- [ ] No

### 4.3 Betrug & Risiko

**Q4.3.1** — Ist eine manuelle Betrugsprüfung für hochpreisige Bestellungen nötig? *(optional)*
*Nativ: Betrugsanalyse und die App Shopify Fraud Control.*

- [ ] Yes
- [ ] No

**Q4.3.2** — Welche Bestellbeschränkungen werden benötigt? *(optional)*
*Länder zu sperren ist nativ (Märkte und Versandzonen); andere Regeln brauchen eine App zur Warenkorb- und Checkout-Validierung (Shopify Function).*

*(tick all that apply)*
- [ ] Block countries
- [ ] Order value min max
- [ ] Quantity limits
- [ ] Customer type restrictions
- [ ] Product combination rules
- [ ] None
- [ ] Not sure yet

**Q4.3.3** — Möchten Sie eine Garantie, dass betrugsbedingte Rückbuchungen erstattet werden? *(optional)*
*Ask if Q1.3.1 is Premium, Luxury or Enterprise.*
*Außerhalb von Shopify Protect (Shop-Pay-Bestellungen in den USA) braucht das eine Betrugs-App.*

- [ ] Yes
- [ ] No

---

## § 5 — Versand & Fulfillment

> Wie Bestellungen zu Kundinnen und Kunden gelangen und zurückkommen: Fulfillment, Versand, Retouren, Stornierungen, Erstattungen und das Erlebnis nach dem Kauf — und ob natives Shopify (Retouren- und Stornoregeln, Self-Service-Retouren, Bestellstatusseite, Lieferdaten) ausreicht oder eine App nötig ist.

### 5.1 Fulfillment-Modell

**Q5.1.1** — Wickeln Sie den Versand selbst ab, über einen 3PL-Dienstleister oder beides? *(required)*

*(tick one)*
- [ ] In house
- [ ] Third-party logistics (3PL)
- [ ] Hybrid (DTC and B2B)

**Q5.1.2** — Welcher 3PL-Dienstleister? *(recommended)*
*Skip if Q5.1.1 = In house.*

> Answer:

**Q5.1.3** — Wie viele Standorte beliefern Online-Bestellungen (Lager, 3PL-Standorte und Filialen, die versenden), und in welchen Ländern liegen sie? *(required)*
*Why we ask: Where stock sits decides what a customer pays at the border, which tax schemes are open to you, and whether a country can be served from the same store as the others or needs its own operation.*
*Filialen, die vor Ort verkaufen, werden getrennt in § 5.6 gezählt.*

- Fulfilment locations:
- Fulfilment countries:

**Q5.1.4** — Wie soll Shopify den beliefernden Standort auswählen? *(required)*
*Shopifys Routing-Regeln für Bestellungen: Teillieferungen minimieren, im Markt bleiben, nächstgelegener Standort, priorisierte Standorte, Standort-Metafelder. Alles andere braucht eine eigene Routing-Function oder das ERP bzw. OMS.*

*(tick all that apply)*
- [ ] Minimise split shipments
- [ ] Stay within the market
- [ ] Closest location
- [ ] Ranked locations
- [ ] Location metafields
- [ ] Custom routing function
- [ ] The ERP or OMS decides
- [ ] Not sure yet

**Q5.1.5** — Welche Carrier nutzen Sie? *(recommended)*

> Answer:

**Q5.1.6** — Wie werden die Versandkosten berechnet? *(required)*
*Pauschal, nach Gewicht oder Warenwert, kostenlos ab einer Schwelle, Live-Carrier-Tarife oder Tarife aus einer App.*

*(tick all that apply)*
- [ ] Flat
- [ ] Weight or price based
- [ ] Free above a threshold
- [ ] Live carrier rates
- [ ] Rates from an app
- [ ] Not sure yet

**Q5.1.7** — Gibt es produktspezifische Versandregeln (schwer, gefährlich, temperaturgeführt)? *(optional)*

> Answer:

**Q5.1.9** — In welche Länder versenden Sie nicht? *(optional)*

> Answer:

**Q5.1.10** — Schwellen für kostenlosen Versand je Markt (Markt, Schwelle, Währung, welche Tarife). *(recommended)*
*Nativ: eine Tarifbedingung auf Basis des Bestellwerts oder ein automatischer Rabatt für kostenlosen Versand.*

| Market | Threshold | Currency | Rates |
|---|---|---|---|
| | | | |

**Q5.1.11** — Welche Zustellarten bieten Sie an? *(required)*
*Lokale Lieferung und Abholung in der Filiale sind nativ. Paketshops sind nur für Stores in Frankreich, Italien, Spanien und dem Vereinigten Königreich nativ (mit bestimmten Carriern); anderswo brauchen sie eine Liefer-App oder eine eigene Lösung. Lieferzeitfenster brauchen eine App; Versand aus der Filiale braucht Shopify POS.*

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

**Q5.1.12** — Wie werden Versandlabels erstellt? *(optional)*

*(tick one)*
- [ ] Shopify Shipping
- [ ] 3PL system
- [ ] Carrier software
- [ ] Shipping app

**Q5.1.13** — Haben alle Produkte korrekte Gewichte (und Packmaße), und woher stammen diese Daten? *(recommended)*
*Ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app.*
*Gewichtsbasierte und live berechnete Tarife, Versandlabels und manche Zollberechnungen brauchen Produktgewichte.*

*(tick one)*
- [ ] From the PIM or ERP
- [ ] Maintained in Shopify
- [ ] Only for some products
- [ ] Not available yet
- [ ] Not sure yet

**Q5.1.14** — Gelten einzelne Produkte als Gefahrgut im Versand? *(recommended)*
*Z. B. Aerosole (Sprays, manche Sonnenschutzmittel), entzündbare Flüssigkeiten (Parfüms, alkoholhaltige Produkte), Lithiumbatterien, Trockeneis. Sie brauchen in der Regel ein eigenes Versandprofil und eigene Carrier-Vereinbarungen.*

*(tick all that apply)*
- [ ] Aerosols
- [ ] Flammable liquids
- [ ] Lithium batteries
- [ ] Dry ice
- [ ] Other hazardous materials
- [ ] None
- [ ] Not sure yet

### 5.2 Retouren & Umtausch

**Q5.2.1** — Fassen Sie die Retourenrichtlinie zusammen (Frist, Bedingungen, wer das Rücksendeporto trägt). *(recommended)*

> Answer:

**Q5.2.2** — Shopify bietet Retourenanfragen im Kundenkonto, gesteuert über Retourenregeln (Frist, Retourengebühr, Wiedereinlagerungsgebühr, endgültiger Verkauf). Reicht das? *(recommended)*

*(tick one)*
- [ ] Shopify self-serve returns are enough
- [ ] A returns app is needed
- [ ] Staff create returns only
- [ ] Not sure yet

**Q5.2.3** — Wickeln Sie Umtausch ab (nicht nur Erstattungen)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.4** — Welche Apps für Retouren, Sendungsverfolgung oder die Zeit nach dem Kauf nutzen oder bevorzugen Sie? *(optional)*
*Ask if Q1.2.1 is yes, or Q0.2.6 is 500 or more.*

> Answer:

**Q5.2.5** — Wie viele Tage haben Kundinnen und Kunden, um eine Bestellung zurückzusenden? *(recommended)*

> Answer:

**Q5.2.6** — Welcher Anteil der Bestellungen wird heute retourniert (%)? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Hohe Retourenquoten oder -mengen rechtfertigen meist eine Retourenplattform statt Shopifys nativer Selbstbedienungsretouren.*

> Answer:

**Q5.2.7** — Wie senden Kundinnen und Kunden Artikel zurück: vorfrankiertes Label, Abgabe per QR-Code, eigene Sendung oder gemischt? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Shopify erstellt Retourenlabels nur für Fulfillment-Standorte in den USA; andere Länder oder die QR-Abgabe brauchen eine Retouren-App.*

*(tick one)*
- [ ] Prepaid label
- [ ] QR code drop-off
- [ ] Customer arranged
- [ ] Mixed

**Q5.2.8** — Wer trägt das Rücksendeporto: Sie, die Kundschaft, oder hängt es vom Markt ab? *(recommended)*

*(tick one)*
- [ ] Merchant
- [ ] Customer
- [ ] Depends on market

**Q5.2.9** — Welchen Umtausch bieten Sie an: dasselbe Produkt in einer anderen Variante, ein beliebiges anderes Produkt, oder zuerst Guthaben? *(optional)*
*Skip if Q5.2.3 = no.*
*Ask if Q0.2.6 is 500 or more.*
*Im Retourenformular von Shopify kann die Kundschaft keinen Umtausch wählen; Mitarbeitende fügen Umtauschartikel beim Genehmigen hinzu. Vom Kunden gewählter Umtausch braucht eine App.*

*(tick all that apply)*
- [ ] Same product variant
- [ ] Any product
- [ ] Store credit first
- [ ] None
- [ ] Not sure yet

**Q5.2.10** — Akzeptieren Sie internationale Retouren (einschließlich Erstattung der Zölle)? *(optional)*
*Ask if Q3.1.1 has 2+ markets.*

- [ ] Yes
- [ ] No

**Q5.2.11** — Müssen retournierte Artikel geprüft werden, bevor Erstattung oder Umtausch erfolgen? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.2.12** — Müssen Retourengründe erfasst und ausgewertet werden? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.13** — Sollen Geschäftskunden Retouren online beantragen (falls Sie B2B verkaufen)? *(optional)*
*Shopifys Retourenanfragen funktionieren auch für B2B-Bestellungen.*

- [ ] Yes
- [ ] No

**Q5.2.14** — Unterscheiden sich Retourenfristen oder -bedingungen je Markt oder Produkt (z. B. Artikel im endgültigen Verkauf)? *(optional)*
*Endgültiger Verkauf je Produkt oder Kategorie ist nativ.*

- [ ] Yes
- [ ] No

### 5.3 Benachrichtigungen

**Q5.3.1** — Brauchen Benachrichtigungen zu Bestellung, Versand und Zustellung eigenes Design oder eigene Inhalte? *(optional)*
*Shopify-Benachrichtigungen sind bearbeitbar; SMS-Versandbenachrichtigungen sind nativ.*

- [ ] Yes
- [ ] No

**Q5.3.2** — Werden die Benachrichtigungen von Shopify versendet, von der E-Mail-Plattform, oder von beiden? *(optional)*

*(tick one)*
- [ ] Shopify
- [ ] ESP
- [ ] Mixed

### 5.4 Stornierungen & Erstattungen

**Q5.4.2** — Sollen Kundinnen und Kunden Bestellungen selbst stornieren können? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Kundinnen und Kunden können im Konto die Stornierung nicht versandter Bestellungen beantragen; Sie genehmigen. Sofortige Stornierung ohne Genehmigung braucht eine App.*

- [ ] Yes
- [ ] No

**Q5.4.3** — Bis wann kann eine Bestellung storniert werden? *(recommended)*

*(tick one)*
- [ ] No cancellations
- [ ] Until fulfilled
- [ ] Within 15 minutes
- [ ] Within 1 hour
- [ ] Within 24 hours
- [ ] Staff only

**Q5.4.4** — Erlauben Sie Teilstornierungen (einzelne Positionen einer Bestellung)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.5** — Sollen Kundinnen und Kunden eine Bestellung nach dem Absenden ändern können (Adresse, Positionen)? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Mitarbeitende können Bestellungen nativ ändern; dass Kundinnen und Kunden ihre eigenen Bestellungen ändern, braucht eine App.*

- [ ] Yes
- [ ] No

**Q5.4.6** — Wie werden Erstattungen ausgezahlt: auf das ursprüngliche Zahlungsmittel, als Shop-Guthaben oder als Geschenkkarte? *(recommended)*

*(tick all that apply)*
- [ ] Original payment
- [ ] Store credit
- [ ] Gift card
- [ ] Not sure yet

**Q5.4.7** — Wann wird erstattet: auf Antrag, beim Scan des Carriers, bei Eingang oder nach Prüfung? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Erstattungen beim Scan des Carriers brauchen eine Retourenplattform, die an die Sendungsverfolgung angebunden ist.*

*(tick one)*
- [ ] On request
- [ ] On carrier scan
- [ ] On receipt
- [ ] After inspection

**Q5.4.8** — Werden die ursprünglichen Versandkosten erstattet: immer, nur bei eigenem Verschulden, oder nie? *(optional)*

*(tick one)*
- [ ] Always
- [ ] On fault only
- [ ] Never

**Q5.4.9** — Erheben Sie eine Wiedereinlagerungsgebühr? *(optional)*
*Eine Wiedereinlagerungsgebühr ist eine native Retourenregel (Prozentsatz der Retoure).*

- [ ] Yes
- [ ] No

**Q5.4.10** — Gewähren Sie Teilerstattungen (z. B. bei Beschädigung oder fehlenden Teilen)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.11** — Müssen Erstattungen von jemandem genehmigt werden, bevor sie ausgezahlt werden? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.4.12** — Müssen Stornierungen und Erstattungen an Ihr ERP- oder Finanzsystem übergeben werden? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.4.13** — Müssen Stornierungen sofort und ohne Ihre Genehmigung erfolgen? *(optional)*
*Skip if Q5.4.2 = no.*
*Ask if Q5.4.2 is yes.*

- [ ] Yes
- [ ] No

### 5.5 Erlebnis nach dem Kauf

**Q5.5.1** — Möchten Sie eine gebrandete Sendungsverfolgungsseite auf Ihrer eigenen Website? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*
*Shopify enthält eine Bestellstatusseite und Versand-E-Mails. Eine gebrandete Trackingseite, proaktive Carrier-Hinweise oder Lieferprognosen brauchen meist eine Post-Purchase-App.*

- [ ] Yes
- [ ] No

**Q5.5.2** — Auf welchen Kanälen sollen Kundinnen und Kunden proaktive Lieferhinweise erhalten (Verzögerungen, in Zustellung)? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*

*(tick all that apply)*
- [ ] Email
- [ ] SMS
- [ ] WhatsApp
- [ ] Push
- [ ] None
- [ ] Not sure yet

**Q5.5.3** — Sollen Produktseiten oder der Checkout voraussichtliche Liefertermine zeigen? *(optional)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*
*Shopify kann Liefertermine im Checkout zeigen: manuelle Termine überall, automatische Termine nur für Fulfillment-Standorte in den USA.*

- [ ] Yes
- [ ] No

**Q5.5.4** — Müssen Kundinnen und Kunden Garantie-, Reparatur- oder Serviceanliegen online eröffnen können? *(recommended)*
*Ask if Q1.1.3 mentions watch, jewel, electronic, appliance, furniture, bike, bicycle, tool, device or luxury.*

- [ ] Yes
- [ ] No

### 5.6 Retail & POS

**Q5.6.1** — Wie viele stationäre Filialen (inklusive Pop-ups) werden mit Shopify verkaufen? *(required)*
*0, wenn keine.*

> Answer:

**Q5.6.2** — Kassensystem zum Launch? *(required)*
*Skip if Q5.6.1 = 0.*

*(tick one)*
- [ ] Shopify POS
- [ ] Another POS, integrated
- [ ] Another POS, not integrated
- [ ] Not sure yet

**Q5.6.3** — Welche Omnichannel-Services werden in der Filiale gebraucht? *(required)*
*Skip if Q5.6.1 = 0.*
*Abholung in der Filiale, Versand aus der Filiale, Retouren von Online-Bestellungen in der Filiale, Endless Aisle, Bestandstransfers, Filialpreise.*

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

**Q5.6.4** — In welchen Ländern liegen die Filialen? *(recommended)*
*Skip if Q5.6.1 = 0.*

> Answer:

---

## § 6 — Kundinnen und Kunden, B2B & Datenschutz

> Kundenkonten, B2B, Loyalty, Segmentierung und Pflichten zu personenbezogenen Daten.

### 6.1 Kundenkonten

**Q6.1.1** — Ist der Gastkauf der Standard, sind Konten optional, oder ist eine Registrierung Pflicht? *(recommended)*

*(tick one)*
- [ ] Guest default
- [ ] Optional
- [ ] Required

**Q6.1.3** — Was soll der Kontobereich enthalten (Bestellhistorie, Adressen, Retouren, Merkliste, Abos)? *(required)*

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

**Q6.1.4** — Wie sollen sich Kundinnen und Kunden anmelden? *(required)*
*Einmalcode per E-Mail sowie die Anmeldung über Google oder Facebook sind nativ.*

*(tick all that apply)*
- [ ] One-time email code
- [ ] Google or Facebook sign-in
- [ ] Shop (Shop Pay)
- [ ] Company single sign-on (identity provider)
- [ ] Sign in from another site
- [ ] Not sure yet

### 6.2 B2B & Großhandel

**Q6.2.2** — Brauchen Geschäftskunden Unternehmenskonten mit eigener Anmeldung? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.3** — Erhalten Geschäftskunden unternehmensspezifische Preislisten? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Preislisten für Geschäftskunden sind B2B-Kataloge.*

- [ ] Yes
- [ ] No

**Q6.2.4** — Gibt es B2B-Mengenrabatte oder Mengenregeln? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.5** — Welche Zahlungsbedingungen werden benötigt (30 Tage netto, Rechnung, Bestellnummer)? *(required)*
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

**Q6.2.6** — Gibt es einen Angebotsanfrage-Prozess, oder werden Preise je Einkäufer verhandelt? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify hat keine eingebaute Angebotsanfrage: Bestellungen können als Entwurf zur Prüfung eingereicht werden, oder eine Angebots-App übernimmt die Verhandlung.*

- [ ] Yes
- [ ] No

**Q6.2.7** — Müssen B2B-Konten freigegeben werden, bevor sie bestellen können? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Nativ: ein Antragsformular für Großhandelskunden (Shopify Forms) plus Flow zum Anlegen und Freigeben von Unternehmen.*

- [ ] Yes
- [ ] No

**Q6.2.8** — Natives Shopify B2B oder eine App? *(recommended · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

*(tick one)*
- [ ] Shopify B2B
- [ ] Shopify B2B plus apps
- [ ] A B2B app only
- [ ] Separate B2B expansion store
- [ ] Not sure yet

**Q6.2.9** — Wie viele B2B-Konten werden innerhalb von 12 Monaten erwartet? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

> Answer:

**Q6.2.10** — Wie viele unterschiedliche B2B-Preislisten (Kataloge) brauchen Sie, und muss eine davon für genau ein Unternehmen gelten? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- Catalog count:
- Company specific catalogs:

**Q6.2.11** — Sollen Geschäftskunden einen anderen Shop oder Checkout sehen als Endkunden? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.12** — Brauchen B2B-Bestellungen eines davon: Abos, lokale Lieferung oder Paketshops, Express-Checkouts, mehr als 500 Positionen, Geschenkkarten? *(required · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify B2B unterstützt das nicht.*

*(tick all that apply)*
- [ ] Subscriptions
- [ ] Local delivery or pickup points
- [ ] Express checkouts
- [ ] More than 500 line items
- [ ] Gift cards
- [ ] None
- [ ] Not sure yet

**Q6.2.13** — Welche Versandregeln unterscheiden sich für Geschäftskunden? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Standardmäßig sehen B2B- und Endkunden dieselben Versandarten. Abweichende Optionen brauchen Checkout Blocks, eine App oder eine Delivery-Customization-Function; Bestellungen können außerdem als Entwurf eingereicht werden, damit der Versand vor der Zahlung kalkuliert wird.*

*(tick all that apply)*
- [ ] Separate rates or methods
- [ ] Free shipping above an order value
- [ ] Freight or pallet delivery
- [ ] Buyer's own carrier account
- [ ] Shipping quoted after the order
- [ ] None
- [ ] Not sure yet

**Q6.2.14** — Wird das Großhandelsgeschäft von einem eigenen Team mit eigenen Zielen oder eigener Ergebnisrechnung geführt? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B), or Q1.1.4 is Hybrid (DTC and B2B).*
*Why we ask: A wholesale business with its own team, targets and customers usually wants to move at its own pace — its own campaigns, its own releases, its own data. That is the difference between wholesale living alongside the consumer store and wholesale having a store of its own.*
*Wir fragen nach der Organisation des Geschäfts, nicht nach der Website.*

- [ ] Yes
- [ ] No

### 6.3 Loyalty & Segmentierung

**Q6.3.1** — Welche Loyalty-Bausteine sind geplant? *(recommended)*
*Ask if Q1.1.4 is Direct to consumer (DTC) or Hybrid (DTC and B2B).*
*Shopify hat kein natives Punkteprogramm; Shop-Guthaben kann als Prämienwährung dienen. Loyalty braucht eine App.*

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

**Q6.3.2** — Wird Loyalty zum Launch gebraucht oder in einer späteren Phase? *(recommended)*

*(tick one)*
- [ ] Launch
- [ ] Phase 2
- [ ] None

**Q6.3.3** — Welche Loyalty-App wird genutzt oder bevorzugt? *(optional)*

> Answer:

**Q6.3.4** — Muss der Loyalty-Status mit der E-Mail-Plattform oder dem CRM synchronisiert werden? *(optional)*

- [ ] Yes
- [ ] No

**Q6.3.5** — Welche Kundensegmente nutzen Sie heute? *(optional)*

> Answer:

**Q6.3.6** — Woher wird die Segmentierung gesteuert — aus Shopify, der E-Mail-Plattform, einer CDP oder gemischt? *(optional)*
*Kundensegmente sind in Shopify nativ; stattdessen können sie der E-Mail-Plattform oder einer CDP gehören.*

*(tick one)*
- [ ] Shopify
- [ ] ESP
- [ ] CDP
- [ ] Mixed
- [ ] None

**Q6.3.7** — Welche Kunden-Tags steuern heute eigene Logik (Preise, Zugriff, Rabatte)? *(optional)*

> Answer:

### 6.4 Datenschutz & Einwilligung

**Q6.4.1** — Welche Datenschutzgesetze gelten für Ihre Kundschaft (DSGVO, UK GDPR, CCPA, Schweizer revDSG, andere)? *(required)*

*(tick all that apply)*
- [ ] GDPR (EU)
- [ ] UK GDPR
- [ ] CCPA (US)
- [ ] Swiss nFADP
- [ ] Other
- [ ] None
- [ ] Not sure yet

**Q6.4.2** — Cookie-Einwilligung: Shopifys Cookie-Banner oder eine Consent-Management-Plattform? Bitte das Werkzeug nennen, falls bekannt. *(recommended)*
*Ask if Q6.4.1 includes GDPR (EU), UK GDPR, Swiss nFADP or CCPA (US).*
*Shopifys Cookie-Banner ist nativ; eine Drittanbieter-Plattform muss Shopifys Customer Privacy API anbinden.*

- Consent approach:
- Cookie consent tool:

**Q6.4.3** — Ist eine ausdrückliche Einwilligung für Marketing-E-Mails erforderlich? *(recommended)*

- [ ] Yes
- [ ] No

**Q6.4.4** — Erheben Sie besondere Kategorien personenbezogener Daten (Gesundheit, Alter, biometrische, finanzielle Daten)? *(required)*
*Besondere Datenkategorien erfordern eine Datenschutz-Folgenabschätzung und eine rechtliche Freigabe.*

- [ ] Yes
- [ ] No

**Q6.4.5** — Müssen Auskunfts- oder Löschanfragen auch Systeme jenseits von Shopify erreichen (ERP, E-Mail-Plattform) oder ohne Zutun von Mitarbeitenden ablaufen? *(required)*
*Shopify bearbeitet Export- und Löschanfragen im Admin; andere Systeme oder Automatisierung brauchen zusätzliches Design und eine rechtliche Freigabe.*

- [ ] Yes
- [ ] No

**Q6.4.6** — Verlangen US-Bundesstaatengesetze zum Datenschutz eine Seite „Do not sell or share my personal information“? *(optional)*
*Eine native Opt-out-Seite berücksichtigt Global Privacy Control.*

- [ ] Yes
- [ ] No

**Q6.4.7** — Wo erheben Sie die Marketing-Einwilligung? *(optional)*

*(tick all that apply)*
- [ ] Checkout
- [ ] Customer account sign in
- [ ] Forms popups
- [ ] POS
- [ ] None
- [ ] Not sure yet

---

## § 7 — Marketing & Promotions

> SEO, Analytics, E-Mail, Bewertungen, Affiliates, Rabatte, Kampagnen und KI-gestützter Commerce.

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

### 7.2 Analytics & Tracking

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

### 7.3 E-Mail & CRM

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

### 7.4 Bewertungen & Affiliates

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

### 7.5 Rabatte & Gutscheincodes

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

### 7.6 Geschenkkarten & Kampagnen

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

### 7.7 KI & agentischer Commerce

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

## § 8 — Integrationen & Migration

> Jedes System, das Daten mit dem Shop austauscht, und was von der heutigen Plattform mitkommt.

### 8.1 Angebundene Systeme

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

### 8.2 Datenmigration

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

## § 9 — Design & Erlebnis

> Design-Quelle, Storefront-Ansatz, Barrierefreiheit und Performance.

### 9.1 Design-Input

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

### 9.2 Storefront

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

### 9.3 Barrierefreiheit

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

## § 10 — Umsetzung, Steuerung & Compliance

> Zeitplan, Entscheidungswege, Support, Recht und Projektwerkzeuge.

### 10.1 Zeitplan

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

### 10.2 Team & Entscheidungen

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

### 10.3 Support & Schulung

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

### 10.4 Recht & regulierte Branchen

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

### 10.5 Projekt-Setup (Consultant)

**Q10.5.1** — Lead consultant. *(required · consultant)*

> Answer:

**Q10.5.2** — Has the client agreed that their answers may be processed by AI (no customer personal data included)? *(required · consultant)*
*Nothing else can be recorded until this is Yes, and it has to be true — an RFP arriving in your inbox is not consent to put it through an AI tool. If the client’s process has no such clause, ask, or stop.*

- [ ] Yes
- [ ] No

**Q10.5.3** — Jira site and project key for the backlog. *(recommended · consultant)*

- Site:
- Project key:

**Q10.5.4** — Jira components to use. *(optional · consultant)*

> Answer:

---

## Checkliste zur Vollständigkeit

- [ ] Jede *erforderliche* Frage in §§ 0–10 hat eine Antwort oder „TBC“
- [ ] Mindestens ein KPI hat einen Ausgangswert und einen Zielwert (Q0.4.2)
- [ ] Jedes angebundene System ist in Q8.1.1 mit Richtung und Konnektor aufgeführt
- [ ] Einwilligung in die KI-Verarbeitung ist erfasst (Q10.5.2)
