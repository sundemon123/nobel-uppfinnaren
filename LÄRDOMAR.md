# Lärdomar från Nobel: Uppfinnarens väg

En playbook destillerad ur hela utvecklingsresan — skriven som
startpunkt för nästa spel (Albert Einstein!). Allt nedan är belagt
genom speltester och verifierade fixar, inte gissningar.

---

## 1. Speldesign för 7–11 år — vad som bevisat fungerar

**Kärnloopen:** läs/lyssna lite → gör ett val → **spela** → samla.
Ett minispel per kapitel är minimum; textkorridorer på 4+ skärmar i
rad är där otåliga barn ger upp (Liam-testet: nära ragequit två
gånger på exakt sådana sträckor).

**Det som bar spelet** (alla fem testpersonas oberoende):
- **Dagboken som minns spelarens val** — "som ett riktigt spel".
  Låt huvudpersonen referera spelarens beslut i jag-form.
- **Dramatiska vändpunkten** (dödsrunan i kap 6) — barn tål allvar
  och älskar det när det berättas rakt, utan dalt. Korta meningar.
- **Konsekvenslås** (lågt Rykte låser fina val) — "valen kändes på
  riktigt". Men: förvarna innan sista kapitlet, och förklara låset.
- **Samlarbok + stjärnor + Försök igen** — omspelsloopen. Stjärnor
  som uppdateras i boken vid omspel gör att barn frivilligt spelar om.
- **Källkritik i faktarutor** ("det är oklart om...") — imponerade
  på 10-åringen. Våga nyansera.

**Tonregler:**
- **Aldrig "underkänt".** 1–3 stjärnor, alltid minst en, alltid
  uppmuntrande text. "Godkänt, men du kan bättre!" = skolprov = fel.
- **Fira lagom.** Konfetti efter ett sorgligt kapitel är tonkrock.
  Stillsamt klockspel slår partyhorn med jubel.
- **Du-form, solospelare.** "Fundera tillsammans"/"ni" känns som
  klassrum. Berättelsens egna "ni" (dialog) är fine.
- **Misslyckande ska vara roligt** — smällen när man blandar fel i
  kap 4 var "roligaste misslyckandet i spelet".

**Svårighet:** tre nivåer räcker (Lugn 7–8 / Lagom / Klurig 9–11) och
ska styra få men kännbara rattar: hintfördröjning, tidsgränser,
banbredd, om facit visas. 7-åringar behöver hintpuls efter ~6 s;
10-åringar vill ha "nörd-nivå" utan facit.

