# Nobel: Uppfinnarens väg — Förbättringsplan för målgruppen 7–11 år

Detta dokument sammanfattar en analys av spelet i dess nuvarande form och en
prioriterad backlog med förbättringar som gör spelet roligare och mer
tillgängligt för barn i åldern 7–11 år.

## Nuläge

Spelet är ett berättelsedrivet, pedagogiskt spel om Alfred Nobels liv i sju
kapitel (Barndom → Kemilaboratoriet → Farliga experiment → Dynamitens födelse
→ Imperiet → Dödens köpman → Testamentet). Mekaniken består av:

- Berättelsetext med förgrenade val och konsekvenser
- Inspelad berättarröst (40 klipp) som autospelas per skärm
- Fyra Canvas-baserade minispel (kapitel 2–5) med poäng och omdömen
- Faktakort att samla, en dagbok och en HUD med poäng och progress

### Grundproblem för 7–11-åringar

1. **Läsmängd och språknivå.** Långa stycken och avancerade ord
   ("testamente", "logistik", "landstrykare"). De yngsta i målgruppen läser
   ännu långsamt.
2. **Abstrakta, vuxna teman.** Affärsstrategi, rykte, moral och arv — en
   8-åring har svag intuition för "kontroll över kvaliteten" eller "tömmer
   kassan".
3. **Långsam, textbaserad feedback.** Barn i den här åldern behöver snabb,
   tydlig och glädjefylld belöning ("juice": ljud, partiklar, animation).

---

## Prioriterad backlog

### P1 — Störst effekt

#### 1. Skär ner texten och komplettera uppläsningen
- Halvera textmängden per skärm. Korta meningar, max 2–3 per textruta.
- ✅ **KLART: Knappstyrd uppläsning.** Autoplay är ersatt med en tydlig
  🔊 **Lyssna**-knapp (uppe till vänster) som spelar/stoppar klippet och
  kan tryckas hur många gånger som helst. Pågående klipp stoppas vid
  skärmbyte, och berättarrösten följer nu volym/mute-kontrollen.
  - Knappen hittar ljudet via konventionen
    `<audio id="narrator-SKÄRM-ID">` — nya klipp behöver bara läggas in
    med rätt id så dyker knappen upp automatiskt.
- **Återstår: spela in klipp (ElevenLabs) för skärmar som saknar
  berättarröst:** `intro`, `ch1-howtoplay`, `ch6-newspaper`,
  `ch6-reflection` samt de nya minispelsskärmarna `ch1-minigame`,
  `ch6-minigame`, `ch7-minigame` (och gärna instruktionerna i
  ch2–ch5-minispelen).
- Byt svåra ord mot enkla, eller lägg en liten "?"-ikon som förklarar i
  barnspråk (t.ex. "testamente = ett brev om vem som ska få dina saker").

