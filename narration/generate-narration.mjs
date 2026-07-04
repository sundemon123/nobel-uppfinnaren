#!/usr/bin/env node
/*
 * Generera berättarröst för Nobel: Uppfinnarens väg med ElevenLabs.
 *
 * Användning (kräver Node 18+):
 *   export ELEVENLABS_API_KEY=din-nyckel        # committa ALDRIG nyckeln
 *   node narration/generate-narration.mjs --list-voices
 *   node narration/generate-narration.mjs --voice VOICE_ID          # generera alla klipp
 *   node narration/generate-narration.mjs --voice VOICE_ID --only intro,ch1-title
 *   node narration/generate-narration.mjs --inject                  # bädda in klippen i index.html
 *
 * Flöde: kör först med --voice (klippen hamnar i narration/clips/*.mp3,
 * lyssna och byt röst om det behövs), kör sedan --inject.
 * Ljudknappen i spelet hittar klippen automatiskt via id-konventionen
 * narrator-SKÄRM-ID, så inga övriga kodändringar behövs.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const CLIPS = join(DIR, 'clips');
const INDEX = join(DIR, '..', 'index.html');
const API = 'https://api.elevenlabs.io/v1';
const KEY = process.env.ELEVENLABS_API_KEY;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

if (!flag('--inject') && !KEY) {
  console.error('Sätt ELEVENLABS_API_KEY i miljön först.');
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  if (!res.ok) throw new Error(path + ' -> ' + res.status + ': ' + (await res.text()).slice(0, 300));
  return res;
}

if (flag('--list-voices')) {
  const data = await (await api('/voices')).json();
  for (const v of data.voices) {
    const l = v.labels || {};
    console.log(`${v.voice_id}  ${v.name}  [${l.language || '?'} ${l.accent || ''} ${l.age || ''} ${l.gender || ''}] ${v.category || ''}`);
  }
  const sub = await (await api('/user/subscription')).json();
  console.log(`\nTecken kvar denna period: ${sub.character_limit - sub.character_count} av ${sub.character_limit}`);
  process.exit(0);
}

if (flag('--inject')) {
  let html = readFileSync(INDEX, 'utf-8');
  const files = existsSync(CLIPS) ? readdirSync(CLIPS).filter(f => f.endsWith('.mp3')) : [];
  if (!files.length) { console.error('Inga klipp i narration/clips/ — kör med --voice först.'); process.exit(1); }
  let replaced = 0, added = 0;
  const missing = [];
  for (const f of files) {
    const screenId = f.replace(/\.mp3$/, '');
    const elId = 'narrator-' + screenId;
    const b64 = readFileSync(join(CLIPS, f)).toString('base64');
    const src = 'data:audio/mpeg;base64,' + b64;
    // Replace existing element's src (covers narrator-bridge alias for ch2-bridge)
    const ids = screenId === 'ch2-bridge' ? [elId, 'narrator-bridge'] : [elId];
    let done = false;
    for (const id of ids) {
      const re = new RegExp('(<audio id="' + id + '" src=")[^"]*(")');
      if (re.test(html)) { html = html.replace(re, '$1' + src + '$2'); replaced++; done = true; break; }
    }
    if (!done) missing.push('<audio id="' + elId + '" src="' + src + '" preload="none"></audio>');
  }
  if (missing.length) {
    const block = '\n<!-- Berättarröst för skärmar som saknade klipp (genererad) -->\n' +
      '<div id="narration-extra" style="display:none">\n' + missing.join('\n') + '\n</div>\n';
    // Remove any previous generated block, then insert before </body>
    html = html.replace(/\n<!-- Berättarröst för skärmar som saknade klipp \(genererad\) -->\n<div id="narration-extra"[\s\S]*?<\/div>\n/, '');
    html = html.replace('</body>', block + '</body>');
    added = missing.length;
  }
  writeFileSync(INDEX, html);
  console.log(`Klart: ${replaced} klipp utbytta, ${added} nya inbäddade.`);
  process.exit(0);
}

// ── Generate clips ──
const voice = opt('--voice');
if (!voice) { console.error('Ange --voice VOICE_ID (se --list-voices) eller --inject.'); process.exit(1); }
const only = opt('--only') ? opt('--only').split(',') : null;
const manus = JSON.parse(readFileSync(join(DIR, 'manus.json'), 'utf-8'));
mkdirSync(CLIPS, { recursive: true });

let chars = 0;
for (const [screenId, text] of Object.entries(manus)) {
  if (only && !only.includes(screenId)) continue;
  const out = join(CLIPS, screenId + '.mp3');
  process.stdout.write(screenId + ' (' + text.length + ' tecken)… ');
  const res = await api('/text-to-speech/' + voice + '?output_format=mp3_44100_64', {
    method: 'POST',
    body: JSON.stringify({
      text: text.replace(/\n/g, ' … '),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.25 }
    })
  });
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  chars += text.length;
  console.log('ok');
}
console.log('\nTotalt ' + chars + ' tecken förbrukade. Kör nu: node narration/generate-narration.mjs --inject');
