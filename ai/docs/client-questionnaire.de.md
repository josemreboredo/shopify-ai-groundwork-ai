<!-- GENERATED FILE — do not edit. Source: ai/schema/question-bank.json + ai/schema/offering.json. Re-render: npm run questionnaire:render -->

# Shopify Discovery — Fragebogen

> **Version:** question bank 1.7.0 · offering 3.0.0
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
- [ ] Neukundengewinnung
- [ ] Conversion
- [ ] Kundenbindung
- [ ] Gemischt
- [ ] Noch unklar

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
- [ ] Keine
- [ ] Shopify
- [ ] WooCommerce
- [ ] Magento / Adobe Commerce
- [ ] Shopware
- [ ] Salesforce Commerce Cloud
- [ ] BigCommerce
- [ ] Individuell
- [ ] Anderes

### 0.6 Budget

**Q0.6.1** — Welcher Budgetrahmen steht für dieses Projekt ungefähr zur Verfügung (Spanne und Währung)? *(required)*

- Min:
- Max:
- Currency:

**Q0.6.2** — Liegt die Priorität darauf, die Anfangskosten gering zu halten (Apps und Konfiguration), die Lösung zu besitzen (Individualentwicklung), oder auf einer Balance? *(required)*

*(tick one)*
- [ ] Anfangsinvestition gering halten
- [ ] Eigene Lösung
- [ ] Ausgewogen

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
- [ ] Direkt an Endkunden (DTC)
- [ ] Geschäftskunden (B2B)
- [ ] Hybrid (DTC und B2B)

**Q1.1.5** — Aktuelle Website-URL. *(optional)*

> Answer:

**Q1.1.6** — Verkaufen Sie über mehr als eine juristische Person (z. B. eine je Land oder Region)? Bitte auflisten. *(required)*
*Mehrere verkaufende Einheiten in einem Shop oder ein Shop je Einheit verändern das Shop-Setup.*

> Answer:

**Q1.1.7** — Wo werden Sie zum Launch verkaufen? *(required)*
*Onlineshop, Shopify POS, Shop-App, Marktplätze, Social-Kanäle, B2B, Headless- oder App-Frontends, KI-Shopping-Agenten.*

*(tick all that apply)*
- [ ] Onlineshop
- [ ] Shopify POS
- [ ] Shop app
- [ ] Marktplätze
- [ ] Facebook & Instagram
- [ ] Google & YouTube
- [ ] TikTok
- [ ] B2B online
- [ ] Headless oder mobile App
- [ ] KI-Einkaufsassistenten
- [ ] Keine
- [ ] Noch unklar

**Q1.1.8** — Für wie viele eigenständige, kundenseitig erkennbare Marken benötigt dieses Engagement einen Shopify-Store? *(required)*
*Eine Marke, die zwei Kundinnen als unterschiedlichen Namen, unterschiedliches Logo oder unterschiedliche Identität erkennen würden — nicht ein Markt oder eine Produktlinie unter derselben Marke.*

> Answer:

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
- [ ] Keine
- [ ] Starter
- [ ] Basic
- [ ] Grow
- [ ] Advanced
- [ ] Shopify Plus
- [ ] Enterprise
- [ ] Filialgeschäft
- [ ] Noch unklar

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
- [ ] checkout.liquid oder zusätzliche Skripte
- [ ] Script-Tags im Onlineshop
- [ ] Alte Kundenkonten
- [ ] Stocky
- [ ] Geolocation-App
- [ ] Keine
- [ ] Noch unklar

**Q1.2.6** — Wie viele Personen benötigen nach dem Go-live einen eigenen Shopify-Admin-Zugang? *(required)*
*Mitarbeit über Collaborator-Konten und reines POS-Personal zählen nicht mit.*

> Answer:

### 1.3 Marke & Positionierung

**Q1.3.1** — Wie würden Sie die Positionierung der Marke beschreiben: Value, Mid-Market, Premium, Luxus oder Enterprise? *(required)*
*Die Positionierung prägt Designtiefe und Lösungsansatz.*

*(tick one)*
- [ ] Wert
- [ ] Mittelstand
- [ ] Premium
- [ ] Luxus
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
- [ ] Einfach
- [ ] Variante
- [ ] Festes Bundle
- [ ] Multipack
- [ ] Mix-and-Match-Bundle
- [ ] Bundle
- [ ] Produktset
- [ ] Geschenkkarte
- [ ] Digital
- [ ] Abo
- [ ] Vorbestellung
- [ ] Auf Bestellung gefertigt
- [ ] Virtuell
- [ ] Erst anprobieren, dann zahlen
- [ ] Keine
- [ ] Noch unklar

**Q2.2.2** — Laufen Abos über Shopify Subscriptions (Shopifys eigene App) oder über eine Drittanbieter-App? Bitte die App nennen, falls bekannt. *(recommended)*
*Skip if Q2.2.1 does not include subscription.*
*Ask if Q2.2.1 includes Subscription.*
*Shopify Subscriptions: Kundinnen und Kunden überspringen, pausieren und kündigen im eigenen Konto; nicht mit Bundles oder B2B.*

- Approach:
- Subscription app:

**Q2.2.3** — Falls Sie Bundles verkaufen: Was müssen diese können? *(recommended)*
*Skip if Q2.2.1 does not include fixed_bundle,multipack,mix_and_match_bundle,bundle,product_set.*
*Ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle.*
*Shopify Bundles: bis zu 30 Komponenten; nicht mit Abos oder Vorbestellungen; keine verschachtelten Bundles.*

*(tick all that apply)*
- [ ] Bundle zum Festpreis
- [ ] Multipack
- [ ] Die Kundschaft stellt das Bundle zusammen
- [ ] Bundle mit Abo
- [ ] Bundle-Rabattstufen
- [ ] Bundles am Kassensystem verkaufen
- [ ] Bundles auf Marktplätzen
- [ ] Keine
- [ ] Noch unklar

**Q2.2.4** — Welche Abo-Funktionen werden benötigt? *(recommended)*
*Skip if Q2.2.1 does not include subscription.*
*Ask if Q2.2.1 includes Subscription.*

*(tick all that apply)*
- [ ] Zahlung je Lieferung
- [ ] Vorausbezahlte Mehrfachlieferung
- [ ] Box selbst zusammenstellen
- [ ] Abo-Rabatt
- [ ] Abo-Bundles
- [ ] Abos am Kassensystem
- [ ] B2B-Abos
- [ ] Internationale Abos
- [ ] Bestehende Verträge migrieren
- [ ] Noch unklar

**Q2.2.5** — Wann wird bei Vorbestellungen abgerechnet? *(recommended)*
*Skip if Q2.2.1 does not include pre_order.*
*Ask if Q2.2.1 includes Pre order.*
*Vorbestellungen brauchen eine Pre-Order-App; Express-Checkouts (Shop Pay, Apple Pay, Google Pay) stehen für Vorbestellungen nicht zur Verfügung.*

*(tick one)*
- [ ] Voller Betrag bei Bestellung
- [ ] Anzahlung, dann Restbetrag
- [ ] Abrechnung bei Versand

**Q2.2.6** — Personalisieren Kundinnen und Kunden Produkte mit Angaben, die keine Lagervarianten sind (Gravur, Datei-Upload, kostenpflichtige Zusatzoptionen, Konfiguratoren)? *(recommended)*
*Ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order.*

*(tick all that apply)*
- [ ] Textgravur
- [ ] Datei-Upload
- [ ] Kostenpflichtige Zusatzoptionen
- [ ] Bedingte Optionen
- [ ] 3D-Konfigurator
- [ ] Keine
- [ ] Noch unklar

### 2.3 Katalogdaten

**Q2.3.1** — Wie viele Kategorien (Collections) gibt es ungefähr? *(optional)*

> Answer:

**Q2.3.2** — Sind die Kategorien manuell, regelbasiert (automatisiert) oder gemischt? *(optional)*

*(tick one)*
- [ ] Manuell
- [ ] Automatisiert
- [ ] Gemischt

**Q2.3.3** — Welche Produktattribute gehen über Shopifys Standardfelder hinaus (technische Daten, Zertifikate, Passform-Hinweise, Inhaltsstoffe)? *(required)*
*Shopify speichert zusätzliche Attribute als Metafelder und Metaobjekte und nutzt die Standard-Produkttaxonomie für Kategorieattribute (Filter, Google- und Meta-Feeds). Mit einem PIM kommen die Attribute aus dem PIM.*

> Answer:

**Q2.3.4** — Wo werden die Katalogdaten heute gepflegt? *(recommended)*
*Typisch: Produkte und Inhalte aus dem PIM; Preise und Bestände aus dem ERP.*

*(tick one)*
- [ ] Shopify Admin
- [ ] Tabellenkalkulation
- [ ] ERP
- [ ] PIM
- [ ] Gemischt

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
- [ ] Anderes

**Q2.5.2** — Werden Benachrichtigungen bei niedrigem Bestand benötigt? *(optional)*
*Shopify hat keine eingebaute Benachrichtigung bei niedrigem Bestand; wir richten sie mit Shopify Flow ein.*

- [ ] Yes
- [ ] No

**Q2.5.3** — Was soll passieren, wenn ein Produkt nicht auf Lager ist? *(optional)*
*Ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more.*
*Weiterverkaufen (Nachbestellung) ist nativ; Benachrichtigungen bei Wiederverfügbarkeit und Vorbestellungen brauchen Apps.*

