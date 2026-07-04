# Historieresan — seriearkitektur

Modellen för hela spelserien. Läs den här FÖRE du börjar på ett nytt
spel. Bygger på `LÄRDOMAR.md` (beprövad 7–11-design) och `LÄROPLAN.md`
(Lgr22-analysen).

## Målgrupp och syfte

Berättelsedrivna, uppläsbara webbspel för svensk grundskola, med tyngd­
punkt på **mellanstadiet (åk 4–6, 9–12 år)** och Lugn-läget som ingång
för de yngre. Varje spel ska vara användbart i klassrum: förankrat i
kursplanens centrala innehåll och paketerat med en kort lärarhandledning
(reflektionen efteråt är enligt forskningen det som gör spel till
undervisning).

## Tvålagersmodellen: epok + nedslag

Serien är organiserad som svenska läroplanen är — kring **epoker och
skeenden**, inte kring kändisar. För varje epok finns två lager:

### Lager 1 — Äventyret (epokens skelett)

Ett övergripande spel som ger de stora dragen: kronologi, orsak och
verkan, kontinuitet och förändring, samhällsstrukturen. Res-/kartdrivet,
20–40 minuter, resurser och långa val. Det är **här strukturen bor** —
motgiftet mot "individualiserings-fällan" (att historia reduceras till
enskilda geniers bedrifter), som forskningen pekar ut som den centrala
didaktiska risken.

### Lager 2 — Nedslagen (människorna i epoken)

Flera korta vinjetter (5–12 min) som målande skildrar **vardagslivet**
eller **en viktig person**, ur olika gruppers perspektiv. Det är här
läroplanens komparativa krav uppfylls: hur livet skilde sig för **barn,
kvinnor, män och andra grupper**. Nedslagen bär historisk empati bättre
än ett översiktsäventyr någonsin kan, för de kommer nära en enda människa.

**Nedslagen löser tre läroplanskrav på en gång:**
- **Jämställdhet/mångfald** — en kvinna, ett barn, en ofri i *samma*
  epok täcker "kvinnors och mäns historia" och "andra grupper" utan att
  varje äventyr måste alternera perspektiv.
- **Historisk empati** — bedöm efter samtidens villkor, men bjud in till
  etisk reflektion (Skolverkets tvåstegsmodell).
- **Historiebruk & källkritik** — ett nedslag kan vara "Hur vet vi?":
  jämför en sagas skrytsamma version med vad utgrävningen visar.

## Varför modellen är bra

1. **Läroplansträff på två nivåer:** äventyret ger den kronologiska
   referensramen och orsak/verkan; nedslagen ger levnadsvillkoren och
   empatin. Tillsammans täcker de åk 4–6-historia både uppifrån och
   nedifrån.
2. **Variationen byggs in.** Seriedirektivet säger "återanvänd motorn,
   inte upplevelsen" (LÄRDOMAR §7). Här ÄR äventyr och nedslag olika
   format per definition — variation blir en egenskap, inte en kamp.
3. **Billigare och modulärt.** Nedslagen är korta, delar motorn, och kan
   släppas ett i taget efter äventyret.

## Formatskillnad (håll isär)

| | Äventyret | Nedslaget |
|---|---|---|
| Längd | 20–40 min | 5–12 min |
| Struktur | 7 kapitel, livs-/resebåge | 1 vivid skiva: en dag, ett ögonblick, en röst |
| Perspektiv | överblick, "de stora dragen" | nära, förstaperson, en grupp |
| Bär | kronologi, orsak/verkan, struktur | levnadsvillkor, empati, källkritik |
| Resurser | fulla, med finallås | få eller inga; känsla > poäng |

**Regel:** max 2 av ett spels minispelsmekaniker får delas med ett
tidigare spel i serien. Äventyr och nedslag i samma epok ska kännas
olika i formen (LÄRDOMAR §7).

