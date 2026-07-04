# Speltest med fem barn-personas (juli 2026)

> **Status:** 4 av 5 rapporter inne (Liam kvarstår). **Fixbatch A+B
> genomförd och regressionstestad**: Bofors-läckan, ikonerna,
> mjau→pling, medaljkravet, kap 7-grafiken, topplistans game-fält +
> timeout, porträttet, världskartan, 🇩🇪-markeringen, dolda straff,
> statiska tidslinjen, "lovade"-texten, Ulm/Long Island/Mai 1933,
> Mileva-dagboken, Hiroshima-skärmen (ny!), Mileva-epilogen (ny!),
> "Vad gjorde Albert på riktigt?"-facit (nytt!), Avtryck i st.f.
> Eftermäle, fysik-ärlighetsnoter, klurig-kamouflage i Kompassjakten,
> mjukare fiolkrav, maskot dold i kap 6. **Variationsbatch A–C:** spegelpussel (kap 3), hitta-felet-i-ritningen (kap 4) och radio-set-piece (kap 6) ersätter de mest Nobel-lika momenten. Rösten inspelad (52 klipp, David/eleven_v3). Kvar: Liams rapport, riktiga barn.

| Persona | Profil | Dom |
|---|---|---|
| Elsa, 7 | Nybörjarläsare, behöver uppläsning | **4/5 med vuxen, 2/5 ensam** |
| Liam, 8 | Otålig gamer, skippar text, fuskar | _(rapport väntas)_ |
| Maja, 9 | Noggrann samlare, läser allt | **4,5/5** — klarade allt, 7/7 märken |
| Noah, 10 | Faktanörd, gränstestare | **4/5** — "nästan femma" |
| Vera, 11 | "För cool", dömer hårt | **3,5/5** — kap 6 räddar spelet |

---

## Fynd från Maja (9 år) — verifierade

### Buggar (P0)

1. **Bofors-kvarleva i kapitel 5:** valet "skicka beräkningarna till
   Eddington" triggar Nobel-spelets gamla investeringsbonus
   *"✨ Bofors-investeringen ger avkastning! +4 💰"* och ger +4
   Fantasi på riktigt (makeChoice, Bofors-blocket). Sabbar
   poängbalansen.
2. **Topplistan visar Nobel-ikoner:** "💰 Fantasi" och "⭐ Mod" i
   slutuppställningen (ska vara 💡 och 🦁).
3. **Dubbel signatur** i frågebokens kapitel 7 ("/ Albert" i texten +
   modulens "— Albert").
4. **Stjärnräknaren i finalen** visar 🦁-ikon i stället för ⭐ innan
   avslöjandet (`ch7-starsScore`).
5. **Intro-porträttet trasigt:** tom img (strippad base64) visar
   alt-texten "Albert Einstein" svagt bakom ramen — behöver riktig
   SVG-illustration.

### Ton (P1)

6. **Maskoten skojar i kapitel 6** ("Pling!", "Snurr snurr… klick!" på
   bokbåls- och flyktskärmarna). Bör vara dold/tyst hela kapitel 6.
7. **Finalens konfetti** regnar visuellt över dödsbeskedet högst upp
   på samma scrollskärm.
8. Klistermärkes-fanfaren kunde vara tystare på kapitel 6-slutet.

### Design (P2)

9. **Omspel per kapitel:** stjärnorna fryses när kapitlet stängs —
   "Försök igen" finns bara på resultatskärmen. Önskemål: spela om
   minispel från samlarboken.
10. **Klurig-nivån i Fiolens toner** kräver noll fel på 4+5+6 toner i
    högt tempo för 3 stjärnor — på gränsen.

### Bekräftat bra (rör ej)

- Samlarloopen: klistermärken, stjärnuppdatering vid omspel, diplom
  vid 7/7 + "perfekt resa"-rad. ✅
- Frågeboken speglade alla val exakt i alla 7 kapitel. ✅
- Kapitel 6-tonen: noll konfetti, dova knappar, 🇩🇪-markerad
  propaganda. ✅