*(tick all that apply)*
- [ ] Ausblenden
- [ ] Als ausverkauft anzeigen
- [ ] Weiterverkaufen (Nachbestellung)
- [ ] Benachrichtigung bei Wiederverfügbarkeit
- [ ] Vorbestellung
- [ ] Noch unklar

**Q2.5.4** — Welche Bestandsaufgaben wird Ihr Team in Shopify erledigen? *(optional)*
*Einkaufsbestellungen, Transfers und Bestandskorrekturen sind im Shopify Admin nativ (Stocky ist eingestellt).*

*(tick all that apply)*
- [ ] Einkaufsbestellungen
- [ ] Bestandstransfers
- [ ] Bestandszählungen am Kassensystem
- [ ] Beschädigt, Qualitätskontrolle und Sicherheitsbestand
- [ ] Keine
- [ ] Noch unklar

---

## § 3 — Märkte & Internationalisierung

> Shopify Markets, Währungen, Sprachen, Steuern und Zölle.

### 3.1 Märkte zum Launch

**Q3.1.1** — In welche Länder verkaufen Sie zum Launch? Je Land: das Land, die Währung, in der Kundinnen und Kunden zahlen, die Sprachen, die Internetadresse, die dort heute genutzt wird, wie die Preise gebildet werden, welche Ihrer Gesellschaften die Kundschaft fakturiert, ob das Sortiment dem Ihres Hauptmarkts entspricht, wer dieses Land operativ verantwortet, und ob es ein eigenes Theme-Design braucht statt desselben Designs mit lokalen Inhalten. *(required)*
*Why we ask: These rows decide how many Shopify stores your business needs. Countries that share one selling company, one range and one team can run on a single store; countries that differ on those points usually need their own store, which multiplies the build, the running cost and the work of every future change.*
*Eine Zeile je Land. Lassen Sie ein Feld leer, wenn Sie es nicht wissen — wir kommen darauf zurück.*

| Code | Currency | Languages | Domain | Price strategy | Domain type | Selling entity | Assortment | Run by | Distinct theme design |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

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
- [ ] Expansion Stores
- [ ] Hybrid (DTC und B2B)

**Q3.1.5** — Wie sollen Besucherinnen und Besucher in ihren lokalen Markt gelangen? *(optional)*
*Die automatische Weiterleitung ist nativ; EU-Besucher auf EU-Länderdomains werden nicht automatisch weitergeleitet.*

*(tick one)*
- [ ] Automatische Weiterleitung
- [ ] Nur ein Länderselector
- [ ] Hinweisbanner
- [ ] Keine

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
- [ ] Im eigenen Haus
- [ ] Agentur
- [ ] Translate & Adapt
- [ ] App eines Drittanbieters
- [ ] Vom PIM geliefert
- [ ] Noch unklar

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
- [ ] Produktdaten aus dem PIM
- [ ] Theme-Texte
- [ ] Inhalte in Metaobjekten
- [ ] Richtlinien
- [ ] Benachrichtigungen
- [ ] URL-Handles
- [ ] App-Inhalte
- [ ] Keine
- [ ] Noch unklar

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
- [ ] Im PIM
- [ ] Im ERP
- [ ] Noch zu erstellen
- [ ] Nicht erforderlich

**Q3.4.5** — Sollen die Preise in manchen Märkten inklusive Steuer (MwSt.) und in anderen exklusive Steuer angezeigt werden? *(required)*
*Shopify kann Preise je Markt inklusive Steuer anzeigen (dynamische Steueranzeige).*

*(tick one)*
- [ ] Überall inklusive Steuer
- [ ] Überall exklusive Steuer
- [ ] Dynamisch je Markt

**Q3.4.6** — Welcher Steuerdienst? *(recommended · consultant)*
*Shopify Tax deckt USA, EU, UK und Kanada ab; seit dem 13.05.2026 können neue Stores, die in der EU, in UK oder Kanada verkaufen, Basic Tax nicht mehr nutzen.*

*(tick one)*
- [ ] Shopify Tax
- [ ] Steuer-App
- [ ] Manuelle Tarife
- [ ] Noch unklar

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
- [ ] EU Import-One-Stop-Shop (IOSS)
- [ ] Britische MwSt. auf geringwertige Einfuhren
- [ ] Schweizer MwSt. auf geringwertige Einfuhren
- [ ] Norway VOEC
- [ ] Australische GST auf geringwertige Einfuhren
- [ ] Neuseeländische GST auf geringwertige Einfuhren
- [ ] Keine
- [ ] Noch unklar

**Q3.4.10** — Gibt es Produkte mit ermäßigten oder Nullsteuersätzen oder mit Steuerbefreiungen in einem Markt (z. B. Arzneimittel, Bücher, Lebensmittel, Kinderbekleidung)? *(recommended)*
*Die Sätze bestätigt die Finanzabteilung; Merkle erteilt keine Steuerberatung.*

- [ ] Yes
- [ ] No

**Q3.4.11** — Wer stellt die Rechnungen an die Kundschaft aus? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI.*
*Shopify kann MwSt.-Rechnungen für EU- und UK-Bestellungen erzeugen (auf der Bestellstatusseite sichtbar, nicht per E-Mail, nicht für Bestellungen mit Zöllen). Die kostenlose App Order Printer druckt Rechnungen aus Vorlagen. Rechnungen können auch aus dem ERP oder einer Rechnungs-App kommen.*

*(tick one)*
- [ ] MwSt.-Rechnungen von Shopify (EU und UK)
- [ ] Shopify Order Printer
- [ ] Rechnungs-App
- [ ] ERP
- [ ] Abrechnungs- oder Steuerdienst
- [ ] Noch unklar

**Q3.4.12** — Welche Pflichten zur elektronischen Rechnungsstellung (E-Invoicing) gelten für Ihre Umsätze? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU.*
*Zum Beispiel Peppol, XRechnung oder ZUGFeRD (Deutschland), Factur-X (Frankreich), SdI (Italien), KSeF (Polen) oder VeriFactu (Spanien). Shopify hat kein eingebautes E-Invoicing: Es kommt aus dem ERP oder einer Rechnungs-App.*

*(tick all that apply)*
- [ ] Peppol
- [ ] Deutschland: XRechnung oder ZUGFeRD
- [ ] Frankreich: Factur-X
- [ ] Italien: SdI
- [ ] Polen: KSeF
- [ ] Spanien: VeriFactu
- [ ] Anderes
- [ ] Keine
- [ ] Noch unklar

**Q3.4.13** — Wenn der Verkauf in einem Land bedeutete, sich dort steuerlich registrieren und Erklärungen abgeben zu müssen: Würden Sie das selbst übernehmen, oder wäre Ihnen lieber, ein Partner wäre für diese Bestellungen der rechtliche Verkäufer? *(recommended)*
*Why we ask: This decides who carries the tax and customs liability on cross-border orders. Keeping it yourself means registering, filing and remitting in each country; handing it to a partner removes that work and that risk, and costs a percentage of every international order.*
*Bitte für die Länder antworten, in die Sie verkaufen, in denen Sie heute aber nicht registriert sind.*

*(tick one)*
- [ ] Eigene Registrierungen
- [ ] Partner bevorzugt
- [ ] Gemischt
- [ ] Noch unklar

**Q3.4.14** — Wie verkaufen Sie über die Grenze: mit Shopify Markets und eigenen Steuerregistrierungen, mit Shopifys Managed Markets oder mit einer Merchant-of-Record-App eines Drittanbieters? *(recommended)*
*Ask if Q3.1.1 has 2+ markets.*
*Mit Markets verkaufen Sie in eigenem Namen und regeln die Steuern pro Land. Ein Merchant of Record verkauft in seinem Namen und übernimmt Steuern und Compliance für Sie. Shopifys Managed Markets (Global-e als Merchant of Record) steht nur Händlern mit Sitz in den kontinentalen USA und bestimmten Shops in Kanada und Grossbritannien offen — nicht einem Shop mit Sitz in der Schweiz.*

*(tick one)*
- [ ] Shopify Markets mit eigenen Steuerregistrierungen
- [ ] Shopify Managed Markets (Global-e als Merchant of Record)
- [ ] Merchant-of-Record-App eines Drittanbieters
- [ ] Noch unklar

### 3.5 Festlandchina

**Q3.5.1** — Möchten Sie grenzüberschreitend (von außerhalb Chinas) oder onshore, hinter der Großen Firewall, an das chinesische Festland verkaufen? *(required)*
*Only if the launch markets include mainland China (CN).*
*Der Onshore-Verkauf setzt eine Gesellschaft in der VR China, eine ICP-Registrierung oder -Lizenz und Hosting in China voraus.*

*(tick one)*
- [ ] Grenzüberschreitend, von außerhalb Chinas
- [ ] Onshore, hinter der Großen Firewall
- [ ] Beides
- [ ] Noch unklar

**Q3.5.2** — Welche Kanäle für das chinesische Festland? *(required)*
*Only if the launch markets include mainland China (CN).*
*Grenzüberschreitende Marktplätze (Tmall Global, JD Worldwide, Douyin Global, RED), ein WeChat-Mini-Programm, die eigene Website oder ein Hongkong-Store, der auf das Festland versendet.*

*(tick all that apply)*
- [ ] Tmall Global
- [ ] JD Worldwide
- [ ] Douyin Global
- [ ] RED (Xiaohongshu)
- [ ] WeChat-Mini-Programm
- [ ] Eigene Seite außerhalb Chinas
- [ ] Eigene Seite innerhalb Chinas
- [ ] Hongkong-Store mit Versand auf das Festland
- [ ] Noch unklar

