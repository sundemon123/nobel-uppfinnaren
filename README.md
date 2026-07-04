# Einstein: Tänkarens väg ⚛️

Ett berättelsedrivet pedagogiskt webbspel om Albert Einstein för
barn 7–11 år — spel 2 i serien efter
[Nobel: Uppfinnarens väg](https://sundemon123.github.io/nobel-uppfinnaren/).

**🎮 Spela:** _(publiceras via GitHub Pages när repot är uppe)_

## Om spelet

Följ Albert från kompassen han fick som femåring till fredsmanifestet
han skrev under dagarna före sin död. Sju kapitel med val och
konsekvenser, ett minispel per kapitel, en frågebok som minns dina
val, samlarbok med klistermärken — och ett allvar som barn tål:
flykten 1933 och ångern efter Hiroshima berättas rakt, inte bortdaltat.

### Kapitlen

1. **Kompassen** — magnetism och frågan om det osynliga 🧭
2. **Skolan som inte gillade frågor** — våga fråga varför 🎻
3. **Ljusstrålen och Mileva** — kuggad, och ändå på väg ✨
4. **Patentkontoret och mirakelåret** — fyra artiklar som ändrar allt 💡
5. **Solförmörkelsen** — beviset, pressen och Nobelpriset 🌞
6. **Flykten** — propaganda, bokbål och ett avsked 🕊️
7. **Brevet och freden** — E=mc², ansvaret och arvet ⚛️

### Funktioner

- **Val med konsekvenser** — resurserna Kunskap 📚, Fantasi 💡 och
  Mod 🦁 formar vägen; lågt mod låser det svåraste valet i finalen
- **7 minispel** — kompassjakt, härma melodin, rid på ljusstrålen,
  patentgranskning, böj ljuset runt solen, sant eller propaganda,
  då-och-nu-matchning
- **Alberts frågebok** — dagbok som skrivs om efter dina val
- **Källkritik på riktigt** — källkolls-rutor med två nivåer och ett
  helt minispel om propaganda
- **Tre svårighetslägen** — Lugn (7–8), Lagom, Klurig (9–11)
- **Berättarröst** på svenska (knappstyrd, aldrig autoplay) och
  ljudeffekter
- **Samlarbok** med klistermärken, stjärnor och diplom
- **Maskot:** Kompis Kompassen 🧭
- Självuppdaterande versionskontroll (uppdateringsbanner vid ny build)

### För lärare

Se **[LARARHANDLEDNING.md](LARARHANDLEDNING.md)** — en sida per
kapitel med samtalsfrågor och Lgr22-koppling (historiebruk,
källkritik, jämställdhet, historisk empati). Läroplansanalysen bakom
serien finns i Nobel-repots `LÄROPLAN.md`.

## Teknik

Hela spelet är en självförsörjande `index.html` — ingen byggkedja,
inga beroenden, funkar offline. Grafik som inline-SVG/canvas, ljud
som base64, sparning i localStorage. Berättarrösten genereras med
ElevenLabs (se `narration/README.md` när den är inspelad; pipelinen
delas med Nobel-spelet).

Utvecklingen dokumenteras i `KONCEPT.md`. Metoden — inklusive
speltest med fem AI-barnpersonas — bygger på `LÄRDOMAR.md` i
Nobel-repot.

## Historisk noggrannhet

Spelet följer forskningsläget men förenklar för åldersgruppen.
Osäkerheter (t.ex. hur mycket Mileva Marić bidrog till 1905 års
artiklar) markeras i spelets källkolls-rutor i stället för att
döljas. Kända förenklingar: dialoger är påhittade och tidslinjer
komprimerade.
