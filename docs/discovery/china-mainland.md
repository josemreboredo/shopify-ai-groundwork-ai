# Mainland China — separate China discovery

- **Audience:** Merkle lead consultants (internal). Not legal advice: PRC licensing, customs and product-registration
  questions must be confirmed with PRC counsel before scoping.
- **Status:** research briefing, checked 2026-09-17 against Shopify documentation, PRC regulator publications and public
  business cases. Evidence labels: **[O]** official (Shopify, PRC regulator or the vendor's own product docs),
  **[S]** reputable secondary, **[S-v]** secondary written by a vendor selling the solution, **[I]** inference.
- **Owner decision (2026-09-17):** mainland China is **not part of the Merkle offering** and needs its own China discovery.

## How the discovery tool handles mainland China

| Situation | Rule | Effect |
|---|---|---|
| Mainland China (`CN`) is one of several launch markets | **11.20 FLAG** | CN is excluded from markets, languages, offer, Shopify plan and build stories; the approach adds one task "Separate China discovery"; the deck marks CN as a separate discovery |
| Mainland China is the only launch market | **11.21 STOP** | Discovery stops; route to the China discovery (Larger Engagement or no bid) |
| Hong Kong SAR, Macao SAR, Taiwan | — | Separate markets, not mainland China; handled by the normal offer rules |

When CN is a launch market, the questionnaire and the interview add **§ 3.5 Mainland China**, drawn from the checklist in
section 6; without CN these questions are not asked. The discovery call only triages China with 4 required questions
(selling model, channels, legal entity in China, who gives PRC legal advice); the other 17 are optional and are covered
in a full interview or the separate China discovery session. The answers are stored
in `engagement.china` and shown in the Larger Engagement brief and in deck section 18.

## What "behind the wall" means with Shopify — read this first

Selling **onshore** to mainland consumers (a storefront hosted inside mainland China, behind the Great Firewall) needs a
PRC-registered entity, an ICP filing or licence (per PRC counsel) and onshore hosting [O Order 292; O Alibaba Cloud ICP].
**Shopify does not operate inside mainland China:** "Shopify's servers aren't located in mainland China, so connection
speeds might vary" [O, verified]; its China guides are written for merchants operating from mainland China or Hong Kong SAR
who sell abroad [O, verified]; Cloudflare proxy set-ups in front of Shopify "aren't supported" [O, verified]. We found **no
public case of a Shopify storefront running behind the Great Firewall**. In practice, "behind the wall" therefore means a
**separate onshore platform or marketplace channels**, with Shopify as the global platform and, at most, the source of
products, inventory and orders — see the options in section 4. The China discovery must first establish whether the client
wants **cross-border** selling (offshore, options A, B, C, F) or **onshore** selling behind the wall (options D, E).

---

## 1. Summary for consultants

1. **Shopify doesn't offer an in-China ("onshore") platform.** Shopify says its "servers aren't located in mainland China, so connection speeds might vary". Its "Selling in China" guides are written mainly for **China-based merchants who export**, not for brands selling *into* the mainland [O, help.shopify.com sell-in-china pages].
2. **Shopify Payments isn't available to mainland entities.** Mainland merchants must use third-party gateways. Shopify Payments **Hong Kong SAR** offers UnionPay cards and, in early access, **Alipay and WeChat Pay** (customers see CNY; no card-style chargebacks) [O]. Macao and Taiwan are not on the Shopify Payments country list [O].
3. **Hosting in the mainland triggers ICP obligations.** An ICP filing (备案) is required when a domain resolves to a server in mainland China. It can only be obtained by a **PRC-registered entity** (a WFOE is enough for a filing). Hong Kong hosting does not need one [O Alibaba Cloud; S]. After the filing, a public-security (公安) filing is due within 30 days [O/S].
4. **Filing or commercial licence? Sources disagree for a brand selling its own goods.** One PRC law firm cites a 2010 MOFCOM notice that a filing is enough. Dezan Shira (China Briefing) and PTS say a commercial ICP licence is needed for monetised sites. Marketplaces also need an EDI (B21) licence. Foreign ownership of licensed businesses was capped at 50%. Since April 2024, 100% foreign ownership is allowed in Beijing, Shanghai (Lingang/Pudong), Shenzhen and Hainan pilots [O MIIT via S]. **Confirm with PRC counsel.**
5. **Shopify can't legitimately sit behind an onshore CDN or proxy on its own.** Onshore CDNs (e.g. Cloudflare China Network via JD Cloud) require an ICP number and content vetting [O Cloudflare]. Shopify says Cloudflare proxy setups, including O2O, "aren't supported" [O]. Vendors such as Chinafy and 21YunBox sell an "optimisation layer" in front of Shopify, some holding the ICP filing on that layer; Shopify does not endorse this [S-v].
6. **Headless with an onshore front end is possible in theory, but no public case was found.** Shopify's Storefront API and checkout stay offshore. The cart's `checkoutUrl` "redirects customers through Shopify's web checkout" [O shopify.dev]. We found **no public case study** of an ICP-licensed onshore storefront running on the Storefront API. Merchants reported in early 2024 that Shopify URLs were intermittently inaccessible from China; Shopify support blamed "third parties" [S community]. Treat this as high risk [I].
7. **Most documented foreign-brand volume goes through cross-border e-commerce (CBEC) channels.** Tmall Global, JD Worldwide, Douyin Global, RED and WeChat mini-programs run in two customs modes: 1210 (bonded warehouse) and 9610 (direct mail). CBEC goods are treated as personal-use items and are **exempt from first-import registration or filing** (e.g. NMPA cosmetics registration). Conditions: the product is on the **positive list** and within the **RMB 5,000 per-order / RMB 26,000 per-year** limits [O MOFCOM 2018 No.486; MOF 2018 No.49].
8. **Shopify's China marketplace connectors are thin today.** The Shopify x JD.com "JD Marketplace" channel (Jan 2022, US merchants) shows **"not currently available"** on the Shopify App Store [O apps.shopify.com, checked 2026-09-17]. The listings that do exist are the WalktheChat WeChat Connector and the WalktheChat Marketplace app (WeChat, Tmall, RED, Douyin), plus JD SHIPPING logistics apps [O listings].
9. **Data (PIPL) applies even when everything is offshore.** PIPL applies to offshore processing aimed at people in China (Art. 3). Offshore handlers must appoint a PRC representative (Art. 53). Cross-border transfers need separate consent (Art. 39). The 2024 CAC Provisions exempt transfers "necessary to conclude/perform a contract" such as **cross-border shopping**. Security assessment is required above 1m people (or 10k for sensitive data) [O].
10. **The demo client is a pharmaceutical skin-care brand, which is high risk.** The NMPA says "药妆" (cosmeceutical) or "medical skincare" claims are **illegal** for cosmetics. Cosmetics labels and ads may not state or imply medical effects [O CSAR Art. 37/43; Advertising Law Art. 17]. Whitening, sunscreen and anti-hair-loss products are "special cosmetics" needing NMPA registration via general trade [O CSAR Art. 16]. Real medicines are not CBEC goods, except a Henan pilot for 13 OTC drugs (2021) [O gov]. Shopify Managed Markets prohibits OTC medicines and "products that make medicinal or health claims" [O].

---

## 2. Shopify and mainland China: what Shopify documents

### 2.1 Selling to China from Shopify

| Topic | What Shopify says | Level | Source |
|---|---|---|---|
| Audience of the China guides | The "Selling in China" section covers store setup, payments, legal and compliance for "China exporters", and cross-border fulfilment. It is aimed at merchants **based in** mainland China or Hong Kong SAR who sell abroad. | O | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china ; https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-legal-policies (no date shown) |
| Server location / speed | "Shopify's servers aren't located in mainland China, so connection speeds might vary." | O | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do |
| Blocked fonts | "Firewalls in China frequently block requests to Google Fonts, which can cause slow page loads, font display issues, or timeouts". Google Fonts' CDN "is often inaccessible from mainland China". Use web-safe or Monotype fonts. | O | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/online-store-setup |
| ICP | Only: "If you need a `.cn` domain, then additional ICP (Internet Content Provider) filing requirements might apply." No further ICP guidance. | O | same as above |
| Unsupported countries | Shopify's unsupported list is Cuba, Iran, North Korea, Syria, Crimea, and the so-called Donetsk and Luhansk People's Republics. **China, Hong Kong, Macao and Taiwan are not on it.** | O | https://help.shopify.com/en/manual/compliance/legal/unsupported-countries-and-regions |
| Proxies / CDNs in front of Shopify | "Cloudflare proxy setups, including O2O, aren't supported by Shopify." Reasons: SSL (ACME) failures, lost resiliency, weaker bot detection, and a setup that "could break at any time"; issues are "outside the scope of Shopify Support". | O | https://help.shopify.com/en/manual/domains/troubleshoot-issues-with-domains |
| Checkout field for China | Changelog, 2020-10-14: customers in China can enter a **Resident ID number** at checkout (for customs, labels, invoices). | O | https://changelog.shopify.com/posts/country-fields-in-checkout-for-customers-in-china-italy-and-south-korea |
| Headless checkout | Storefront API cart `checkoutUrl`: "a URL that redirects customers through Shopify's web checkout". | O | https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage |
| Where data is processed | APAC merchants contract with Shopify Commerce Singapore Pte. Ltd. Onward transfers go to countries where Shopify, its affiliates or subprocessors operate (including Canada and Singapore, per the search summary). Nothing mentions PRC or PIPL. | O | https://help.shopify.com/en/manual/privacy-and-security/privacy/international-data-transfers/contracting-entities ; https://help.shopify.com/en/manual/privacy-and-security/privacy/international-data-transfers/onward-transfers |

### 2.2 Payments

| Topic | What Shopify says | Level | Source |
|---|---|---|---|
| Mainland merchants | Mainland merchants cannot use Shopify Payments and must use third-party providers. "If you're a mainland China resident, then you can't register as an individual or sole proprietorship for Shopify Payments. You must have a Hong Kong SAR corporation, partnership, or non-profit entity", with physical operations in Hong Kong. No provider names are given. | O | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/set_up_payments |
| Shopify Payments countries | Hong Kong SAR is listed. Mainland China, Macao and Taiwan are **not** listed. | O | https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries |
| Hong Kong SAR payment methods | Cards: Amex, Mastercard, **UnionPay**, Visa. Wallets: Apple Pay, Google Pay, Shop Pay. Local methods: **Alipay** ("any country") and **WeChat Pay** ("any country"), among others. | O | https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/hong-kong/payment-methods |
| Alipay via Shopify Payments | Requirements: a Hong Kong SAR Shopify Payments account, eligible category, public store. **Early access.** Customers see **CNY**; merchant is paid in the payout currency. One-time payments only. No card-style chargebacks. Review takes about 5 days. | O | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/alipay |
| WeChat Pay via Shopify Payments | Hong Kong SAR account only; early access; CNY shown to customers. Not for subscriptions or gift cards. No chargebacks. Transaction limits are set by WeChat Pay. | O | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/wechat-pay |
| Alipay gateway (history) | 2020-11-17: Shopify–Alipay partnership launched an Alipay gateway for **US** merchants, with Hong Kong and other markets "to come". Whether that US gateway still exists today was **not verified**. | O | https://www.shopify.com/news/a-world-of-opportunity-shopify-launches-partnership-with-alipay-to-help-merchants-access-new-global-consumers |
| Antom (Ant International) plugins | Two Shopify plugins. "Antom Payments (Ant Intl)" is for merchants in **Hong Kong SAR and Singapore only**; the credit card plugin (including UnionPay) covers HK, SG, US, EU and UK. Docs updated 2026-08-26. | O (vendor) | https://docs.antom.com/ac/plugins/shopify |
| WeChat Pay cross-border (Tencent) | Institutional, direct (Hong Kong and UK only) and service-provider access modes; settlement in 16 foreign currencies. Taken from the search summary; the page was not fetched in full. | O (vendor), partially verified | https://act.weixin.qq.com/static/merchant_overseas/faq_en.html |

### 2.3 Markets and Managed Markets

| Topic | What Shopify says | Level | Source |
|---|---|---|---|
| Merchant eligibility | Business based in the continental US, Canada or the UK. Requires Shopify Payments. | O | https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations |
| Destinations | "China", "Hong Kong", "Macao" and "Taiwan, Province of China" appear under "Compatible countries and regions with Managed Markets" (fetched page; no date). | O | same |
| Order cap and prohibited items | Maximum order value to China is **¥10,000 CNY**. Prohibited: OTC and prescription medicines, supplements, and "products that make medicinal or health claims". Some lotions and creams are restricted in certain regions; China is not named for that restriction. | O | https://help.shopify.com/en/manual/international/managed-markets/prohibited-items |
| Caveat | Managed Markets (Global-e as merchant of record) is a **direct-mail cross-border** model. Nothing in Shopify's docs says it solves storefront access behind the firewall, CBEC positive-list or registration compliance, or PIPL. | I | — |

### 2.4 Shopify programmes and apps for China

| Item | Finding | Level | Source |
|---|---|---|---|
| Shopify x JD.com (2022-01-18) | "JD Marketplace" sales channel for **US merchants** to list on **JD Worldwide** (CBEC). JD handles fulfilment from US warehouses. "3–4 weeks" to start selling. | O | https://www.shopify.com/news/shopify-and-jd-com-unlock-world-s-largest-ecommerce-market-for-merchants ; https://jdcorporateblog.com/jd-com-and-shopify-ink-strategic-partnership-to-simplify-cross-border-e-commerce/ |
| JD Marketplace app today | Listing page says **"This app is not currently available on the Shopify App Store."** JD.COM's partner page lists only **JD SHIPPING** and **JD SHIPPING EU** (logistics). No sunset notice was found. | O (listing, checked 2026-09-17) | https://apps.shopify.com/jd-marketplace ; https://apps.shopify.com/partners/jd-worldwide |
| JD guide for Shopify merchants | JD's page: sync products from Shopify admin → auto-translation → China Customs product filing (2–5 day review) → publish. | O (JD) | https://www.jd.hk/channelGuidePage/UdWaVaW6UdV4U9T4.html |
| WalktheChat WeChat Connector | Listed. Developer based in Beijing. Launched 2020-05-05; 7 reviews. Builds a WeChat mini-program synced with Shopify (products, inventory, orders); payments from Chinese customers. Paid monthly plan plus a one-time verification fee. | O (listing) | https://apps.shopify.com/walkthechat-wechat-connector |
| WalktheChat Marketplace | Listed. Launched 2022-09-06; 0 reviews. Connects Shopify to "WeChat, Tmall, Red, Douyin, etc." | O (listing) | https://apps.shopify.com/walkthechat-marketplace |
| Shopify blog on WeChat | Shopify blog (Thomas Graziani, 2022-12-09) describes cross-border WeChat shops synced with Shopify and cites Botkier. | O (Shopify blog; author's affiliation not checked) | https://www.shopify.com/blog/sell-on-wechat |
| "Apps for beginners in China" collection | 24 general apps (reviews, TikTok, dropshipping, ERPs, JD Shipping), aimed at China-based sellers. **No Tmall, Alipay-onshore or ICP apps.** | O (collection) | https://apps.shopify.com/collections/apps-for-china |
| Tmall Global app on the Shopify App Store | **Not found** (only through WalktheChat Marketplace). | O (negative search) | — |

---

## 3. Requirements behind the Great Firewall

### 3.1 ICP filing vs commercial ICP licence vs EDI

| Point | Finding | Level | Source |
|---|---|---|---|
| Legal basis | State Council Order 292 (2000, amended 2011), 互联网信息服务管理办法. **Commercial** internet information services (经营性) need a **licence**; **non-commercial** services (非经营性) need a **filing**. "未取得许可或者未履行备案手续的，不得从事互联网信息服务" (no licence or filing, no internet information service). | O | https://www.cac.gov.cn/2000-09/30/c_126193701.htm ; https://www.gov.cn/gongbao/content/2000/content_60531.htm |
| Filing rules | MIIT Order 33 (2005): Non-commercial Internet Information Service Filing Measures (filing number issued within 20 working days; published in the MIIT system). | O | https://www.gov.cn/gongbao/content/2005/content_93018.htm |
| When hosting triggers ICP | Filing is required when a domain resolves to a server in **mainland China**. Hong Kong or other offshore nodes need no MIIT filing. Filing goes through the hosting provider; the Alibaba Cloud **International** site does not support filing (a China-site account is needed). Page updated 2026-05-22. | O (Alibaba Cloud) | https://www.alibabacloud.com/help/en/icp-filing/faq-about-icp-filing-applications-in-different-scenarios/ ; https://www.alibabacloud.com/help/en/icp-filing/basic-icp-service/product-overview/icp-filing-application-for-enterprises-outside-the-chinese-mainland |
| Who can file | Filing needs a PRC-registered entity; a WFOE can file; an overseas company cannot file directly. | S | https://www.ptsconsulting.com.hk/blog/china-icp-licence-explained ; https://appinchina.co/how-can-i-get-an-icp-license-for-china/ |
| Brand site selling own goods: **conflicting positions** | (a) Landing Law Offices (2020-04-08) cites a 2010 MOFCOM notice: FIEs "who sell their own products on their online platforms shall need to do the filing"; a licence may be needed if they sell advertising. (b) China Briefing / Dezan Shira: an ICP **licence** is needed for "any website or app that charges users or monetizes in any way"; EDI is not needed for self-operated sites. (c) PTS Consulting: direct online sales "typically necessitates the licence". | S (conflict) | https://www.sinoblawg.com/selling-products-online-in-china-license-requirements/ ; https://www.china-briefing.com/news/china-internet-business-licenses-foreign-companies/ ; https://www.ptsconsulting.com.hk/blog/china-icp-licence-explained |
| EDI (B21) licence | Needed for **platforms** where third parties transact (marketplace model), not for a brand selling only its own goods. | S | https://appinchina.co/edi-electronic-data-interchange-b21-online-data-processing-and-transaction-processing-services/ ; China Briefing (above) |
| Foreign ownership | Historically a 50% cap on value-added telecom (VATS) licensees. MIIT Circular [2024] No.107 (April 2024) pilot allows **100% foreign ownership** for B11 IDC, B12 CDN, B14 ISP, **B21 online data/transaction processing** and parts of B25 information services. Pilot areas: Beijing, Shanghai (Lingang / Pudong), Shenzhen, Hainan. Entity **and facilities** must be in the pilot area. | S (describing an O circular) | https://www.mofo.com/resources/insights/240418-china-pilots-relaxed-foreign-ownership ; https://investmentpolicy.unctad.org/investment-policy-monitor/measures/4636/-allows-100-per-cent-foreign-ownership-in-certain-value-added-telecommunication-services |
| Public-security filing | Within 30 days of the site going live, file with the Ministry of Public Security platform and show the 公网安备 number in the footer. | O (MPS portal) / O (Alibaba Cloud help) | https://beian.mps.gov.cn/ ; https://help.aliyun.com/zh/icp-filing/basic-icp-service/the-public-security-network-for-record-and-cancellation |
| Apps and mini-programs | MIIT 工信部信管〔2023〕105号: apps **and mini-programs** must be filed (new ones from Sept 2023; existing ones by end of March 2024). | O | https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_920db564162e4312916a01bed6540ad8.html |
| Onshore CDN | Cloudflare China Network (run with JD Cloud) needs a valid ICP filing or licence per apex domain **plus JD Cloud content vetting**, on an Enterprise plan. | O (Cloudflare) | https://developers.cloudflare.com/china-network/faq/ ; https://developers.cloudflare.com/china-network/concepts/global-acceleration/ |

### 3.2 Blocked or unreliable services

- **Official statements:** Shopify officially confirms only **Google Fonts** [O, online-store-setup page above]. There is **no official PRC list** of blocked services; the government does not publish one [I].
- **Commonly cited as blocked or unreliable** [S-v, S]: Google Fonts, Google Analytics and Tag Manager, Google Maps, **reCAPTCHA**, YouTube, Vimeo, Facebook/Meta pixels. reCAPTCHA can silently block form or checkout submission. Sources: https://www.chinafy.com/blog/why-your-shopify-store-isnt-working-in-china-and-how-to-fix-it ; https://appinchina.co/blog/why-does-my-website-not-work-in-china-common-causes-and-fixes/ ; https://www.wemakewebsites.com/blog/selling-in-china-with-shopify (2023-02-22).
- **Shopify's CDN:** Shopify's CDNs (Cloudflare, Fastly) are said to have no mainland nodes [S-v Chinafy]. A 2025-08 community thread (no Shopify staff reply) reports the same: https://community.shopify.com/t/custom-cdn-for-china/561170
- **Access incident:** from Jan–Mar 2024, merchants reported Shopify URLs inaccessible without VPN. A merchant quoted Shopify support: issues "are happening because of third parties that may be preventing connectivity to our services" (not a staff post) [S]. https://community.shopify.com/t/is-shopify-now-inaccessible-in-china/285308

### 3.3 Data: PIPL, cross-border transfer, CAC

| Rule | Content | Level | Source |
|---|---|---|---|
| PIPL Art. 3 | Applies to processing **outside China** when the purpose is providing products or services to people in China. | O (NPC bilingual) / S translation | http://www.npc.gov.cn/npc/c2597/c5854/bfflywwb/202311/t20231117_433007.html ; https://digichina.stanford.edu/work/translation-personal-information-protection-law-of-the-peoples-republic-of-china-effective-nov-1-2021/ |
| PIPL Art. 38–40 | Export mechanisms: CAC security assessment, certification, or standard contract. **Separate consent** for export (Art. 39). Critical information infrastructure operators (CIIOs) and processors above CAC volumes must store data in China (Art. 40). | O / S | same |
| PIPL Art. 53 | Offshore processors under Art. 3 must set up a **dedicated entity or representative in China** and report it. | O / S | same |
| CAC Provisions on Promoting and Regulating Cross-Border Data Flows (CAC Order 16, 2024-03-22) | Art. 5 exempts exports "necessary to conclude or perform a contract to which the individual is a party, **such as cross-border shopping**, cross-border delivery, cross-border payment…". Security assessment for ≥1m people (non-sensitive) or ≥10k (sensitive). Standard contract or certification for 100k–1m. Free-trade-zone negative lists. | O | https://www.cac.gov.cn/2024-03/22/c_1712776611775634.htm |
| Network Data Security Management Regulations (in force 2025-01-01) | Reinforce the PRC representative requirement for offshore processors of PRC personal information. | O (gov.cn) / S | https://english.www.gov.cn/policies/latestreleases/202409/30/content_WS66fab6c8c6d0868f4e8eb720.html ; https://www.china-briefing.com/news/china-issues-new-regulations-on-network-data-security-management-effective-january-1-2025/ |
| Cybersecurity Law amendments (in force 2026-01-01) | Higher fines; first-violation fines; wider extraterritorial reach. | S | https://www.china-briefing.com/news/china-cybersecurity-law-amendment/ ; https://www.reedsmith.com/articles/china-approves-major-amendments-to-cybersecurity-law/ |
| Hong Kong / Macao | Hong Kong runs its own **PDPO**, not PIPL. The GBA Standard Contract (Dec 2023) eases mainland ↔ Hong Kong transfers under "respective jurisdiction". Macao and Taiwan data law was not researched. | O (PCPD) | https://www.pcpd.org.hk/english/resources_centre/publications/files/standard_contract_gba.pdf |

**What this means for Shopify-hosted data [I]:** a Shopify store collecting data from mainland consumers processes it offshore, so PIPL applies through Art. 3. Art. 53 requires a PRC representative. The CAC "cross-border shopping" exemption covers only what is *necessary* for the contract; marketing and profiling data are not covered. An onshore front end that sends orders to Shopify is a data export from China and needs its own analysis.

### 3.4 E-commerce, advertising and consumer law

| Rule | Content | Level | Source |
|---|---|---|---|
| E-Commerce Law (电子商务法, 2018) Art. 10 | E-commerce operators must register as market entities (limited exceptions). | O | http://www.npc.gov.cn/c2/c30834/201905/t20190521_281583.html ; https://www.cac.gov.cn/2018-09/01/c_1123362506.htm |
| E-Commerce Law Art. 15 | Show **business licence information** and relevant administrative licences (or a link to them) continuously and prominently on the homepage. | O | same |
| E-Commerce Law Art. 26 | Cross-border e-commerce operators must comply with import/export supervision laws. | O | same |
| Advertising Law Art. 17 | Apart from medical, drug and device ads, **no ad may refer to disease-treatment functions or use medical terms** or terms confusable with drugs. | O | https://nmpa.gov.cn/directory/web/nmpa/xxgk/fgwj/flxzhfg/20230328161808137.html |

### 3.5 Product regulation: cosmetics and pharmaceuticals

| Rule | Content | Level | Source |
|---|---|---|---|
| CBEC retail import framework (MOFCOM et al., 商财发〔2018〕486号, in force 2019-01-01) | Defined as purchases through CBEC **third-party platform operators** by mode **1210** (bonded) or **9610** (direct). Goods are supervised as personal-use items and "不执行有关商品首次进口许可批件、注册或备案要求" (no first-import licence, registration or filing). The overseas operator must appoint a **domestic agent** registered with customs. Consumers must receive risk notices. Pilot-city scope. | O | https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5437823.htm |
| Pilot expansion (2021) | CBEC retail import pilots extended (MOFCOM et al., 2021-03). | O | https://www.gov.cn/zhengce/zhengceku/2021-03/22/content_5594971.htm |
| Tax and limits (财关税〔2018〕49号) | Per-order limit **RMB 5,000**; annual per-person limit **RMB 26,000**. Within limits: 0% tariff, and import VAT and consumption tax at 70% of the statutory amount. | O | https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5440499.htm |
| Positive list | 2019 list, adjusted by MOF et al. Announcement 2022 No.7 (in force 2022-03-01, +29 items). | O | https://www.gov.cn/zhengce/zhengceku/2022-02/21/content_5674854.htm |
| CBEC cosmetics summary | Registration or filing is not required under CBEC; animal testing is not required. Chinese labels are not explicitly mandated. The domestic agent must register with Customs. | S (ChemLinked) | https://cosmetic.chemlinked.com/cosmepedia/china-cross-border-e-commerce-regulation-cbec |
| Cosmetic Supervision and Administration Regulation (CSAR, State Council Order 727, in force 2021-01-01) | Art. 16: hair dye, perm, spot-removal/whitening, sunscreen, anti-hair-loss and new-efficacy products are **special cosmetics** (registration); all others are ordinary (filing). Art. 17: imports registered or filed with the NMPA. Art. 23: overseas registrants or filers must designate a **PRC enterprise legal person** (domestic responsible person). Art. 37: labels may not state or imply medical effects. Art. 43: ads may not imply medical effects. | O | https://www.gov.cn/gongbao/content/2020/content_5525087.htm |
| "药妆" (cosmeceutical) claims | NMPA Q&A (2019-01-10): China has no legal "药妆品" category; claiming "药妆" or "医学护肤品" for cosmetics is illegal. | O | https://www.nmpa.gov.cn/zwfwqjd/zwfwmhzcjd/20190110093701592.html |
| Drugs via CBEC | State Council approved a **Henan** CBEC retail import **drug pilot** (May 2021, 3-year term, 13 OTC drugs already approved in China); first live transaction reported by Zhengzhou. Status after the 3-year term: **not verified**. | O (local gov) | https://swj.zhengzhou.gov.cn/swdt/6371057.jhtml ; https://www.yidaiyilu.gov.cn/p/234546.html |
| Personal postal articles (not CBEC) | Customs Announcement 2010 No.43: duty exempt if tax ≤ RMB 50. Announcement **2024 No.176** amended the per-parcel limit to **RMB 2,000 "寄自境外"** (replacing RMB 800 for HK/MO/TW and RMB 1,000 for others). Commercial shipments must clear as goods. | O (customs, via provincial portal) | http://wuhan.customs.gov.cn/customs/302249/302266/302267/357036/index.html ; https://swt.fujian.gov.cn/xxgk/tzgg/202412/t20241213_6591719.htm |
| Platform tightening (2026) | Tmall Global and Douyin now require proof of overseas production (factory registration, CoO, 90-day customs declarations) and overseas circulation. Temu, Shopee and TikTok are not accepted as sole evidence. | S (ChemLinked, 2026-04-29) | https://food.chemlinked.com/news/food-news/chinas-e-commerce-giants-douyin-and-tmall-tighten-rules-for-cross-border-brands |

---

## 4. Architecture options: pros, cons and evidence

Legend: **Wall** = whether the option puts the storefront behind the Great Firewall (ICP, onshore hosting), matching the owner's definition.

### A. CBEC marketplaces (Tmall Global, JD Worldwide, Douyin Global, RED), with Shopify as back office or not connected

- **Wall:** No ICP needed for the brand; the platform is onshore. The storefront is the marketplace, not Shopify.
- **How it works**
  - An overseas entity opens a store; Hong Kong, Macao and Taiwan companies count as overseas.
  - Goods ship via 1210 bonded warehouse or 9610 direct mail.
  - A domestic agent or joint-liability entity registers with customs.
  - Sources: [O 486号]; Tmall Global join page https://www.tmall.hk/wow/z/import/pegasus-no-head/NjbnNNt2QTAxrsGdXsGP [O, not fetched in full]; https://www.worldfirst.com.cn/content/articles/global-voyage/tmallglobal_guideline [S, Ant Group's WorldFirst].
- **Pros**
  - Products on the positive list skip NMPA registration [O].
  - Consumer traffic and trust sit on the platform [S, WeMakeWebsites 2023-02-22: "T-mall & JD… over 85%" of the market, their claim].
  - Payments are handled inside the platform [I].
- **Cons**
  - Platform fees, deposits and approval. Trademark requirements [S].
  - Tighter 2026 documentation rules [S ChemLinked].
  - Positive list and per-order limits [O].
  - Little Shopify integration today: JD channel unavailable; only WalktheChat for Tmall, RED and Douyin [O listings]. Integration is usually middleware or ERP [I].
- **Evidence:** strong regulatory evidence [O]. Shopify-connected case evidence is thin; see §5.

### B. WeChat (or other) mini-program shop connected to Shopify

- **Wall:** Partly. Mini-programs must be **filed with MIIT** since 2023 [O], which needs a PRC entity or partner [S]. Cross-border WeChat shops (WalktheChat model) run under a service or partner arrangement.
- **How it works:** a WalktheChat app syncs Shopify products, inventory and orders to a mini-program. WeChat Pay cross-border settles in foreign currency. Goods ship direct [O listing; S-v WalktheChat].
- **Pros**
  - Uses Shopify as the order and inventory master.
  - Lower entry cost than Tmall [S-v].
  - Public cases exist (Botkier) [S-v].
- **Cons**
  - Traffic must be bought through KOLs and ads.
  - The WeChat Connector app has few reviews [O listing].
  - Filing and data-export questions [O MIIT; O PIPL].
  - Verification and commission terms depend on the provider [S-v].

### C. Shopify storefront kept offshore and "optimised for China" (no onshore hosting)

- **Wall:** No (not "behind the wall").
- **How it works:** Chinafy or 21YunBox replace or strip blocked resources and route through near-China or onshore delivery nodes. Some attach an ICP filing to their onshore delivery layer [S-v].
- **Pros:** fastest route (vendors claim 2 days to 3 weeks); one Shopify store; Shopify checkout with Hong Kong Shopify Payments (Alipay, WeChat Pay, UnionPay) or gateways [O payments].
- **Cons**
  - Shopify says Cloudflare proxy setups are unsupported. Whether that extends to other reverse proxies is **inference** but likely [O + I].
  - Performance and availability are not guaranteed; see the 2024 incident [S].
  - Goods ship as direct mail or personal articles, with no CBEC exemption unless a CBEC platform or 9610 channel is used [O customs + I].
  - PIPL Art. 3/53 still apply [O].
  - Pharma or health claims are restricted by Managed Markets and PRC ad law [O].
- **Evidence:** vendor case studies (Mastermind Tokyo, MIRTA, Boréas, Harbour Outdoor Asia) [S-v]; see §5.

### D. Separate onshore storefront (ICP-licensed, PRC entity, local hosting), Shopify for the rest of the world

- **Wall:** Yes. This matches the owner's definition.
- **Variants**
  - **China SaaS:** Youzan or Weimob (mini-programs). They are the major Chinese commerce SaaS players [S Tech Buzz China: https://www.techbuzzchina.com/podcast/ep-75-china-e-commerce-saas-youzan-weimob-amp-wechat-mini-programs]. **No Shopify connector was verified.**
  - **Salesforce on Alibaba Cloud:** Sales, Service, Platform and the Connected Experiences Gateway. "Social Commerce" for WeChat mini-programs and .CN sites. "Sold and operated exclusively by Alibaba Cloud". Customer logos: Kering, Bayer, EF, Royal Canin [O vendor: https://www.salesforce.com/partners/alibaba/]. **Traditional B2C Commerce Cloud storefront availability in China was not confirmed.**
  - **Adobe Commerce on Alibaba Cloud:** agency claims only [S-v: https://it-consultis.com/insights/why-magento-china/ ; https://www.chinafy.com/adobe-commerce-in-china]. Not verified with Adobe.
  - **Shopline:** the "Shopline China" onshore offer was **not verified**; the Shopline integrations found are for its international product.
- **Pros:** full local UX, payments (domestic Alipay and WeChat Pay merchant accounts), analytics, SEO (Baidu) and data localisation [I, S].
- **Cons**
  - Needs a PRC entity; general-trade import means NMPA registration or filing for cosmetics and a domestic responsible person [O CSAR].
  - Consultancies cite long lead times ("up to 2 years", Chinafy, a vendor with an interest) [S-v].
  - Two platforms to run; data bridge to global CRM or ERP under PIPL export rules [O].
  - Shopify is not part of the onshore stack [I].
- **Evidence:** vendor and regulator documents. **No public case of this pattern with Shopify as global platform was found**, apart from Allbirds (Tmall, Chinese website and stores; source does not mention Shopify: https://www.digitalcommerce360.com/2019/02/28/allbirds-plans-to-open-stores-in-china-and-sell-products-on-tmall/).

### E. Headless storefront hosted in China (ICP) calling the Shopify Storefront API

- **Wall:** Only the front end sits behind the wall; the commerce back end and checkout stay offshore.
- **Facts**
  - Shopify servers are not in mainland China [O].
  - Checkout redirects to Shopify web checkout [O shopify.dev].
  - Shopify's hosting product for headless storefronts (Oxygen) has no documented China region; we found no Shopify statement either way [negative search].
  - A vendor proposes Hong Kong VPS hosting with CN2 routing, citing 20–35 ms to Chinese users (vendor claim, not onshore) [S-v https://server.hk/blog/shopify-headless-storefront-hong-kong-vps-china-performance/].
- **Evidence status:** **no public case study, Shopify partner article or Shopify staff statement** was found for an ICP-licensed onshore Hydrogen or Storefront API front end.
- **Assessment [I]**
  - Technically feasible for browsing: cache catalogue data onshore and call the API server-side.
  - **Cart and checkout still cross the border** to Shopify-hosted checkout. That brings latency and blocking risk (2024 incident) and a PIPL export of each order.
  - Offshore checkout inside an ICP-licensed onshore site may raise questions about who the e-commerce operator of record is under the E-Commerce Law and the ICP licence scope → **PRC counsel**.
  - Payments: Shopify Payments Hong Kong Alipay/WeChat Pay are early access; domestic merchant accounts need a PRC entity.
  - **Treat as a spike or proof of concept with a firewall-tested prototype before any commitment.**

### F. Hong Kong SAR store serving mainland consumers by cross-border shipping

- **Wall:** No.
- **How it works**
  - Hong Kong entity with Shopify Payments HK (UnionPay; Alipay and WeChat Pay in early access, CNY display) [O].
  - Ships to the mainland as personal postal or express articles (RMB 2,000 per-parcel limit, postal tax) or as 9610 CBEC through a registered channel [O customs; O 486号].
  - No ICP for Hong Kong hosting [O Alibaba Cloud].
  - Hong Kong data law is the PDPO, but PIPL Art. 3 still applies to targeting mainland consumers [O].
- **Pros:** real Shopify Payments with China wallets; simple entity; common among Hong Kong brands [S claim, unsubstantiated case, see §5].
- **Cons:** same storefront-access issues as C; parcel value and tax limits; returns across the border; no bonded-warehouse speed; product registration exemptions apply only inside the CBEC framework [O + I].

### Option comparison (summary)

| Option | Behind wall | PRC entity needed | Shopify role | Pharma skin-care fit |
|---|---|---|---|---|
| A. CBEC marketplace | Platform is onshore | Domestic agent (not an owning entity) | Back office via middleware, or none | Cosmetics on positive list: good. Medical claims: no. Drugs: no (pilot only) |
| B. Mini-program + Shopify | Partly (MIIT filing) | Partner or entity for filing | Order and inventory master | As A, plus WeChat content rules |
| C. Offshore optimised Shopify | No | No (a PRC representative for PIPL) | Storefront + checkout | Weak: direct mail, claims restrictions |
| D. Separate onshore platform | Yes | Yes (WFOE or JV; licence per counsel) | Rest of world only | General trade: NMPA registration or filing |
| E. Onshore headless + Storefront API | Front end only | Yes | Catalogue + checkout (offshore) | Unproven; highest technical risk |
| F. Hong Kong store + cross-border shipping | No | Hong Kong entity | Storefront + checkout | Weak: parcel limits, claims restrictions |

---

## 5. Public business cases

| Brand / agency | Approach | Source URL | Date | Evidence level |
|---|---|---|---|---|
| **Shopify x JD.com** (programme) | JD Marketplace channel for US Shopify merchants into JD Worldwide (CBEC) | https://www.shopify.com/news/shopify-and-jd-com-unlock-world-s-largest-ecommerce-market-for-merchants | 2022-01-18 | O (app now "not currently available": https://apps.shopify.com/jd-marketplace) |
| **Altuzarra** | Tested the JD Marketplace channel before launch | https://www.modernretail.co/retailers/shopify-partners-with-chinas-jd-com-on-cross-border-sales-for-merchants/ | 2022-01-18 | S (trade press) |
| **Botkier** (New York) / WalktheChat | Cross-border WeChat store, then a mini-program synced with its US **Shopify Plus** store; WeChat Pay, Alipay, UnionPay; KOL campaigns; claims 9.6x ROI | https://walkthechat.com/botkier-wechat-weibo-case-study/ ; cited in https://www.shopify.com/blog/sell-on-wechat | Case ~2017–2018 (Singles' Day 2017); Shopify blog 2022-12-09 | S-v (+ O mention) |
| **Harbour Outdoor Asia** / Projects Promotion Ltd (Hong Kong Shopify Partner) / Chinafy | Shopify B2B-B2C site for mainland and Hong Kong; optimisation layer; ICP certificate via Chinafy partner; claims 4.9x faster | https://www.chinafy.com/case-studies/shopify-for-china-how-harbour-outdoor-asia-optimizes-shopify-for-china-with-chinafy | Not shown | S-v |
| **MIRTA** (Milan) / Chinafy | Shopify site optimised for China; CNY, WeChat Pay and UnionPay; RED and WeChat presence; separate .cn site for marketing | https://www.chinafy.com/case-studies/mirta-making-a-luxury-italian-handcrafted-marketplace-accessible-in-china-with-shopify--chinafy | Not shown | S-v |
| **Mastermind Tokyo** / Chinafy | Offshore Shopify optimised; **no ICP**; about 11.6 s visually complete in Beijing | https://www.chinafy.com/case-studies/how-mastermind-tokyo-optimizes-shopify-for-china-with-chinafy | Not shown | S-v |
| **Boréas Technologies** / Chinafy | Localised Shopify site (Weglot) made to load and check out in China | https://www.chinafy.com/case-studies/boreas-technologies-scaling-up-product-innovations-in-china-with-a-localised-shopify-site | Not shown | S-v |
| **Lee Kum Kee** (Hong Kong) | CLEARgo **claims** it uses Shopify Plus and Shopify Markets to target mainland consumers; **no source given**. The Wave Commerce case study (2019-01-04) shows a **Hong Kong-only** Shopify store. | https://www.cleargo.com/insights/shopify-plus-hong-kong-guide ; https://www.wavecommerce.hk/clients/lee-kum-kee-online-shop-case-study | 2026 guide / 2019 | **Unverified claim** (S-v) |

**Count: 8 rows** (1 programme, 7 brand cases). Only Botkier and Altuzarra show a Shopify-to-China *channel*; the others are offshore optimisation. **No public case of Shopify behind the firewall** (option D with Shopify, or E) was found.

**Context, not Shopify-specific:** Allbirds entered China via Tmall, a Chinese website and stores (2019): https://www.digitalcommerce360.com/2019/02/28/allbirds-plans-to-open-stores-in-china-and-sell-products-on-tmall/ [S]. Salesforce on Alibaba Cloud lists Kering, Bayer, EF and Royal Canin: https://www.salesforce.com/partners/alibaba/ [O vendor].

---

## 6. China discovery checklist

### 6.1 Market, entity and structure

| # | Question | Why / source |
|---|---|---|
| 1 | Which territories exactly: mainland, Hong Kong SAR, Macao SAR, Taiwan? Treat each separately. | Different payments ([O] Shopify Payments list), data law ([O] PCPD) and customs ([O] 2024 No.176) |
| 2 | Is the goal cross-border (offshore, options A/B/C/F) or onshore behind the wall (D/E)? | Determines ICP, entity, hosting ([O] Order 292; Alibaba Cloud ICP) |
| 3 | Does the client have a PRC entity (WFOE, JV, representative office)? Where is it registered (a 2024 VATS pilot area)? | ICP filing needs a PRC entity [S]; licence ownership cap and 2024 pilot [S/MIIT] |
| 4 | Does it have an overseas or Hong Kong entity with retail qualifications, trademarks (R marks) and proof of overseas production and circulation? | Tmall Global and Douyin entry; 2026 tightening [S ChemLinked] |
| 5 | Who is the domestic agent or joint-liability entity for CBEC customs registration? | 商财发〔2018〕486号 [O] |
| 6 | Model: selling only own goods, or also third-party goods? | EDI (B21) licence for marketplaces [S] |

### 6.2 Licences and filings (onshore options)

| # | Question | Why / source |
|---|---|---|
| 7 | Has PRC counsel confirmed ICP **filing vs commercial licence** for this model? | Conflicting secondary sources (§3.1) |
| 8 | Domains: .cn or other; registrar; real-name verification; public-security filing plan (30 days); footer numbers | MIIT Order 33 [O]; MPS portal [O]; Shopify .cn note [O] |
| 9 | Mini-program or app filing owner (MIIT 2023)? | [O] 工信部信管〔2023〕105号 |
| 10 | Business licence display on the homepage (E-Commerce Law Art. 15) and market-entity registration (Art. 10) | [O] NPC |

### 6.3 Channels and architecture

| # | Question | Why / source |
|---|---|---|
| 11 | Which channels: Tmall Global, JD Worldwide, Douyin Global, RED, WeChat mini-program, own site? Channel priority and a trade partner (TP)? | Option A/B; entry rules [S] |
| 12 | Role of Shopify: global master (products, inventory, orders), channel, or not involved in China? | JD channel unavailable; only WalktheChat apps listed [O] |
| 13 | If an own site is required: offshore optimised (C), Hong Kong store (F), onshore separate platform (D) or onshore headless (E)? Is the client willing to fund a firewall-tested proof of concept for E? | Shopify has no onshore infrastructure; no proxies supported; checkout offshore [O]; no public E case [negative] |
| 14 | Integration: middleware or ERP for marketplace orders, customs "three-document match", Resident ID capture | Shopify Resident ID field [O changelog 2020-10-14]; 9610/1210 [O] |
| 15 | Third-party scripts inventory: fonts, analytics, reCAPTCHA, pixels, video; China replacements (e.g. Baidu Tongji, Youku, Tencent Video) | Shopify on Google Fonts [O]; others [S-v] |

### 6.4 Logistics

| # | Question | Why / source |
|---|---|---|
| 16 | Customs mode: 1210 bonded, 9610 direct mail, general trade, or personal postal articles? | [O] 486号; [O] 2024 No.176 |
| 17 | Bonded-warehouse city (pilot-zone scope), 3PL, cross-border returns | [O] 2018 and 2021 pilot notices |
| 18 | Order values vs RMB 5,000 per order / RMB 26,000 per year; the Managed Markets ¥10,000 cap | [O] 财关税〔2018〕49号; [O] Shopify |

### 6.5 Payments

| # | Question | Why / source |
|---|---|---|
| 19 | Payment set-up: platform-internal, Shopify Payments Hong Kong (Alipay and WeChat Pay are early access), Antom (Hong Kong or Singapore merchant), WeChat Pay cross-border institution, or domestic merchant accounts (PRC entity)? | [O] Shopify; [O] Antom; [O] Tencent |
| 20 | Settlement currency, FX, refunds without chargebacks, SAFE rules for a PRC entity | [O] Shopify wallet pages; [O] Shopify China legal page (SAFE mention) |

### 6.6 Data and privacy

| # | Question | Why / source |
|---|---|---|
| 21 | Expected mainland data-subject volumes per year (<100k / 100k–1m / >1m); any sensitive personal information (health data from skin-condition questionnaires counts)? | [O] CAC Order 16 thresholds; PIPL sensitive PI |
| 22 | PRC representative (PIPL Art. 53), separate-consent flows (Art. 39), personal information protection impact assessment (PIPIA) | [O] PIPL |
| 23 | Which data leaves China, and is it "necessary for the contract" (cross-border shopping exemption) or marketing and CRM? | [O] CAC Order 16 Art. 5 |
| 24 | Where will the CRM, CDP or email service provider sit for China customers? | [I] + [O] PIPL Art. 38–40 |

### 6.7 Product regulation (critical for pharmaceutical skin care)

| # | Question | Why / source |
|---|---|---|
| 25 | Product classification of each SKU in China: ordinary cosmetic, **special cosmetic** (whitening, sunscreen, anti-hair-loss…), drug, or medical device? | [O] CSAR Art. 16 |
| 26 | Are the SKUs' HS codes on the CBEC positive list? | [O] positive list 2019 / 2022 |
| 27 | For general trade: NMPA registration or filing status, domestic responsible person, Chinese labels | [O] CSAR Art. 17 / 23 |
| 28 | Claims audit: remove "药妆", "medical", "dermatologist-treats" type claims from labels, product pages, KOL content | [O] NMPA 2019 Q&A; CSAR Art. 37 / 43; Advertising Law Art. 17 |
| 29 | Any SKU a registered drug? CBEC drug route exists only as the Henan pilot (status to verify) | [O] Zhengzhou gov |

### 6.8 Content, marketing and customer service

| # | Question | Why / source |
|---|---|---|
| 30 | Content review ownership (platform vetting, e.g. JD Cloud for CDN; WeChat and Douyin rules), absolute-term and claims checks | [O] Cloudflare China Network vetting; [O] Advertising Law |
| 31 | Marketing: KOL, KOC, RED, Douyin, WeChat; paid-media budgets; Singles' Day and 618 calendar | [S-v] Botkier case; [O] Shopify–Alipay news on shopping festivals |
| 32 | Chinese-language customer service in WeChat, Tmall Wangwang, etc.; returns policy | [S] JD guide notes Chinese-speaking team for returns |

### 6.9 Budget, timeline and governance

| # | Question | Why / source |
|---|---|---|
| 33 | Timeline expectations vs lead times: CBEC channel weeks to months; ICP filing weeks; licence months; entity set-up | [S] PTS (filing 2–4 weeks, licence several months); [O] JD "3–4 weeks" (2022) |
| 34 | Who owns PRC legal, tax and customs advice (not Merkle)? Local partner or TP selection | [I] |
| 35 | Security: MLPS (等保) grading for onshore systems | [I] not researched; confirm with counsel |
| 36 | Account and tooling: PRC data must not flow to non-approved LLMs or tools (PIPL export) | [O] PIPL Art. 38–39; project security gate on PII |

---

## 7. Open points that could not be verified

1. **ICP filing vs commercial ICP licence** for a brand's own-goods site: sources conflict (Landing Law 2020 citing a 2010 MOFCOM notice vs China Briefing / PTS). The primary 2010 MOFCOM notice was not retrieved.
2. **Status of the JD Marketplace channel:** the listing says "not currently available"; no Shopify or JD sunset announcement was found, so the date and reason are unknown.
3. **Whether Shopify's 2020 US Alipay gateway still exists**, and whether Alipay and WeChat Pay via Shopify Payments Hong Kong are still early access (help pages say early access; no date shown).
4. **No public case** of an ICP-licensed onshore storefront using the Shopify Storefront API or Hydrogen, and no Shopify staff statement on it. Latency and reliability figures are vendor claims only.
5. **Whether Shopify's "proxy not supported" statement covers non-Cloudflare reverse proxies** (Chinafy, 21YunBox). The doc names Cloudflare explicitly; extension to others is inference.
6. **Whether a brand's own Shopify site can use the CBEC 9610 channel** (and its registration exemption): 486号 defines CBEC retail import via "third-party platform operators". The own-site eligibility conditions were not confirmed.
7. **Henan CBEC drug pilot** after its 3-year term (from May 2021): extension or national roll-out not verified.
8. **Lee Kum Kee mainland targeting via Shopify Markets** (CLEARgo claim): unsubstantiated.
9. **Giesswein** (WalktheChat WeChat case): Shopify use not confirmed. Chinafy's Heinz, JB Hi-Fi and Simba: Shopify use not confirmed.
10. **Salesforce B2C Commerce Cloud in mainland China:** only Social Commerce and mini-programs are confirmed on the Alibaba Cloud page. **Adobe Commerce on Alibaba Cloud** and **Youzan/Weimob–Shopify connectors**: no official confirmation. **Shopline China** onshore offer: not verified.
11. **Official Tmall Global, Douyin Global and RED merchant rules** (fees, current entity rules): only secondary summaries were read; official portals were not reviewed in full.
12. **Shopify Oxygen hosting regions** and any China region: not documented.
13. **Macao and Taiwan** data and customs specifics: not researched beyond the Shopify Payments list and Managed Markets destinations.
14. **Current CNY presentment or settlement support** in Shopify Markets: not checked.
15. **MLPS (等保)** obligations for onshore systems: not researched.
16. **WeChat Pay cross-border FAQ details:** taken from a search summary, not a full page read.

---

## 8. Sources

### Shopify (official)
- https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china
- https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do
- https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/online-store-setup
- https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/set_up_payments
- https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-legal-policies
- https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries
- https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/hong-kong/payment-methods
- https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/alipay
- https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/wechat-pay
- https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations
- https://help.shopify.com/en/manual/international/managed-markets/prohibited-items
- https://help.shopify.com/en/manual/compliance/legal/unsupported-countries-and-regions
- https://help.shopify.com/en/manual/domains/troubleshoot-issues-with-domains
- https://help.shopify.com/en/manual/privacy-and-security/privacy/international-data-transfers/contracting-entities
- https://help.shopify.com/en/manual/privacy-and-security/privacy/international-data-transfers/onward-transfers
- https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage
- https://changelog.shopify.com/posts/country-fields-in-checkout-for-customers-in-china-italy-and-south-korea
- https://www.shopify.com/news/shopify-and-jd-com-unlock-world-s-largest-ecommerce-market-for-merchants
- https://www.shopify.com/news/a-world-of-opportunity-shopify-launches-partnership-with-alipay-to-help-merchants-access-new-global-consumers
- https://www.shopify.com/blog/sell-on-wechat
- https://apps.shopify.com/jd-marketplace
- https://apps.shopify.com/partners/jd-worldwide
- https://apps.shopify.com/walkthechat-wechat-connector
- https://apps.shopify.com/walkthechat-marketplace
- https://apps.shopify.com/collections/apps-for-china

### Shopify community (merchant posts; not staff statements)
- https://community.shopify.com/t/is-shopify-now-inaccessible-in-china/285308
- https://community.shopify.com/t/custom-cdn-for-china/561170

### PRC regulators and government (official)
- https://www.cac.gov.cn/2000-09/30/c_126193701.htm (Order 292)
- https://www.gov.cn/gongbao/content/2000/content_60531.htm
- https://www.gov.cn/gongbao/content/2005/content_93018.htm (MIIT Order 33)
- https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_920db564162e4312916a01bed6540ad8.html (app / mini-program filing)
- https://beian.mps.gov.cn/ (public-security filing)
- https://www.cac.gov.cn/2024-03/22/c_1712776611775634.htm (cross-border data flow provisions)
- http://www.npc.gov.cn/npc/c2597/c5854/bfflywwb/202311/t20231117_433007.html (PIPL bilingual)
- https://english.www.gov.cn/policies/latestreleases/202409/30/content_WS66fab6c8c6d0868f4e8eb720.html (Network Data Security Management Regulations)
- http://www.npc.gov.cn/c2/c30834/201905/t20190521_281583.html (E-Commerce Law)
- https://nmpa.gov.cn/directory/web/nmpa/xxgk/fgwj/flxzhfg/20230328161808137.html (Advertising Law)
- https://www.gov.cn/gongbao/content/2020/content_5525087.htm (CSAR)
- https://www.nmpa.gov.cn/zwfwqjd/zwfwmhzcjd/20190110093701592.html (NMPA "药妆" Q&A)
- https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5437823.htm (商财发〔2018〕486号)
- https://www.gov.cn/zhengce/zhengceku/2021-03/22/content_5594971.htm (2021 pilot expansion)
- https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5440499.htm (财关税〔2018〕49号)
- https://www.gov.cn/zhengce/zhengceku/2022-02/21/content_5674854.htm (positive list 2022 adjustment)
- http://wuhan.customs.gov.cn/customs/302249/302266/302267/357036/index.html (Customs 2010 No.43)
- https://swt.fujian.gov.cn/xxgk/tzgg/202412/t20241213_6591719.htm (Customs 2024 No.176)
- https://swj.zhengzhou.gov.cn/swdt/6371057.jhtml ; https://www.yidaiyilu.gov.cn/p/234546.html (Henan drug pilot)
- https://www.pcpd.org.hk/english/resources_centre/publications/files/standard_contract_gba.pdf (Hong Kong PCPD, GBA)

### Platform and vendor official documentation
- https://www.alibabacloud.com/help/en/icp-filing/faq-about-icp-filing-applications-in-different-scenarios/
- https://www.alibabacloud.com/help/en/icp-filing/basic-icp-service/product-overview/icp-filing-application-for-enterprises-outside-the-chinese-mainland
- https://help.aliyun.com/zh/icp-filing/basic-icp-service/the-public-security-network-for-record-and-cancellation
- https://developers.cloudflare.com/china-network/faq/
- https://developers.cloudflare.com/china-network/concepts/global-acceleration/
- https://docs.antom.com/ac/plugins/shopify
- https://act.weixin.qq.com/static/merchant_overseas/faq_en.html
- https://www.salesforce.com/partners/alibaba/
- https://jdcorporateblog.com/jd-com-and-shopify-ink-strategic-partnership-to-simplify-cross-border-e-commerce/
- https://www.jd.hk/channelGuidePage/UdWaVaW6UdV4U9T4.html
- https://www.tmall.hk/wow/z/import/pegasus-no-head/NjbnNNt2QTAxrsGdXsGP

### Reputable secondary (law firms, consultancies, press)
- https://www.mofo.com/resources/insights/240418-china-pilots-relaxed-foreign-ownership (Morrison Foerster, 2024-04)
- https://investmentpolicy.unctad.org/investment-policy-monitor/measures/4636/-allows-100-per-cent-foreign-ownership-in-certain-value-added-telecommunication-services (UNCTAD)
- https://www.china-briefing.com/news/china-internet-business-licenses-foreign-companies/ (Dezan Shira)
- https://www.china-briefing.com/news/china-issues-new-regulations-on-network-data-security-management-effective-january-1-2025/
- https://www.china-briefing.com/news/china-cybersecurity-law-amendment/
- https://www.reedsmith.com/articles/china-approves-major-amendments-to-cybersecurity-law/
- https://www.sinoblawg.com/selling-products-online-in-china-license-requirements/ (Landing Law Offices, 2020-04-08)
- https://www.ptsconsulting.com.hk/blog/china-icp-licence-explained
- https://appinchina.co/how-can-i-get-an-icp-license-for-china/ ; https://appinchina.co/edi-electronic-data-interchange-b21-online-data-processing-and-transaction-processing-services/ ; https://appinchina.co/blog/why-does-my-website-not-work-in-china-common-causes-and-fixes/
- https://digichina.stanford.edu/work/translation-personal-information-protection-law-of-the-peoples-republic-of-china-effective-nov-1-2021/ (Stanford DigiChina)
- https://cosmetic.chemlinked.com/cosmepedia/china-cross-border-e-commerce-regulation-cbec (ChemLinked)
- https://food.chemlinked.com/news/food-news/chinas-e-commerce-giants-douyin-and-tmall-tighten-rules-for-cross-border-brands (ChemLinked, 2026-04-29)
- https://www.worldfirst.com.cn/content/articles/global-voyage/tmallglobal_guideline (WorldFirst / Ant Group)
- https://www.modernretail.co/retailers/shopify-partners-with-chinas-jd-com-on-cross-border-sales-for-merchants/ (Modern Retail, 2022-01-18)
- https://www.digitalcommerce360.com/2019/02/28/allbirds-plans-to-open-stores-in-china-and-sell-products-on-tmall/
- https://www.wemakewebsites.com/blog/selling-in-china-with-shopify (2023-02-22)
- https://www.techbuzzchina.com/podcast/ep-75-china-e-commerce-saas-youzan-weimob-amp-wechat-mini-programs

### Vendor-authored secondary (commercial interest)
- https://www.chinafy.com/blog/why-your-shopify-store-isnt-working-in-china-and-how-to-fix-it
- https://www.chinafy.com/blog/how-to-make-shopify-plus-work-in-china (2021-10-07, updated 2025-08)
- https://www.chinafy.com/case-studies/shopify-for-china-how-harbour-outdoor-asia-optimizes-shopify-for-china-with-chinafy
- https://www.chinafy.com/case-studies/mirta-making-a-luxury-italian-handcrafted-marketplace-accessible-in-china-with-shopify--chinafy
- https://www.chinafy.com/case-studies/how-mastermind-tokyo-optimizes-shopify-for-china-with-chinafy
- https://www.chinafy.com/case-studies/boreas-technologies-scaling-up-product-innovations-in-china-with-a-localised-shopify-site
- https://www.chinafy.com/adobe-commerce-in-china
- https://www.21cloudbox.com/solutions/how-to-speed-up-shopify-site-in-china.html
- https://walkthechat.com/botkier-wechat-weibo-case-study/
- https://walkthechat.com/wechat-cross-border-e-commerce-account/
- https://walkthechat.com/wechat-mini-program-store-with-shopify-integration/
- https://www.cleargo.com/insights/shopify-plus-hong-kong-guide
- https://www.wavecommerce.hk/clients/lee-kum-kee-online-shop-case-study (2019-01-04)
- https://server.hk/blog/shopify-headless-storefront-hong-kong-vps-china-performance/
- https://it-consultis.com/insights/why-magento-china/