**Q3.5.3** — Haben Sie eine juristische Person auf dem chinesischen Festland? *(required)*
*Only if the launch markets include mainland China (CN).*
*Erforderlich für eine ICP-Registrierung oder -Lizenz und für Onshore-Hosting.*

*(tick one)*
- [ ] Keine
- [ ] Unternehmen in ausländischem Alleinbesitz (WFOE)
- [ ] Joint Venture
- [ ] Repräsentanz
- [ ] Geplant

**Q3.5.4** — Haben Sie eine Gesellschaft in Hongkong oder anderswo im Ausland, die grenzüberschreitend verkaufen kann, und sind Ihre Marken in China eingetragen? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Grenzüberschreitende Marktplätze verlangen beides.*

- Overseas entity:
- Trademarks registered in china:

**Q3.5.5** — ICP-Status für eine China-Website? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Ihre Rechtsberatung in der VR China bestätigt, ob eine Registrierung genügt oder eine kommerzielle ICP-Lizenz nötig ist.*

*(tick one)*
- [ ] Keine
- [ ] ICP-Registrierung
- [ ] Kommerzielle ICP-Lizenz
- [ ] Über einen Partner
- [ ] Nicht erforderlich
- [ ] Noch unklar

**Q3.5.6** — Welche Rolle spielt Shopify für das chinesische Festland? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*Shopify kann global führend für Produkte, Bestände und Bestellungen bleiben, während China über lokale Kanäle verkauft.*

*(tick one)*
- [ ] Global führend für Produkte, Bestände und Bestellungen
- [ ] China-Kanal oder -Storefront
- [ ] Nicht beteiligt
- [ ] Noch unklar

**Q3.5.7** — Wie gelangen die Waren nach China: Zolllager (1210), Direktversand (9610), allgemeiner Handel oder Privatsendungen? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Grenzüberschreitende Kanäle haben Grenzen je Bestellung und je Jahr und Verbraucher.*

*(tick all that apply)*
- [ ] Zolllager (1210)
- [ ] Direktversand (9610)
- [ ] Allgemeiner Handel
- [ ] Privatsendungen
- [ ] Noch unklar

**Q3.5.8** — Stehen Ihre Produkte auf Chinas Positivliste für den grenzüberschreitenden E-Commerce? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] Alle auf der Liste
- [ ] Manche auf der Liste
- [ ] Keine auf der Liste
- [ ] Noch unklar

**Q3.5.9** — Wie sind Ihre Produkte in China eingestuft? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Aufhellende Produkte, Sonnenschutz und Mittel gegen Haarausfall gelten als besondere Kosmetika; Arzneimittel sind keine grenzüberschreitenden Waren.*

*(tick all that apply)*
- [ ] Gewöhnliche Kosmetika
- [ ] Besondere Kosmetika (z. B. aufhellend, Sonnenschutz)
- [ ] Arzneimittel
- [ ] Medizinprodukte
- [ ] Nahrungsergänzungsmittel
- [ ] Allgemeine Waren
- [ ] Noch unklar

**Q3.5.10** — Status der Registrierung oder Anmeldung bei Chinas Arzneimittelbehörde (NMPA)? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Der allgemeine Handel verlangt Registrierung oder Anmeldung; grenzüberschreitende Kanäle sind für Waren auf der Positivliste befreit.*

*(tick one)*
- [ ] Registriert
- [ ] Eingereicht
- [ ] In Arbeit
- [ ] Noch nicht begonnen
- [ ] Nicht erforderlich (grenzüberschreitender E-Commerce)
- [ ] Noch unklar

**Q3.5.11** — Müssen Produktaussagen für China geprüft werden (medizinische, kosmezeutische oder Behandlungsaussagen)? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*China lässt kosmezeutische oder medizinische Aussagen für Kosmetika nicht zu.*

- [ ] Yes
- [ ] No

**Q3.5.12** — Wie werden Kundinnen und Kunden auf dem Festland bezahlen? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Innerhalb des Marktplatzes, mit Alipay und WeChat Pay über ein Shopify-Payments-Konto in Hongkong (Early Access), über einen grenzüberschreitenden Wallet-Anbieter oder über inländische Händlerkonten (Gesellschaft in der VR China).*

*(tick all that apply)*
- [ ] Innerhalb des Marktplatzes
- [ ] Alipay / WeChat Pay über Shopify Payments (Hongkong)
- [ ] Grenzüberschreitender Wallet-Anbieter
- [ ] Inländische Händlerkonten (Gesellschaft in der VR China)
- [ ] Noch unklar

**Q3.5.13** — Wie viele Kundinnen und Kunden vom chinesischen Festland erwarten Sie pro Jahr? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Chinas Gesetz zum Schutz personenbezogener Daten sieht je nach Volumen unterschiedliche Pflichten beim Datenexport vor.*

*(tick one)*
- [ ] Unter 100.000
- [ ] 100.000 bis 1 Million
- [ ] Über 1 Million
- [ ] Noch unklar

**Q3.5.14** — Haben Sie in China eine vertretungsberechtigte Person für den Schutz personenbezogener Daten (PIPL)? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Erforderlich, wenn ein ausländisches Unternehmen Verbraucherinnen und Verbraucher in China anspricht.*

- [ ] Yes
- [ ] No

**Q3.5.15** — Wo werden die China-Kundendaten (CRM, E-Mail, Analytics) gespeichert? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] Innerhalb Chinas
- [ ] Außerhalb Chinas
- [ ] Beides
- [ ] Noch unklar

**Q3.5.16** — Müssen in China blockierte Skripte (Google Fonts, Google Analytics, reCAPTCHA, Meta-Pixel, YouTube) ersetzt werden? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*

- [ ] Yes
- [ ] No

**Q3.5.17** — Welche Marketingkanäle für China? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick all that apply)*
- [ ] KOL-/KOC-Influencer
- [ ] RED (Xiaohongshu)
- [ ] Douyin
- [ ] WeChat
- [ ] Baidu
- [ ] Tmall-Werbung
- [ ] Keine
- [ ] Noch unklar

**Q3.5.18** — Wer leistet den Kundenservice auf Chinesisch? *(optional)*
*Only if the launch markets include mainland China (CN).*

*(tick one)*
- [ ] Im eigenen Haus
- [ ] Partner
- [ ] Plattform
- [ ] Noch unklar

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
- [ ] Rechtsberatung des Kunden in der VR China
- [ ] Partner
- [ ] Noch nicht

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
- [ ] SEPA-Lastschrift oder Rechnung über ein Gateway
- [ ] Anderes
- [ ] Keine
- [ ] Noch unklar

**Q4.1.3** — Welche Buy-now-pay-later-Optionen, falls überhaupt? *(optional)*
*Shop Pay Installments steht Stores in den USA, Kanada und dem Vereinigten Königreich zur Verfügung.*

*(tick all that apply)*
- [ ] Shop Pay Installments
- [ ] Klarna über Shopify Payments
- [ ] Jetzt kaufen, später zahlen über ein anderes Gateway
- [ ] Keine
- [ ] Noch unklar

**Q4.1.4** — Brauchen Sie Auszahlungen in mehr als einer Währung? *(required)*

- [ ] Yes
- [ ] No

**Q4.1.5** — Werden Kartendaten ausschließlich vom Shopify-gehosteten Checkout verarbeitet, von einer gehosteten Zahlungsseite eines Drittanbieters, oder von einer eigenen Karten-Oberfläche bzw. Tokenisierung? *(required · consultant)*
*Kartendaten außerhalb des Shopify-gehosteten Checkouts erfordern eine eigene Sicherheitsprüfung.*

*(tick one)*
- [ ] Von Shopify gehosteter Checkout
- [ ] Gehostete Zahlungsseite eines Drittanbieters
- [ ] Eigene Kartenverarbeitung

**Q4.1.6** — Welche Express-Checkouts werden benötigt? *(recommended)*
*B2B-Checkout und Vorbestellungen unterstützen keine Express-Checkouts.*

*(tick all that apply)*
- [ ] Shop Pay
- [ ] Apple Pay
- [ ] Google Pay
- [ ] PayPal
- [ ] Amazon Pay
- [ ] Keine
- [ ] Noch unklar

**Q4.1.7** — Müssen Zahlungsarten je Markt, Kundentyp oder Warenkorb ausgeblendet, umbenannt oder umsortiert werden? *(recommended)*
*Erfordert eine App zur Zahlungsanpassung (Shopify Function).*

- [ ] Yes
- [ ] No

### 4.2 Checkout

**Q4.2.1** — Welche Änderungen am Checkout werden benötigt? *(required)*
*Der Shopify-Checkout wird über den Checkout-Editor und Checkout Extensibility angepasst (Blöcke, Felder, Logik über Functions). Eine vollständig eigene Checkout-Oberfläche ist auf Shopify nicht möglich.*

*(tick all that apply)*
- [ ] Branding im Checkout-Editor
- [ ] Blöcke auf der Dankes- und Bestellstatusseite
- [ ] Blöcke oder Felder in den Checkout-Schritten
- [ ] Gestaltung über die Checkout Branding API
- [ ] Backend-Logik (Shopify Functions)
- [ ] Vollständig eigene Checkout-Oberfläche
- [ ] Keine
- [ ] Noch unklar

**Q4.2.2** — Welche Checkout-Erweiterungen werden benötigt? *(optional · consultant)*
*Skip if Q4.2.1 = None.*

