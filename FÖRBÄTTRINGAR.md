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
- **Uppläsning finns redan** — 40 inspelade berättarröst-klipp som
  autospelas per skärm. Bygg vidare på den:
  - **Täck luckorna.** Skärmar som saknar berättarröst idag: `intro` och
    `ch1-howtoplay` (de allra första skärmarna ett barn möter — viktigast
    för icke-läsare!), de fyra minispelsskärmarnas instruktioner samt
    `ch6-newspaper`/`ch6-reflection`.
  - **"Lyssna igen"-knapp.** Klippen spelas bara en gång, automatiskt när
    skärmen visas. Barn som missade början behöver en tydlig
    högtalarknapp för att höra om.
  - **Koppla berättarrösten till volymkontrollen.** Mute/volym styr idag
    bara WebAudio-effekterna — `<audio>`-elementen med berättarröst
    påverkas inte, så spelet "muteat" fortsätter prata.
- Byt svåra ord mot enkla, eller lägg en liten "?"-ikon som förklarar i
  barnspråk (t.ex. "testamente = ett brev om vem som ska få dina saker").

#### 2. Gör minispelen till huvudrätten
- Fler, kortare och mer varierade minispel — barn minns det de *gjorde*,
  inte det de läste. Sikta på minst ett interaktivt moment per kapitel,
  gärna två.
- Idéer per kapitel:
  - Kap 1: Hjälp Alfred hitta böcker/saker att experimentera med i
    Stockholm (peka-och-hitta).
  - Kap 2: Dra-och-släpp kemikalier till rätt provrör.
  - Kap 3: "Stoppa mätaren i det gröna fältet" — stabilisera nitroglycerinet.
  - Kap 4: Pussla ihop gruvgången och spräng på rätt ställe.
  - Kap 5: Kör dynamitlaster till rätt städer på en Europakarta.
  - Kap 6: Sortera tidningsrubriker — sant eller falskt om Alfred?
  - Kap 7: Fördela testamentet med mynt som dras till olika högar.
- Mer "juice": partiklar, ljud och små animationer vid rätt svar, och en
  tydlig wow-effekt vid kapitelslut.

#### 3. Byt betygston mot stjärnor och beröm
- Ersätt omdömen i stil med "Godkänt, men du kan bättre!" med **1–3
  stjärnor** och en genomgående uppmuntrande ton. Det ska aldrig kännas som
  ett skolprov eller ett misslyckande.
- Låt barnet **prova om direkt** med en stor, glad "Försök igen!"-knapp.

### P2 — Stor effekt

#### 4. Konkretisera valen visuellt
- Abstrakta affärsval ska få **synliga** konsekvenser: en karta där
  fabriker dyker upp, mynt som rullar in eller ut, en glad/orolig figur.
  Konsekvensen ska synas, inte bara beskrivas i text.
- Begränsa varje val till två tydliga alternativ med ikon + kort text.

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
- **Berättarrösten lyder inte volymkontrollen.** Se P1 punkt 1.
- **Externt beroende:** leaderboard mot en Cloudflare Worker
  (`nobel-leaderboard.jonatan-sundemo.workers.dev`).
