# Speltest med fem barn-personas (juli 2026)

> **Status:** Alla P0-buggar (1–10) och samtliga korrekturfel är
> åtgärdade och verifierade i browser. P1 (ton/läsbarhet) och P2
> (design) återstår — se rekommenderad ordning längst ner.

Fem AI-agenter spelade igenom spelet i varsin browser, i roll som barn i
målgruppen. Varje agent interagerade som en riktig användare (klick,
drag, skärmdumpar) och rapporterade ur sin personas perspektiv.

| Persona | Profil | Dom |
|---|---|---|
| Elsa, 7 | Nybörjarläsare, behöver uppläsning | 3/5 med förälder, 2/5 ensam |
| Liam, 8 | Otålig gamer, skippar all text | 3/5 — nära ragequit två gånger |
| Maja, 9 | Noggrann samlare, läser allt | 4/5 — spelar klart och om |
| Noah, 10 | Faktanörd, gränstestare | 4/5 — "det här är faktiskt bra" |
| Vera, 11 | "För cool", dömer hårt | 4/5 — kap 6 fångade henne |

**Mönstret:** spelet håller för 9–11-åringar men tappar 7–8-åringarna
mellan minispelen. Det som bär: kapitel 6-tidningen (alla fem),
dagboken som minns ens val, samlarboken, rykteslåsen, "Försök igen".

---

## P0 — Buggar (bekräftade, ofta av flera personas)

1. **Lyssna-knappen skymmer skärmrubrikerna** vid mobilbredd — alla fem
   rapporterade det ("…n i Paris", "BOOM!" dolt). Dessutom saknas
   knappen helt där den behövs mest (minispelens instruktioner,
   howtoplay) eftersom klipp saknas där.
2. **Ingen auto-scroll efter val** — resultatruta + Fortsätt hamnar
   under skärmkanten; Elsa klickade på valet igen och trodde inget
   hände. Drabbar alla valskärmar.
3. **Klistermärkes-popupen landar på fel skärm** — visas 2,4 s efter
   kapitelslutet; snabba spelare hinner vidare och popupen lägger sig
   över nästa minispel (Liam: 3 av 3 gånger).
4. **ch5 ljuger vid timeout** — tiden ut på 3/5 leveranser ger ändå
   "Alla städer fick sin dynamit" och räknaren "Leverans 4 av 5" står
   kvar över resultatet (Elsa + Noah).
5. **ch3-timern startar innan man börjat spela** — långsamma läsare
   (som spelet självt uppmanar läsa högt!) får 1 stjärna utan att ha
   rört något (Vera + Noah). Stabiliteten nollställs inte heller när
   man släpper och tar om (Liam).
6. **SPARAT-toasten täcker Rykte-siffran** vid varje autosave (Maja).
7. **ch6: facit står kvar under nästa rubrik** — "Falskt! Han kunde fem
   språk" visas under efterföljande fråga (Vera). Snabba stämpelklick
   under animationen ignoreras (Maja).
8. **ch4 kemifel:** enbart kiselgur (inert lera) ger "Vilken smäll!"
   (Noah).
9. **ch1 spamexploit:** blind klickspam hittar sakerna på 118 ms — inga
   straff/cooldown för felklick (Liam).
10. **ch6-reflection tom i flera sekunder** — ser ut som en krasch;
    barn börjar klicka (Vera + Liam).

## P0 — Korrekturfel i innehållet (Noah)

- Emil "20 år" på explosionsskärmen, "tjugoett" i dagboken (rätt: 20).
- Dagboken kap 7: "nittio procent" — valkortet sa 94 %.
- "Alfreds **militara** satsning **gäv** enorma vinster" (kap 5-slut).
- "tidningen kanske hade en **poang**" (kap 6).
- "mästare på att **nämna** sina uppfinningar" → *namnge*.
- "priset blir **väldigt**" (ord saknas), "…beröra själen **och
  teknik**" (haltande mening), "blev aldrig **densamma**" → *densamme*.
- Dagbok kap 1 daterad "21 oktober 1833" — Alfreds födelsedag; kapitlet
  slutar 1842 (Maja).

## P1 — Känslor och ton

- **"TOTAL POÄNG 8 av 40" presenteras naket** — läses som underkänt av
  ett barn som gjort sitt bästa (Maja). Lägg till omdöme/diplom och
  visa stjärnorna.