*(tick all that apply)*
- [ ] Eigene Felder
- [ ] Upsell-Block
- [ ] Geschenknachricht
- [ ] Vertrauenssiegel
- [ ] Einlösen von Prämien
- [ ] Anpassung der Zustellung
- [ ] Anpassung der Zahlungsarten
- [ ] Warenkorb- und Checkout-Validierung
- [ ] Adressprüfung
- [ ] Generator für Paketshops
- [ ] Keine
- [ ] Noch unklar

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
- [ ] Länder sperren
- [ ] Bestellwert min./max.
- [ ] Mengenbegrenzungen
- [ ] Beschränkungen nach Kundentyp
- [ ] Regeln zur Produktkombination
- [ ] Keine
- [ ] Noch unklar

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
- [ ] Im eigenen Haus
- [ ] Logistikdienstleister (3PL)
- [ ] Hybrid (DTC und B2B)

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
- [ ] Teillieferungen minimieren
- [ ] Im Markt bleiben
- [ ] Nächstgelegener Standort
- [ ] Priorisierte Standorte
- [ ] Standort-Metafelder
- [ ] Eigene Routing-Function
- [ ] Das ERP oder OMS entscheidet
- [ ] Noch unklar

**Q5.1.5** — Welche Carrier nutzen Sie? *(recommended)*

> Answer:

**Q5.1.6** — Wie werden die Versandkosten berechnet? *(required)*
*Pauschal, nach Gewicht oder Warenwert, kostenlos ab einer Schwelle, Live-Carrier-Tarife oder Tarife aus einer App.*

*(tick all that apply)*
- [ ] Pauschal
- [ ] Nach Gewicht oder Wert
- [ ] Kostenlos ab einer Schwelle
- [ ] Live-Carrier-Tarife
- [ ] Tarife aus einer App
- [ ] Noch unklar

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
- [ ] Standardversand
- [ ] Express
- [ ] Lokale Lieferung
- [ ] Abholung in der Filiale
- [ ] Paketshops
- [ ] Geplante Lieferzeitfenster
- [ ] Versand aus der Filiale
- [ ] Keine
- [ ] Noch unklar

**Q5.1.12** — Wie werden Versandlabels erstellt? *(optional)*

*(tick one)*
- [ ] Shopify Shipping
- [ ] System des 3PL
- [ ] Carrier-Software
- [ ] Versand-App

**Q5.1.13** — Haben alle Produkte korrekte Gewichte (und Packmaße), und woher stammen diese Daten? *(recommended)*
*Ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app.*
*Gewichtsbasierte und live berechnete Tarife, Versandlabels und manche Zollberechnungen brauchen Produktgewichte.*

*(tick one)*
- [ ] Aus dem PIM oder ERP
- [ ] In Shopify gepflegt
- [ ] Nur für manche Produkte
- [ ] Noch nicht verfügbar
- [ ] Noch unklar

**Q5.1.14** — Gelten einzelne Produkte als Gefahrgut im Versand? *(recommended)*
*Z. B. Aerosole (Sprays, manche Sonnenschutzmittel), entzündbare Flüssigkeiten (Parfüms, alkoholhaltige Produkte), Lithiumbatterien, Trockeneis. Sie brauchen in der Regel ein eigenes Versandprofil und eigene Carrier-Vereinbarungen.*

*(tick all that apply)*
- [ ] Aerosole
- [ ] Entzündbare Flüssigkeiten
- [ ] Lithiumbatterien
- [ ] Trockeneis
- [ ] Andere Gefahrstoffe
- [ ] Keine
- [ ] Noch unklar

**Q5.1.15** — Muss eine einzelne Bestellung jemals an mehr als eine Adresse gehen — Geschenke an mehrere Empfänger, oder eine Großhandelsbestellung, die auf Filialen aufgeteilt wird? *(recommended)*
*Etwas anderes, als wenn eine Bestellung in mehreren Paketen ankommt — das macht Shopify von selbst.*

- [ ] Yes
- [ ] No

### 5.2 Retouren & Umtausch

**Q5.2.1** — Fassen Sie die Retourenrichtlinie zusammen (Frist, Bedingungen, wer das Rücksendeporto trägt). *(recommended)*

> Answer:

**Q5.2.2** — Shopify bietet Retourenanfragen im Kundenkonto, gesteuert über Retourenregeln (Frist, Retourengebühr, Wiedereinlagerungsgebühr, endgültiger Verkauf). Reicht das? *(recommended)*

*(tick one)*
- [ ] Shopifys Selbstbedienungsretouren genügen
- [ ] Eine Retouren-App ist nötig
- [ ] Retouren nur durch Mitarbeitende
- [ ] Noch unklar

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
- [ ] Vorfrankiertes Label
- [ ] Abgabe per QR-Code
- [ ] Von der Kundschaft organisiert
- [ ] Gemischt

**Q5.2.8** — Wer trägt das Rücksendeporto: Sie, die Kundschaft, oder hängt es vom Markt ab? *(recommended)*

*(tick one)*
- [ ] Händler
- [ ] Kundschaft
- [ ] Hängt vom Markt ab

**Q5.2.9** — Welchen Umtausch bieten Sie an: dasselbe Produkt in einer anderen Variante, ein beliebiges anderes Produkt, oder zuerst Guthaben? *(optional)*
*Skip if Q5.2.3 = no.*
*Ask if Q0.2.6 is 500 or more.*
*Im Retourenformular von Shopify kann die Kundschaft keinen Umtausch wählen; Mitarbeitende fügen Umtauschartikel beim Genehmigen hinzu. Vom Kunden gewählter Umtausch braucht eine App.*

*(tick all that apply)*
- [ ] Dieselbe Produktvariante
- [ ] Beliebiges Produkt
- [ ] Zuerst Shop-Guthaben
- [ ] Keine
- [ ] Noch unklar

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
- [ ] E-Mail-Plattform (ESP)
- [ ] Gemischt

### 5.4 Stornierungen & Erstattungen

**Q5.4.2** — Sollen Kundinnen und Kunden Bestellungen selbst stornieren können? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Kundinnen und Kunden können im Konto die Stornierung nicht versandter Bestellungen beantragen; Sie genehmigen. Sofortige Stornierung ohne Genehmigung braucht eine App.*

- [ ] Yes
- [ ] No

**Q5.4.3** — Bis wann kann eine Bestellung storniert werden? *(recommended)*

*(tick one)*
- [ ] Keine Stornierungen
- [ ] Bis zum Versand
- [ ] Innerhalb von 15 Minuten
- [ ] Innerhalb von 1 Stunde
- [ ] Innerhalb von 24 Stunden
- [ ] Nur Mitarbeitende

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
- [ ] Ursprüngliches Zahlungsmittel
- [ ] Shop-Guthaben
- [ ] Geschenkkarte
- [ ] Noch unklar

**Q5.4.7** — Wann wird erstattet: auf Antrag, beim Scan des Carriers, bei Eingang oder nach Prüfung? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*Erstattungen beim Scan des Carriers brauchen eine Retourenplattform, die an die Sendungsverfolgung angebunden ist.*

*(tick one)*
- [ ] Auf Anfrage
- [ ] Beim Scan des Carriers
- [ ] Bei Eingang
- [ ] Nach Prüfung

**Q5.4.8** — Werden die ursprünglichen Versandkosten erstattet: immer, nur bei eigenem Verschulden, oder nie? *(optional)*

*(tick one)*
- [ ] Immer
- [ ] Nur bei eigenem Verschulden
- [ ] Nie

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
- [ ] E-Mail
- [ ] SMS
- [ ] WhatsApp
- [ ] Push
- [ ] Keine
- [ ] Noch unklar

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
- [ ] Ein anderes Kassensystem, angebunden
- [ ] Ein anderes Kassensystem, nicht angebunden
- [ ] Noch unklar

**Q5.6.3** — Welche Omnichannel-Services werden in der Filiale gebraucht? *(required)*
*Skip if Q5.6.1 = 0.*
*Abholung in der Filiale, Versand aus der Filiale, Retouren von Online-Bestellungen in der Filiale, Endless Aisle, Bestandstransfers, Filialpreise.*

*(tick all that apply)*
- [ ] Online kaufen, in der Filiale abholen
- [ ] Aus der Filiale an die Kundschaft versenden
- [ ] Retouren und Umtausch von Online-Bestellungen in der Filiale
- [ ] Endless Aisle (Bestellung in der Filiale)
- [ ] Shop-Guthaben und Geschenkkarten in der Filiale
- [ ] Bestandstransfers und -zählungen
- [ ] Filialpreise oder -kataloge
- [ ] Rollen und Berechtigungen der Mitarbeitenden
- [ ] Keine
- [ ] Noch unklar

**Q5.6.4** — In welchen Ländern liegen die Filialen? *(recommended)*
*Skip if Q5.6.1 = 0.*

> Answer:

---

## § 6 — Kundinnen und Kunden, B2B & Datenschutz

> Kundenkonten, B2B, Loyalty, Segmentierung und Pflichten zu personenbezogenen Daten.

### 6.1 Kundenkonten

**Q6.1.1** — Ist der Gastkauf der Standard, sind Konten optional, oder ist eine Registrierung Pflicht? *(recommended)*

*(tick one)*
- [ ] Gastkauf als Standard
- [ ] Optional
- [ ] Erforderlich

**Q6.1.3** — Was soll der Kontobereich enthalten (Bestellhistorie, Adressen, Retouren, Merkliste, Abos)? *(required)*

