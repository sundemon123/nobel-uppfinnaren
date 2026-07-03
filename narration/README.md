# Berättarröst (ElevenLabs)

Här finns allt för att spela in spelets berättarröst med en konsekvent
röst — manus för samtliga 50 skärmar och ett script som genererar och
bäddar in klippen.

## Innehåll

- `manus.json` — uppläsningstext per skärm-id, i spelordning
  (~14 500 tecken totalt). Texterna är hämtade från spelets aktuella
  skärmtexter efter korrektur- och läsbarhetsfixarna, så de stämmer
  med det som står på skärmen.
- `generate-narration.mjs` — genererar MP3-klipp via ElevenLabs API
  och bäddar in dem i `index.html` som base64 (samma format som de
  befintliga klippen).

## Så här gör du

```bash
export ELEVENLABS_API_KEY=din-nyckel   # committa ALDRIG nyckeln

# 1. Lista röster och se teckensaldo — välj en svensk/varm berättarröst
node narration/generate-narration.mjs --list-voices

# 2. Provlyssna med några klipp först
#    (M336tBVZHWWiWb4R54ui = "David - Deep, Soothing and Sincere",
#    spelets berättarröst)
node narration/generate-narration.mjs --voice M336tBVZHWWiWb4R54ui --only intro,ch1-title,ch1-minigame

# 3. Generera allt (klippen hamnar i narration/clips/)
node narration/generate-narration.mjs --voice M336tBVZHWWiWb4R54ui

# 4. Bädda in i index.html
node narration/generate-narration.mjs --inject
```

Lyssna-knappen i spelet hittar klippen automatiskt via konventionen
`<audio id="narrator-SKÄRM-ID">` — steg 4 byter ut de gamla klippen
och lägger till klipp för skärmarna som saknade röst (intro,
howtoplay, alla minispel, tidnings- och reflektionsskärmen).

## Att tänka på

- Modellen är `eleven_v3` i 128 kbps (mest uttrycksfull, matchar
  originalinspelningarnas kvalitet); välj
  gärna en röst märkt svensk i rösterbiblioteket, annars funkar de
  flesta varma berättarröster.
- Manuset är ~14 500 tecken — kontrollera teckensaldot med
  `--list-voices` innan du kör allt.
- Vill du ändra en text: redigera `manus.json`, kör om med
  `--only skärm-id` och sedan `--inject` igen.
- `narration/clips/` bör inte committas (klippen bakas ju in i
  `index.html`) — den ligger i `.gitignore`.

> Obs: Claude Code-molnmiljöns nätverkspolicy blockerar
> `api.elevenlabs.io`, därför körs scriptet lokalt. Alternativt kan
> domänen tillåtas i miljöns nätverksinställningar så kan även en
> molnsession köra det.
