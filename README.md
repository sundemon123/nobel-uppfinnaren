# Historieresan 🧭

Hubb för en serie berättelsedrivna pedagogiska historiespel för svensk
grundskola, med tyngdpunkt på **mellanstadiet (åk 4–6)**. Varje spel är
en självförsörjande webbsida (ett `index.html`, ljud inbäddat, funkar
offline) förankrad i Lgr22.

**🌐 Landningssida:** publiceras via GitHub Pages från det här repot.

## Vad som finns här

Det här repot är seriens **nav** — det delade som inte hör till ett
enskilt spel:

- **[SERIE.md](SERIE.md)** — seriearkitekturen (epok + nedslag-modellen).
  Läs den innan du bygger ett nytt spel.
- **[LÄRDOMAR.md](LÄRDOMAR.md)** — playbooken: beprövad 7–11-design,
  speltestmetoden, teknisk arkitektur, ljudpipeline, buggklasser,
  variationsdirektivet.
- **[LÄROPLAN.md](LÄROPLAN.md)** — Lgr22-analysen (deep research,
  verifierad mot Skolverket) som styr person-/temaurval och
  läroplansförankring.
- **[LÄROPLAN-MELLANSTADIET.md](LÄROPLAN-MELLANSTADIET.md)** — fokuserad
  åk 4–6-analys: de tre verifierade epokblocken, betygskriterier→mekanik,
  angränsande SO, samt designförslag på årskursfördelning och nedslag.
- **`motor/`** — röst-/ljudpipelinen (`generate-narration.mjs`,
  `sfx-prompts.json`) och motormallen som spelen delar.
- **`index.html`** — seriens landningssida.

## Spelen (ett repo per epok/spel)

| Spel | Epok | Årskurs | Status | Repo |
|---|---|---|---|---|
| Nobel: Uppfinnarens väg | 1800-tal | åk 4–6 | 🟢 live | `nobel-uppfinnaren` |
| Einstein: Tänkarens väg | 1900-tal | åk 4–6 | 🟡 klar, ej deployad | `einstein-tankarens-vag` |
| Stormaktstiden: Rikets väg | ca 1500–1800 | åk 5 | 🔵 koncept | `stormaktstiden` |
| _(kommande)_ Vikingaresan | ca 800–1500 | åk 4 | ⚪ planerad | — |

## Repostruktur — varför polyrepo + hubb

Varje spel är ett **~13 MB självförsörjande `index.html`** med all ljud
inbäddad som base64. Ett monorepo skulle svälla git-historiken kraftigt
(varje ombygge ändrar hela blobben). Därför:

- **Ett repo per spel/epok** — egen GitHub Pages-sida, egen
  versionskontroll, historiken hålls per spel.
- **Det här hubb-repot** — allt delat (playbook, läroplansanalys,
  motormall, pipeline) på ett ställe, plus landningssidan som binder
  ihop serien.

Spelen kan bygga sin röst med pipelinen i `motor/` och ärver
designreglerna i `LÄRDOMAR.md` / `SERIE.md`.

## Sätta upp ett nytt spel

1. Skapa ett nytt repo (`<epok>` eller `<person>-…`).
2. Kopiera motormallen och följ byggordningen i `SERIE.md`.
3. Lägg till spelet i tabellen ovan och på landningssidan.
4. Aktivera GitHub Pages (main, root).