*(tick all that apply)*
- [ ] Bestellhistorie
- [ ] Nachbestellen
- [ ] Retourenanfragen
- [ ] Stornierungsanträge
- [ ] Shop-Guthaben
- [ ] Adressen
- [ ] Abo-Verwaltung
- [ ] B2B-Unternehmensstandorte
- [ ] Loyalty-Widget
- [ ] Merkliste
- [ ] Zusätzliche Profilfelder
- [ ] Keine
- [ ] Noch unklar

**Q6.1.4** — Wie sollen sich Kundinnen und Kunden anmelden? *(required)*
*Einmalcode per E-Mail sowie die Anmeldung über Google oder Facebook sind nativ.*

*(tick all that apply)*
- [ ] Einmalcode per E-Mail
- [ ] Anmeldung über Google oder Facebook
- [ ] Shop (Shop Pay)
- [ ] Unternehmens-Single-Sign-on (Identity Provider)
- [ ] Anmeldung von einer anderen Seite
- [ ] Noch unklar

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
- [ ] Zahlungsziele
- [ ] Fällig bei Versand
- [ ] Hinterlegte Karte
- [ ] ACH-Lastschrift (USA)
- [ ] Rechnung über einen Bestellentwurf
- [ ] Anzahlungen
- [ ] Teilzahlungen
- [ ] Zahlung je Versand
- [ ] Keine
- [ ] Noch unklar

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
- [ ] Nur eine B2B-App
- [ ] Eigener B2B-Expansion-Store
- [ ] Noch unklar

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
- [ ] Abos
- [ ] Lokale Lieferung oder Paketshops
- [ ] Express-Checkouts
- [ ] Mehr als 500 Positionen
- [ ] Geschenkkarten
- [ ] Keine
- [ ] Noch unklar

**Q6.2.13** — Welche Versandregeln unterscheiden sich für Geschäftskunden? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Standardmäßig sehen B2B- und Endkunden dieselben Versandarten. Abweichende Optionen brauchen Checkout Blocks, eine App oder eine Delivery-Customization-Function; Bestellungen können außerdem als Entwurf eingereicht werden, damit der Versand vor der Zahlung kalkuliert wird.*

*(tick all that apply)*
- [ ] Eigene Tarife oder Versandarten
- [ ] Kostenloser Versand ab einem Bestellwert
- [ ] Spedition oder Palettenzustellung
- [ ] Eigenes Carrier-Konto der Kundschaft
- [ ] Versand wird nach der Bestellung kalkuliert
- [ ] Keine
- [ ] Noch unklar

**Q6.2.14** — Wird das Großhandelsgeschäft von einem eigenen Team mit eigenen Zielen oder eigener Ergebnisrechnung geführt? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
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
- [ ] Punkte für Käufe
- [ ] Punkte für Aktionen
- [ ] VIP-Stufen
- [ ] Empfehlung
- [ ] VIP-Vorabzugang
- [ ] Abo-Rabatt
- [ ] Shop-Guthaben
- [ ] Keine
- [ ] Noch unklar

**Q6.3.2** — Wird Loyalty zum Launch gebraucht oder in einer späteren Phase? *(recommended)*

*(tick one)*
- [ ] Zum Launch
- [ ] Phase 2
- [ ] Keine

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
- [ ] E-Mail-Plattform (ESP)
- [ ] CDP
- [ ] Gemischt
- [ ] Keine

**Q6.3.7** — Welche Kunden-Tags steuern heute eigene Logik (Preise, Zugriff, Rabatte)? *(optional)*

> Answer:

### 6.4 Datenschutz & Einwilligung

**Q6.4.1** — Welche Datenschutzgesetze gelten für Ihre Kundschaft (DSGVO, UK GDPR, CCPA, Schweizer revDSG, andere)? *(required)*

*(tick all that apply)*
- [ ] DSGVO (EU)
- [ ] UK GDPR
- [ ] CCPA (USA)
- [ ] Schweizer revDSG
- [ ] Anderes
- [ ] Keine
- [ ] Noch unklar

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
- [ ] Anmeldung über das Kundenkonto
- [ ] Formulare und Pop-ups
- [ ] POS
- [ ] Keine
- [ ] Noch unklar

### 6.5 Customer service

**Q6.5.1** — Wo werden Kundenanfragen nach dem Launch beantwortet: Shopify Inbox, eine Helpdesk-App, ein Helpdesk außerhalb von Shopify, nur E-Mail, oder noch nirgends? *(required)*
*Shopify Inbox ist kostenlos und liegt im Admin. Ein Helpdesk wie Gorgias oder Zendesk zieht den Bestellkontext hinein und braucht dafür in der Regel eine gebaute Verbindung.*

*(tick one)*
- [ ] Shopify inbox
- [ ] Helpdesk app
- [ ] External helpdesk
- [ ] Email only
- [ ] Keine
- [ ] Noch unklar

**Q6.5.2** — Welcher Helpdesk, falls einer feststeht? *(recommended)*
*Der Produktname, keine Person.*

> Answer:

**Q6.5.3** — Wohin soll das Kontaktformular der Storefront zustellen: in ein E-Mail-Postfach, in den Helpdesk, in ein CRM — oder gibt es kein Formular? *(required)*
*Shopify-Themes bringen ein Kontaktformular mit, das E-Mails sendet. Alles andere ist eine Verbindung, die jemand baut und pflegt.*

*(tick one)*
- [ ] Email only
- [ ] Into the helpdesk
- [ ] Into a CRM
- [ ] Keine
- [ ] Noch unklar

**Q6.5.4** — Legt Ihr Team Bestellungen für Kundinnen und Kunden an — telefonisch, im Showroom oder für Großhandelskäufer? *(required)*
*In Shopify ist das ein Entwurfsauftrag: Das Team baut die Bestellung im Admin und schickt eine Rechnung zur Zahlung.*

- [ ] Yes
- [ ] No

**Q6.5.5** — Buchen Ihre Kundinnen und Kunden Termine bei Ihnen — im Geschäft, als virtuelle Beratung oder beides? *(recommended)*
*Ask if Q5.6.1 is 1 or more, or Q2.2.1 includes Virtual or Made to order, or Q0.3.1 mentions appointment, booking, consultation, fitting, showroom or reservation.*
*Buchung ist keine Shopify-Funktion, sondern eine App-Store-Kategorie, und die App hält den Kalender.*

*(tick one)*
- [ ] Termine im Geschäft
- [ ] Virtuelle Beratung
- [ ] Beides
- [ ] Keine
- [ ] Noch unklar

---

## § 7 — Marketing & Promotions

> SEO, Analytics, E-Mail, Bewertungen, Affiliates, Rabatte, Kampagnen und KI-gestützter Commerce.

### 7.1 SEO

**Q7.1.1** — Ist die organische Suche ein wesentlicher Traffic-Kanal? *(recommended)*

- [ ] Yes
- [ ] No

**Q7.1.2** — Werden eigene URL-Strukturen benötigt? *(optional)*

- [ ] Yes
- [ ] No

**Q7.1.3** — Wer verantwortet SEO? *(optional)*

*(tick one)*
- [ ] Im eigenen Haus
- [ ] Agentur
- [ ] Keine

