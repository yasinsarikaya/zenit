// Zenit Fix Script - run with: node fix.js
const fs = require("fs");
const path = require("path");

// Find App.jsx
const locations = [
  path.join("src", "App.jsx"),
  path.join("C:", "Users", "musab", "zenit-app", "zenit-app", "src", "App.jsx"),
];

let f = null;
for (const loc of locations) {
  if (fs.existsSync(loc)) { f = loc; break; }
}
if (!f) { console.error("App.jsx nicht gefunden!"); process.exit(1); }

console.log("Fixing:", f);
let c = fs.readFileSync(f, "utf8");

// 1. Import fix
c = c.replace(
  'import { supabase } from "./supabase.js";',
  'import { supabase, SUPABASE_CONFIGURED } from "./supabase.js";'
);

// 2. userId fix
c = c.replace(
  "const userId = session.user.id;",
  'const userId = session?.user?.id || "offline";\n  const isOnline = SUPABASE_CONFIGURED && !!session;'
);

// 3. email fix
c = c.replace(
  "email={session.user.email}",
  'email={session?.user?.email || "offline"}'
);

// 4. Skip auth when offline - replace the useEffect in App()
c = c.replace(
  "supabase.auth.getSession().then(({ data }) => {",
  "if (!SUPABASE_CONFIGURED) { setAuthChecked(true); return; }\n    supabase.auth.getSession().then(({ data }) => {"
);

// 5. Add offline route before AuthScreen
c = c.replace(
  "if (!session) return <AuthScreen />;",
  "if (!SUPABASE_CONFIGURED) return <Zenit session={null} />;\n  if (!session) return <AuthScreen />;"
);

// 6. Guard signOut
c = c.replace(
  "const signOut = () => supabase.auth.signOut();",
  "const signOut = () => { if (supabase) supabase.auth.signOut(); };"
);

// 7. Guard load from supabase
c = c.replace(
  "  // ---- laden ----\n  useEffect(() => {\n    (async () => {\n      const { data, error } = await supabase",
  "  // ---- laden ----\n  useEffect(() => {\n    if (!isOnline) {\n      try { const raw = localStorage.getItem('zenit-offline'); if (raw) applyData(JSON.parse(raw)); } catch(e) {}\n      setLoaded(true); return;\n    }\n    (async () => {\n      const { data, error } = await supabase"
);

// 8. Guard save
c = c.replace(
  "    clearTimeout(saveTimer.current);\n    saveTimer.current = setTimeout(async () => {\n      const payload = { lang, gem, tasks, cats, sentences, notifTime, lastNotif };",
  "    const payload = { lang, gem, tasks, cats, sentences, notifTime, lastNotif };\n    if (!isOnline) {\n      try { localStorage.setItem('zenit-offline', JSON.stringify(payload)); } catch(e) {}\n      return;\n    }\n    clearTimeout(saveTimer.current);\n    saveTimer.current = setTimeout(async () => {"
);

// 9. Guard sync
c = c.replace(
  "  // ---- Live-Sync zwischen Ger",
  "  // ---- Live-Sync zwischen Ger"
);
// Add isOnline guard to sync useEffect
const syncPattern = /\/\/ ---- Live-Sync zwischen Ger[^\n]*\n\s*useEffect\(\(\) => \{/;
c = c.replace(syncPattern, (match) => {
  return match + "\n    if (!isOnline) return;";
});

fs.writeFileSync(f, c, "utf8");
console.log("DONE! App.jsx fixed for offline mode.");
console.log("Now refresh the browser (F5)!");
