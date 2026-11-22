"use strict";

/* ---------- helpers ---------- */

function setMsg(el, text, kind) {
  el.textContent = text;
  el.className = "msg" + (kind ? " " + kind : "");
}

async function copyText(text, msgEl, okText) {
  if (!text) {
    setMsg(msgEl, "Belum ada hasil buat disalin.", "err");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Clipboard API bisa ditolak (izin/fokus) — fallback manual.
    const tmp = document.createElement("textarea");
    tmp.value = text;
    tmp.style.position = "fixed";
    tmp.style.opacity = "0";
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand("copy");
    tmp.remove();
  }
  setMsg(msgEl, okText, "ok");
}

/* ---------- tabs ---------- */

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tool-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });
    panels.forEach((p) => {
      p.hidden = p.id !== "panel-" + btn.dataset.tab;
    });
  });
});

/* ---------- 1. JSON Formatter ---------- */

const jsonInput = document.getElementById("json-input");
const jsonMsg = document.getElementById("json-msg");
const jsonCount = document.getElementById("json-count");

function updateJsonCount() {
  jsonCount.textContent = jsonInput.value.length + " karakter";
}
jsonInput.addEventListener("input", updateJsonCount);
updateJsonCount();

function parseJsonInput() {
  const raw = jsonInput.value.trim();
  if (!raw) {
    setMsg(jsonMsg, "Kotaknya masih kosong — tempel JSON dulu.", "err");
    return { ok: false };
  }
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch (e) {
    setMsg(jsonMsg, "JSON-nya belum valid: " + e.message, "err");
    return { ok: false };
  }
}

document.getElementById("json-format").addEventListener("click", () => {
  const result = parseJsonInput();
  if (!result.ok) return;
  jsonInput.value = JSON.stringify(result.data, null, 2);
  updateJsonCount();
  setMsg(jsonMsg, "Beres, JSON valid dan udah dirapikan ✓", "ok");
});

document.getElementById("json-minify").addEventListener("click", () => {
  const result = parseJsonInput();
  if (!result.ok) return;
  jsonInput.value = JSON.stringify(result.data);
  updateJsonCount();
  setMsg(jsonMsg, "Udah diminify jadi satu baris ✓", "ok");
});

document.getElementById("json-copy").addEventListener("click", () => {
  copyText(jsonInput.value, jsonMsg, "JSON tersalin ke clipboard ✓");
});

document.getElementById("json-clear").addEventListener("click", () => {
  jsonInput.value = "";
  updateJsonCount();
  setMsg(jsonMsg, "", "");
  jsonInput.focus();
});

/* ---------- 2. Base64 ---------- */

const b64Input = document.getElementById("b64-input");
const b64Output = document.getElementById("b64-output");
const b64Msg = document.getElementById("b64-msg");

function base64EncodeUtf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64DecodeUtf8(b64) {
  const binary = atob(b64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

document.getElementById("b64-encode").addEventListener("click", () => {
  if (!b64Input.value) {
    setMsg(b64Msg, "Isi dulu teksnya, baru encode.", "err");
    return;
  }
  b64Output.value = base64EncodeUtf8(b64Input.value);
  setMsg(b64Msg, "Encode berhasil ✓", "ok");
});

document.getElementById("b64-decode").addEventListener("click", () => {
  const raw = b64Input.value.trim();
  if (!raw) {
    setMsg(b64Msg, "Tempel Base64-nya dulu, baru decode.", "err");
    return;
  }
  try {
    b64Output.value = base64DecodeUtf8(raw);
    setMsg(b64Msg, "Decode berhasil ✓", "ok");
  } catch (e) {
    b64Output.value = "";
    setMsg(b64Msg, "Itu bukan Base64 yang valid — cek lagi teksnya.", "err");
  }
});

document.getElementById("b64-copy").addEventListener("click", () => {
  copyText(b64Output.value, b64Msg, "Hasil tersalin ke clipboard ✓");
});

document.getElementById("b64-clear").addEventListener("click", () => {
  b64Input.value = "";
  b64Output.value = "";
  setMsg(b64Msg, "", "");
  b64Input.focus();
});

/* ---------- 3. UUID Generator ---------- */

const uuidCount = document.getElementById("uuid-count");
const uuidOutput = document.getElementById("uuid-output");
const uuidMsg = document.getElementById("uuid-msg");

function makeUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versi 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // varian RFC 4122
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return (
    hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) +
    "-" + hex.slice(16, 20) + "-" + hex.slice(20)
  );
}

