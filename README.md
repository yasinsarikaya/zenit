# Zenit 💎 — Deine eigene Planungs-App (PWA)

Dein persönliches Planungssystem als **echte App**: installierbar auf dem Handy, gleichzeitig als Website nutzbar, mit **Live-Synchronisation** zwischen allen Geräten über eine Cloud-Datenbank.

**Funktionen:** Tages-/Wochen-/Monats-/Langzeit-Aufgaben · Lektionen mit 1-3-7-Wochen-Wiederholung (danach 2×/Monat) · Warteliste · Analyse-Bereich mit Statistiken · wachsendes Juwel (XP) · eigene Motivations-Sätze · fixe Planungstage · 3 Sprachen (DE/TR/EN) · tägliche Erinnerungen · KI-Coach (optional).

**Kosten: 0 €.** Supabase, Vercel und GitHub haben kostenlose Stufen, die dafür locker reichen.

---

## Was du brauchst

1. **Node.js 18 oder neuer** → https://nodejs.org (LTS-Version installieren)
2. Kostenlose Accounts bei:
   - **Supabase** → https://supabase.com (Datenbank + Login)
   - **GitHub** → https://github.com (Code-Speicher, gut fürs Portfolio!)
   - **Vercel** → https://vercel.com (Hosting, mit GitHub anmelden)

---

## Schritt 1 — Projekt auf deinen Computer

ZIP entpacken, dann im Terminal (Eingabeaufforderung / PowerShell / Terminal):

```bash
cd zenit-pwa
npm install
```

---

## Schritt 2 — Supabase einrichten (ca. 5 Minuten)

1. Auf https://supabase.com → **New project** → Name z. B. `zenit`, Region `eu-central-1 (Frankfurt)`, Datenbank-Passwort ausdenken (irgendwo notieren).
2. Warten bis das Projekt bereit ist (~1 Min).
3. Links im Menü: **SQL Editor** → **New query** → den kompletten Inhalt der Datei `supabase/schema.sql` einfügen → **Run**. ✅ Damit existiert die Tabelle inkl. Sicherheitsregeln (jeder Nutzer sieht nur seine eigenen Daten) und Live-Sync.
4. Links im Menü: **Authentication → Sign In / Up** → sicherstellen, dass **Email** aktiviert ist (ist es standardmäßig).
5. Links im Menü: **Project Settings → API** → kopiere dir:
   - **Project URL** (sieht aus wie `https://abcdefgh.supabase.co`)
   - **anon public key** (langer Text)

---

## Schritt 3 — Verbindung eintragen

Im Projektordner: Datei `.env.example` **kopieren** und die Kopie **`.env`** nennen. Dann die zwei Werte aus Schritt 2 eintragen:

```
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=dein_anon_key
```

> Der `anon key` ist für den Browser gedacht und darf öffentlich sein — die Sicherheit kommt von den Datenbank-Regeln (RLS) aus Schritt 2.

---

## Schritt 4 — Lokal testen

```bash
npm run dev
```

Browser öffnen: http://localhost:5173 → E-Mail eingeben → Login-Link aus deinem Postfach anklicken → du bist drin! 💎

*(Der Login-Link öffnet sich auf dem Gerät, auf dem du ihn anklickst — beim lokalen Testen also am besten die Mail am PC öffnen.)*

---

## Schritt 5 — Auf GitHub hochladen

1. Auf https://github.com → **New repository** → Name `zenit` → **Create**.
2. Im Projektordner:

```bash
git init
git add .
git commit -m "Zenit v1"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/zenit.git
git push -u origin main
```

> `.env` wird durch `.gitignore` automatisch **nicht** hochgeladen — so gehören sich Geheimnisse.

---

## Schritt 6 — Online stellen mit Vercel

1. Auf https://vercel.com → **Add New → Project** → dein `zenit`-Repository importieren.
2. Bei **Environment Variables** die zwei Werte aus `.env` eintragen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy** klicken. Nach ~1 Minute bekommst du deine URL, z. B. `https://zenit-xyz.vercel.app` 🎉
4. **Wichtig:** In Supabase unter **Authentication → URL Configuration** deine Vercel-URL als **Site URL** eintragen (damit Login-Links auf die richtige Adresse zeigen).

Ab jetzt: Jedes `git push` aktualisiert die App automatisch.

---

## Schritt 7 — Aufs Handy installieren