- **Låst val i sista kapitlet utan förvarning** — Rykte < 5 låser det
  historiskt korrekta valet i ch7 utan chans att reparera; ingen
  tidigare hint om att Rykte skulle behövas (Maja).
- **"-1 Rykte för att göra nitroglycerinet säkert" oförklarat** —
  känns som bestraffning för ett bra val (Maja).
- **Konfetti direkt efter dödsruna-kapitlet** — tonkrock (Vera).
- **"Ni"-tilltalet + skolformuleringar** ("Läs valen högt, diskutera
  tillsammans") känns som klassrum för äldre barn (Vera).
- "-2"-flytsiffra visas även när resursen redan är 0 (Noah).

## P1 — Läsbarhet (Elsa + Maja)

- Stoppord för yngre: "testamente", "konkurs", "ingenjörskonst",
  "säkerhetsprotokollen", "metodiskt", "instabila sprängämnet",
  "uppnådde vuxen ålder", "stroke" (oförklarat).
- Dagbokens 1800-talssvenska ("icke", "blott", "bävar", "kanhända") är
  stämningsfull men kräver vuxen — behåll som medvetet val, men märk
  den som "för stora barn" eller läs upp den.
- Fransk tidningstext utan förklaring får plikttrogna läsare att känna
  sig dumma — en liten "🇫🇷 det här är franska"-markering räcker.
- ch5: "Frankrike bygger järnväg" kräver att man vet att Paris ligger i
  Frankrike — skriv stadens namn i ordern eller ge landskartan
  landsnamn.

## P2 — Speldesign (större)

- **Textkorridorerna:** kap 4–5 har 5–6 text-/valskärmar i rad utan
  spelmoment — Liams nära-ragequit. Bryt med interaktiva moment eller
  slå ihop skärmar.
- **Explosionen i kap 3 är en textskärm** — Liam OCH Elsa önskade en
  riktig explosion (skärmskak, eld, ljud). Spelets största ögonblick
  bör kännas.
- **Svårighetslägen behövs åt båda hållen** (P3.8): ch3 för svår för
  Elsa (7), det mesta för lätt för Noah (10). Två lägen: 7–8 år
  (bredare bana, gömda saker synligare) och 9–11 år ("nörd-nivå":
  skattjaktens saker delvis gömda, ch2 utan facit i statusraden,
  kunskapsfrågor).
- **Retcon av val** (Noah): "Stanna kvar och studera" ignoreras av
  kap 2:s intro — bemöt valet med en mellanmening i stället för att
  låtsas att det inte hänt.
- **Minispelstjärnorna syns inte i slutpoängen** (Vera) — räkna in dem
  (t.ex. X/40 resurser + Y/21 stjärnor) så omspel lönar sig.
- **Maskot** (Elsa, = P2.6): en klickbar följeslagare (hennes förslag:
  en katt som jamar).
- **Samlarboken**: nås bara på kapitelslut — lägg en knapp i HUD:en;
  belöning/diplom för full bok; snyggare märken än ren emoji (Maja).
- **Leaderboard utan fallback** — på skolnät med filter dör hela
  tävlingsmomentet tyst (Vera). Cachea lokalt + visa "sparas när
  nätet funkar".
- **Kapiteltitelbilderna ser oladdade ut** (Elsa, Maja, Vera) — blek
  SVG-skiss uppfattas som trasig platshållare.
- Konsol-exploit: `makeChoice` på besvarade val staplar bonusar (Noah).

## Vad som INTE ska röras (bekräftat bra)

- Tidningssekvensen i kap 6 — alla fems favorit. "Okej den var
  faktiskt cool" (Vera).
- Dagboken som skrivs om efter ens val — "som ett riktigt spel".
- Rykteslåsen — "valen kändes på riktigt" (Noah).
- ch3-banspelet — Liams 5/5, anti-fusket håller.
- Stjärnor + Försök igen + samlarbok-uppdatering — omspelsloopen
  fungerar (Maja körde om för ⭐⭐⭐).
- Källkritik-faktarutan i kap 6 ("Det är oklart om...") — "Mer sånt!"

## Rekommenderad ordning

1. **P0-buggar + korrektur** (små, väl avgränsade fixar).
2. **P1 känslor/ton + läsbarhet** — textändringar.
3. **Därefter ElevenLabs-inspelning** — texterna måste vara klara
   innan rösterna spelas in, annars spelas allt in två gånger.
4. **P2-design** i takt med lust och tid, styrt av denna lista.