- "Fortsätt resa" efter avbrott mitt i kapitel 6: perfekt återställt. ✅
- Aldrig "underkänt" — 0 poäng ger 1 stjärna + snäll text. ✅
- Inga JS-fel under två hela genomspelningar. ✅

---

## Fynd från Vera (11 år) — 3,5/5

### Buggar (P0)
11. **Maskoten MJAUAR** — kattsyntens klang följde med (bara frekvenserna byttes). Kompass ska plinga.
12. **Kap 7-minispelets grafik** visar Nobel-prisceremonins frackklädda man på podium, men texterna handlar om GPS/solceller — bild och text pekar åt olika håll. Dessutom dubbla citattecken i ledtrådar + medaljetiketter som överlappar.
13. **Topplistan saknar `game`-fält** — Einstein-resultat blandas med Nobel-spelets lista.
14. **"Skickar…" i 18 s utan timeout** innan offline-beskedet (fetch utan timeout).
15. **Låsetiketten** säger "Kräver 5 ⭐ Mod" (resourceEmojis rad ~3090 har Nobel-ikoner).
16. **Konfetti läcker** in över nästa kapitels titel/minispel.
17. Kontrast: vit text på ljusgula medaljer (kap 7).
18. Världskartan i finalen nästan tom (mörk oval + prickar).
19. Fortsätt-knapp halvt skymd bakom resursfältet (ch6-newspaper).
20. Dolda Nobel-fallbackspel ligger kvar (visas om v2 kraschar).

### Ton (P1)
21. **Hiroshima får en (1) mening** och klipper direkt till glatt medalj-UI. Veras önskan: en egen tyst skärm, som kap 6-tidningen. Inga stjärnor direkt efteråt.
22. **Mileva försvinner spårlöst efter kapitel 5** — våga berätta klart (skilsmässan, vart hon tog vägen).
23. "⭐⭐⭐ Perfekt granskat!"-jubel direkt efter propaganda-spelet mitt i katastrofen.
24. Kap 1-minispelet på Klurig är identiskt med Lugn — sakerna är inte gömda.
25. "Kanske har du mött honom i vårt förra spel!" i kap 5-faktarutan läses som reklam.

### Bekräftat bra (rör ej)
- Du-formen ("Vad gör Albert?") friad av bebis-radarn. ✅
- Kap 6 i sin helhet; "Sant eller propaganda?"-frågan *vem tjänar på att du tror?* ✅
- Mileva-innehållet: "på riktigt, inte duktig flicka-pedagogik". ✅
- Mod-låset + kuggad-skärmen ("äntligen ett spel som inte låtsas att genier alltid vinner"). ✅
- Fuskskydd: makeChoice-guard, requires-guard, låsta kort. ✅

---

## Fynd från Elsa (7 år) — 4/5 med vuxen, 2/5 ensam

### Kritiskt
26. **Uppläsningen är död** (alla narrator-src tomma — rösten inte inspelad än; utlovas dock i spelet på ch1-howtoplay). UTAN röst är Lugn-läget i praktiken "9+ med läsflyt". → Task: spela in rösten FÖRE deploy; överväg speechSynthesis-fallback.

### Läsnivå (P1) — exakta stoppord för 7-åringar
27. "Källkoll" (rubrik), "resurser", "tankeexperiment", "kuggad"/"underkänt", "evighetsmaskin", "upprop"/"hyllar", "relativitetsteorin", "propaganda"-definitionen, "EFTERMÄLE" (resursnamnet!), "vem tjänar på att du tror".
28. **Tyska tidningen skrämde** ("Är spelet trasigt?") — 🇩🇪-markeringen kommer först EFTER texten; behövs direkt vid tidningshuvudet.
29. Kap 4/6-stämpelspelen: svårigheten är LÄSNINGEN, inte mekaniken — Lugn-läget minskar inte textmängden.

