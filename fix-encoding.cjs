// fix-encoding.cjs
// Repariert kaputte Zeichen (Mojibake) wie "â—‡" -> "◇", "GerÃ¤ts" -> "Geräts"
// Ausführen im Projektordner:  node fix-encoding.cjs

const fs = require("fs");
const path = require("path");

// Dateien, die repariert werden sollen:
const FILES = [
  "src/App.jsx",
  "src/main.jsx",
  "src/notifications.js",
  "src/supabase.js",
  "index.html",
  "README.md",
];

// CP1252-Sonderzeichen -> Byte-Wert
const CP1252 = {
  "\u20AC": 0x80, "\u201A": 0x82, "\u0192": 0x83, "\u201E": 0x84,
  "\u2026": 0x85, "\u2020": 0x86, "\u2021": 0x87, "\u02C6": 0x88,
  "\u2030": 0x89, "\u0160": 0x8A, "\u2039": 0x8B, "\u0152": 0x8C,
  "\u017D": 0x8E, "\u2018": 0x91, "\u2019": 0x92, "\u201C": 0x93,
  "\u201D": 0x94, "\u2022": 0x95, "\u2013": 0x96, "\u2014": 0x97,
  "\u02DC": 0x98, "\u2122": 0x99, "\u0161": 0x9A, "\u203A": 0x9B,
  "\u0153": 0x9C, "\u017E": 0x9E, "\u0178": 0x9F,
};

function charToByte(ch) {
  const code = ch.codePointAt(0);
  if (code <= 0xff) return code;
  if (CP1252[ch] !== undefined) return CP1252[ch];
  return null; // echtes Unicode-Zeichen (z.B. Emoji) -> nicht anfassen
}

function fixMojibake(text) {
  const chars = Array.from(text);
  const out = [];
  let i = 0;
  while (i < chars.length) {
    const b0 = charToByte(chars[i]);
    let len = 0;
    if (b0 !== null) {
      if (b0 >= 0xc2 && b0 <= 0xdf) len = 2;
      else if (b0 >= 0xe0 && b0 <= 0xef) len = 3;
      else if (b0 >= 0xf0 && b0 <= 0xf4) len = 4;
    }
    if (len && i + len <= chars.length) {
      const bytes = [b0];
      let ok = true;
      for (let j = 1; j < len; j++) {
        const b = charToByte(chars[i + j]);
        if (b === null || b < 0x80 || b > 0xbf) { ok = false; break; }
        bytes.push(b);
      }
      if (ok) {
        const decoded = Buffer.from(bytes).toString("utf8");
        if (!decoded.includes("\uFFFD")) {
          out.push(decoded);
          i += len;
          continue;
        }
      }
    }
    out.push(chars[i]);
    i++;
  }
  return out.join("");
}

let totalFixed = 0;
for (const rel of FILES) {
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) {
    console.log("übersprungen (nicht gefunden):", rel);
    continue;
  }
  let text = fs.readFileSync(file, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM entfernen

  // Mehrfach anwenden, falls doppelt kaputt kodiert:
  let fixed = text;
  for (let pass = 0; pass < 3; pass++) {
    const next = fixMojibake(fixed);
    if (next === fixed) break;
    fixed = next;
  }

  if (fixed !== text) {
    fs.writeFileSync(file + ".backup", text, "utf8"); // Sicherheitskopie
    fs.writeFileSync(file, fixed, "utf8");
    console.log("REPARIERT:", rel, "(Backup: " + rel + ".backup)");
    totalFixed++;
  } else {
    console.log("ok (nichts zu tun):", rel);
  }
}
console.log("\nFertig! " + totalFixed + " Datei(en) repariert.");
console.log("Jetzt prüfen mit: npm run dev  — dann git add/commit/push.");