**Q7.1.4** — Sollen die Produkte in KI-Einkaufsassistenten auffindbar sein? *(optional)*
*Shopify Catalog und agentische Kanäle (Spring '26).*

- [ ] Yes
- [ ] No

### 7.2 Analytics & Tracking

**Q7.2.1** — Welche Analytics-Plattformen nutzen Sie (GA4, Adobe, andere)? *(recommended)*

> Answer:

**Q7.2.2** — Wird serverseitiges Tracking benötigt? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.1.1 mentions conversion, tracking, attribution, advert, ads, roas or acquisition.*
*Shopifys Customer Events erfassen Shop und Checkout mit Einwilligung; die Apps Facebook & Instagram sowie Google & YouTube senden serverseitige Events. Alles darüber hinaus braucht eine Tracking-App. Serverseitige Events können Kundendaten an Werbeplattformen weitergeben (PII-Gate).*

- [ ] Yes
- [ ] No

**Q7.2.3** — Welche Werbe-Pixel werden benötigt (Meta, TikTok, Pinterest, Google Ads)? *(recommended)*

> Answer:

**Q7.2.4** — Ist bereits ein Tag Manager eingerichtet? *(recommended)*
*Tag Manager laufen in Shopify als Custom Pixel in einer Sandbox; Skripte im Checkout sind nicht mehr möglich.*

- [ ] Yes
- [ ] No

**Q7.2.5** — Welche eigenen Events müssen über die Standard-Commerce-Events hinaus erfasst werden? *(recommended)*

> Answer:

### 7.3 E-Mail & CRM

**Q7.3.1** — Welche E-Mail- oder CRM-Plattform nutzen Sie oder planen Sie: Shopify Messaging oder eine andere Plattform (bitte nennen)? *(recommended)*
*Shopify Messaging deckt Kampagnen und Automatisierungen per E-Mail, SMS und WhatsApp ab.*

- Type:
- Platform:

**Q7.3.2** — Welche automatisierten Strecken werden benötigt (Willkommen, abgebrochener Warenkorb, nach dem Kauf, Rückgewinnung)? *(recommended)*

> Answer:

**Q7.3.3** — Wo werden Kundensegmente geführt: in Shopify oder in der E-Mail-Plattform? *(recommended)*
*Das System, das die Segmente führt, ist das, in dem sie gebaut werden und aus dem das andere sie liest.*

*(tick one)*
- [ ] Shopify
- [ ] E-Mail-Plattform (ESP)

**Q7.3.4** — Versenden Sie SMS-Marketing, und in welche Länder? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.4.1 mentions sms, retention or repeat.*

- Enabled:
- Countries:

**Q7.3.5** — Versenden Sie WhatsApp-Marketing? *(optional)*
*In Shopify Messaging nativ.*

- [ ] Yes
- [ ] No

### 7.4 Bewertungen & Affiliates

**Q7.4.1** — Welche App für Produktbewertungen wird genutzt oder bevorzugt? *(optional)*
*Ask if Q1.2.1 is yes, or Q0.5.4 is not None.*
*Produktbewertungen brauchen eine App.*

> Answer:

**Q7.4.2** — Sind nutzergenerierte Inhalte wichtig (Kundenfotos, Social-Einbettungen)? *(optional)*

- [ ] Yes
- [ ] No

**Q7.4.3** — Welche Affiliate-Plattform, falls überhaupt? *(optional)*

> Answer:

**Q7.4.4** — Nutzen Sie Shopify Collabs für Influencer? *(optional)*
*Shopify Collabs nimmt keine neuen Creator-Anmeldungen an; Sie können Creator weiterhin einladen.*

- [ ] Yes
- [ ] No

**Q7.4.5** — Werden Affiliate- und Influencer-Umsätze über Rabattcodes, UTM-Parameter oder beides verfolgt? *(optional)*

*(tick one)*
- [ ] Rabattcodes
- [ ] UTM-Parameter
- [ ] Beides
- [ ] Keine

### 7.5 Rabatte & Gutscheincodes

**Q7.5.1** — Welche Rabattarten werden genutzt? *(recommended)*

*(tick all that apply)*
- [ ] Prozentsatz
- [ ] Fester Betrag
- [ ] Kaufe eins, erhalte eins (BOGO)
- [ ] Kostenloser Versand
- [ ] Mengenstaffel
- [ ] Automatisch
- [ ] Code-basiert
- [ ] Geplante Aktion
- [ ] Kombinierbar
- [ ] Nur Kassensystem
- [ ] Keine
- [ ] Noch unklar

**Q7.5.2** — Welche Rabatte müssen sich auf einer Bestellung kombinieren lassen? *(required)*
*Shopify kombiniert Produkt-, Bestell- und Versandrabatte nativ (bis zu 5 Codes plus 1 Versandcode und bis zu 25 automatische Rabatte). Eigene Logik braucht eine Discount Function.*

*(tick one)*
- [ ] Keine
- [ ] Shopifys native Kombinationen
- [ ] Mehrere Rabatte auf denselben Artikel
- [ ] Eigene Logik (Discount Function)

**Q7.5.3** — Sind Gutscheincodes einmalig, mehrfach nutzbar oder in Serie erzeugt? *(optional)*

*(tick all that apply)*
- [ ] Einmalig
- [ ] Mehrfach nutzbar
- [ ] In Serie
- [ ] Keine
- [ ] Noch unklar

**Q7.5.4** — Müssen Codes markenbezogen sein (z. B. WELCOME20)? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.5** — Brauchen Codes Mindestbestellwerte oder Mindestmengen? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.6** — Laufen Codes zu einem festen Datum ab, nach einem gleitenden Zeitraum, oder nie? *(optional)*

*(tick one)*
- [ ] Keine
- [ ] Fest
- [ ] Gleitend

**Q7.5.7** — Wie werden Codes verteilt (E-Mail, SMS, Print, Influencer)? *(optional)*

> Answer:

**Q7.5.8** — Unterscheiden sich Aktionen je Markt, Kundensegment, Vertriebskanal oder B2B-Unternehmen? *(recommended)*

*(tick all that apply)*
- [ ] Markt
- [ ] Kundensegment
- [ ] Nur Kassensystem
- [ ] B2B-Unternehmen
- [ ] Keine
- [ ] Noch unklar

### 7.6 Geschenkkarten & Kampagnen

**Q7.6.1** — Werden Geschenkkarten als Produkt verkauft? *(optional)*
*Geschenkkarten sind nativ: digitale Karten per E-Mail, physische Karten über das Kassensystem; sie verfallen standardmäßig nie. Deckt auch im Checkout akzeptierte Geschenkkarten ab.*

- [ ] Yes
- [ ] No

**Q7.6.2** — Werden Geschenkkarten als Prämie oder Entschädigung ausgegeben? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.3** — Digitale Geschenkkarten, physische oder beides? *(optional)*

*(tick one)*
- [ ] Digital
- [ ] Physisch
- [ ] Beides

**Q7.6.4** — Müssen Geschenkkarten verfallen? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.5** — Werden Aktionen aus E-Mail- oder SMS-Kampagnen ausgelöst? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.6** — Braucht jede Kampagne eine eigene Landingpage? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.7** — Werden Countdown-Timer oder Dringlichkeitselemente benötigt? *(optional)*
*Countdown-Timer brauchen eine App oder Theme-Arbeit.*

- [ ] Yes
- [ ] No

**Q7.6.8** — Unterscheiden sich Aktionen je Markt — eine Kampagne oder ein Rabatt, der nur in einem Land läuft? *(optional)*
*Ask if Q3.1.1 has 2+ markets.*

- [ ] Yes
- [ ] No

**Q7.6.9** — Fahren Sie geplante Drops oder Flash Sales mit hohem Traffic? *(optional)*
*Geplante Theme- und Checkout-Änderungen sind nativ (Rollouts).*

- [ ] Yes
- [ ] No

### 7.7 KI & agentischer Commerce

**Q7.7.1** — Möchten Sie, dass Ihre Produkte in KI-Assistenten wie ChatGPT, Google AI oder Copilot gefunden und gekauft werden können? *(recommended)*
*KI-Assistenten werden zu einem Verkaufskanal. Shopify schaltet geeignete Stores bereits standardmäßig frei — das ist also eine Entscheidung zu bestätigen oder zu widerrufen, keine zu vertagen.*

- [ ] Yes
- [ ] No

**Q7.7.2** — Soll Shopify Sie automatisch in neuen KI-Kanälen anmelden, sobald sie erscheinen, oder möchten Sie jeden einzeln freigeben? *(recommended)*
*Die Standardeinstellung meldet Sie auch in Kanälen an, die es noch gar nicht gibt.*

*(tick one)*
- [ ] Von Shopify verwaltet
- [ ] Je Kanal
- [ ] Aus
- [ ] Noch unklar

**Q7.7.3** — Sollen Kundinnen und Kunden im KI-Assistenten bezahlen können, oder sollen sie zum Bezahlen in Ihren Shop kommen? *(recommended)*
*Im Assistenten zu bezahlen konvertiert besser; sie in Ihren Shop zu schicken erhält die ganze Strecke, die Upsells und die Auswertung.*

*(tick one)*
- [ ] Alle Kanäle
- [ ] Ausgewählte Kanäle
- [ ] Aus
- [ ] Noch unklar

**Q7.7.4** — Verkaufen Sie an Kundinnen und Kunden in den Vereinigten Staaten? *(recommended)*
*Manche KI-Kanäle stehen nur Händlern offen, die an US-Käufer verkaufen, unabhängig vom Sitz des Unternehmens.*

- [ ] Yes
- [ ] No

**Q7.7.5** — Wer darf Shopifys Zusatzbedingungen für den Verkauf über KI-Kanäle akzeptieren? *(recommended)*
*Der Verkauf über diese Kanäle erfordert die Annahme gesonderter Bedingungen — üblicherweise durch die Rechts- oder Einkaufsabteilung, nicht durch das E-Commerce-Team.*

> Answer:

**Q7.7.6** — Sind Sie damit einverstanden, Name, E-Mail, Telefonnummer und Adresse der Kundschaft mit einem KI-Kanal zu teilen, wenn dort gekauft wird? *(recommended)*
*Das ist eine datenschutzrechtliche Entscheidung. Unter der DSGVO braucht sie in der Regel eine dokumentierte Prüfung vor dem Launch.*

*(tick one)*
- [ ] Genehmigt
- [ ] Abgelehnt
- [ ] Braucht eine rechtliche Prüfung

**Q7.7.7** — Wie vollständig sind Ihre Produktdaten — Titel, Bilder, Preise, Beschreibungen und Varianten? *(recommended)*
*KI-Kanäle listen nur Produkte mit vollständigen Daten. Lücken machen Produkte unsichtbar, nicht bloß schlecht dargestellt.*

*(tick one)*
- [ ] Vollständig
- [ ] Nur für manche Produkte
- [ ] Noch unklar

**Q7.7.8** — Stehen wichtige Produktinformationen in eigenen Feldern, getrennten Datensätzen oder im Produkttitel (zum Beispiel „Stahl 40 mm — Automatik“)? *(optional)*
*Daten in eigenen Feldern oder im Titel brauchen ein Mapping, bevor KI-Kanäle sie lesen können.*

- [ ] Yes
- [ ] No

**Q7.7.9** — Sollen KI-Crawler auf Ihrer Website erlaubt, eingeschränkt oder blockiert werden? *(optional)*
*Crawler zu blockieren entfernt Ihre Produkte nicht aus KI-Einkaufskanälen; es betrifft nur, was sie von Ihrer öffentlichen Seite lesen.*

*(tick one)*
- [ ] Alle erlauben
- [ ] Selektiv
- [ ] Blockieren
- [ ] Noch unklar

**Q7.7.10** — Möchten Sie steuern, welche Antworten KI-Assistenten zu Versand, Retouren und Größen geben? *(optional)*
*Shopify hat eine kostenlose App, die Ihre FAQ für Assistenten veröffentlicht und protokolliert, wonach gefragt wird.*

- [ ] Yes
- [ ] No

**Q7.7.11** — Planen Sie einen eigenen KI-Einkaufsassistenten oder die eigenständige Anbindung des Stores an Agentenplattformen? *(optional)*
*Teile davon sind bei Shopify noch im Early Access — behandeln Sie es als Erkundung, nicht als festen Umfang.*

*(tick one)*
- [ ] Jetzt
- [ ] Später
- [ ] Nein
- [ ] Noch unklar

**Q7.7.12** — Welche KI-Werkzeuge von Shopify soll Ihr Team im Tagesgeschäft nutzen? *(optional)*
*Das sind Backoffice-Werkzeuge für Ihr Team, nicht für die Kundschaft.*

*(tick all that apply)*
- [ ] Sidekick
- [ ] Shopify magic
- [ ] Semantische Suche
- [ ] Wissensdatenbank
- [ ] Keine
- [ ] Noch unklar

**Q7.7.13** — Bestehender Shopify-Store: Was zeigen die Einstellungen der agentischen Verkaufskanäle heute (Vertriebskanäle → Agentic)? *(recommended · consultant)*
*Skip if Q1.2.1 = no.*
*Sehen Sie gemeinsam mit dem Kunden in den Admin: Anmeldemodus, welche Kanäle an sind, und ob der Checkout innerhalb des Assistenten aktiviert ist.*

*(tick one)*
- [ ] Von Shopify verwaltet
- [ ] Je Kanal
- [ ] Aus
- [ ] Noch unklar

---

## § 8 — Integrationen & Migration

> Jedes System, das Daten mit dem Shop austauscht, und was von der heutigen Plattform mitkommt.

### 8.1 Angebundene Systeme

**Q8.1.1** — Listen Sie jedes System auf, das Produkt-, Bestands-, Bestell-, Kunden- oder Finanzdaten mit dem Store austauscht. Je System: System, Kategorie, Richtung, Datenobjekte, Frequenz, Konnektor (native App / iPaaS / eigen / keiner), verantwortliche Stelle, Status und ob es eine Testumgebung gibt, mit der wir uns vor dem Go-live verbinden können. *(required)*
*Typische Zuständigkeiten: Das PIM liefert Produkte, Attribute und Übersetzungen; das ERP liefert Preise (auch B2B-Kataloge), Bestände je Standort und Bestellstatus. Shopify braucht für Staging keine eigene Instanz, zu organisieren ist also nur Ihre Seite: Ein System ohne Testumgebung bedeutet, dass die Integration gegen Ihr Live-System getestet wird.*

| System | Category | Direction | Objects | Frequency | Connector | Middleware | Owner | Status | Daily updates | Latency minutes | Test environment |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

**Q8.1.2** — Gibt es eine Middleware-/iPaaS-Ebene oder eigene Konnektoren? *(optional)*

> Answer:

**Q8.1.3** — Wie oft ändern sich Preise und Bestände (Aktualisierungen pro Tag), und müssen Änderungen innerhalb von Minuten live sein? *(recommended)*
*Bemisst das Design der Synchronisation (Bulk Operations gegenüber Webhooks).*

- Daily updates:
- Latency minutes:

### 8.2 Datenmigration

**Q8.2.2** — Welche Daten müssen migriert werden? *(recommended)*
*Skip if Q0.5.4 = None.*
*Kundenpasswörter lassen sich nicht migrieren; die Anmeldung erfolgt über einen Einmalcode.*

*(tick all that apply)*
- [ ] Produkte
- [ ] Kundinnen und Kunden
- [ ] Bestellungen
- [ ] Inhalte
- [ ] Weiterleitungen
- [ ] Bewertungen
- [ ] Geschenkkarten
- [ ] Shop-Guthaben
- [ ] Metafelder und Metaobjekte
- [ ] B2B-Unternehmen
- [ ] Abo-Verträge
- [ ] Blogbeiträge und Seiten
- [ ] Keine
- [ ] Noch unklar

**Q8.2.3** — Ungefähre Mengen: Produkte, Kundinnen und Kunden, Bestellungen, URL-Weiterleitungen. *(required)*
*Skip if Q0.5.4 = None.*

- Products:
- Customers:
- Orders:
- Redirects:

**Q8.2.4** — Müssen historische Bestellungen in Shopify verfügbar sein? *(required)*
*Skip if Q0.5.4 = None.*

- [ ] Yes
- [ ] No

**Q8.2.5** — Wie viel SEO-Substanz (Rankings, Backlinks) muss erhalten bleiben? *(required · consultant)*
*Skip if Q0.5.4 = None.*

*(tick one)*
- [ ] Keine
- [ ] Mittel
- [ ] Erheblich

**Q8.2.6** — Müssen aktive Abos ohne erneute Karteneingabe der Kundschaft in den neuen Store umziehen? *(required)*
*Skip if Q0.5.4 = None.*

- [ ] Yes
- [ ] No

---

## § 9 — Design & Erlebnis

> Design-Quelle, Storefront-Ansatz, Barrierefreiheit und Performance.

### 9.1 Design-Input

**Q9.1.1** — Gibt es eine Figma-Datei oder ein Design-Mockup für den neuen Store? *(required)*

- [ ] Yes
- [ ] No

**Q9.1.2** — Wie vollständig ist es — nur Marke, Schlüsselseiten, oder jedes Template? *(required)*
*Skip if Q9.1.1 = no.*

*(tick one)*
- [ ] Keine
- [ ] Nur Marke
- [ ] Schlüsselseiten
- [ ] Alle Templates

**Q9.1.3** — Enthält die Figma-Datei ein vollständiges Designsystem (Tokens und Komponenten)? *(required)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.4** — Ist das Design auf Shopify-Abschnitte und -Blöcke abgebildet? *(optional · consultant)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.5** — Wird ein vollständig eigenes Design verlangt statt eines Themes mit Markenanpassung? *(recommended)*

- [ ] Yes
- [ ] No

**Q9.1.6** — Wie viele eigens gestaltete Abschnitte oder Blöcke braucht der Storefront über die des Themes hinaus? *(recommended)*
*Ein Abschnitt, der für Sie entworfen und gebaut wird — nicht einer der Abschnitte des Themes, nur konfiguriert. Zählen Sie die unterschiedlichen, nicht wie viele Seiten sie verwenden.*

> Answer:

### 9.2 Storefront

**Q9.2.1** — Wird ein Headless-Storefront benötigt (Hydrogen, ein anderes Framework oder das Frontend einer nativen App)? *(required)*
*Headless heißt ein eigenes Frontend auf Shopify; der Checkout bleibt der Shopify-Checkout.*

- [ ] Yes
- [ ] No

**Q9.2.2** — Gibt es eine Theme-Lizenz, die erhalten bleiben soll? *(optional)*
*Neubauten starten von Shopifys Horizon-Theme; eine Drittanbieter-Theme-Lizenz zählt nur bei einer Nicht-Horizon-Basis.*

> Answer:

**Q9.2.3** — Welche ästhetische Richtung (minimal, redaktionell, Luxus, verspielt, funktional)? *(optional)*

> Answer:

**Q9.2.4** — Welche interaktiven Muster werden gebraucht (Mega-Menü, Schnellkauf, Farbfelder, vorausschauende Suche, Lookbook, Video-Hero)? *(required)*

*(tick all that apply)*
- [ ] Mega-Menü
- [ ] Vorausschauende Suche
- [ ] Varianten-Farbfelder
- [ ] Schnellkauf
- [ ] Combined listings
- [ ] Filter
- [ ] Schnellbestellliste und Mengenpreise
- [ ] Merkliste
- [ ] Filialfinder
- [ ] Lookbook
- [ ] Video-Hero
- [ ] Keine
- [ ] Noch unklar

**Q9.2.5** — Werden eigene Bewegung oder Animationen benötigt? *(recommended)*

- [ ] Yes
- [ ] No

**Q9.2.6** — Warum Headless? *(required)*
*Skip if Q9.2.1 = no.*
*Hilft zu prüfen, ob Theme Blocks in Horizon genügen würden.*

*(tick all that apply)*
- [ ] UX im Theme nicht umsetzbar
- [ ] Performance
- [ ] Bestehendes CMS oder Content-Plattform
- [ ] Native mobile App
- [ ] Mehrere Frontends, ein Backend
- [ ] Kontrolle über die URL-Struktur
- [ ] Anderes
- [ ] Noch unklar

**Q9.2.7** — Hosting für Headless? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Oxygen (Hosting von Shopify)
- [ ] Selbst gehostete JavaScript-Laufzeit
- [ ] Noch unklar

**Q9.2.8** — Wo werden die redaktionellen Inhalte für den Headless-Storefront gepflegt? *(recommended)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Shopify metaobjects
- [ ] Headless CMS
- [ ] PIM
- [ ] Noch unklar

**Q9.2.11** — Welches Frontend: Shopify Hydrogen oder ein anderes Framework? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] Hydrogen
- [ ] Other framework
- [ ] Noch unklar

