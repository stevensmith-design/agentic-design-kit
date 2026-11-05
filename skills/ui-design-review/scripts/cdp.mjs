// ui-design-review — minimal CDP driver shared by the rendered checks.
//
// Deliberately dependency-free. The kit is flat-vendored, fully checksummed and ships with no
// install step (docs/DIST-README.md), so a rendered check may not pull in Puppeteer or
// Playwright — each would add a ~170MB auto-downloaded browser and a supply-chain surface the
// kit has nowhere else. Everything here uses `node:` builtins plus the global WebSocket that
// Node 22+ provides, and drives whatever Chromium-based browser is already installed (Chrome,
// Chromium, Edge, Brave) on macOS, Linux or Windows. CHROME_PATH always wins.
//
// What this is NOT: a browser-automation framework. There is no auto-waiting, no selector
// engine, no trace viewer. A harness wrapping this kit should use a real framework; this exists
// so the kit's own rendered assertions are runnable wherever the kit is vendored.
//
// Exit-code convention shared by every consumer: 0 = pass, 1 = a real finding,
// 2 = could not measure. 2 must never be reported as a pass — a check that never rendered is
// UNVERIFIED, and the whole reason these scripts exist is that a clean-looking result from a
// check that did not run is what let a padding bug ship.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Every location tried, in order. Returned so a failure can say where it looked.
export function chromeCandidates() {
  const out = [];
  if (process.env.CHROME_PATH) out.push(process.env.CHROME_PATH);
  const home = homedir();
  if (process.platform === 'darwin') {
    const apps = [
      ['Google Chrome', 'Google Chrome'], ['Chromium', 'Chromium'],
      ['Microsoft Edge', 'Microsoft Edge'], ['Brave Browser', 'Brave Browser'],
      ['Google Chrome Canary', 'Google Chrome Canary'],
    ];
    for (const root of ['/Applications', join(home, 'Applications')]) {
      for (const [app, bin] of apps) out.push(join(root, `${app}.app`, 'Contents', 'MacOS', bin));
    }
  } else if (process.platform === 'win32') {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    const rel = [
      ['Google', 'Chrome', 'Application', 'chrome.exe'], ['Chromium', 'Application', 'chrome.exe'],
      ['Microsoft', 'Edge', 'Application', 'msedge.exe'],
      ['BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'],
    ];
    for (const r of roots) for (const p of rel) out.push(join(r, ...p));
  } else {
    out.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
      '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable',
      '/usr/bin/brave-browser', '/opt/google/chrome/chrome', '/snap/bin/chromium',
      '/var/lib/flatpak/exports/bin/org.chromium.Chromium',
      join(home, '.local/share/flatpak/exports/bin/org.chromium.Chromium'));
  }
  return out;
}

// chrome-headless-shell is Chromium's minimal headless build: same Blink, none of the browser's
// sign-in, sync, push or update services, so it makes no requests of its own. Preferred when on
// PATH. A full browser still works; the flags below suppress most of its background traffic,
// though a few startup service checks cannot be switched off by flag.
const SHELL_NAMES = ['chrome-headless-shell', 'headless_shell'];
const PATH_NAMES = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
  'microsoft-edge', 'microsoft-edge-stable', 'brave-browser', 'chrome', 'msedge'];

