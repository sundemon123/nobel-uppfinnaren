# Speltest med fem barn-personas (juli 2026)

> **Status:** Testning pågår. Fem AI-personas spelar spelet i browser
> (Playwright, mobilvy) enligt metoden från Nobel-spelet. Rapporterna
> fylls på här; fixar bockas av efter P0-batchen.

| Persona | Profil | Dom |
|---|---|---|
| Elsa, 7 | Nybörjarläsare, behöver uppläsning | _(spelar)_ |
| Liam, 8 | Otålig gamer, skippar text, fuskar | _(spelar)_ |
| Maja, 9 | Noggrann samlare, läser allt | **4,5/5** — klarade allt, 7/7 märken |
| Noah, 10 | Faktanörd, gränstestare | _(spelar)_ |
| Vera, 11 | "För cool", dömer hårt | _(spelar)_ |

---

## Fynd från Maja (9 år) — verifierade

### Buggar (P0)

1. **Bofors-kvarleva i kapitel 5:** valet "skicka beräkningarna till
   Eddington" triggar Nobel-spelets gamla investeringsbonus
   *"✨ Bofors-investeringen ger avkastning! +4 💰"* och ger +4
   Fantasi på riktigt (makeChoice, Bofors-blocket). Sabbar
   poängbalansen.
2. **Topplistan visar Nobel-ikoner:** "💰 Fantasi" och "⭐ Mod" i
   slutuppställningen (ska vara 💡 och 🦁).
3. **Dubbel signatur** i frågebokens kapitel 7 ("/ Albert" i texten +
   modulens "— Albert").
4. **Stjärnräknaren i finalen** visar 🦁-ikon i stället för ⭐ innan
   avslöjandet (`ch7-starsScore`).
5. **Intro-porträttet trasigt:** tom img (strippad base64) visar
   alt-texten "Albert Einstein" svagt bakom ramen — behöver riktig
   SVG-illustration.

### Ton (P1)

6. **Maskoten skojar i kapitel 6** ("Pling!", "Snurr snurr… klick!" på
   bokbåls- och flyktskärmarna). Bör vara dold/tyst hela kapitel 6.
7. **Finalens konfetti** regnar visuellt över dödsbeskedet högst upp
   på samma scrollskärm.
8. Klistermärkes-fanfaren kunde vara tystare på kapitel 6-slutet.

### Design (P2)

9. **Omspel per kapitel:** stjärnorna fryses när kapitlet stängs —
   "Försök igen" finns bara på resultatskärmen. Önskemål: spela om
   minispel från samlarboken.
10. **Klurig-nivån i Fiolens toner** kräver noll fel på 4+5+6 toner i
    högt tempo för 3 stjärnor — på gränsen.

### Bekräftat bra (rör ej)

- Samlarloopen: klistermärken, stjärnuppdatering vid omspel, diplom
  vid 7/7 + "perfekt resa"-rad. ✅
- Frågeboken speglade alla val exakt i alla 7 kapitel. ✅
- Kapitel 6-tonen: noll konfetti, dova knappar, 🇩🇪-markerad
  propaganda. ✅
- "Fortsätt resa" efter avbrott mitt i kapitel 6: perfekt återställt. ✅
- Aldrig "underkänt" — 0 poäng ger 1 stjärna + snäll text. ✅
- Inga JS-fel under två hela genomspelningar. ✅
