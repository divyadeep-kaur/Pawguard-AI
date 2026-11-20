#!/usr/bin/env node
// Tests for scripts/build-config.mjs. Run: npm run test:config
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'build-config.mjs');
const jwt = role => `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ iss: 'supabase', ref: 'abc', role })).toString('base64url')}.sig`;
const URL_OK = 'https://abcdefghijklmnop.supabase.co';
let failed = 0;

function run(name, env, expect) {
  const out = join(mkdtempSync(join(tmpdir(), 'pgcfg-')), 'config.js');
  const clean = { PATH: process.env.PATH, CONFIG_OUT: out, ...env };
  const r = spawnSync(process.execPath, [script], { env: clean, encoding: 'utf8' });
  const written = existsSync(out) ? readFileSync(out, 'utf8') : '';
  const checks = [];
  if (expect.exit !== undefined) checks.push(['exit code', r.status === expect.exit]);
  if (expect.contains) for (const c of [].concat(expect.contains)) checks.push([`config contains ${c.slice(0, 30)}`, written.includes(c)]);
  if (expect.notContains) for (const c of [].concat(expect.notContains)) checks.push([`config must NOT contain ${c.slice(0, 30)}`, !written.includes(c)]);
  if (expect.stderr) checks.push([`message mentions "${expect.stderr}"`, (r.stderr + r.stdout).includes(expect.stderr)]);
  if (expect.noFile) checks.push(['no config written on failure', written === '']);
  const bad = checks.filter(c => !c[1]);
  console.log(`${bad.length ? 'FAIL' : 'PASS'}  ${name}${bad.length ? '  <- ' + bad.map(b => b[0]).join('; ') : ''}`);
  if (bad.length) { failed++; console.log(r.stdout, r.stderr); }
}

const anon = jwt('anon'), service = jwt('service_role');

run('valid URL + anon JWT is written', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: anon }, { exit: 0, contains: [URL_OK, anon] });
run('trailing slash on URL is trimmed', { SUPABASE_URL: URL_OK + '/', SUPABASE_ANON_KEY: anon }, { exit: 0, contains: `"SUPABASE_URL": "${URL_OK}"` });
run('NEXT_PUBLIC_ aliases are accepted', { NEXT_PUBLIC_SUPABASE_URL: URL_OK, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon }, { exit: 0, contains: URL_OK });
run('publishable key (sb_publishable_) accepted', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: 'sb_publishable_abc123' }, { exit: 0, contains: 'sb_publishable_abc123' });
run('service_role JWT is REFUSED and never written', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: service }, { exit: 1, stderr: 'service_role', noFile: true, notContains: service });
run('sb_secret_ key is REFUSED', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: 'sb_secret_abc123' }, { exit: 1, stderr: 'SECRET', noFile: true });
run('JWT with some other role is refused', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: jwt('authenticated') }, { exit: 1, stderr: 'expected "anon"' });
run('garbage key is refused', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: 'hello' }, { exit: 1, stderr: 'not a recognised' });
run('http:// (non-local) URL refused', { SUPABASE_URL: 'http://abc.supabase.co', SUPABASE_ANON_KEY: anon }, { exit: 1, stderr: 'https://' });
run('URL with /rest/v1 path refused', { SUPABASE_URL: URL_OK + '/rest/v1', SUPABASE_ANON_KEY: anon }, { exit: 1, stderr: 'bare project URL' });
run('only URL set -> refused (half configuration)', { SUPABASE_URL: URL_OK }, { exit: 1, stderr: 'BOTH' });
run('only key set -> refused (half configuration)', { SUPABASE_ANON_KEY: anon }, { exit: 1, stderr: 'BOTH' });
run('nothing set -> builds, writes EMPTY config, warns', {}, { exit: 0, contains: '"SUPABASE_URL": ""', stderr: 'WARNING' });
run('SUPABASE_SERVICE_ROLE_KEY in env is never copied into output', { SUPABASE_URL: URL_OK, SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: service }, { exit: 0, notContains: service });

console.log(failed ? `\n${failed} test(s) FAILED` : '\nAll build-config tests passed');
process.exit(failed ? 1 : 0);
