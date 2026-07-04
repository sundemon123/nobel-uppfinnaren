# Berättarröst & ljudeffekter (ElevenLabs)

Spelets svenska berättarröst är **David** (`M336tBVZHWWiWb4R54ui`,
"Deep, Soothing and Sincere") med modellen **eleven_v3** — samma röst
som i Nobel: Uppfinnarens väg, så att serien låter enhetligt.

## Innehåll

- `manus.json` — uppläsningstext per skärm-id (52 poster, ~14 000
  tecken), extraherad ur spelets **låsta** skärmtexter efter
  speltest-fixarna.
- `sfx-prompts.json` — promptar för de 8 ljudeffekterna
  (`/v1/sound-generation`), bl.a. kompass-pling och stillsamt
  klockspel.
- `generate-narration.mjs` — `--list-voices`, `--voice ID [--only id]`
  och `--inject` (bäddar in klippen som base64 i `index.html`).

## Pipeline (samma som Nobel-spelet)

1. **Lås texterna först** — annars spelas allt in två gånger.
2. Generera i `mp3_44100_128`, komprimera med ffmpeg
   (`-ac 1 -b:a 64k`) — uttalet sitter i tagningen, inte bitraten.
3. `node narration/generate-narration.mjs --inject` byter ut klippen
   i `index.html` via konventionen `<audio id="narrator-SKÄRM-ID">`.
4. Enstaka omtagningar: redigera `manus.json`, generera med
   `--only skärm-id`, injecta igen.
5. Ljudeffekterna bäddas in i `<audio id="nobel-sfx-NAMN">`
   (elementnamnen delas med Nobel-motorn).

> **Molnmiljö-fälla:** Nodes fetch går förbi nätverksproxyn — generera
> med `curl` i molnsessioner (se scratchpad-scripten) eller kör lokalt.
> Committa aldrig API-nyckeln; `narration/clips/` ligger i .gitignore.