#### 2. Gör minispelen till huvudrätten
- ✅ **KLART: Alla sju kapitel har nu ett minispel.** Tre nya
  Canvas-spel byggda i samma NobelMinigames-ramverk som ch2–ch5:
  - **Kap 1 — "Skattjakten på vinden"** (`ch1-minigame`): peka-och-hitta.
    Fem gömda uppfinnarprylar (bok, förstoringsglas, magnet, kolv,
    fjäderpenna) i Alfreds vindsrum. Guldgnistor vid fynd, sakerna flyger
    ner i en samlarbricka, och en hintpuls hjälper till efter 12 sekunder
    utan fynd.
  - **Kap 6 — "Rätta tidningen!"** (`ch6-minigame`): rubriker om Alfred
    stämplas SANT (grön) eller FALSKT (röd) med stämpelanimation, och
    varje svar följs av en kort förklaring ("Tidningen blandade ihop
    Alfred med hans bror Ludvig").
  - **Kap 7 — "Prisutdelningen"** (`ch7-minigame`): pristagare står i
    strålkastarljus och berättar vad de gjort — dra rätt medalj (Fysik,
    Kemi, Medicin, Litteratur, Fred) till rätt person. Konfetti och
    höjda armar vid rätt svar.
  - Poängen lagras i `miniGameScores` (ch1_treasure, ch6_headlines,
    ch7_ceremony) och ger resursbonusar precis som de gamla spelen.
- ✅ **KLART: Spelmotorn ombyggd och de gamla spelen (ch2–ch5) fixade.**
  Diagnosen visade två riktiga buggar och flera barnfientliga designval:
  - **Motorbugg:** "är spelet klart?"-detekteringen räknade *alla*
    knappar i spelcontainern som en resultatskärm — därför dök
    "Fortsätt" upp i kapitel 4 innan man ens spelat (spelets egen
    "Testa!"-knapp matchade). Nu anmäler spelen sig klara direkt via
    `notifyDone()`; pollern finns kvar enbart som reserv.
  - **Kap 2:** krävde att man *gissade* rätt ordning på flaskorna.
    Nu visar statusraden receptet steg för steg ("häll i Glycerin!").
  - **Kap 3:** gick att fuska (dra rakt till MÅL = full poäng direkt)
    och var samtidigt frustrerande ärligt spelad (20 s tidspress).
    Nu måste markören följa banan (fönstrad sökning + korridorkrav),
    banan är bredare (30→38), tidspressen borta och stabiliteten
    återhämtar sig när man fortsätter försiktigt.
  - **Kap 4:** "75 % nitro, 25 % kiselgur" är för abstrakt för en
    7-åring. Nu: "3 droppar nitro för varje droppe kiselgur", ett
    tydligt **grönt fält** på mätaren och en statusrad som guidar
    ("Droppa i mer nitroglycerin!").
  - **Kap 5:** fel stad brände hela ordern (ett försök!), 45 s
    tidspress och pyttesmå träffytor. Nu: fel stad = försök igen,
    90 s, större träffytor för lådan och städerna, och en hintpuls
    på rätt stad efter 12 s.
- ✅ **KLART: mer "wow" vid kapitelslut** — kapitelrubriken stämplas in
  med en studs-animation och en stjärnexplosion (⭐✨🌟🎉) fyrar av
  ovanpå konfettin.
- Kvar att göra: ev. andra interaktiva moment per kapitel.

#### 3. Byt betygston mot stjärnor och beröm
- ✅ **KLART för alla sju spelen:** resultatet visas som **1–3
  stjärnor** med uppmuntrande text (aldrig "underkänt"), plus en
  🎯 **"Försök igen"-knapp** för att spela om direkt. Renderas av en
  delad `showResult()`-helper så alla spel beter sig likadant.

### P2 — Stor effekt

#### 4. Konkretisera valen visuellt
- ✅ **KLART (första steget):** när man gör ett val **flyger resurserna
  synligt** från valkortet ner till resursmätaren (📚 böcker, 💰 pengar,
  ⭐ stjärnor, ✨ eftermäle) och räknaren tickar när de landar. Vid
  negativa effekter dräneras resurserna ur mätaren i stället.
- Kvar: större visualiseringar (karta där fabriker dyker upp, glad/orolig
  figur) och ev. färre alternativ per val.

#### 5. Stärk samlandet och belöningsslingan
- Faktakorten är en bra krok — förstärk den:
  - Animerad "kortet låses upp!"-effekt med ljud och glitter.
  - Samlingsbok med tydlig progress ("12 av 20!").
  - Klistermärken/badges per avklarat kapitel.

#### 6. Maskot/följeslagare
- En liten återkommande karaktär (t.ex. Alfred som barn, eller en labbråtta)
  som guidar, hejar på och förklarar svåra saker med enkel, varm röst.
- Maskoten reagerar på det som händer: jublar vid stjärnor, tröstar och
  peppar vid omförsök.

### P3 — Polish

#### 7. Tillgänglighet och flöde
- Större knappar och träffytor (spelet körs i porträttläge 720×1280 —
  tänk tumvänligt på mobil/surfplatta).
- Möjlighet att hoppa över/snabba upp text för de som spelar om.
- Autospar per kapitel så att man aldrig tappar progress.

#### 8. Svårighetslägen
- Två lägen: **7–8 år** (mer uppläsning, enklare minispel, generösare
  tidsgränser) och **9–11 år** (mer text, klurigare minispel).

---

## Tekniska noteringar

- **HTML-versionen (v2) är rätt grund** — spelet är UI-tungt (text, val,
  kort, dagbok) och DOM/CSS passar det bättre än en spelmotor. Minispelen
  täcks av Canvas, ljudet av WebAudio. Ingen byggkedja behövs.
- **Dubblerad kod.** Dagbokssystemet, minispelen och ljudsystemet ligger
  inlinade som scriptblock i `index.html` — samtidigt som samma kod finns
  som separata filer (`nobel-diary-system.js`, `nobel-minigames-v2.js`,
  `nobel-sound-system.js`) som inte refereras. Välj en källa, förslagsvis
  `<script src="...">` mot de externa filerna.
- ~~Berättarrösten lyder inte volymkontrollen.~~ ✅ Fixat — narratorljudet
  synkas mot NobelSound-volymen medan det spelar.
- **Externt beroende:** leaderboard mot en Cloudflare Worker
  (`nobel-leaderboard.jonatan-sundemo.workers.dev`).