## Klassrumsmodularitet — en lektion, ett kapitel

Spelen ska fungera i undervisningen, inte bara hemma. Varje kapitel
byggs därför som en **självbärande lektionsenhet (~10–15 min)**: krok →
val → minispel → reflektion → "till nästa gång"-teaser. Ett kapitel ska
kännas helt även om man aldrig spelar de andra.

- **Kapitelväljare** på startskärmen — läraren hoppar rakt till dagens
  kapitel (ingen omspelning av 1–3 för att nå 4).
- **"Detta hände sist"-recap** vid kapitelstart (det kan gå en vecka
  mellan lektionerna).
- **Fristående kallstart** med neutralt utgångsläge; konsekvenssystemet
  körs fullt ut vid sparning men degraderar elegant vid kallstart.
- **Före eller efter genomgång:** varje kapitel funkar som *krok* före
  lärarens genomgång (väcker frågor) eller *fördjupning* efter (låter
  dem uppleva/känna). Lärarhandledningen ger båda per kapitel — en sida
  per lektion.
- **Nedslagen är redan lektionsstora** och fristående — idealiska för
  "en lektion, ett nedslag", utan sparningsberoende.

Retrofit i Nobel/Einstein (kapitelväljare + recap) när tid finns.
Sparning över delade skolenheter löses separat, längre fram.

## Repostruktur (se README)

Ett repo per epok. Epoklandningen binder ihop äventyr + nedslag som
platser/kapitel på en karta:

```
<epok>/
  index.html          epoklandning (karta: välj äventyr eller nedslag)
  aventyr.html        det stora äventyrsspelet
  nedslag/
    <person1>.html
    <vardagsliv>.html
    <hurvivet>.html
```

Personspel som Nobel och Einstein är i praktiken **nedslag i epoken
1800–1900** (porträtt), som senare kan samlas under ett gemensamt
1800-tals-äventyr med ett "Emigranterna"-nedslag för vardagslivet.

## Epok-för-epok-karta (åk 4–6)

Grundad i den verifierade `LÄROPLAN-MELLANSTADIET.md`. **Lgr22 har TRE
epokblock för åk 4–6-historia** (inte fyra — 1700-talet ligger ihop med
1500-talet). Exakta rubriker + verifierat innehåll finns i den rapporten;
årskursfördelning och nedslag nedan är designförslag.

| Block (verifierad rubrik) | Äventyr | Nedslag (designförslag) | Årskurs* |
|---|---|---|---|
| Kulturmöten och statsbildning i Norden, ca **800–1500** | Vikingaresan | Trälflickan (ofria) · Völvan (kvinnor) · Runristaren (historiebruk + källkritik) | ~åk 4 |
| Maktförhållanden och levnadsvillkor i Norden, ca **1500–1800** | Maktens tid (Vasa → östersjövälde) | Gustav Vasa · ett liv i ståndssamhället · häxprocessen (källor) | ~åk 5 |
| Folkökning, ändrade maktförhållanden och emigration, ca **1800–1900** | Industri & utvandring | **Nobel ✓** · Emigranterna · en kvinnlig 1800-talsröst | ~åk 6 |

*Årskursfördelningen är vårt designförslag, inte ett läroplanskrav.

**Om Einstein/Curie:** åk 4–6-historia är Sverige/Norden-fokuserad.
Einstein och Curie ligger utanför det centrala innehållet för åk 4–6
(de hör till NO/teknik och åk 7–9:s världshistoria) — värdefulla spel,
men marknadsför dem inte som åk 4–6-historia. Där vinner de
svensk/nordiskt förankrade berättelserna.

## Byggordning per spel (från LÄRDOMAR)

innehåll/kapitel → minispel → speltesta med fem barn-personas → fixa P0
→ ton/läsbarhet → LÅS TEXTERNA → spela in röst → ljudeffekter → deploy
med versionskontroll → riktiga barn.