function onPath(names) {
  const finder = process.platform === 'win32' ? 'where' : 'which';
  for (const name of names) {
    const r = spawnSync(finder, [name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split(/\r?\n/)[0];
  }
  return null;
}

export function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const shell = onPath(SHELL_NAMES);
  if (shell) return shell;
  for (const c of chromeCandidates()) if (existsSync(c)) return c;
  return onPath(PATH_NAMES);
}

export function toUrl(target) {
  return /^(https?|file|data|about):/.test(target) ? target : pathToFileURL(resolve(target)).href;
}

function unmeasurable(msg) {
  const e = new Error(msg);
  e.code = 2;
  return e;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Launch one headless browser and return a page session. One session can visit many pages and
 * viewports; close() must always be called (use try/finally).
 *
 *   const s = await openSession({ width: 1280, height: 900 });
 *   await s.goto('page.html');                 // waits for load, then settleMs
 *   const v = await s.evaluate(fn, arg1, ...);  // fn is serialised into the page
 *   await s.setViewport(320, 800);
 *   s.exceptions                                // uncaught exceptions since the last goto
 *   await s.close();
 *
 * Throws an Error with .code = 2 when the browser cannot be started or reached.
 */
export async function openSession({ width = 1280, height = 900, mobile = false } = {}) {
  const chrome = findChrome();
  if (!chrome) {
    throw unmeasurable('no Chromium-based browser found (Chrome, Chromium, Edge or Brave). ' +
      'Set CHROME_PATH to one. Looked in:\n    ' + chromeCandidates().join('\n    ') +
      `\n    and on PATH: ${[...SHELL_NAMES, ...PATH_NAMES].join(', ')}`);
  }
  if (typeof WebSocket === 'undefined') throw unmeasurable('this Node build has no global WebSocket (needs Node 22+).');

  const profile = mkdtempSync(join(tmpdir(), 'uidr-cdp-'));
  const flags = ['--headless=new', '--disable-gpu', '--remote-debugging-port=0', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--mute-audio', `--user-data-dir=${profile}`,
    // Never phone home: no update checks, field trials, sync, metrics or safe-browsing fetches.
    '--disable-background-networking', '--disable-component-update', '--disable-sync',
    '--disable-default-apps', '--disable-domain-reliability', '--metrics-recording-only',
    '--no-pings', '--disable-client-side-phishing-detection', '--disable-breakpad',
    '--disable-component-extensions-with-background-pages', '--disable-field-trial-config',
    '--disable-features=OptimizationHints,MediaRouter,Translate,AutofillServerCommunication,' +
      'InterestFeedContentSuggestions,CertificateTransparencyComponentUpdater,DialMediaRouteProvider',
    '--password-store=basic', '--use-mock-keychain', '--no-service-autorun',
    // Rendering consistency for measurement: one colour profile, no throttled background tabs.
    '--force-color-profile=srgb', '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'];
  // Chromium refuses to run as root with its sandbox on (containers, CI). Only then drop it.
  if (process.platform === 'linux' && process.getuid?.() === 0) flags.push('--no-sandbox');
  if (process.env.CDP_EXTRA_FLAGS) flags.push(...process.env.CDP_EXTRA_FLAGS.split(/\s+/).filter(Boolean));
  const child = spawn(chrome, [...flags, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (d) => { stderr = (stderr + d).slice(-2000); });
  let exited = false;
  child.on('exit', () => { exited = true; });

  const kill = () => {
    try { child.kill(); } catch {}
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  };

  try {
    // The browser writes its chosen port to DevToolsActivePort — no port guessing or collisions.
    let port = null;
    const deadline = Date.now() + 15000;
    while (!port && Date.now() < deadline && !exited) {
      try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim(); } catch {}
      if (!port) await sleep(100);
    }
    if (!port) {
      const why = stderr.split('\n').filter((l) => /ERROR|FATAL|error/i.test(l)).slice(-2).join(' | ');
      throw unmeasurable(`the browser at ${chrome} did not start within 15s.${why ? ' It said: ' + why : ''}`);
    }
    let tab = null;
    for (let i = 0; i < 50 && !tab; i++) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        tab = list.find((t) => t.type === 'page');
      } catch {}
      if (!tab) await sleep(100);
    }
    if (!tab) throw unmeasurable('could not reach the headless browser\'s page target.');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = () => rej(unmeasurable('websocket to the browser failed.'));
    });
    let id = 0;
    const pending = new Map();
    const waiters = new Map();
    const session = { chrome, exceptions: [], width, height };
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails || {};
        session.exceptions.push({
          text: d.exception?.description?.split('\n')[0] || d.text || 'Uncaught exception',
          url: d.url || '', line: (d.lineNumber ?? -1) + 1, column: (d.columnNumber ?? -1) + 1,
        });
      }
      const w = waiters.get(m.method);
      if (w) { waiters.delete(m.method); w(m.params); }
    };
    const send = (method, params = {}) => new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
    const once = (method, ms) => new Promise((res) => {
      const t = setTimeout(() => { waiters.delete(method); res(null); }, ms);
      waiters.set(method, (p) => { clearTimeout(t); res(p); });
    });

    await send('Page.enable');
    await send('Runtime.enable');

    session.setViewport = async (w, h = session.height, mob = mobile) => {
      session.width = w; session.height = h;
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
      await sleep(80);
    };
    session.setMedia = async (features) => {
      await send('Emulation.setEmulatedMedia', { features: Object.entries(features).map(([name, value]) => ({ name, value })) });
    };
    session.goto = async (target, { settleMs = 300, timeoutMs = 15000 } = {}) => {
      session.exceptions = [];
      const loaded = once('Page.loadEventFired', timeoutMs);
      const nav = await send('Page.navigate', { url: toUrl(target) });
      if (nav.errorText) throw unmeasurable(`could not load ${target}: ${nav.errorText}`);
      if (!(await loaded)) throw unmeasurable(`${target} did not fire load within ${timeoutMs}ms.`);
      await sleep(settleMs);
    };
    session.evaluate = async (fn, ...args) => {
      const argList = args.map((a) => JSON.stringify(a)).join(', ');
      const res = await send('Runtime.evaluate', {
        expression: typeof fn === 'string' ? fn : `(${fn.toString()})(${argList})`,
        returnByValue: true, awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw unmeasurable('page probe threw: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
      }
      return res.result.value;
    };
    session.sleep = sleep;
    session.close = async () => { try { ws.close(); } catch {} kill(); };

    await session.setViewport(width, height, mobile);
    return session;
  } catch (e) {
    kill();
    throw e.code === 2 ? e : unmeasurable(e.message);
  }
}