**Q9.2.9** — Welche Plattformfunktionen werden für Headless benötigt? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick all that apply)*
- [ ] Kundenkonten (Customer Account API)
- [ ] Markets und Sprachrouten
- [ ] Geschäftskunden (B2B)
- [ ] Abos
- [ ] Bundles und Combined Listings
- [ ] Analytics und Einwilligung von Shopify
- [ ] Mehrere Storefronts
- [ ] Keine
- [ ] Noch unklar

**Q9.2.10** — Möchten Sie Themes oder Checkout-Konfigurationen A/B-testen? *(required)*
*Nativ über Experimente in Shopify Rollouts.*

- [ ] Yes
- [ ] No

**Q9.2.12** — Möchten Sie in Shopifys Shop-App präsent sein — mit einem Shop Mini? *(recommended)*
*Ein bildschirmfüllendes Einkaufserlebnis innerhalb der Shop-App. Es ist weder eine eigene App noch eine Headless-Storefront.*

*(tick one)*
- [ ] Jetzt
- [ ] Später
- [ ] Nein
- [ ] Noch unklar

**Q9.2.13** — Wie viele Storefronts brauchen über die erste hinaus ein wirklich anderes Design — ein anderes Layout und einen anderen Seitenaufbau, nicht andere Inhalte, Bilder oder Übersetzungen? *(recommended)*
*Andere Inhalte, Bilder und Übersetzungen pro Markt sind in jedem Angebot enthalten. Ein anderes Design ist ein zweites Theme, und das ist etwas anderes: Shopifys Anpassung pro Markt reicht bis Section-Inhalte, Sichtbarkeit und Reihenfolge von Blöcken sowie Section-Einstellungen — nie bis zu Theme-Einstellungen und nie bis zu Liquid-Templates. Antworten Sie 0, wenn ein Design für alle Märkte und Stores reicht.*

