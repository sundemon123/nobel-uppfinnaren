# Motor — det spelen delar

Här bor den delade tekniken som varje spel i serien återanvänder. Enligt
seriedirektivet (LÄRDOMAR §7): **återanvänd motorn, inte upplevelsen.**

## Vad som återanvänds osynligt (kopiera fritt)

Ur ett befintligt spels `index.html`:

- **Spelmotorn** — `goToScreen`, `makeChoice` (med `_answered`-guard),
  `applyChoiceRequirements`, resurser + finallås, autosave (tyst),
  versionskontrollen (`GAME_BUILD` + `version.txt` + uppdateringsbanner).
- **Minispelsramverket** (`NobelMinigames`) — varje spel är en IIFE med
  `init/start/getScore/destroy`; delade helpers `showResult`,
  `notifyDone` (deterministisk fortsätt-knapp), `nmgDifficulty`,
  `createCanvas`, `getPointerPos`, `shuffle`, `roundRect`.
- **Ljudsystemet** (`NobelSound`) — syntes + sample-first-uppspelning.
- **Narrator-modulen** — knappstyrd uppläsning, konventionen
  `<audio id="narrator-SKÄRM-ID">`.
- **Klistermärken + diplom**, maskotmodulen, svårighetslägena,
  leaderboard med offline-kö.

## Vad som ALLTID varieras synligt (skriv nytt per spel)

Kapitelstruktur, dagboks-/artefaktgreppet, det mörka kapitlets form,
resursernas namn och dynamik, minispelen (max 2 av 7 delade mekaniker),
maskot, palett, typografi. Se `../SERIE.md` och `../LÄRDOMAR.md §7`.

## Röst- och ljudpipeline

- `generate-narration.mjs` — genererar MP3-klipp via ElevenLabs och
  bäddar in dem i spelets `index.html`.
  - `--list-voices` · `--voice ID [--only id1,id2]` · `--inject`
  - Seriens röst: **David** `M336tBVZHWWiWb4R54ui`, modell `eleven_v3`.
  - Genereras i 128 kbps, komprimeras med ffmpeg (`-ac 1 -b:a 64k`).
  - `--inject` processar bara nycklar i `manus.json` (så SFX-klipp i
    samma mapp inte förorenar inbäddningen).
- `sfx-prompts.json` — mall för 8 ljudeffekter (`/v1/sound-generation`).

Varje spel har sin egen `narration/manus.json` (skärm-id → text) och
sina egna klipp. `narration/clips/` ska ligga i `.gitignore` (klippen
bakas in i `index.html`).

> **Molnmiljö-fälla:** Nodes fetch går förbi nätverksproxyn — generera
> med `curl` i molnsessioner, eller kör lokalt. Committa aldrig
> API-nyckeln.
