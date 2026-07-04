# Stormaktstiden: Rikets väg — innehåll & konsekvenser

Hela det authored innehållet: berättelse, val, effekter och konsekvenser
för alla sju kapitel + nedslag. Detta låses (byggordningen: innehåll
FÖRST) innan skärmar och röst byggs. Skrivet för åk 5, uppläsbart,
du-form.

## Resurser & startvärden

- **Makt** 👑 start 1 · **Välstånd** 💰 start 1 · **Folkets stöd** 🤝 start 2
  *(folket börjar med dig — men förtroende är lätt att förlora)*

Effekter hålls små (+1/+2/−1), som i Nobel/Einstein. Skalan går 0–10.

## Konsekvenssystemet (skeende, inte livsbåge)

Tre lager, alla synliga:

1. **Det återkommande stället.** Varje kapitel återvänder vi till
   samma småstad vid Östersjön — **Salteby**. Torget och hamnen ÄNDRAS
   efter dina val: rikt/fattigt, lojalt/oroligt. `gameState.saltebyHumor`
   ('lojal' / 'neutral' / 'orolig') styr stadsbilden och introtexter.
2. **Retcon-bryggor** (som Einstein): tidigare val ekar i senare
   kapitlens introtext.
3. **Korpen Minne** kommenterar utifrån vad du gjort ("Jag minns när
   torget var fullt av folk. Nu är det tyst.").

### Förtida kris — inte förtida slut

Om **Makt ≥ 6 OCH Folkets stöd ≤ 3** vid slutet av kapitel 3 tänds
`gameState.overreach = true`. Då:
- Kapitel 4 öppnar med ett **upprorsutbrott** i Salteby (extra scen,
  inte game over).
- Ett "fredligt/generöst" val låses i kap 4 och 6 (med förklaring +
  förvarning, som Nobels rykteslås).
- Korpen och krönikan blir dystrare.
- Slutet lutar mot den hårda grenen.
Spelaren når ALLTID kapitel 7. Krisen är kännbar, aldrig avslutande.

### Slutgrenar (kapitel 7, alla spelbara & snällt inramade)

Beräknas på slutbalansen:
- **Det bestående riket** (Folkets stöd ≥ 6, balans) — stormakten
  faller men *landet* består; folket minns dig med värme.
- **Den ensamma kronan** (overreach / Makt hög, stöd lågt) — du blev
  mäktig men ensam; fallet blev hårt och folket bar kostnaden.
- **Den rika hamnen** (Välstånd ≥ 7) — riket blev rikt men beroende av
  andra; handeln överlevde kronan.
- **Den tysta staden** (allt lågt) — riket tynade stilla; även små
  handlingar spelade roll. *(aldrig "du förlorade")*

Slutet innehåller alltid en **"Vad hände på riktigt?"-ruta**
(historiebruk): jämför spelarens väg med det verkliga fallet
(Poltava 1709, freden i Nystad 1721).

---

## INTRO

> Salteby, en liten stad vid Östersjön. Här har folk fiskat, handlat och
> levt i hundratals år. En korp sitter på kyrktornet och ser allt.
> "Kraa. Jag är Minne", säger den. "Jag minns allt som händer här. Och
> nu ska något stort börja — ett rike ska resa sig, bli mäktigt, och
> sedan falla. Du får bestämma hur. Följ med genom seklen!"

Startmeny: **Börja resan** · **Välj kapitel** (kapitelväljare) ·
**Fortsätt** (om sparning finns). Svårighetsval på how-to-play.

---

## KAPITEL 1 — Unionen skakar (~1520)

**Recap (om man hoppar in):** "Sverige, Danmark och Norge styrs av en
enda kung i Kalmarunionen. Många svenskar är missnöjda."

**Scen:** Danska kungen Kristian har låtit halshugga många svenska
stormän i Stockholm (Stockholms blodbad). En ung adelsman, Gustav
Eriksson (Vasa), flyr till Dalarna för att få bönderna att göra uppror.
I Salteby samlas folk på torget och viskar: ska vi följa honom?

**VAL 1 — Vad gör Salteby?**
1. *Skicka män med Gustav* — "Saltebyborna tar sina yxor och följer.
   Farligt, men modigt." → Folkets stöd +1, Makt +1
2. *Vänta och se* — "Staden håller sig undan. Klokt kanske — men Gustav
   minns vilka som inte kom." → Välstånd +1, Folkets stöd −1
3. *Varna danskarna* — "Någon skickar bud till kungen. Staden skonas
   nu, men grannarna ser snett på er." → Välstånd +2, Folkets stöd −1

**KONSEKVENS:** VAL 1 sätter `ch1_uppror` → påverkar hur Gustav (som ny
kung) ser på Salteby i kap 2.

**MINISPEL — Flykten över fjället:** hjälp Gustav välja säker väg genom
Dalarnas snö undan danska ryttare (välj-väg/tajming).

**Lektionskrok:** *före genomgång* — "varför ville svenskarna bryta sig
loss?" Låt frågan hänga; genomgången svarar.

**Kapitelslut:** Gustav vinner. Unionen spricker. Sverige blir eget
rike — och Gustav blir kung. "Kraa. En ny tid", säger Minne.

---

## KAPITEL 2 — Kungen och kyrkan (~1527)

**Recap:** "Gustav Vasa är kung. Men riket är fattigt och skuldsatt —
kungen behöver pengar."

**Scen:** Kyrkan är stenrik: den äger jord, silver och guld. Kung Gustav
bestämmer att kronan ska ta över kyrkans rikedomar (reformationen). I
Salteby står klostret och den gamle munken Brother Anders. Kungens
fogde kommer för att hämta kyrksilvret.

**VAL 1 — Var står Salteby?**
1. *Ge kungen silvret* — "Fogden nickar nöjd. Kungen minns lojala
   städer." → Makt +2, Folkets stöd −1
2. *Göm en del åt kyrkan* — "Ni räddar munkarnas kalk — men riskerar
   kungens vrede." → Folkets stöd +1, Makt −1
3. *Låt folket bestämma på tinget* — "Ett rättvist beslut tar tid, men
   ingen känner sig överkörd." → Folkets stöd +1, Välstånd +1

**KONSEKVENS:** `ch2_kyrka` → om man gömde silver blir kungen misstänksam
(ekar i kap 3). Retcon: om `ch1_uppror==0` (skickade män) öppnar kap 2
med kungens tacksamhet.

**MINISPEL — Sätt trycktypen:** hjälp tryckaren sätta bokstäverna till
den första svenska bibeln (arrangera/pussla bokstavsbrickor). Historiskt:
reformationen gav bibeln på svenska.

**Källkoll-ruta:** Varför ville kungen ha en svensk bibel? Fundera på
vem som tjänade på att folk kunde läsa Guds ord själva — och vem som
förlorade makt.

**Lektionskrok:** *efter genomgång* om reformationen — låt dem uppleva
kungens val.

**Kapitelslut:** Kronan blir rik och stark. Kungamakten växer. Men
munken Anders lämnar klostret för sista gången. "Kraa. Det gamla tar
slut", säger Minne.

---

## KAPITEL 3 — Upproret (Dackefejden, 1542–43)

**Recap:** "Kungen har blivit mäktig. Han tar ut hårda skatter — och i
Småland är bönderna arga."

**Scen:** Nils Dacke leder Sveriges största bondeuppror mot kung Gustav.
Skatterna är tunga, och kungen har förbjudit den gamla gränshandeln med
Danmark. I Salteby kommer Dackes budbärare: vill ni resa er med oss?

**VAL 1 — Salteby och upproret:**
1. *Följ Dacke* — "Staden reser sig mot kungen. Modigt — men kungen slår
   hårt tillbaka mot upprorsmän." → Folkets stöd +2, Makt −2
2. *Stå med kungen* — "Ni skickar män att slå ner upproret. Kungen
   belönar er — men grannbyarna glömmer aldrig." → Makt +2, Folkets stöd −2
3. *Håll staden neutral* — "Ni stänger portarna och väntar ut stormen.
   Ingen ära, ingen skada." → Välstånd +1

**KONSEKVENS:** Sätter `ch3_dacke`. **Kontrollpunkt för overreach:** om
Makt ≥ 6 och Folkets stöd ≤ 3 här → `overreach=true`, Salteby blir
'orolig', och kapitel 4 öppnar med krisscen.

**MINISPEL — Samla byarna:** balansera stödet mellan byar (håll tre
mätare i balans utan att någon by känner sig lurad). *Om overreach:
svårare — byarna litar inte på dig.*

**Lektionskrok:** *före genomgång* — "får man göra uppror mot kungen?"
Etikfråga att ta med till klassen.

**Kapitelslut (två varianter):**
- *Normal:* Dacke besegras till slut, men kungen förstår att han inte
  kan pressa folket hur hårt som helst. En läxa i makt.
- *Overreach:* Upproret slås ner brutalt. Salteby är tyst och rädd.
  "Kraa. Jag minns när torget var fullt av skratt", säger Minne sorgset.

---

## KAPITEL 4 — Stormakten växer (1600-talet)

**Recap:** "Åren gick. Gustav Vasas barnbarn styr nu ett rike som växer.
Sverige krigar runt hela Östersjön — och vinner."

**[Overreach-öppning om aktiv]:** "Men i Salteby pyr oron. Skatterna för
krigen är tunga, och folk minns hur staden behandlades. På torget står
en upprorsfana." → kort krisscen, Folkets stöd −1, ett generöst val låses
längre fram.

**Scen:** Sverige blir en stormakt. Kungen (Gustav II Adolf) för krig i
Tyskland, och svenska soldater marscherar genom Europa. Salteby ligger
vid havet — härifrån seglar skepp med soldater och kommer hem med byten
och sår. Staden behöver försvaras.

**VAL 1 — Kriget och staden:**
1. *Skicka Saltebys unga män till kriget* — "Ära och byte lockar. Men
   många kommer aldrig hem." → Makt +2, Folkets stöd −1
2. *Satsa på handeln i stället* — "Medan andra krigar tjänar Salteby på
   att sälja tjära, järn och salt." → Välstånd +2
3. *Bygg försvar hemma* — "Murar och kanoner. Tryggt — men dyrt." →
   Makt +1, Välstånd −1, Folkets stöd +1

**VAL 2 (låst vid overreach) — En hungrande vinter:**
1. *Öppna kronans förråd åt folket* — [LÅST vid overreach: "Kronan har
   inget kvar att ge — allt gick till kriget."] → Folkets stöd +2
2. *Låt folket klara sig själva* — "Vintern blir hård. Några svälter." →
   Makt +1, Folkets stöd −1

**KONSEKVENS:** `ch4_krig`. **Förvarning:** om Folkets stöd < 4 här visas
"Märk väl: folket börjar tröttna. Ett rike utan folkets stöd står ostadigt."

**MINISPEL — Bygg fästningen:** placera murar och kanoner på ett rutnät
för att skydda hamnen (bygg/konstruera — ny mekanik).

**Lektionskrok:** *efter genomgång* om stormaktstiden — "hur blev lilla
Sverige en stormakt?"

**Kapitelslut:** Sverige är nu en av Europas mäktigaste stater. Flaggan
vajar över halva Östersjön. Men Minne ser längre: "Kraa. Det som växer
fort... kan falla fort."

---

## KAPITEL 5 — Fyra stånd, ett rike

**Recap:** "Riket är stort och mäktigt. Men alla lever inte lika. Sverige
är ett ståndssamhälle: adel, präster, borgare och bönder."

**Scen:** Inget krig i det här kapitlet — i stället ett nedslag i
vardagen. I Salteby bor alla fyra stånden: greven på slottet, prästen i
kyrkan, köpmannen vid torget, och bondefamiljen utanför staden. Vi ser
en dag i vars och ens liv. Vem betalar mest skatt? Vem bestämmer? Vems
barn får gå i skola?

**VAL 1 — Ett rättvist rike?**
1. *Låt adeln behålla sina förmåner* — "Greven är nöjd, kronan har
   lugn." → Makt +1, Folkets stöd −1
2. *Låt borgarna och bönderna få mer att säga till om* — "Farligt för
   adeln — men folket känner sig sedda." → Folkets stöd +2, Makt −1
3. *Ta tillbaka mark från adeln till kronan (reduktion)* — "Kungen blir
   rikare och starkare, adeln rasande." → Makt +2, Välstånd +1,
   Folkets stöd... beror (se konsekvens)

**KONSEKVENS:** `ch5_stand`. VAL 3 (reduktionen) ger Folkets stöd +1 om
Folkets stöd redan ≥ 5 (folket gläds åt att adeln stukas), annars −1
(folket bryr sig inte, bara adeln blir fiende). En nyanserad
konsekvens att prata om i klassen.

**MINISPEL — Ståndsvågen:** väg vad varje stånd *ger* (skatt, arbete,
soldater) mot vad de *får* (mark, makt, skydd). Håll vågen i balans —
eller välj medvetet att gynna ett stånd (balans/väg-mekanik, ny).

**Källkoll-ruta:** Hur vet vi hur folk levde? Genom **brev, dagböcker och
kartor** de lämnade efter sig. Men mest skrev de rika — de fattiga
bönderna kunde sällan skriva. Vems röst saknas i historien?

**Lektionskrok:** *före genomgång* om ståndssamhället — "var det
rättvist? Fanns det något bra med det?"

**Kapitelslut:** Riket står på höjden av sin makt. Men under ytan är det
ojämnt och spänt. Minne kraxar: "Kraa. Ett hus är inte starkare än sin
svagaste bjälke."

---

## KAPITEL 6 — Fallet (MÖRKT KAPITEL, ~1700–1721)

**Recap:** "Riket är mäktigast av alla — men grannarna är trötta på
Sveriges makt. Nu vänder allt."

**Scen (stillsam, som Einsteins/Nobels mörka kapitel — inget jubel):**
Kung Karl XII för Sverige i ett stort krig mot Ryssland och flera länder
samtidigt (stora nordiska kriget). Långt borta, vid Poltava 1709,
förlorar den svenska armén allt. Samtidigt kommer **pesten** till kusten.
I Salteby är hamnen tyst. Skeppen kommer inte hem. På torget brinner
ljus för de döda.

**Set-piece — Budet:** en ryttare kommer till Salteby med brevet om
nederlaget vid Poltava. Berättaren och en enda knapp; texten tonar fram
långsamt (som radion i Einstein, tidningen i Nobel — men **ett brev/bud**,
ny form). Inget minispel som firar — bara stillhet.

**VAL 1 — När allt faller:**
1. *Ta hand om de sjuka och hemlösa* — "Salteby öppnar sina dörrar.
   Modigt i en mörk tid." → Folkets stöd +2
2. *Rädda det du kan för din egen familj* — "Man förstår dig. Men staden
   minns vilka som stängde sin dörr." → Välstånd +1, Folkets stöd −1
3. *[LÅST vid overreach] Kalla folket till gemensamt försvar* — kräver
   Folkets stöd ≥ 4: "Folket samlas kring dig en sista gång." →
   Makt +1, Folkets stöd +1

**KONSEKVENS:** `ch6_fall`. Sätter tonen för slutet.

**Reflektionsskärm** (som Einstein kap 6): stillsam, "Vad kostade
stormakten? Och för vem?"

**Lektionskrok:** *efter genomgång* om stormaktens fall — "varför föll
Sverige? Kunde det ha slutat annorlunda?"

**Kapitelslut:** Freden i Nystad 1721. Sverige förlorar sina länder runt
Östersjön. Stormaktstiden är slut. Minne sitter tyst på tornet.

---

## KAPITEL 7 — Vad blev kvar (final + historiebruk)

**Recap:** "Stormakten föll. Men Salteby finns kvar. Och något lever
vidare."

**Scen:** Tiden hoppar ända fram till idag. Salteby är en modern liten
stad. På torget står ett **monument** över stormaktstiden, och gatorna
heter *Kungsgatan* och *Dackegatan*. Skolbarn går förbi. Hur minns vi det
som hände?

**Slutsekvens** (som Einsteins finale): tidslinje 1520 → 1721 → idag,
sedan **slutbalansen** och en av de fyra **slutgrenarna** (se ovan),
inramad snällt och som insikt.

**MINISPEL — Då och nu:** para ihop spår från stormaktstiden med hur de
syns idag (monument, gatunamn, ord, gränser). *Historiebruk-kriteriet.*

**"Vad hände på riktigt?"-ruta:** jämför spelarens Salteby-väg med den
verkliga historien (Poltava 1709, freden i Nystad 1721, att Sverige
därefter blev ett mindre men bestående land). Markera tydligt vad som är
påhittat (Salteby, Korpen Minne) och vad som hände på riktigt.

**Samlarbok/diplom:** 7 klistermärken (ett per kapitel), diplom vid 7/7.

---

## NEDSLAG (separata, lektionsstora ~10 min)

Fristående — behöver inte äventyrets sparning. Egna korta bågar.

### Nedslag A — Gustav Vasa
Ledaren med hårda val, i förstaperson: barndomen som gisslan, flykten,
uppror, kung, reformationen, de hårda skatterna. Val som visar priset för
makten. *Bär: aktör + kungamaktens framväxt.*

### Nedslag B — En dag i ståndssamhället
Växla mellan **bondflickan Kerstin** och **adelsdottern Beata** samma dag:
Kerstin upp i gryningen till gårdssysslor, ingen skola; Beata danslektion
och fransk guvernant. Samma ålder, olika världar. *Bär: likheter/skillnader
i levnadsvillkor mellan grupper — exakt den verifierade punkten.*

### Nedslag C — Häxprocessen (källkritik)
Under "det stora oväsendet" (1668–1676) anklagas en kvinna i byn för att
ha fört barn till Blåkulla. Du får läsa **domstolsprotokollet** — och se
hur bekännelsen tvingades fram. "Hur vet vi vad som hände?" Jämför vad
protokollet säger med vad vi förstår idag. *Bär: källkritik + mörk sida
+ historisk empati (bedöm efter samtidens rädsla, men ifrågasätt).*

---

## Manus-/röstnoter

- Korpen Minne = seriens nya röst-signatur i det här spelet (korta
  "Kraa"-repliker mellan kapitel — kan bli egna små röstklipp).
- Äldre citat (kungabrev, krönika) märks: "så här skrev man för 400 år
  sedan" — som Einsteins 🇩🇪-markering.
- Manus låses HÄR innan röst spelas in (David/eleven_v3).