### Buggar
30. **ch7-medals:** "Välj 3–5" men betyget räknas av 5 — den som väljer 3 kan max få 3/5. ("Jag gjorde ju rätt?!")
31. Klistermärkes-popupen försvinner efter 3,2 s — långsamma läsare hinner inte.
32. Fortsätt-knappen efter minispel delvis under resursfältet (kräver scroll).
33. Finalens 16 s tidslinje utan knapp — "har det pajat?".

### Minispelsbetyg på Lugn (Elsa)
Kompassjakten 5/5 · Fiolens toner 4/5 · Ljusstrålen 5/5 (favorit) ·
Patentgranskaren 2/5 (läsning) · Böj ljuset 3/5 · Propaganda 2/5
(ämne+ord över åldern; grät nästan på "Tyvärr sant" om bokbålen) ·
Då och nu 3/5 (långa ledtrådar, etikettöverlapp).


---

## Fynd från Noah (10 år) — 4/5

Faktagranskning: 15+ historiska detaljer verifierade korrekta
(Nobelpriset 1921 för ljuspaketen, 4 undertecknare av motuppropet,
Eddington 29/5 1919, "hade jag fel hade det räckt med EN",
presidenterbjudandet, Russell–Einstein-manifestet, Max Talmud m.m.).

### Faktafel (alla fixade i batch B)
34. Bofors-bonusen (= Majas/Veras fynd) — **fixad (borttagen)**.
35. Statisk finaltidslinje motsade mod-låst val — **fixad (dynamisk)**.
36. "precis som Albert en gång lovade" villkorslöst — **fixad**.
37. Dagbok 4 gav Mileva relativitetsidén som faktum, mot spelets egen
    källkritik — **fixad (delad nattdiskussion)**.
38. "München, 1879–1889" (född i Ulm) — **fixad**.
39. Bokbål i "März 1933" (skedde 10 maj) — **fixad (Mai)**.
40. "Princeton, augusti 1939" (sommarhuset låg på Long Island) — **fixad**.
41. "Vetenskap riv inte ner" — **fixad (river)**.
42. Dolda resursstraff på Kuggad-skärmen — **fixade (borttagna)**.
43. ch4:s 0-stjärnetext kopierad från ch6 ("rubriker") — **fixad**.
44. Mod-förvarning fanns bara i kap 6, KONCEPT lovade kap 5+6 — **fixad**.
45. Nörd-nitpicks: mässingsnyckel omagnetisk (**fixad, stål**), fysik-
    förenklingar i minispel 1/3/5 (**fixade med ärlighetsnoter**).

### Noahs önskemål — implementerat
"Vad gjorde Albert på riktigt?"-ruta i finalen som jämför spelarens
väg med historien (brevet/presidenten/manifestet). ✅

## Genomförda P1/P2 från Vera/Elsa
- **Hiroshima har nu en egen tyst skärm** (6 augusti 1945) före
  medaljvalet; maskoten dold. ✅
- **Mileva-epilog i finalen** (skilsmässan 1919, Zürich, sönerna,
  prispengarna, återupprättelsen). ✅
- Marie Curie-cameo i kap 5-fakta (KONCEPT-löftet). ✅
- "Reklamraden" om förra spelet borttagen. ✅
- Medaljvalet kräver nu exakt 5 ("Jag gjorde ju rätt?!"-fällan borta). ✅
- Klistermärkes-popup 5,2 s + konfetti städas vid skärmbyte. ✅
- Fortsätt-knappar får marginal ovanför resursfältet. ✅
- "Berättelsen fortsätter av sig själv…"-rad i finalen. ✅

## Medvetna beslut (ej ändrade)
- "Källkoll"-rubriken behålls (Maja/Vera älskade den; Elsas problem
  löses av uppläsningen).
- Kap 4/6-stämpelspelens textmängd: uppläsningen är lösningen för
  7-åringar, inte kortare kort.
- Kap 7-valet president/manifest förblir ett val — facit-rutan
  berättar att Albert hann med båda.
