# Nobel: Uppfinnarens väg

Ett pedagogiskt berättelsespel om Alfred Nobels liv för barn i åldern
7–11 år. Följ Alfred från fattig pojke i Stockholm till Nobelprisets
skapare — gör val, spela minispel, samla klistermärken och forma hans
eftermäle.

**🎮 Spela här: https://sundemon123.github.io/nobel-uppfinnaren/**

## Innehåll

- **7 kapitel** med förgrenade val som påverkar berättelsen, resurserna
  (Kunskap, Kapital, Rykte, Eftermäle) och slutet
- **7 minispel** — ett per kapitel (skattjakt, kemilabb, balansbana,
  dynamitblandning, leveranskarta, sant/falskt-stämpling, prisutdelning)
- **Svensk berättarröst** på varje skärm (Lyssna-knappen) — för barn
  som ännu inte läser flytande
- **Tre svårighetslägen**: Lugn (7–8 år), Lagom och Klurig (9–11 år)
- **Samlarbok** med klistermärken och stjärnor, diplom vid full bok
- **Nobelkatten** 🐈 — klickbar maskot som jamar och peppar
- **Alfreds dagbok** som skrivs om utifrån spelarens val
- **Topplista** med offline-stöd för skolnätverk

## Teknik

Hela spelet är **en enda självförsörjande fil**: `index.html` (~14 MB).
All kod, grafik och allt ljud ligger inbäddat — ingen byggkedja, inga
beroenden att installera. Deploy = servera filen statiskt (GitHub Pages
publicerar automatiskt från `main`).

Externa beroenden i drift (spelet fungerar utan båda):

- **Google Fonts** (Playfair Display, Source Sans 3, Caveat) — faller
  tillbaka på systemtypsnitt offline
- **Topplistan** — Cloudflare Worker på
  `nobel-leaderboard.jonatan-sundemo.workers.dev`; vid nätverksfel
  köas resultat lokalt och skickas senare

## Utveckling

Öppna `index.html` i en webbläsare — klart. All källkod ligger inline i
filen (spelmotor, minispelsmodulen `NobelMinigames`, ljudsystemet
`NobelSound`, dagboken `NobelDiary`).

### Berättarröst och ljudeffekter

Katalogen `narration/` innehåller verktyg för att (om)generera allt
ljud med ElevenLabs:

- `manus.json` — uppläsningstext per skärm-id
- `generate-narration.mjs` — genererar och bäddar in röstklipp
  (se `narration/README.md`)
- `sfx-prompts.json` — prompter för ljudeffekterna

### Dokumentation

- `FÖRBÄTTRINGAR.md` — designplan och genomförda förbättringar
- `SPELTEST.md` — speltestrapport (fem barn-personas) med åtgärdslista