document.getElementById("uuid-generate").addEventListener("click", () => {
  let n = parseInt(uuidCount.value, 10);
  if (isNaN(n) || n < 1) n = 1;
  if (n > 100) n = 100;
  uuidCount.value = n;
  const list = [];
  for (let i = 0; i < n; i++) list.push(makeUuid());
  uuidOutput.value = list.join("\n");
  setMsg(uuidMsg, n + " UUID baru dibuat ✓", "ok");
});

document.getElementById("uuid-copy").addEventListener("click", () => {
  copyText(uuidOutput.value, uuidMsg, "Semua UUID tersalin ✓");
});

/* ---------- 4. Password Generator ---------- */

const passOutput = document.getElementById("pass-output");
const passLength = document.getElementById("pass-length");
const passLengthVal = document.getElementById("pass-length-val");
const passStrength = document.getElementById("pass-strength");
const passMsg = document.getElementById("pass-msg");

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

function randomInt(max) {
  // Rejection sampling biar distribusinya rata, tanpa modulo bias.
  const limit = Math.floor(256 / max) * max;
  const buf = new Uint8Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function strengthLabel(password, variety) {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (password.length >= 32) score++;
  if (variety >= 3) score++;
  if (variety >= 4) score++;
  if (score <= 1) return "lemah";
  if (score <= 3) return "sedang";
  return "kuat";
}

function generatePassword() {
  const sets = [SETS.lower];
  if (document.getElementById("pass-upper").checked) sets.push(SETS.upper);
  if (document.getElementById("pass-numbers").checked) sets.push(SETS.numbers);
  if (document.getElementById("pass-symbols").checked) sets.push(SETS.symbols);

  const length = parseInt(passLength.value, 10);
  const all = sets.join("");
  const chars = [];

  // Jamin minimal satu karakter dari tiap set yang dipilih.
  sets.forEach((set) => chars.push(set[randomInt(set.length)]));
  while (chars.length < length) chars.push(all[randomInt(all.length)]);

  // Acak urutannya (Fisher–Yates pakai crypto).
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const password = chars.join("");
  passOutput.value = password;
  const label = strengthLabel(password, sets.length);
  passStrength.textContent = "Kekuatan: " + label;
  passStrength.className = "strength " + label;
  setMsg(passMsg, "Password baru dibuat ✓", "ok");
}

passLength.addEventListener("input", () => {
  passLengthVal.textContent = passLength.value;
});

document.getElementById("pass-generate").addEventListener("click", generatePassword);
document.getElementById("pass-copy").addEventListener("click", () => {
  copyText(passOutput.value, passMsg, "Password tersalin — simpan di tempat aman ya ✓");
});

/* ---------- 5. Timestamp Converter ---------- */

const tsMsg = document.getElementById("ts-msg");
const tsNow = document.getElementById("ts-now");

function tickNow() {
  tsNow.textContent = Math.floor(Date.now() / 1000);
}
tickNow();
setInterval(tickNow, 1000);

document.getElementById("ts-now-copy").addEventListener("click", () => {
  copyText(tsNow.textContent, tsMsg, "Timestamp sekarang tersalin ✓");
});

document.getElementById("ts-to-date").addEventListener("click", () => {
  const raw = document.getElementById("ts-unix-input").value.trim();
  const localEl = document.getElementById("ts-date-local");
  const isoEl = document.getElementById("ts-date-iso");
  if (!/^-?\d+$/.test(raw)) {
    setMsg(tsMsg, "Isi detik unix-nya pakai angka aja, cth. 1763800000.", "err");
    return;
  }
  const date = new Date(parseInt(raw, 10) * 1000);
  if (isNaN(date.getTime())) {
    setMsg(tsMsg, "Angkanya di luar jangkauan tanggal yang bisa ditampilkan.", "err");
    return;
  }
  localEl.textContent = date.toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  isoEl.textContent = date.toISOString();
  setMsg(tsMsg, "Keubah ✓", "ok");
});

let lastUnixResult = "";
document.getElementById("ts-to-unix").addEventListener("click", () => {
  const value = document.getElementById("ts-date-input").value;
  if (!value) {
    setMsg(tsMsg, "Pilih dulu tanggal & jamnya.", "err");
    return;
  }
  const ms = new Date(value).getTime();
  if (isNaN(ms)) {
    setMsg(tsMsg, "Tanggalnya belum valid.", "err");
    return;
  }
  lastUnixResult = String(Math.floor(ms / 1000));
  document.getElementById("ts-unix-result").textContent = lastUnixResult;
  document.getElementById("ts-ms-result").textContent = String(ms);
  setMsg(tsMsg, "Keubah ✓", "ok");
});

document.getElementById("ts-unix-copy").addEventListener("click", () => {
  copyText(lastUnixResult, tsMsg, "Detik unix tersalin ✓");
});