> Answer:

**Q9.2.14** — Braucht jede Marke ein eigenes Design-System — eigene Tokens und Komponenten — statt eines Design-Systems mit einem Theme pro Marke? *(recommended)*
*Ask if Q1.1.8 is 2 or more.*
*Ein Design-System kann mehrere Marken tragen: dieselben Komponenten, mit Farben, Typografie und Bildsprache jeder Marke als Tokens, und einem anderen Layout, wo eine Marke eines braucht. Ein Design-System pro Marke bedeutet getrennte Tokens und Komponenten, getrennt gestaltet und gepflegt.*

- [ ] Yes
- [ ] No

### 9.3 Barrierefreiheit

**Q9.3.1** — Welcher Barrierefreiheitsstandard gilt? *(required)*
*Shopifys Checkout wird gegen WCAG 2.2 AA geprüft; Theme und Apps liegen in Ihrer Verantwortung (z. B. nach dem European Accessibility Act).*

*(tick one)*
- [ ] WCAG 2.1 AA
- [ ] WCAG 2.2 AA
- [ ] EN 301 549
- [ ] Section 508
- [ ] Keine

**Q9.3.2** — Wurde die aktuelle Seite auf Barrierefreiheit geprüft? *(optional)*

- [ ] Yes
- [ ] No

### 9.4 Performance

**Q9.4.1** — Zielwerte für die Core Web Vitals: LCP (Sekunden), CLS, INP (Millisekunden). *(optional)*

- Lcp s:
- Cls:
- Inp ms:

**Q9.4.2** — Ist die Seitengeschwindigkeit heute ein bekanntes Problem? *(recommended)*
*Shopifys Web-Performance-Bericht zeigt die Core Web Vitals des aktuellen Stores.*

- [ ] Yes
- [ ] No

**Q9.4.3** — Welche Drittanbieter-Skripte müssen geladen werden (Chat, Personalisierung, Heatmaps)? *(optional)*

> Answer:

---

## § 10 — Umsetzung, Steuerung & Compliance

> Zeitplan, Entscheidungswege, Support, Recht und Projektwerkzeuge.

### 10.1 Zeitplan

**Q10.1.1** — Was ist der angestrebte Go-live-Termin? *(required)*
*Ein Termin, der früher liegt als die Lieferzeit, die der Umfang braucht, führt zu einem phasenweisen Plan nach dem MVP-Prinzip.*

> Answer:

**Q10.1.2** — Woraus ergibt sich der Termin (Hochsaison, Produktlaunch, Vertragsende)? *(recommended)*

> Answer:

**Q10.1.3** — Ist ein phasenweiser Launch geplant? *(optional)*

- [ ] Yes
- [ ] No

**Q10.1.4** — Gewünschter Kick-off-Termin für das Projekt. *(recommended)*

> Answer:

### 10.2 Team & Entscheidungen

**Q10.2.1** — Wer ist auf Kundenseite beteiligt? Je Person: Rolle, RACI (R/A/C/I), entscheidungsbefugt (ja/nein). Namen sind optional. *(required)*

| Role | Raci | Decision maker | Name |
|---|---|---|---|
| | | | |

**Q10.2.2** — Gibt es eine einzige entscheidungsbefugte Person für Umfang, Freigaben und Rückmeldungen? *(required · consultant)*
*Eine einzige entscheidungsbefugte Person muss vor dem Leistungsschein benannt sein.*

- [ ] Yes
- [ ] No

**Q10.2.3** — Ist klar, wer das Budget freigeben darf? *(required · consultant)*

- [ ] Yes
- [ ] No

**Q10.2.4** — Welche Rollen betreiben den Shop im Alltag — zum Beispiel Merchandising, Kundendienst, Finanzen, Marketing — mit jeweils eigenen Mitarbeiterberechtigungen? *(recommended)*
*Rollen, keine Namen. Jede Rolle erhält eigene Berechtigungen statt eines gemeinsamen Logins.*

> Answer:

### 10.3 Support & Schulung

**Q10.3.1** — Welche Schulungen werden benötigt (Produkte, Bestellungen, Rabatte, Auswertungen)? *(optional)*

> Answer:

**Q10.3.2** — Werden schriftliche Arbeitsanweisungen benötigt? *(optional)*

- [ ] Yes
- [ ] No

**Q10.3.3** — Welches Supportmodell nach dem Launch wird erwartet? *(recommended)*

*(tick one)*
- [ ] Nur Hypercare
- [ ] Retainer
- [ ] Eigenständig
- [ ] Drittanbieter

**Q10.3.4** — Ist der Grow-Retainer unterschrieben? *(required · consultant)*

- [ ] Yes
- [ ] No

**Q10.3.5** — Laufzeit des Retainers in Monaten. *(recommended · consultant)*
*Skip if Q10.3.4 = no.*

> Answer:

**Q10.3.6** — Wird der Kunde Apps und Shopify-Funktionen nach dem Launch bei jeder Shopify Edition neu prüfen? *(optional · consultant)*

- [ ] Yes
- [ ] No

**Q10.3.7** — Wie viele Arbeitstage Hypercare brauchen Sie nach dem Go-live? *(recommended)*
*Hypercare ist die Zeit direkt nach dem Go-live: ein benannter Kanal, eine Antwort innert eines Arbeitstags und die Triage der Fehler mit Ihnen. Eine bestimmte Anzahl Tage ist im Angebot enthalten; antworten Sie nur, wenn Sie mehr brauchen.*

> Answer:

### 10.4 Recht & regulierte Branchen

**Q10.4.1** — Ist das Geschäft in einer regulierten Branche tätig (Pharma, Alkohol, Waffen, altersbeschränkte Waren, Finanzprodukte, Medizinprodukte)? Falls ja, in welcher? *(required)*
*Eine regulierte Branche erfordert eine rechtliche Prüfung. Shopify hat eigene Regeln: Alkohol braucht zum Beispiel eine Altersprüfung; manche Geschäftsarten können Shopify Payments nicht nutzen.*

- Active:
- Category:

**Q10.4.2** — Sind die Rechtstexte (AGB, Datenschutz, Cookies, Retouren) fertig, aktualisierungsbedürftig oder noch zu erstellen? *(recommended)*

*(tick one)*
- [ ] Fertig
- [ ] Muss aktualisiert werden
- [ ] Muss erstellt werden

**Q10.4.3** — Gibt es weitere branchenspezifische Compliance-Anforderungen? *(optional)*

> Answer:

**Q10.4.4** — Sind Geschäft und Sortiment für Shopify Payments zulässig (keine eingeschränkten oder verbotenen Kategorien)? *(required · consultant)*

- [ ] Yes
- [ ] No

### 10.5 Projekt-Setup (Consultant)

**Q10.5.1** — Lead Consultant. *(required · consultant)*

> Answer:

**Q10.5.2** — Hat der Kunde zugestimmt, dass die Antworten von der KI-Discovery-Engine verarbeitet werden dürfen (keine personenbezogenen Kundendaten enthalten)? *(required · consultant)*
*ADR 0007 — die Engine verweigert den Betrieb ohne erfasste Einwilligung.*

- [ ] Yes
- [ ] No

**Q10.5.3** — Jira-Instanz und Projektschlüssel für das Backlog. *(recommended · consultant)*

- Site:
- Project key:

**Q10.5.4** — Zu verwendende Jira-Komponenten. *(optional · consultant)*

> Answer:

---

## Checkliste zur Vollständigkeit

- [ ] Jede *erforderliche* Frage in §§ 0–10 hat eine Antwort oder „TBC“
- [ ] Mindestens ein KPI hat einen Ausgangswert und einen Zielwert (Q0.4.2)
- [ ] Jedes angebundene System ist in Q8.1.1 mit Richtung und Konnektor aufgeführt
- [ ] Einwilligung in die KI-Verarbeitung ist erfasst (Q10.5.2)
