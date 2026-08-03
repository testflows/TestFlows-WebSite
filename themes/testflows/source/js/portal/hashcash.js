/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/**
 * Client-side Hashcash proof-of-work.
 * MUST mirror Machine client/api/hashcash.py and cloud/api/hashcash.py.
 * Stamp: VERSION:bits:bucket:rand:nonce
 * Hashed challenge: VERSION:bits:bucket:<value>:rand:nonce
 */

const VERSION = "1";
const DIGEST_BITS = 256;
const YIELD_EVERY = 4096;
//: Upper bound on solver workers — the nonce space is tiny per shard past this,
//: and each worker has spawn cost. Actual count is min(this, hardwareConcurrency).
const MAX_WORKERS = 8;
//: One reused encoder — `new TextEncoder()` per hash was a big allocation cost in
//: the inner search loop (millions of hashes per solve).
const ENCODER = new TextEncoder();

/** @param {Uint8Array} digest @param {number} bits */
function meetsDifficulty(digest, bits) {
  let value = 0n;
  for (let i = 0; i < digest.length; i++) {
    value = (value << 8n) | BigInt(digest[i]);
  }
  return value < 1n << BigInt(DIGEST_BITS - bits);
}

/** Sync SHA-256 (compact). */
function sha256Bytes(message) {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const bytes = typeof message === "string" ? ENCODER.encode(message) : message;
  const bitLen = bytes.length * 8;
  const withOne = bytes.length + 1;
  const padLen = (withOne % 64 <= 56 ? 56 : 120) - (withOne % 64);
  const total = withOne + padLen + 8;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 4, bitLen >>> 0, false);
  view.setUint32(total - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < total; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, h0, false);
  ov.setUint32(4, h1, false);
  ov.setUint32(8, h2, false);
  ov.setUint32(12, h3, false);
  ov.setUint32(16, h4, false);
  ov.setUint32(20, h5, false);
  ov.setUint32(24, h6, false);
  ov.setUint32(28, h7, false);
  return out;
}

function digest(bits, bucket, value, rand, nonce) {
  return sha256Bytes(`${VERSION}:${bits}:${bucket}:${value}:${rand}:${nonce}`);
}

export function currentBucket(bucketSeconds) {
  return Math.floor(Date.now() / 1000 / bucketSeconds);
}

function randomHex16() {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Synchronous nonce search over the subsequence start, start+stride, … Runs to
 * completion (worker context — no yielding). Stamp format matches the server.
 * @param {string} value @param {number} bits @param {number} bucket
 * @param {string} rand @param {number} start @param {number} stride
 * @returns {string}
 */
export function solveRange(value, bits, bucket, rand, start, stride) {
  if (stride < 1) throw new RangeError("stride must be >= 1");
  for (let nonce = start; ; nonce += stride) {
    const n = nonce.toString(16);
    if (meetsDifficulty(digest(bits, bucket, value, rand, n), bits)) {
      return `${VERSION}:${bits}:${bucket}:${rand}:${n}`;
    }
  }
}

/** Single-thread fallback: the classic loop, yielding so the UI can breathe. */
async function solveInline(value, bits, bucket, rand) {
  let nonce = 0;
  while (true) {
    for (let i = 0; i < YIELD_EVERY; i++, nonce++) {
      const n = nonce.toString(16);
      if (meetsDifficulty(digest(bits, bucket, value, rand, n), bits)) {
        return `${VERSION}:${bits}:${bucket}:${rand}:${n}`;
      }
    }
    await new Promise((r) => setTimeout(r, 0));
  }
}

/**
 * Fan the nonce space across a Web Worker pool — disjoint subsequences, shared
 * rand; first valid stamp wins and the rest are terminated. Rejects if the worker
 * path is unavailable so `solve` can fall back.
 * @returns {Promise<string>}
 */
function solveWithWorkers(value, bits, bucket, rand, count) {
  return new Promise((resolve, reject) => {
    // Carry hashcash.js's ?v= cache key onto the worker URL so a code change busts
    // both together (GitHub Pages ignores the query, so it's purely a cache key).
    const base = new URL(import.meta.url);
    const url = new URL("./hashcash.worker.js", base);
    url.search = base.search;
    /** @type {Worker[]} */
    const pool = [];
    let settled = false;
    /** @param {(v: any) => void} fn @param {any} arg */
    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      for (const w of pool) w.terminate();
      fn(arg);
    };
    for (let i = 0; i < count; i++) {
      let worker;
      try {
        worker = new Worker(url, { type: "module" });
      } catch (err) {
        finish(reject, err);
        return;
      }
      worker.onmessage = (e) => finish(resolve, String(e.data));
      worker.onerror = (e) => finish(reject, e);
      pool.push(worker);
      worker.postMessage({ value, bits, bucket, rand, start: i, stride: count });
    }
  });
}

/**
 * Search a nonce for a valid stamp. Parallelizes across Web Workers when
 * available (keeping the UI thread free); falls back to a yielding loop.
 * @param {string} value opaque subject from the server
 * @param {number} bits required difficulty
 * @param {number} bucket time bucket
 * @returns {Promise<string>} stamp for X-Tf-Pow
 */
export async function solve(value, bits, bucket) {
  const rand = randomHex16();
  if (typeof Worker !== "undefined") {
    const count = Math.max(
      1,
      Math.min(MAX_WORKERS, navigator.hardwareConcurrency || 4)
    );
    try {
      return await solveWithWorkers(value, bits, bucket, rand, count);
    } catch {
      /* worker path unavailable — fall through to the inline solver */
    }
  }
  return solveInline(value, bits, bucket, rand);
}
