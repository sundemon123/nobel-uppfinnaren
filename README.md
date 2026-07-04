# Stormaktstiden: Rikets väg ⚔️👑

Ett berättelsedrivet, uppläsbart pedagogiskt webbspel om **svenska
stormaktstiden (ca 1500–1800)** för **åk 5** i grundskolan. Spel 3 i serien
[**Historieresan**](https://github.com/sundemon123/historieresan) (efter Nobel
och Einstein) — och seriens första *epok-äventyr* och första *klassrums­modulära*
spel.

Du följer den lilla staden **Salteby** vid Östersjön genom ett helt rikes
uppgång och fall — från att Gustav Vasa bryter Kalmarunionen, genom
reformationen, Dackefejden och stormakten, till Poltava och fallet — med
korpen **Minne** som guide och källkritisk röst.

**🎮 Spela:** publiceras via GitHub Pages (aktivera Pages → main → root).

## Vad som gör det till mer än en biografi

- **Ett skeende, inte en hjälte.** Strukturen bär berättelsen — ett rikes
  uppgång och fall — inte en enskild kändis. (Motgift mot att historia
  reduceras till geniers bedrifter.)
- **En lektion = ett kapitel.** Sju självbärande lektionsenheter (~10–15 min)
  med kapitelväljare, "detta har hänt"-recap och fristående kallstart.
  Se **[LARARHANDLEDNING.md](LARARHANDLEDNING.md)**.
- **Konsekvenser med tyngd, aldrig game over.** Tre resurser (Makt/Välstånd/
  Folkets stöd) med *omvänt lås*: maxar man makten utan folkets stöd
  översträcker sig riket och faller hårdare — men man når alltid slutet.
  Fyra snällt inramade slutgrenar på slutbalansen.
- **Källkritik & historiebruk** som röd tråd: *vem berättar, och varför?*
  Slutet skiljer det påhittade (Salteby, Korpen Minne) från vad som hände
  på riktigt (Poltava 1709, freden i Nystad 1721).

## Läroplan (Lgr22, historia åk 4–6)

Block **"Maktförhållanden och levnadsvillkor i Norden, ca 1500–1800"** —
kampen om makten, reformationen/kungamakten, uppror, östersjöväldets
uppgång och fall, levnadsvillkor mellan grupper i ståndssamhället, samt
källor och historiebruk. Full koppling i lärarhandledningen.

## Teknik

- **Ett självförsörjande `index.html`** — all kod, grafik och (kommande) ljud
  inbäddat. Funkar offline, inget bygg­steg, inget konto.
- Delad motor från serien: minispelsramverk, ljudsystem, uppläst berättar­röst
  (ElevenLabs), klistermärken/diplom, tre svårighetslägen, autospar,
  versionskontroll (`GAME_BUILD` + `version.txt`).
- Testat: hela berättelsen (alla val­vägar), konsekvenssystemet, de fyra
  slutgrenarna och alla sju minispel — end-to-end i webbläsare.

## Nedslag (den mänskliga nivån)

Enligt seriens tvålagersmodell (äventyr + nedslag) finns korta, lektionsstora
förstapersonsvinjetter som kommer nära en enda människa:

- **[Gustav Vasa — Ett liv](nedslag/gustav-vasa.html)** ✅ — ledaren med hårda
  val, i förstaperson: gisslan, flykten, blodbadet, upproret, kronan,
  reformationen och de hårda skatterna. Visar *priset för makten* och hur en
  kung minns olika. Fristående (~10 min), ingen sparning behövs.
- _(kommande)_ En dag i ståndssamhället · Häxprocessen (källkritik)

## Status

🟡 **Äventyret (7 kapitel) + minispel + första nedslaget klara och
speltestade.** Kvar: berättarröst + ljudeffekter (ElevenLabs), och fler nedslag.

## Filer

- `index.html` — hela spelet
- `KONCEPT.md` — designkoncept
- `INNEHALL.md` — allt authored innehåll (val, effekter, konsekvenser)
- `LARARHANDLEDNING.md` — för läraren, en sida i klassrummet
- `narration/` — röst-/ljudpipeline