**Läsnivå:** stoppord som fällde 7-åringen: byråkratiska abstrakta ord
("konkurs", "metodiskt", "säkerhetsprotokoll", "uppnådde vuxen
ålder"). Procenttal är för abstrakt — "3 droppar av X för varje
droppe Y" fungerar. Utländsk text behöver en "det här är franska"-
markering, annars känner sig plikttrogna läsare dumma.

## 2. Speltestmetoden — gör om exakt så här

Fem AI-personas som SPELAR spelet via Playwright (klick, drag,
skärmdumpar de "ser") och rapporterar strukturerat:

| Persona | Profil | Hittar |
|---|---|---|
| 7 år | Nybörjarläsare, behöver uppläsning | läsnivå, UX-fällor |
| 8 år | Otålig gamer, skippar text, försöker fuska | tempo, exploits |
| 9 år | Noggrann samlare, läser allt, känslig | ton, känslor, samlande |
| 10 år | Faktanörd, gränstestare, väljer "fel" med flit | fakta, logik, konsekvens |
| 11 år | "För cool", dömer hårt | bebis-radar, förstaintryck |

Be varje persona om: dom med betyg, var de fastnat, exakta citat på
för svåra texter, minispelsbetyg, buggar (separerade från persona-
åsikter), ett önskemål. **Kör före lansering** — de fem hittade 10
riktiga buggar, 9 korrekturfel och 3 designmissar som alla var
verkliga. Instruera dem att skilja "barnet hade fastnat" från
"AI-musens tekniska problem".

## 3. Teknisk arkitektur — återanvänd rakt av

**En självförsörjande `index.html`.** Allt inline (kod, grafik som
SVG/base64, ljud som base64). Inga byggsteg, deploy = statisk fil,
funkar offline, F12-felsökbart. UI-tunga berättelsespel mår bäst i
DOM/CSS; minispelen i Canvas. Håll koll på totalstorleken (~16 MB ok).

**Minispelsramverket** (`NobelMinigames`): varje spel är en IIFE med
`init(containerId)/start()/getScore() 0–2/destroy()`. Delade helpers:
`showResult()` (stjärnskärm + retry) och `notifyDone()` (visar
Fortsätt-knappen **deterministiskt**). Lärdom i blod: poll-detektering
som letade efter knappar i containern gav "Fortsätt" innan spelet ens
spelats. Spel ska ANMÄLA sig klara, inte detekteras.

**Ljudsystemet** (`NobelSound`): WebAudio-syntes som bas, inspelade
sampel läggs ovanpå via `<audio id="nobel-sfx-NAMN">` — `play()`
provar sampel först (avkodat genom masterGain så volym/mute gäller),
syntes som fallback. Frekventa småljud (sidvändning) behåller syntes.

**Sparande:** localStorage med versionsfält, explicit fältlista i
save/load (inte hela gameState), autosave per skärmbyte — **tyst**
(sparat-toast irriterade och täckte HUD:en).

**Övrigt värt att kopiera:** svårighetsläges-hooken (`nmgDifficulty()`
läses av varje spel i `start()`), klistermärkessystemet med diplom,
maskotmodulen, leaderboard med offline-kö, versionskontrollen (nedan).

## 4. Ljudpipeline (ElevenLabs) — hela receptet

1. **Texterna FÖRST.** Lås manus efter korrektur/läsbarhet — annars
   spelas allt in två gånger. `narration/manus.json` = skärm-id → text.
2. **Konventionen bär allt:** `<audio id="narrator-SKÄRM-ID">` — 
   Lyssna-knappen hittar klipp automatiskt; nya skärmar = nytt id.
3. **Uppläsning = knappstyrd**, aldrig autoplay. Stoppa vid skärmbyte.
   Koppla till volymkontrollen (lätt att missa: <audio> lyder inte
   WebAudio-mutern av sig själv).
4. **Modell: `eleven_v3`** — hörbart bättre svenskt uttal/inlevelse.
   Generera i `mp3_44100_128`, komprimera med ffmpeg till 64 kbps
   mono (`-ac 1 -b:a 64k`) — uttalet sitter i tagningen, inte
   bitraten. Halverar storleken gratis.
5. **Tagningar är slumpmässiga** — spara klippen, iterera enskilda
   med `--only skärm-id`, transkoda i stället för att omgenerera.
6. **Ljudeffekter:** `/v1/sound-generation` med promptfil
   (`sfx-prompts.json`). 8–10 effekter på nyckelögonblick räcker.
7. **Kostnad:** hela spelet ≈ 14 000 tecken/körning. Klonade röster
   kräver betald plan; kolla `/v1/models` och `/v1/voices` först.
8. **Molnmiljö-fälla:** Nodes fetch går FÖRBI proxyn — använd curl
   (eller kör scriptet lokalt). Ta reda på vilken röst originalet
   använde innan omkörning (filnamn/Discord-historik/gamla klipp i
   git-historiken — bitrate går att läsa ur mp3-headern!).

## 5. Deploy (GitHub Pages) — och cache-lösningen

- Pages publicerar från `main` (miljöskyddet tillåter bara main —
  feature-branch-workflows nekas). Fast-forward main = deploy.
- **Deployer failar ibland transient** ("Deployment failed, try again
  later") — det är GitHubs infrastruktur; tom commit och försök igen,
  med tålamod (upp till 3 cykler à 5 min har behövts).
- **Verifiera med checksumma:** `sha256sum` på serverad fil vs lokal.
  "Det ser gammalt ut" är annars omöjligt att skilja från cache.
- **Cache-lösningen (kopiera denna!):** Pages cachar 10 min. Spelet
  har `GAME_BUILD` + `version.txt`; vid start hämtas versionsfilen
  med `cache: 'no-store'`, och nyare bygge visar en "🔄 Ny version"-
  knapp som laddar om med ny query-sträng. Synligt byggnummer på
  introskärmen gör supporten trivial ("vad står det längst ner?").
  **Bumpa båda vid varje deploy.**

## 6. Buggklasser att designa bort från dag ett

1. Flytande knappar (Lyssna m.fl.) som täcker rubriker — reservera
   plats med padding när knappen visas.
2. Resultat/Fortsätt under skärmkanten — auto-scrolla till dem.
3. Popups som landar på fel skärm — guarda med `currentScreen` och
   städa overlays vid skärmbyte.
4. Timers som startar innan barnet börjat interagera.
5. Sluttexter som ljuger vid timeout ("Alla städer fick sin dynamit"
   när tiden tog slut på 3 av 5).
6. Facit/feedback som ligger kvar under nästa fråga.
7. Klickspam-exploits — kort lockout efter miss.
8. Dubbelanrop på val (även via konsolen) staplar bonusar — guard.
9. Retcon: om ett val ignoreras av nästa kapitel, bemöt det med en
   bryggmening i stället för att låtsas att det inte hänt.
10. Faktafel i dynamiska texter (ålder på två ställen, procentsatser)
    — faktanörds-personan hittar dem.
11. Kartor/geografi: barn vet inte att Paris ligger i Frankrike —
    skriv ut landsnamn. Och Storbritannien är en ö.
12. Låga SVG-opaciteter ser ut som trasiga platshållare.

## 7. Snabbstart för Einstein-spelet

**Återanvänd omodifierat:** minispelsramverket, showResult/notifyDone,
NobelSound + sampelsystemet, narrator-modulen + Lyssna-knappen,
klistermärkes-/diplomsystemet, svårighetslägena, versionskontrollen,
leaderboard med offline-kö, `generate-narration.mjs` + pipeline,
speltest-personas-metoden, deploy-upplägget.

**Skriv nytt:** kapitelstruktur och val (Einsteins liv har samma
dramaturgiska guldkorn: patentkontoret, mirakelåret 1905, flykten
från Nazityskland, brevet till Roosevelt och ångern — samma "geni
med samvetskval"-båge som Nobel), minispelsteman (ljusstrålar,
pussel med tid/rum, sortera patent, E=mc²-experiment), maskot,
klistermärken, manus.

**Ordningen som fungerade:** innehåll/kapitel → minispel →
speltesta med personas → fixa P0 → ton/läsbarhet → LÅS TEXTERNA →
spela in röst → ljudeffekter → deploy med versionskontroll →
riktiga barn.