/**
 * Render `target` and run `probe` inside the page (one-shot; kept for measure-*.mjs).
 *
 * @param {object}   o
 * @param {string}   o.target      file path or http(s) URL
 * @param {function} o.probe       serialised into the page; must return a JSON-safe value
 * @param {any[]}    [o.args]      arguments passed to probe (JSON-serialised)
 * @param {number}   [o.width]     viewport width  (default 1280)
 * @param {number}   [o.height]    viewport height (default 900)
 * @param {boolean}  [o.mobile]    mobile emulation (default false)
 * @param {number}   [o.settleMs]  wait after load (default 1200)
 * @param {string}   [o.media]     e.g. 'prefers-reduced-motion' → set to 'reduce'
 * @returns {Promise<any>} the probe's return value
 * @throws  {Error} with .code = 2 when the page could not be rendered at all
 */
export async function render({
  target, probe, args = [], width = 1280, height = 900,
  mobile = false, settleMs = 1200, media = null,
}) {
  const s = await openSession({ width, height, mobile });
  try {
    if (media) await s.setMedia({ [media]: 'reduce' });
    await s.goto(target, { settleMs });
    return await s.evaluate(probe, ...args);
  } finally {
    await s.close();
  }
}

/** Shared CLI arg parsing for the rendered checks. */
export function parseCommonArgs(argv, extra = {}) {
  const opts = {
    target: null, selector: null, width: 1280, height: 900,
    tolerance: 2, json: false, mobile: false, ...extra,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selector') opts.selector = argv[++i];
    else if (a === '--width') opts.width = Number(argv[++i]);
    else if (a === '--height') opts.height = Number(argv[++i]);
    else if (a === '--tolerance') opts.tolerance = Number(argv[++i]);
    else if (a === '--json') opts.json = true;
    else if (a === '--mobile') opts.mobile = true;
    else if (a in opts && !a.startsWith('--')) { /* positional handled below */ }
    else if (!a.startsWith('--')) opts.target = a;
  }
  return opts;
}

/** Uniform handling for the "could not measure" path. */
export function failUnmeasurable(err, scriptName) {
  console.error(`${scriptName}: ${err.message}`);
  console.error('  Reporting UNVERIFIED, not PASS — a check that never rendered must not read');
  console.error('  as a clean result.');
  process.exit(2);
}