Öffne deine Vercel-URL auf dem Handy:

- **Android (Chrome):** Menü ⋮ → **App installieren** / „Zum Startbildschirm hinzufügen"
- **iPhone (Safari):** Teilen-Symbol → **Zum Home-Bildschirm**

Zenit liegt jetzt wie eine echte App auf deinem Homescreen — mit Diamant-Icon, ohne Browserleiste. Gleiche URL am PC öffnen → **gleiche Daten, live synchron.** Erledige etwas am Handy und sieh zu, wie es am PC sofort erscheint.

---

## Schritt 8 — Benachrichtigungen

**Stufe 1 (eingebaut):** In der App: ⚙ Einstellungen → **Benachrichtigungen → Aktivieren** → Uhrzeit wählen. Du bekommst eine tägliche Zusammenfassung (Fälliges, Überfälliges, Warteliste, Planungstage), solange die App installiert ist bzw. der Browser läuft.

> **Ehrlicher Hinweis:** Bei *komplett geschlossener* App braucht es „Web Push" mit einem kleinen Server-Teil (VAPID-Schlüssel + Cron-Job, z. B. als Supabase Edge Function). Das ist **Stufe 2** — ein sauberes eigenes Mini-Projekt. Wenn du so weit bist, bauen wir das zusammen; die Architektur ist dafür schon vorbereitet.
> iPhone-Hinweis: Web-Benachrichtigungen funktionieren auf iOS erst, wenn die App zum Home-Bildschirm hinzugefügt wurde (iOS 16.4+).

---

## Schritt 9 (optional) — KI-Coach aktivieren

Der Coach läuft als **Supabase Edge Function**, damit dein API-Schlüssel sicher auf dem Server bleibt.

1. Anthropic-API-Key besorgen: https://console.anthropic.com (API-Nutzung kostet ein paar Cent pro Coach-Aufruf).
2. Supabase CLI installieren: https://supabase.com/docs/guides/cli → dann im Projektordner:

```bash
supabase login
supabase link --project-ref DEIN_PROJEKT_REF   # steht in Project Settings → General
supabase secrets set ANTHROPIC_API_KEY=sk-ant-DEIN-KEY
supabase functions deploy coach
```

Fertig — der ✦-Button in der App funktioniert jetzt. Ohne diesen Schritt zeigt die App einfach einen Hinweis („Coach noch nicht eingerichtet") und alles andere läuft normal.

---

## Projektstruktur

```
zenit-pwa/
├── index.html               Einstieg + PWA-Meta
├── vite.config.js           Build + PWA-Manifest (Name, Icons, Farben)
├── package.json
├── .env.example             Vorlage für deine Supabase-Werte
├── public/icons/            App-Icons (Diamant)
├── src/
│   ├── main.jsx             React-Start
│   ├── App.jsx              Die komplette Zenit-App
│   ├── supabase.js          Datenbank-Verbindung
│   └── notifications.js     Erinnerungs-Logik (Stufe 1)
└── supabase/
    ├── schema.sql           Tabelle + Sicherheitsregeln + Live-Sync
    └── functions/coach/     KI-Coach (Edge Function, optional)
```

## Wie der Sync funktioniert (kurz erklärt)

Dein kompletter App-Zustand liegt als eine JSON-Zeile pro Nutzer in der Tabelle `zenit_state`. Beim Ändern speichert die App (leicht verzögert) in die Cloud; über **Supabase Realtime** hören alle deine offenen Geräte mit und übernehmen Änderungen sofort. Eine Geräte-Kennung verhindert, dass ein Gerät seine eigenen Änderungen doppelt anwendet. Row Level Security sorgt dafür, dass niemand außer dir deine Zeile lesen oder schreiben kann.

## Probleme?

- **Weißer Bildschirm / „Supabase-Umgebungsvariablen fehlen":** `.env` vergessen (Schritt 3) oder Vercel-Variablen nicht gesetzt (Schritt 6) — danach neu deployen.
- **Login-Mail kommt nicht:** Spam-Ordner prüfen; in Supabase unter Authentication → Logs nachsehen.
- **Login-Link führt auf localhost:** Site URL in Supabase auf deine Vercel-URL stellen (Schritt 6.4).
- **Sync klappt nicht:** Prüfen, ob die letzte Zeile von `schema.sql` (`alter publication …`) mit ausgeführt wurde.

Viel Erfolg — und poliere dein Juwel! 💎
