/**
 * ============================================================
 *  ALFRED'S DIARY — "Alfreds dagbok"
 *  Nobel: Uppfinnarens väg
 * ============================================================
 *
 *  A personal diary system that shows handwritten-style entries
 *  from Alfred Nobel's perspective after each chapter, reflecting
 *  the specific choices the player made.
 *
 *  API:
 *    NobelDiary.show(chapterNumber)   — show diary overlay
 *    NobelDiary.hide()                — close diary overlay
 *    NobelDiary.getEntry(chapter)     — return { date, text } for chapter
 *
 *  Depends on:
 *    - window.gameState  (the game's global state object)
 *    - CSS custom properties defined in the main game stylesheet
 *
 *  Usage: include this file via <script src="nobel-diary-system.js">
 *         after the main game script (so gameState exists).
 * ============================================================
 */

var NobelDiary = (function () {
  'use strict';

  // ── Google Font injection ──────────────────────────────────
  (function injectFont() {
    if (document.querySelector('link[href*="Caveat"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  })();

  // ── CSS injection ──────────────────────────────────────────
  (function injectStyles() {
    if (document.getElementById('nobel-diary-styles')) return;
    var style = document.createElement('style');
    style.id = 'nobel-diary-styles';
    style.textContent = ''

    /* ── overlay backdrop ─────────────────────── */
    + '.diary-overlay {'
    + '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;'
    + '  background: rgba(44, 24, 16, 0.65);'
    + '  z-index: 200; display: flex; align-items: center; justify-content: center;'
    + '  opacity: 0; pointer-events: none;'
    + '  transition: opacity 0.5s ease;'
    + '  padding: 16px;'
    + '}'
    + '.diary-overlay.open {'
    + '  opacity: 1; pointer-events: all;'
    + '}'

    /* ── parchment card ───────────────────────── */
    + '.diary-card {'
    + '  position: relative;'
    + '  max-width: 520px; width: 100%;'
    + '  max-height: 85vh;'
    + '  overflow-y: auto;'
    + '  background:'
    + '    repeating-linear-gradient('
    + '      0deg,'
    + '      transparent,'
    + '      transparent 31px,'
    + '      rgba(139, 105, 20, 0.07) 31px,'
    + '      rgba(139, 105, 20, 0.07) 32px'
    + '    ),'
    + '    linear-gradient(135deg,'
    + '      var(--parchment-dark) 0%,'
    + '      var(--parchment, #f5edd6) 25%,'
    + '      var(--parchment, #f5edd6) 60%,'
    + '      var(--parchment-dark) 100%'
    + '    );'
    + '  border: 2px solid var(--brown-light, #8b7a62);'
    + '  border-radius: 4px;'
    + '  padding: 48px 36px 36px;'
    + '  box-shadow:'
    + '    0 8px 32px rgba(44, 24, 16, 0.35),'
    + '    inset 0 0 60px rgba(139, 105, 20, 0.06);'
    + '  transform: translateY(40px) scale(0.96);'
    + '  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);'
    + '}'
    + '.diary-overlay.open .diary-card {'
    + '  transform: translateY(0) scale(1);'
    + '}'

    /* ── ink stains (decorative pseudo-elements) ── */
    + '.diary-card::before {'
    + '  content: "";'
    + '  position: absolute; top: -8px; right: 24px;'
    + '  width: 40px; height: 40px;'
    + '  background: radial-gradient(ellipse at 50% 50%,'
    + '    rgba(44, 24, 16, 0.12) 0%,'
    + '    rgba(44, 24, 16, 0.06) 40%,'
    + '    transparent 70%'
    + '  );'
    + '  border-radius: 50% 50% 45% 55%;'
    + '  transform: rotate(-15deg);'
    + '  pointer-events: none;'
    + '}'
    + '.diary-card::after {'
    + '  content: "";'
    + '  position: absolute; bottom: 12px; left: 18px;'
    + '  width: 28px; height: 22px;'
    + '  background: radial-gradient(ellipse at 60% 40%,'
    + '    rgba(44, 24, 16, 0.10) 0%,'
    + '    rgba(44, 24, 16, 0.04) 50%,'
    + '    transparent 75%'
    + '  );'
    + '  border-radius: 55% 45% 50% 50%;'
    + '  transform: rotate(8deg);'
    + '  pointer-events: none;'
    + '}'

    /* ── additional ink splatter ─────────────── */
    + '.diary-stain {'
    + '  position: absolute;'
    + '  border-radius: 50%;'
    + '  pointer-events: none;'
    + '}'
    + '.diary-stain--1 {'
    + '  top: 60px; left: -6px; width: 18px; height: 14px;'
    + '  background: radial-gradient(ellipse,'
    + '    rgba(44, 24, 16, 0.08) 0%, transparent 70%);'
    + '  transform: rotate(25deg);'
    + '}'
    + '.diary-stain--2 {'
    + '  bottom: 70px; right: 10px; width: 24px; height: 18px;'
    + '  background: radial-gradient(ellipse,'
    + '    rgba(90, 58, 40, 0.07) 0%, transparent 65%);'
    + '  transform: rotate(-12deg);'
    + '}'

    /* ── wax seal ─────────────────────────────── */
    + '.diary-seal {'
    + '  position: absolute; top: -18px; left: 50%; transform: translateX(-50%);'
    + '  width: 44px; height: 44px; border-radius: 50%;'
    + '  background:'
    + '    radial-gradient(circle at 35% 35%,'
    + '      #c0392b 0%, #922b21 40%, #6e2118 80%, #4a1610 100%);'
    + '  box-shadow:'
    + '    0 2px 8px rgba(44, 24, 16, 0.4),'
    + '    inset 0 -2px 4px rgba(0,0,0,0.2),'
    + '    inset 0 2px 3px rgba(255,255,255,0.15);'
    + '  display: flex; align-items: center; justify-content: center;'
    + '  z-index: 2;'
    + '}'
    + '.diary-seal::after {'
    + '  content: "N";'
    + '  font-family: var(--font-headline, "Playfair Display", Georgia, serif);'
    + '  font-size: 20px; font-weight: 700;'
    + '  color: rgba(255, 220, 180, 0.8);'
    + '  text-shadow: 0 1px 2px rgba(0,0,0,0.3);'
    + '}'

    /* ── header ───────────────────────────────── */
    + '.diary-header {'
    + '  text-align: center; margin-bottom: 20px;'
    + '}'
    + '.diary-title {'
    + '  font-family: var(--font-headline, "Playfair Display", Georgia, serif);'
    + '  font-size: 1.3rem; font-weight: 600;'
    + '  color: var(--brown-dark, #2c1810);'
    + '  margin-bottom: 4px;'
    + '}'
    + '.diary-date {'
    + '  font-family: var(--font-body, "Source Sans 3", sans-serif);'
    + '  font-size: 0.85rem; font-style: italic;'
    + '  color: var(--brown-medium, #5a3a28);'
    + '  opacity: 0.8;'
    + '}'

    /* ── divider ──────────────────────────────── */
    + '.diary-divider {'
    + '  width: 60%; height: 1px; margin: 16px auto;'
    + '  background: linear-gradient(to right,'
    + '    transparent,'
    + '    var(--brown-light, #8b7a62),'
    + '    transparent'
    + '  );'
    + '  opacity: 0.4;'
    + '}'

    /* ── diary text ───────────────────────────── */
    + '.diary-text {'
    + '  font-family: "Caveat", cursive;'
    + '  font-size: 1.35rem; line-height: 1.7;'
    + '  color: var(--brown-dark, #2c1810);'
    + '  white-space: pre-wrap;'
    + '  min-height: 100px;'
    + '}'
    + '.diary-text .diary-char {'
    + '  opacity: 0;'
    + '}'
    + '.diary-text .diary-char.visible {'
    + '  opacity: 1;'
    + '}'

    /* ── cursor (blinking pen nib) ────────────── */
    + '.diary-cursor {'
    + '  display: inline-block;'
    + '  width: 2px; height: 1.1em;'
    + '  background: var(--brown-dark, #2c1810);'
    + '  vertical-align: text-bottom;'
    + '  margin-left: 1px;'
    + '  animation: diary-blink 0.7s step-end infinite;'
    + '}'
    + '@keyframes diary-blink {'
    + '  0%, 100% { opacity: 1; }'
    + '  50% { opacity: 0; }'
    + '}'

    /* ── signature ────────────────────────────── */
    + '.diary-signature {'
    + '  font-family: "Caveat", cursive;'
    + '  font-size: 1.4rem; font-weight: 600;'
    + '  text-align: right;'
    + '  color: var(--brown-dark, #2c1810);'
    + '  margin-top: 20px;'
    + '  opacity: 0;'
    + '  transition: opacity 0.8s ease;'
    + '}'
    + '.diary-signature.visible { opacity: 1; }'

    /* ── close button ─────────────────────────── */
    + '.diary-close-btn {'
    + '  display: block; margin: 24px auto 0;'
    + '  padding: 10px 28px;'
    + '  font-family: var(--font-body, "Source Sans 3", sans-serif);'
    + '  font-size: 0.95rem; font-weight: 600;'
    + '  color: var(--parchment, #f5edd6);'
    + '  background: linear-gradient(135deg,'
    + '    var(--brown-medium, #5a3a28),'
    + '    var(--brown-dark, #2c1810)'
    + '  );'
    + '  border: 1px solid var(--brown-light, #8b7a62);'
    + '  border-radius: 6px;'
    + '  cursor: pointer;'
    + '  opacity: 0;'
    + '  transition: opacity 0.5s ease, transform 0.2s ease, box-shadow 0.2s ease;'
    + '  box-shadow: 0 2px 8px rgba(44, 24, 16, 0.25);'
    + '}'
    + '.diary-close-btn.visible { opacity: 1; }'
    + '.diary-close-btn:hover {'
    + '  transform: translateY(-1px);'
    + '  box-shadow: 0 4px 12px rgba(44, 24, 16, 0.35);'
    + '}'
    + '.diary-close-btn:active { transform: translateY(0); }'

    /* ── skip hint ────────────────────────────── */
    + '.diary-skip-hint {'
    + '  text-align: center; margin-top: 10px;'
    + '  font-family: var(--font-body, "Source Sans 3", sans-serif);'
    + '  font-size: 0.75rem; color: var(--brown-light, #8b7a62);'
    + '  opacity: 0; transition: opacity 0.4s ease;'
    + '}'
    + '.diary-skip-hint.visible { opacity: 0.7; }'

    /* ── responsive ───────────────────────────── */
    + '@media (max-width: 500px) {'
    + '  .diary-card { padding: 40px 20px 28px; }'
    + '  .diary-text { font-size: 1.15rem; }'
    + '  .diary-title { font-size: 1.15rem; }'
    + '}';

    document.head.appendChild(style);
  })();


  // ══════════════════════════════════════════════════════════════
  //  DIARY ENTRY TEXTS — per chapter, per choice combination
  // ══════════════════════════════════════════════════════════════

  /**
   * Each generator receives gameState.choices and returns
   * { date: String, text: String }
   */
  var entryGenerators = {};

  // ── CHAPTER 1 — 1833, Stockholm ────────────────────────────
  entryGenerators[1] = function (ch) {
    var date = 'Stockholm, den 21 oktober 1833';
    var lines = [];

    // Opening — always the same mood
    lines.push('Kära dagbok,');
    lines.push('');

    // ch1_days
    if (ch.ch1_days === 0) {
      lines.push('Jag har åter tillbringat dagen med mina böcker. Mamma säger att jag läser för mycket, att en pojke borde leka med de andra barnen. Men bokstäverna talar till mig på ett sätt som andra barn icke gör. I kemins formler finner jag en ordning som den fattiga världen utanför saknar.');
    } else if (ch.ch1_days === 1) {
      lines.push('Idag hjälpte jag mamma med hushållet igen. Hennes händer är spruckna av arbete, och jag skäms över att jag icke kan göra mer. Men hon log mot mig och sade att jag var hennes största rikedom. Jag svär att en dag skall jag ge henne ett bättre liv.');
    } else {
      lines.push('Jag har irrat genom Stockholms gränder hela dagen, frågande och undersökande allting. En apotekare lät mig se hans kemikalier — fascinerade! Min ficka är nu tom, men mitt sinne är rikt som en kung.');
    }

    lines.push('');

    // ch1_russia
    if (ch.ch1_russia === 0) {
      lines.push('Pappa skriver från Ryssland att vi skall förenas. Jag bävar och gläds på samma gång — att lämna Stockholm, dessa gator jag känner så väl, det skär i hjärtat. Men familjen hör samman, och kanhända väntar något stort bortom horisonten.');
    } else {
      lines.push('Pappa har rest till Ryssland, men jag stannar. Det var mitt eget val, fast det känns som om någon ryckt bort halva mitt hjärta. Här finns mina böcker, mina experiment — men på nätterna är tystnaden outhärdlig.');
    }

    lines.push('');
    lines.push('Jag är blott en pojke ännu. Men jag känner att livet har något i beredskap för mig — om jag blott har mod att gripa det.');

    return { date: date, text: lines.join('\n') };
  };

  // ── CHAPTER 2 — 1850-talet, Sankt Petersburg ──────────────
  entryGenerators[2] = function (ch) {
    var date = 'Sankt Petersburg, den 14 mars 1852';
    var lines = [];

    lines.push('Kära dagbok,');
    lines.push('');

    // ch2_education
    if (ch.ch2_education === 0) {
      lines.push('Kemin har blivit mitt allt. Professor Zinin visar mig ting som förvandlar min förståelse av världen — att materien själv kan tämjas och omformas! Jag arbetar vid laboratoriebänken tills ljusen brinner ned, och ändå vill jag icke sluta.');
    } else if (ch.ch2_education === 1) {
      lines.push('Jag har läst Shelley ånyo idag, och hans ord brinner i mig som eld. Kanhända borde jag blivit poet snarare än kemist. Orden forsar ur mig, men världen vill ha uppfinnare, icke drömmare. Ändå — är icke varje uppfinning först en dröm?');
    } else if (ch.ch2_education === 2) {
      lines.push('Paris! London! Vilka städer, vilka sinnen jag mött! Resorna har öppnat mina ögon för hur stor och underbar världen är. Varje nytt laboratorium, varje ny filosof jag talat med har lagt ännu en sten i den grund jag bygger mitt liv uppå.');
    } else {
      lines.push('Fader önskar att jag studerar ingenjörskonst, och jag lyder. Det är praktiskt och nyttigt, säger han. Jag kan icke neka att det finns skönhet i att bygga maskiner — men mitt hjärta dras till de kemiska mysterierna bakom allt.');
    }

    lines.push('');

    // ch2_nitro
    if (ch.ch2_nitro === 0) {
      lines.push('Nitroglycerinet. Vilken fruktansvärd och förunderlig substans! Alla varnar mig, men jag kan icke låta bli. Det finns en kraft i den vätskan som kan förändra hela världen — spränga berg, bana väg för järnvägar genom klippor. Jag måste tämja den, koste vad det koste vill.');
    } else {
      lines.push('Jag valde den säkrare vägen. Kanhända är jag feg — men jag minns professorns ord om försiktighet. Varje experiment skall göras med respekt för krafterna man handskas med. Världen har tid att vänta på mina upptäckter.');
    }

    lines.push('');
    lines.push('Nätterna här är kalla, men tankarna brinner. Jag vet att mitt livs stora arbete ligger framför mig, likt en ofärdskriven bok med blanka sidor.');

    return { date: date, text: lines.join('\n') };
  };

  // ── CHAPTER 3 — 1864, Stockholm (explosionen) ─────────────
  entryGenerators[3] = function (ch) {
    var date = 'Stockholm, den 3 september 1864';
    var lines = [];

    lines.push('Kära dagbok,');
    lines.push('');

    // ch3_speed — the approach before the disaster
    if (ch.ch3_speed === 0) {
      lines.push('Jag var så försiktig. Varje steg mätt och beräknat. Ändå skedde det — explosionen som rev sönder allt. Var all min noggrannhet förgäves? Eller hade det blivit ännu värre om jag icke vinnlagt mig så?');
    } else {
      lines.push('Jag pressade på, alltför snabbt. Jag visste det innerst inne, men rastlösheten drev mig. Nu brinner ruinerna ännu framför mina ögon varje gång jag sluter dem. Hade jag blott tagit mig tid...');
    }

    lines.push('');
    lines.push('Emil. Min lille bror Emil. Jag kan icke skriva hans namn utan att handen darrar. Han var tjugoett år. Tjugoett! Världen skall aldrig höra hans skratt igen, och det är mitt fel. Min vetenskap, min ambition, min förbannande nyfikenhet — den tog honom ifrån oss.');

    lines.push('');

    // ch3_aftermath
    if (ch.ch3_aftermath === 0) {
      lines.push('Jag stannar i Stockholm. Jag skall se människorna i ögonen, tala med tidningarna, bära detta kors öppet. Det vore fegt att fly. Emil förtjänar att jag står kvar.');
    } else if (ch.ch3_aftermath === 1) {
      lines.push('Jag har flyttat mina experiment till en pråm på Mälaren. Ensam med vågornas kluckande och mina kemikalier. Här kan jag icke skada någon annan. Isoleringen gnager, men den är mitt straff och min tillflykt.');
    } else {
      lines.push('Jag lämnar Sverige. Jag kan icke vara kvar där varje gata minner mig om vad jag förlorat. Utomlands väntar nya möjligheter — men sorgen följer med i bagaget, tyngre än allt annat jag äger.');
    }

    lines.push('');
    lines.push('Mamma förlät mig. Jag förstår icke hur. Jag har icke förlåtit mig själv, och jag vet icke om jag någonsin skall kunna det. Men jag svär vid Emils minne: jag skall göra sprängämnet säkert. Ingen fler skall dö för att jag drömde för djärvt.');

    return { date: date, text: lines.join('\n') };
  };

  // ── CHAPTER 4 — 1867, dynamitens framgång ─────────────────
  entryGenerators[4] = function (ch) {
    var factoryPlace = ch.ch4_factory === 0 ? 'Sverige'
                     : ch.ch4_factory === 1 ? 'Hamburg'
                     : 'Paris';
    var yearStr = ch.ch4_factory === 1 ? '1867' : '1868';
    var date = factoryPlace + ', den 19 juni ' + yearStr;
    var lines = [];

    lines.push('Kära dagbok,');
    lines.push('');

    // Factory location
    if (ch.ch4_factory === 0) {
      lines.push('Fabriken i Sverige maler på. Här, nära gruvorna och berget, ser jag varje dag hur dynamiten förändrar arbetet. Bergsprängarna tackar mig — de säger att jag räddat deras kamraters liv. Det värmer, fast ingenting fyller det hål Emil lämnade.');
    } else if (ch.ch4_factory === 1) {
      lines.push('Hamburg är en bullrande handelsstad, och härifrån skeppas min dynamit till hela Europa. Pengarna strömmar in som aldrig förr. Men ibland, mitt i affärslivets larm, hör jag tystnaden från den tomma stol där Emil borde suttit.');
    } else {
      lines.push('Paris! Världens huvudstad har öppnat sina armar för mig. Salongerna, kontorerna, de stora boulevarderna — allt bländar. Men prestige är en besynnerlig valuta; den glittrar men mättar icke.');
    }

    lines.push('');

    // Sales strategy
    if (ch.ch4_sales === 0) {
      lines.push('Jag säljer licenser till höger och vänster. Det är effektivt och pengarna kommer snabbt. Men jag oroar mig — vem kontrollerar kvaliteten när jag icke är närvarande? Mitt namn står på varje laddning.');
    } else if (ch.ch4_sales === 1) {
      lines.push('Jag bygger egna fabriker, en efter en. Det kostar, det tar tid, men jag har kontroll. Varje fabrik bär mitt namn och min standard. Ingen skall kunna säga att Alfred Nobel var slarvig med människoliv.');
    } else {
      lines.push('Kompanjonskap — det är nyckeln. Jag har funnit pålitliga män att arbeta med i flera länder. Ensam bygger man ingenting varaktigt. Fader lärde mig det, fast han kanske icke menade det så.');
    }

    lines.push('');

    // Motivation
    if (ch.ch4_motivation === 0) {
      lines.push('Allt jag gör, gör jag för säkerheten. Dynamiten måste vara trygg att hantera — det är min plikt efter vad som hände. Varje förbättring jag gör är ett löfte till Emil.');
    } else if (ch.ch4_motivation === 1) {
      lines.push('Framsteget driver mig. Tunnlar genom Alperna! Kanaler som förenar hav! Mänskligheten behöver kraft att forma sin värld, och jag ger dem den. Det är en vacker tanke, fast den ibland skrämmer mig.');
    } else {
      lines.push('Jag ljuger icke för mig själv — affärerna fascinerar mig. Att bygga ett imperium ur ingenting, att se siffrorna växa, det ger en berusning inget laboratorium kan matcha. Men rikedom utan mening är blott siffror på papper.');
    }

    return { date: date, text: lines.join('\n') };
  };

  // ── CHAPTER 5 — 1870–80-tal, imperiet ─────────────────────
  entryGenerators[5] = function (ch) {
    var date = 'Paris, den 8 november 1884';
    var lines = [];

    lines.push('Kära dagbok,');
    lines.push('');

    // ch5_military
    if (ch.ch5_military === 0) {
      lines.push('Jag har beslutat att mina sprängämnen skall brukas enbart för fredliga ändamål. Tunnlar, gruvor, järnvägar — ja. Kanoner och granater — nej. Somliga kallar mig naiv. Kanhända har de rätt. Men jag vill kunna se mig i spegeln utan att vända bort blicken.');
    } else if (ch.ch5_military === 1) {
      lines.push('Jag säljer till både civila och militära kunder. Det är en fruktansvärd kompromiss, och jag vet det. Men om icke jag, så gör någon annan det. Åtminstone kan jag styra kvaliteten och — kanhända, med tiden — påverka hur vapnen används.');
    } else {
      lines.push('Försvar. Enbart försvar. Om varje nation ägde vapen så fruktansvärda att ingen vågade angripa, vore icke det fred? Det är en mörk logik, jag medger. Men jag tror på den — det måste jag, annars vore jag blott en vapensmed.');
    }

    lines.push('');

    // ch5_bofors
    if (ch.ch5_bofors === 0) {
      lines.push('Bofors är nu mitt. Ett helt stålverk, en ny arena för mina idéer. Järnet glöder i ugnarna och jag ser möjligheter överallt. Det var en dyr affär, men mitt i allt stål och all eld känner jag mig underligt hemma.');
    } else {
      lines.push('Jag lät Bofors vara. Kanske var det klokt, kanske var det fegt. Men en man kan icke äga allt och ändå äga sig själv.');
    }

    lines.push('');

    // ch5_journalist
    if (ch.ch5_journalist === 0) {
      lines.push('En journalist frågade mig idag vad mina uppfinningar egentligen är till för. "De räddar liv," svarade jag. "Varje tunnel som byggs utan att en enda arbetare dör, det är mitt livsverk." Han nickade, men jag såg tvivlet i hans ögon. Har jag rätt? Jag hoppas det med hela mitt hjärta.');
    } else if (ch.ch5_journalist === 1) {
      lines.push('En journalist pressade mig hårt idag. Jag svarade att fred kommer genom styrka, att mina uppfinningar gör krig så fruktansvärt att ingen vettig människa startar ett. Han stirrade på mig. Jag stirrade tillbaka. Jag tror på det jag sade — men orden smakade bittert i munnen.');
    } else {
      lines.push('En journalist ville ha svar om mina vapen. Jag vägrade tala. Vad vet han om mina nätters ångest, om de beräkningar jag gör i mitt stilla sinne? Jag är icke skyldig världen en förklaring. Eller är jag det?');
    }

    lines.push('');
    lines.push('Jag är rik bortom vad den fattige stockholmspojken kunde drömma. Men ensam. Alltid ensam. Pengarna håller mig sällskap dåligt.');

    return { date: date, text: lines.join('\n') };
  };

  // ── CHAPTER 6 — 1888, Paris (dödsrunan) ────────────────────
  entryGenerators[6] = function (ch) {
    var date = 'Paris, den 13 april 1888';
    var lines = [];

    lines.push('Kära dagbok,');
    lines.push('');
    lines.push('"Le marchand de la mort est mort." Dödens köpman är död. Så skrev de om mig — om MIG — i tidningen idag. Fast det var Ludvig som dog, min bror, och de förväxlade oss. Men orden... de bränner sig fast i hjärnan som syra i papper.');

    lines.push('');

    // ch6_reaction
    if (ch.ch6_reaction === 0) {
      lines.push('Jag tog fram denna dagbok och började skriva. Det är det enda jag kan göra när världen brinner — sätta ord på smärtan. Vem är jag? Vad har jag skapat? Är jag verkligen blott en dödens köpman? Pennan darrar, men orden rinner. Kanhända finner jag svaren mellan raderna.');
    } else if (ch.ch6_reaction === 1) {
      lines.push('Min första reaktion var raseri. Jag rev sönder tidningen, svor och slog näven i bordet. Hur VÅGAR de? Jag har byggt tunnlar, öppnat berg, möjliggjort framsteg som de icke ens kan förstå! Men vreden kyldes, och kvar låg en tyst, naggande fråga: tänk om de har en poäng?');
    } else {
      lines.push('Jag ringde genast efter min advokat. Om detta är vad världen tänker om mig, måste jag agera. Icke med ord — med handling. Jag har pengar, makt och tid. Jag skall visa dem vem Alfred Nobel verkligen är. Testamentet måste skrivas om.');
    }

    lines.push('');
    lines.push('Ludvig, min bror, vilar nu i frid. Men jag lever vidare med en fråga som icke ger mig ro: när jag en dag verkligen dör — vad skall de skriva då? Jag vägrar vara dödens köpman. Jag vägrar.');

    return { date: date, text: lines.join('\n') };
  };

  // ── CHAPTER 7 — 1895, Paris (testamentet) ──────────────────
  entryGenerators[7] = function (ch) {
    var date = 'Paris, den 27 november 1895';
    var lines = [];

    lines.push('Kära dagbok,');
    lines.push('');
    lines.push('Det är gjort. Pennan har lyfts från papperet och mitt testamente är undertecknat. Mina händer skälver — icke av svaghet, utan av tyngden i vad jag just beslutat.');

    lines.push('');

    // ch7_fortune
    if (ch.ch7_fortune === 0) {
      lines.push('Nittio procent av min förmögenhet. Nästan allt jag äger. Mina släktingar skall bli rasande — jag hör redan deras protester eka genom salongen. Men vad nytta gör guld i familjekistor? Jag vill att varje krona skall lysa som en stjärna, en ledstjärna för dem som söker göra världen bättre.');
    } else if (ch.ch7_fortune === 1) {
      lines.push('Hälften till priserna, hälften till familjen. Det är en kompromiss, och jag avskyr kompromisser. Men jag har sett vad pengar gör med människor — och jag har sett vad fattigdom gör. Min familj skall icke svälta för mina idealers skull.');
    } else {
      lines.push('En tredjedel. Det är blygsamt, kanhända för blygsamt. Men resten ger trygghet åt dem jag älskar. Är det svaghet eller klokskap? Jag vet icke. Jag vet blott att hjärtat slits i två riktningar.');
    }

    lines.push('');

    // ch7_prizes — describe what prizes were chosen
    var prizeNames = {
      'fysik': 'fysikens hemligheter',
      'kemi': 'kemins under',
      'medicin': 'medicinens segrar mot sjukdom',
      'litteratur': 'litteraturens kraft att beröra själen',
      'fred': 'fredens sak, den viktigaste av alla'
    };
    var prizes = ch.ch7_prizes;
    if (prizes && prizes.length > 0) {
      var prizeParts = [];
      for (var i = 0; i < prizes.length; i++) {
        var name = prizeNames[prizes[i]] || prizes[i];
        prizeParts.push(name);
      }
      if (prizeParts.length === 1) {
        lines.push('Ett pris — för ' + prizeParts[0] + '. Låt detta vara min röst från andra sidan graven.');
      } else {
        var lastPrize = prizeParts.pop();
        lines.push('Priser för ' + prizeParts.join(', ') + ' och ' + lastPrize + '. Varje pris ett fröskott i mänsklighetens trädgård. Jag skall icke få se dem blomma, men kanhända skall de dofta i århundraden.');
      }
    } else {
      lines.push('Priserna skall belöna dem som gör mänskligheten den största nyttan. Fysik, kemi, medicin, litteratur — och fred. Framför allt fred.');
    }

    lines.push('');

    // ch7_institution
    if (ch.ch7_institution === 0) {
      lines.push('Svenska institutioner skall förvalta priserna. Mitt hemland, det lilla fattiga land jag en gång lämnade — nu skall det stå i världens centrum. Det känns rätt. Det känns som att komma hem.');
    } else if (ch.ch7_institution === 1) {
      lines.push('Internationella kommittéer skall avgöra. Vetenskapen har inget fosterland, och freden ännu mindre. Priserna skall vara världens, icke ett lands.');
    } else {
      lines.push('Min familj skall ha inflytande över förvaltningen. De känner mig, de vet vad jag ville. Kanhända är det sentimentalt, men blodet binder starkare än bläck på papper.');
    }

    lines.push('');
    lines.push('Nu lägger jag ned pennan. Mitt liv har varit dynamit och dikter, ensamhet och uppfinningar, skuld och drömmar. Jag vet icke om världen skall minnas mig med värme eller förskräckelse. Men jag har gjort vad jag kunnat. Må det räcka.');

    return { date: date, text: lines.join('\n') };
  };


  // ══════════════════════════════════════════════════════════════
  //  DOM CONSTRUCTION
  // ══════════════════════════════════════════════════════════════

  var overlayEl = null;
  var textEl = null;
  var signatureEl = null;
  var closeBtnEl = null;
  var skipHintEl = null;
  var cursorEl = null;
  var typewriterTimer = null;
  var isTyping = false;
  var fullText = '';
  var charIndex = 0;

  function buildDOM() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'diary-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-label', 'Alfreds dagbok');

    overlayEl.innerHTML = ''
      + '<div class="diary-card">'
      +   '<div class="diary-seal"></div>'
      +   '<div class="diary-stain diary-stain--1"></div>'
      +   '<div class="diary-stain diary-stain--2"></div>'
      +   '<div class="diary-header">'
      +     '<div class="diary-title">Alfreds dagbok</div>'
      +     '<div class="diary-date" id="diary-date"></div>'
      +   '</div>'
      +   '<div class="diary-divider"></div>'
      +   '<div class="diary-text" id="diary-text"></div>'
      +   '<div class="diary-signature" id="diary-signature">— Alfred Nobel</div>'
      +   '<button class="diary-close-btn" id="diary-close-btn">St\u00e4ng dagboken</button>'
      +   '<div class="diary-skip-hint" id="diary-skip-hint">Tryck f\u00f6r att visa allt</div>'
      + '</div>';

    document.body.appendChild(overlayEl);

    textEl = document.getElementById('diary-text');
    signatureEl = document.getElementById('diary-signature');
    closeBtnEl = document.getElementById('diary-close-btn');
    skipHintEl = document.getElementById('diary-skip-hint');

    closeBtnEl.addEventListener('click', function (e) {
      e.stopPropagation();
      hide();
    });

    // Click on overlay (outside card) closes
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) {
        if (isTyping) {
          skipTypewriter();
        } else {
          hide();
        }
      }
    });

    // Click on card — skip typewriter if active
    var card = overlayEl.querySelector('.diary-card');
    card.addEventListener('click', function (e) {
      if (e.target === closeBtnEl) return;
      if (isTyping) {
        skipTypewriter();
      }
    });

    // Keyboard: Escape to close, Space/Enter to skip
    overlayEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hide();
      } else if (isTyping && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        skipTypewriter();
      }
    });
  }


  // ══════════════════════════════════════════════════════════════
  //  TYPEWRITER ANIMATION
  // ══════════════════════════════════════════════════════════════

  function startTypewriter(text) {
    fullText = text;
    charIndex = 0;
    isTyping = true;
    textEl.innerHTML = '';

    // Pre-build all char spans (hidden)
    var html = '';
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (c === '\n') {
        html += '<br>';
      } else if (c === ' ') {
        html += '<span class="diary-char">&nbsp;</span>';
      } else {
        html += '<span class="diary-char">' + escapeHtml(c) + '</span>';
      }
    }
    html += '<span class="diary-cursor" id="diary-cursor"></span>';
    textEl.innerHTML = html;
    cursorEl = document.getElementById('diary-cursor');

    // Show skip hint after a brief delay
    setTimeout(function () {
      if (isTyping && skipHintEl) {
        skipHintEl.classList.add('visible');
      }
    }, 2000);

    // Animate chars
    var chars = textEl.querySelectorAll('.diary-char');
    var total = chars.length;

    function revealNext() {
      if (charIndex >= total) {
        finishTypewriter();
        return;
      }
      // Reveal a batch for speed (3 chars per tick for readability)
      var batch = Math.min(2, total - charIndex);
      for (var b = 0; b < batch; b++) {
        chars[charIndex].classList.add('visible');
        charIndex++;
      }
      typewriterTimer = setTimeout(revealNext, 28);
    }

    typewriterTimer = setTimeout(revealNext, 400);
  }

  function skipTypewriter() {
    if (!isTyping) return;
    clearTimeout(typewriterTimer);

    // Show all chars instantly
    var chars = textEl.querySelectorAll('.diary-char');
    for (var i = 0; i < chars.length; i++) {
      chars[i].classList.add('visible');
    }

    finishTypewriter();
  }

  function finishTypewriter() {
    isTyping = false;
    if (cursorEl) cursorEl.style.display = 'none';
    if (skipHintEl) skipHintEl.classList.remove('visible');

    // Show signature and close button
    setTimeout(function () {
      if (signatureEl) signatureEl.classList.add('visible');
    }, 300);
    setTimeout(function () {
      if (closeBtnEl) closeBtnEl.classList.add('visible');
    }, 700);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }


  // ══════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════════════════════════════

  function getEntry(chapter) {
    var gen = entryGenerators[chapter];
    if (!gen) return null;

    var state = (typeof gameState !== 'undefined') ? gameState : {};
    var choices = state.choices || {};

    return gen(choices);
  }

  function show(chapter) {
    buildDOM();

    var entry = getEntry(chapter);
    if (!entry) {
      console.warn('[NobelDiary] Inget dagboksinlägg för kapitel ' + chapter);
      return;
    }

    // Reset state
    signatureEl.classList.remove('visible');
    closeBtnEl.classList.remove('visible');
    skipHintEl.classList.remove('visible');
    textEl.innerHTML = '';

    // Set date
    document.getElementById('diary-date').textContent = entry.date;

    // Open overlay
    overlayEl.classList.add('open');
    overlayEl.focus();

    // Start typewriter after card animation completes
    setTimeout(function () {
      startTypewriter(entry.text);
    }, 600);
  }

  function hide() {
    if (typewriterTimer) clearTimeout(typewriterTimer);
    isTyping = false;

    if (overlayEl) {
      overlayEl.classList.remove('open');
    }
  }


  // ── Return public API ──────────────────────────────────────
  return {
    show: show,
    hide: hide,
    getEntry: getEntry
  };

})();
