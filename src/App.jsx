import { useState, useEffect, useRef } from "react";
import { supabase, SUPABASE_CONFIGURED } from "./supabase.js";
import { notifStatus, ensurePermission, notify } from "./notifications.js";

// Kennung dieses Geräts/Tabs — verhindert Echo beim Live-Sync
const ORIGIN_ID = Math.random().toString(36).slice(2, 10);

// ---------- gems ----------
const GEMS = {
  emerald: { acc: "#2FE6A8", soft: "rgba(47,230,168,.14)", glow: "rgba(47,230,168,.35)" },
  sapphire: { acc: "#5B9DFF", soft: "rgba(91,157,255,.14)", glow: "rgba(91,157,255,.35)" },
  amethyst: { acc: "#B79CFF", soft: "rgba(183,156,255,.14)", glow: "rgba(183,156,255,.35)" },
  champagne: { acc: "#E9C97E", soft: "rgba(233,201,126,.14)", glow: "rgba(233,201,126,.35)" },
};

// ---------- i18n ----------
const T = {
  de: {
    tagline: "Dein Tag im Zenit",
    greetM: "Guten Morgen", greetA: "Guten Tag", greetE: "Guten Abend",
    navDash: "Zenit", navTasks: "Aufgaben", navAna: "Analyse", navWait: "Warten",
    day: "Tag", week: "Woche", month: "Monat", long: "Langzeit",
    addTask: "Neue Aufgabe", taskTitle: "Was möchtest du erreichen?",
    descPh: "Beschreibung (optional)…", chooseLevel: "Zeitebene",
    category: "Kategorie", newCategory: "Neue Kategorie", noCategory: "Ohne",
    isLesson: "Ist das eine Lektion?", yes: "Ja", no: "Nein",
    repeatQ: "Wiederholungsplan aktivieren?",
    repeatInfo: "Nach Abschluss: Wiederholung nach 1, 3 und 7 Wochen — danach 2× pro Monat.",
    save: "Fertig", cancel: "Abbrechen", next: "Weiter", back: "Zurück",
    adoptWeek: "Nächste Woche", adoptAsk: "Für nächste Woche einplanen?",
    planSunday: "Sonntag — Wochenplanung", planMonth: "Letztes Wochenende — Monatsplanung",
    fixedTag: "fest",
    overdue: "Überfällig", openTasks: "Offen", doneWeek: "Diese Woche",
    focusHead: "Im Fokus",
    motivation: "Motivations-Sätze", addSentence: "Neuen Satz schreiben…", add: "Hinzufügen",
    settings: "Einstellungen", categories: "Kategorien", gem: "Dein Edelstein",
    gemNames: { emerald: "Smaragd", sapphire: "Saphir", amethyst: "Amethyst", champagne: "Gold" },
    emptyTasks: "Keine offenen Aufgaben auf dieser Ebene.",
    emptyWait: "Warteliste ist leer.",
    emptyMotiv: "Schreibe deinen ersten Satz in den Einstellungen ◇",
    emptyDue: "Alles ruhig. Nichts fällig.",
    emptyHist: "Noch keine erledigten Aufgaben.",
    rep: "Wiederholung", repOf: "von 3", repMonthly: "2× pro Monat",
    lesson: "Lektion", dueOn: "fällig",
    planDays: "Fixe Planungstage",
    planDaysInfo: "Jeden Sonntag: Wochenplanung. Letzter Samstag + Sonntag im Monat: Monatsplanung. Unveränderbar.",
    ringDone: "erledigt heute",
    jewel: "Dein Juwel", level: "Stufe", xpTo: "XP bis zur nächsten Stufe",
    tiers: ["Rohstein", "Geschliffen", "Facettiert", "Brillant", "Zenit"],
    remindT: "Erinnerung", remindOver: "überfällig", remindWait: "in der Warteliste", show: "Ansehen",
    reviewWeek: "Wochen-Rückblick", reviewMonth: "Monats-Rückblick",
    reviewInfoW: "Diese Wochenaufgaben sind noch offen — entscheide, was mit ihnen passiert:",
    reviewInfoM: "Diese Monatsaufgaben sind noch offen — entscheide, was mit ihnen passiert:",
    nextMonth: "Nächster Monat", later: "Später", reviewEmpty: "Alles entschieden ◇",
    coach: "Zenit-Coach", coachBtn: "Woche mit dem Coach planen",
    coachSun: "Es ist Sonntag — lass uns deine Woche planen ◇",
    coachThink: "Der Coach betrachtet dein Juwel…",
    coachErr: "Coach gerade nicht erreichbar — versuch es gleich nochmal.",
    coachSetup: "Coach-Funktion noch nicht eingerichtet — siehe README, Schritt 7.",
    coachAdd: "Übernehmen", coachAgain: "Neu planen",
    coachHint: "Der Coach kennt deine offenen Aufgaben, deine Warteliste und deine Woche — und schlägt dir einen Plan vor.",
    anaHead: "Deine Analyse",
    statsTotal: "Gesamt erledigt", streak: "Tage-Serie", lessonsDone: "Lektionen",
    last7: "Letzte 7 Tage", byLevel: "Nach Ebene", byCat: "Nach Kategorie",
    bestDay: "Stärkster Wochentag", history: "Alles Geschaffte", todayW: "Heute",
    account: "Konto", signOut: "Abmelden",
    authTitle: "Willkommen bei Zenit",
    authInfo: "Melde dich mit deiner E-Mail an — du bekommst einen Login-Link. Damit synchronisiert sich Zenit zwischen Handy und Website.",
    authEmail: "deine@email.de", authSend: "Login-Link senden",
    authSent: "Link verschickt! Prüfe dein Postfach ◇",
    authErr: "Das hat nicht geklappt — prüfe die E-Mail-Adresse.",
    notif: "Benachrichtigungen", notifEnable: "Aktivieren", notifOn: "Aktiv ◇",
    notifDenied: "Im Browser blockiert — erlaube Benachrichtigungen in den Seiteneinstellungen.",
    notifUnsupported: "Dieser Browser unterstützt keine Benachrichtigungen.",
    notifTime: "Tägliche Erinnerung um",
    notifInfo: "Tägliche Zusammenfassung (Fälliges, Warteliste, Planungstage), solange Zenit installiert bzw. geöffnet ist. Push bei komplett geschlossener App = Stufe 2 (README).",
    nDue: "heute fällig", nOver: "überfällig", nWait: "in der Warteliste",
    nSun: "Wochenplanung heute", nMon: "Monatsplanung dieses Wochenende",
  },
  tr: {
    tagline: "Günün zirvesi",
    greetM: "Günaydın", greetA: "İyi günler", greetE: "İyi akşamlar",
    navDash: "Zenit", navTasks: "Görevler", navAna: "Analiz", navWait: "Bekleme",
    day: "Gün", week: "Hafta", month: "Ay", long: "Uzun Vade",
    addTask: "Yeni görev", taskTitle: "Neyi başarmak istiyorsun?",
    descPh: "Açıklama (isteğe bağlı)…", chooseLevel: "Zaman düzeyi",
    category: "Kategori", newCategory: "Yeni kategori", noCategory: "Yok",
    isLesson: "Bu bir ders mi?", yes: "Evet", no: "Hayır",
    repeatQ: "Tekrar planı etkinleştirilsin mi?",
    repeatInfo: "Tamamlandıktan sonra: 1, 3 ve 7 hafta sonra tekrar — ardından ayda 2 kez.",
    save: "Tamam", cancel: "İptal", next: "İleri", back: "Geri",
    adoptWeek: "Gelecek hafta", adoptAsk: "Gelecek hafta için planlansın mı?",
    planSunday: "Pazar — haftalık planlama", planMonth: "Son hafta sonu — aylık planlama",
    fixedTag: "sabit",
    overdue: "Gecikmiş", openTasks: "Açık", doneWeek: "Bu hafta",
    focusHead: "Odakta",
    motivation: "Motivasyon cümleleri", addSentence: "Yeni cümle yaz…", add: "Ekle",
    settings: "Ayarlar", categories: "Kategoriler", gem: "Taşını seç",
    gemNames: { emerald: "Zümrüt", sapphire: "Safir", amethyst: "Ametist", champagne: "Altın" },
    emptyTasks: "Bu düzeyde açık görev yok.",
    emptyWait: "Bekleme listesi boş.",
    emptyMotiv: "İlk cümleni ayarlardan yaz ◇",
    emptyDue: "Her şey sakin. Bugün için bir şey yok.",
    emptyHist: "Henüz tamamlanan görev yok.",
    rep: "Tekrar", repOf: "/ 3", repMonthly: "Ayda 2 kez",
    lesson: "Ders", dueOn: "tarih",
    planDays: "Sabit planlama günleri",
    planDaysInfo: "Her Pazar: haftalık plan. Ayın son Cumartesi + Pazar günü: aylık plan. Değiştirilemez.",
    ringDone: "bugün tamamlandı",
    jewel: "Taşın", level: "Seviye", xpTo: "sonraki seviyeye XP",
    tiers: ["Ham Taş", "İşlenmiş", "Fasetli", "Pırlanta", "Zenit"],
    remindT: "Hatırlatma", remindOver: "gecikmiş", remindWait: "bekleme listesinde", show: "Göster",
    reviewWeek: "Hafta değerlendirmesi", reviewMonth: "Ay değerlendirmesi",
    reviewInfoW: "Bu hafta görevleri hâlâ açık — ne olacağına karar ver:",
    reviewInfoM: "Bu ay görevleri hâlâ açık — ne olacağına karar ver:",
    nextMonth: "Gelecek ay", later: "Sonra", reviewEmpty: "Hepsi tamam ◇",
    coach: "Zenit Koçu", coachBtn: "Haftayı koçla planla",
    coachSun: "Bugün Pazar — haftanı birlikte planlayalım ◇",
    coachThink: "Koç taşını inceliyor…",
    coachErr: "Koça şu an ulaşılamıyor — birazdan tekrar dene.",
    coachSetup: "Koç fonksiyonu henüz kurulmadı — README, adım 7.",
    coachAdd: "Ekle", coachAgain: "Yeniden planla",
    coachHint: "Koç açık görevlerini, bekleme listeni ve haftanı bilir — sana bir plan önerir.",
    anaHead: "Analizin",
    statsTotal: "Toplam tamamlanan", streak: "Gün serisi", lessonsDone: "Dersler",
    last7: "Son 7 gün", byLevel: "Düzeye göre", byCat: "Kategoriye göre",
    bestDay: "En güçlü gün", history: "Tüm başarılar", todayW: "Bugün",
    account: "Hesap", signOut: "Çıkış yap",
    authTitle: "Zenit'e hoş geldin",
    authInfo: "E-postanla giriş yap — sana bir giriş bağlantısı göndereceğiz. Böylece Zenit telefon ve web arasında senkronize olur.",
    authEmail: "eposta@adresin.com", authSend: "Giriş bağlantısı gönder",
    authSent: "Bağlantı gönderildi! Gelen kutunu kontrol et ◇",
    authErr: "Olmadı — e-posta adresini kontrol et.",
    notif: "Bildirimler", notifEnable: "Etkinleştir", notifOn: "Aktif ◇",
    notifDenied: "Tarayıcıda engellendi — site ayarlarından bildirimlere izin ver.",
    notifUnsupported: "Bu tarayıcı bildirimleri desteklemiyor.",
    notifTime: "Günlük hatırlatma saati",
    notifInfo: "Zenit yüklü/açıkken günlük özet alırsın (bugün olanlar, bekleme listesi, planlama günleri). Uygulama tamamen kapalıyken push = 2. aşama (README).",
    nDue: "bugün", nOver: "gecikmiş", nWait: "bekleme listesinde",
    nSun: "bugün haftalık planlama", nMon: "bu hafta sonu aylık planlama",
  },
  en: {
    tagline: "Your day at its zenith",
    greetM: "Good morning", greetA: "Good afternoon", greetE: "Good evening",
    navDash: "Zenit", navTasks: "Tasks", navAna: "Insights", navWait: "Waiting",
    day: "Day", week: "Week", month: "Month", long: "Long-term",
    addTask: "New task", taskTitle: "What do you want to achieve?",
    descPh: "Description (optional)…", chooseLevel: "Time level",
    category: "Category", newCategory: "New category", noCategory: "None",
    isLesson: "Is this a lesson?", yes: "Yes", no: "No",
    repeatQ: "Enable repetition plan?",
    repeatInfo: "After completion: repeat after 1, 3 and 7 weeks — then 2× per month.",
    save: "Done", cancel: "Cancel", next: "Next", back: "Back",
    adoptWeek: "Next week", adoptAsk: "Plan for next week?",
    planSunday: "Sunday — weekly planning", planMonth: "Last weekend — monthly planning",
    fixedTag: "fixed",
    overdue: "Overdue", openTasks: "Open", doneWeek: "This week",
    focusHead: "In focus",
    motivation: "Motivation sentences", addSentence: "Write a new sentence…", add: "Add",
    settings: "Settings", categories: "Categories", gem: "Your gem",
    gemNames: { emerald: "Emerald", sapphire: "Sapphire", amethyst: "Amethyst", champagne: "Gold" },
    emptyTasks: "No open tasks on this level.",
    emptyWait: "Waitlist is empty.",
    emptyMotiv: "Write your first sentence in settings ◇",
    emptyDue: "All calm. Nothing due.",
    emptyHist: "No completed tasks yet.",
    rep: "Repetition", repOf: "of 3", repMonthly: "2× per month",
    lesson: "Lesson", dueOn: "due",
    planDays: "Fixed planning days",
    planDaysInfo: "Every Sunday: weekly planning. Last Saturday + Sunday of the month: monthly planning. Cannot be changed.",
    ringDone: "done today",
    jewel: "Your jewel", level: "Level", xpTo: "XP to next level",
    tiers: ["Raw Stone", "Polished", "Faceted", "Brilliant", "Zenith"],
    remindT: "Reminder", remindOver: "overdue", remindWait: "on the waitlist", show: "View",
    reviewWeek: "Weekly review", reviewMonth: "Monthly review",
    reviewInfoW: "These week tasks are still open — decide what happens to them:",
    reviewInfoM: "These month tasks are still open — decide what happens to them:",
    nextMonth: "Next month", later: "Later", reviewEmpty: "All decided ◇",
    coach: "Zenit Coach", coachBtn: "Plan the week with the coach",
    coachSun: "It's Sunday — let's plan your week ◇",
    coachThink: "The coach is studying your jewel…",
    coachErr: "Coach unavailable right now — try again shortly.",
    coachSetup: "Coach function not set up yet — see README, step 7.",
    coachAdd: "Add", coachAgain: "Plan again",
    coachHint: "The coach knows your open tasks, waitlist and week — and suggests a plan.",
    anaHead: "Your insights",
    statsTotal: "Total completed", streak: "Day streak", lessonsDone: "Lessons",
    last7: "Last 7 days", byLevel: "By level", byCat: "By category",
    bestDay: "Strongest weekday", history: "Everything achieved", todayW: "Today",
    account: "Account", signOut: "Sign out",
    authTitle: "Welcome to Zenit",
    authInfo: "Sign in with your email — we'll send you a login link. Zenit then syncs between phone and web.",
    authEmail: "you@email.com", authSend: "Send login link",
    authSent: "Link sent! Check your inbox ◇",
    authErr: "That didn't work — check the email address.",
    notif: "Notifications", notifEnable: "Enable", notifOn: "Active ◇",
    notifDenied: "Blocked in the browser — allow notifications in site settings.",
    notifUnsupported: "This browser doesn't support notifications.",
    notifTime: "Daily reminder at",
    notifInfo: "Daily summary (due items, waitlist, planning days) while Zenit is installed or open. Push with the app fully closed = Stage 2 (README).",
    nDue: "due today", nOver: "overdue", nWait: "on the waitlist",
    nSun: "weekly planning today", nMon: "monthly planning this weekend",
  },
};

const LEVELS = ["day", "week", "month", "long"];
const XP = { day: 5, week: 10, month: 25, long: 50 };
const LESSON_BONUS = 5;
const CAT_COLORS = ["#7DE3C8", "#9CC2FF", "#CDB6FF", "#F2D694", "#F5A9C9", "#B9E38A"];

// ---------- helpers ----------
const iso = (d) => d.toISOString().slice(0, 10);
const today = () => iso(new Date());
const addDays = (dateStr, n) => { const d = new Date(dateStr + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (dateStr, lang) => {
  const d = new Date(dateStr + "T12:00:00");
  const loc = lang === "de" ? "de-DE" : lang === "tr" ? "tr-TR" : "en-GB";
  return d.toLocaleDateString(loc, { day: "numeric", month: "short" });
};
const fmtFull = (dateStr, lang) => {
  const d = new Date(dateStr + "T12:00:00");
  const loc = lang === "de" ? "de-DE" : lang === "tr" ? "tr-TR" : "en-GB";
  return d.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" });
};
const weekdayName = (idx, lang) => {
  const d = new Date(2024, 0, 1 + idx);
  const loc = lang === "de" ? "de-DE" : lang === "tr" ? "tr-TR" : "en-GB";
  return d.toLocaleDateString(loc, { weekday: "long" });
};
const isSunday = () => new Date().getDay() === 0;
const isLastWeekendOfMonth = () => {
  const d = new Date(); const wd = d.getDay();
  if (wd !== 0 && wd !== 6) return false;
  const p = new Date(d); p.setDate(p.getDate() + 7);
  return p.getMonth() !== d.getMonth();
};
const startOfWeek = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const nextMonthStart = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return iso(d); };
const nextGap = (s) => (s === 0 ? 7 : s === 1 ? 21 : s === 2 ? 49 : 15);
const repLabel = (s, t) => (s <= 2 ? `${t.rep} ${s + 1} ${t.repOf}` : t.repMonthly);
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const greet = (t) => { const h = new Date().getHours(); return h < 11 ? t.greetM : h < 18 ? t.greetA : t.greetE; };
const taskXp = (task) => (XP[task.level] || 5) + (task.isLesson ? LESSON_BONUS : 0);

// ---------- App ----------
export default function App() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authChecked)
    return (<div className="z-root" style={{ "--acc": GEMS.emerald.acc, "--accSoft": GEMS.emerald.soft, "--accGlow": GEMS.emerald.glow }}>
      <style>{CSS}</style><div className="z-loading">◇</div></div>);

  // Offline-Modus: ohne Supabase direkt die App anzeigen (Daten lokal im Speicher)
  if (!SUPABASE_CONFIGURED) return <Zenit session={null} />;

  if (!session) return <AuthScreen />;
  return <Zenit session={session} />;
}

// ---------- Auth ----------
function AuthScreen() {
  const [lang, setLang] = useState("de");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const t = T[lang];
  const g = GEMS.emerald;

  const send = async () => {
    if (!email.trim()) return;
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setState(error ? "error" : "sent");
  };

  return (
    <div className="z-root" style={{ "--acc": g.acc, "--accSoft": g.soft, "--accGlow": g.glow }}>
      <style>{CSS}</style>
      <div className="z-halo" />
      <div className="z-authwrap">
        <div className="z-wordmark" style={{ justifyContent: "center", fontSize: 18 }}>Z E N I T <span className="z-gemdot" /></div>
        <div className="z-authlangs">
          {["de", "tr", "en"].map((l) => (
            <button key={l} className={"z-lang" + (lang === l ? " on" : "")} onClick={() => setLang(l)}>{l}</button>
          ))}
        </div>
        <div className="z-authcard">
          <div className="z-q" style={{ marginTop: 0 }}>{t.authTitle}</div>
          <p className="z-info">{t.authInfo}</p>
          <input className="z-input" type="email" placeholder={t.authEmail} value={email}
            onChange={(e) => setEmail(e.target.value)} autoFocus />
          <button className="z-mainbtn" style={{ width: "100%", marginTop: 12 }}
            disabled={state === "sending" || !email.trim()} onClick={send}>
            {state === "sending" ? "…" : t.authSend}
          </button>
          {state === "sent" && <p className="z-authok">{t.authSent}</p>}
          {state === "error" && <p className="z-autherr">{t.authErr}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- Zenit (eingeloggt) ----------
function Zenit({ session }) {
  const userId = session?.user?.id || "offline";
  const isOnline = SUPABASE_CONFIGURED && !!session;

  const [lang, setLang] = useState("de");
  const [gem, setGem] = useState("emerald");
  const [tasks, setTasks] = useState([]);
  const [cats, setCats] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [notifTime, setNotifTime] = useState("08:00");
  const [lastNotif, setLastNotif] = useState("");
  const [lastWeekReview, setLastWeekReview] = useState("");
  const [lastMonthReview, setLastMonthReview] = useState("");
  const [showReview, setShowReview] = useState(null);
  const [view, setView] = useState("dash");
  const [levelTab, setLevelTab] = useState("day");
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [motivIdx, setMotivIdx] = useState(0);
  const [gain, setGain] = useState(null);
  const [remindDismissed, setRemindDismissed] = useState(false);
  const skipSave = useRef(false);
  const saveTimer = useRef(null);

  const t = T[lang];
  const g = GEMS[gem];

  const applyData = (d) => {
    skipSave.current = true;
    setLang(d.lang || "de");
    setGem(d.gem || "emerald");
    setTasks(d.tasks || []);
    setCats(d.cats || []);
    setSentences(d.sentences || []);
    setNotifTime(d.notifTime || "08:00");
    setLastNotif(d.lastNotif || "");
    setLastWeekReview(d.lastWeekReview || "");
    setLastMonthReview(d.lastMonthReview || "");
  };

  // ---- laden ----
  useEffect(() => {
    if (!isOnline) {
      // Offline: aus localStorage laden
      try {
        const raw = localStorage.getItem("zenit-offline");
        if (raw) applyData(JSON.parse(raw));
      } catch (e) { /* first run */ }
      setLoaded(true);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("zenit_state").select("data").eq("user_id", userId).maybeSingle();
      if (!error && data && data.data) applyData(data.data);
      setLoaded(true);
    })();
  }, [userId, isOnline]);

  // ---- speichern (debounced) ----
  useEffect(() => {
    if (!loaded) return;
    if (skipSave.current) { skipSave.current = false; return; }
    const payload = { lang, gem, tasks, cats, sentences, notifTime, lastNotif, lastWeekReview, lastMonthReview };
    if (!isOnline) {
      // Offline: in localStorage speichern
      try { localStorage.setItem("zenit-offline", JSON.stringify(payload)); } catch (e) {}
      return;
    }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("zenit_state").upsert({
        user_id: userId, data: payload, origin: ORIGIN_ID, updated_at: new Date().toISOString(),
      });
      if (error) console.error("save failed", error);
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [lang, gem, tasks, cats, sentences, notifTime, lastNotif, lastWeekReview, lastMonthReview, loaded, userId, isOnline]);

  // ---- Live-Sync zwischen Geräten ----
  useEffect(() => {
    if (!isOnline) return;
    const channel = supabase
      .channel("zenit-sync")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "zenit_state", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new;
          if (row && row.origin !== ORIGIN_ID && row.data) applyData(row.data);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, isOnline]);

  // ---- Motivations-Rotation ----
  useEffect(() => {
    if (sentences.length < 2) return;
    const id = setInterval(() => setMotivIdx((i) => (i + 1) % sentences.length), 9000);
    return () => clearInterval(id);
  }, [sentences.length]);

  // ---- XP-Toast ----
  useEffect(() => {
    if (!gain) return;
    const id = setTimeout(() => setGain(null), 1400);
    return () => clearTimeout(id);
  }, [gain]);

  // ---- Sonntags- / Monatsende-Rückblick ----
  useEffect(() => {
    if (!loaded || showReview) return;
    if (isSunday() && lastWeekReview !== today() &&
        tasks.some((x) => x.status === "open" && x.level === "week")) {
      setShowReview("week"); return;
    }
    const mkey = today().slice(0, 7);
    if (isLastWeekendOfMonth() && lastMonthReview !== mkey &&
        tasks.some((x) => x.status === "open" && x.level === "month")) {
      setShowReview("month");
    }
  }, [loaded, tasks, lastWeekReview, lastMonthReview, showReview]);

  // ---- Tägliche Erinnerung (Stufe 1) ----
  useEffect(() => {
    if (!loaded) return;
    const check = () => {
      if (notifStatus() !== "granted") return;
      const now = new Date();
      const [h, m] = (notifTime || "08:00").split(":").map(Number);
      const past = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
      if (!past || lastNotif === today()) return;

      const openT = tasks.filter((x) => x.status === "open");
      const over = openT.filter((x) => x.dueDate && x.dueDate < today()).length;
      const due = openT.filter((x) => x.dueDate === today()).length;
      const waitN = tasks.filter((x) => x.status === "wait").length;

      const parts = [];
      if (due) parts.push(`${due} ${t.nDue}`);
      if (over) parts.push(`${over} ${t.nOver}`);
      if (waitN) parts.push(`${waitN} ${t.nWait}`);
      if (isSunday()) parts.push(t.nSun);
      if (isLastWeekendOfMonth()) parts.push(t.nMon);

      if (parts.length) notify("Zenit ◇", parts.join(" · "));
      setLastNotif(today());
    };
    check();
    const id = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loaded, notifTime, lastNotif, tasks, lang]); // eslint-disable-line

  // ---------- Aktionen ----------
  const addTask = (task) => setTasks((ts) => [...ts, task]);
  const completeTask = (task) => {
    setGain(taskXp(task));
    setTasks((ts) => {
      let next = ts.map((x) => (x.id === task.id ? { ...x, status: "done", completedAt: today() } : x));
      if (task.isLesson && task.repeat) {
        const stage = task.repStage || 0;
        next = [...next, { ...task, id: uid(), status: "open", repStage: stage + 1, dueDate: addDays(today(), nextGap(stage)), completedAt: null }];
      }
      return next;
    });
  };
  const toWaitlist = (task) => setTasks((ts) => ts.map((x) => (x.id === task.id ? { ...x, status: "wait" } : x)));
  const adoptNextWeek = (task) =>
    setTasks((ts) => ts.map((x) => (x.id === task.id ? { ...x, status: "open", level: x.level === "day" ? "week" : x.level, dueDate: addDays(startOfWeek(), 7) } : x)));
  const pushNextWeek = (task) =>
    setTasks((ts) => ts.map((x) => (x.id === task.id ? { ...x, dueDate: addDays(startOfWeek(), 7) } : x)));
  const pushNextMonth = (task) =>
    setTasks((ts) => ts.map((x) => (x.id === task.id ? { ...x, dueDate: nextMonthStart() } : x)));
  const delTask = (task) => setTasks((ts) => ts.filter((x) => x.id !== task.id));
  const addCat = (name) => {
    const clean = name.trim();
    if (!clean || cats.find((c) => c.name === clean)) return null;
    const cat = { name: clean, color: CAT_COLORS[cats.length % CAT_COLORS.length] };
    setCats((cs) => [...cs, cat]); return cat;
  };
  const delCat = (name) => setCats((cs) => cs.filter((c) => c.name !== name));
  const catColor = (name) => (cats.find((c) => c.name === name) || {}).color || "#8A929C";
  const signOut = () => { if (supabase) supabase.auth.signOut(); };

  // ---------- abgeleitet ----------
  const open = tasks.filter((x) => x.status === "open");
  const done = tasks.filter((x) => x.status === "done");
  const wait = tasks.filter((x) => x.status === "wait");
  const overdue = open.filter((x) => x.dueDate && x.dueDate < today());
  const dueToday = open.filter((x) => x.dueDate === today());
  const doneToday = done.filter((x) => x.completedAt === today());
  const doneThisWeek = done.filter((x) => x.completedAt && x.completedAt >= startOfWeek());

  const totalXp = done.reduce((s, x) => s + taskXp(x), 0);
  const lvl = Math.floor(totalXp / 100) + 1;
  const xpInLvl = totalXp % 100;
  const tier = Math.min(lvl, 5);

  const vars = { "--acc": g.acc, "--accSoft": g.soft, "--accGlow": g.glow };

  if (!loaded)
    return (<div className="z-root" style={vars}><style>{CSS}</style><div className="z-loading">◇</div></div>);

  return (
    <div className="z-root" style={vars}>
      <style>{CSS}</style>
      <div className="z-halo" />
      {gain && <div className="z-xptoast">＋{gain} ◇</div>}

      <header className="z-head">
        <div className="z-wordmark">Z E N I T <span className="z-gemdot" /></div>
        <div className="z-headright">
          {["de", "tr", "en"].map((l) => (
            <button key={l} className={"z-lang" + (lang === l ? " on" : "")} onClick={() => setLang(l)}>{l}</button>
          ))}
          <button className="z-icon" onClick={() => setShowSettings(true)} aria-label={t.settings}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </header>

      <main className="z-main">
        {view === "dash" && (
          <>
            <div className="z-greet">{greet(t)}</div>
            <div className="z-motiv" key={motivIdx}
              onClick={() => sentences.length > 1 && setMotivIdx((i) => (i + 1) % sentences.length)}>
              {sentences.length ? sentences[motivIdx % sentences.length] : t.emptyMotiv}
            </div>

            {!remindDismissed && (overdue.length > 0 || wait.length > 0) && (
              <div className="z-remind">
                <span className="z-remindtxt">
                  ◇ {overdue.length > 0 && <b>{overdue.length} {t.remindOver}</b>}
                  {overdue.length > 0 && wait.length > 0 && " · "}
                  {wait.length > 0 && <b>{wait.length} {t.remindWait}</b>}
                </span>
                <span className="z-remindacts">
                  {wait.length > 0 && <button className="z-act wide" onClick={() => setView("wait")}>{t.show}</button>}
                  <button className="z-act dim" onClick={() => setRemindDismissed(true)}>✕</button>
                </span>
              </div>
            )}

            {(isSunday() || isLastWeekendOfMonth()) && (
              <div className="z-planline">
                {isSunday() && <span>◇ {t.planSunday} · <em>{t.fixedTag}</em></span>}
                {isLastWeekendOfMonth() && <span>◇ {t.planMonth} · <em>{t.fixedTag}</em></span>}
              </div>
            )}

            <button className={"z-coachcard" + (isSunday() ? " sun" : "")} onClick={() => setShowCoach(true)}>
              <span className="z-coachic">✦</span>
              <span className="z-coachlbl">{isSunday() ? t.coachSun : t.coachBtn}</span>
              <span className="z-coacharrow">→</span>
            </button>

            <Ring done={doneToday.length} due={dueToday.length + overdue.length} t={t} />

            <div className="z-jewelrow">
              <Jewel tier={tier} />
              <div className="z-jewelinfo">
                <div className="z-jeweltier">{t.tiers[tier - 1]}<span className="z-jewellvl"> · {t.level} {lvl}</span></div>
                <div className="z-xpbar"><span style={{ width: xpInLvl + "%" }} /></div>
                <div className="z-xplbl">{100 - xpInLvl} {t.xpTo}</div>
              </div>
            </div>

            <div className="z-statrow">
              <div className="z-statc"><b>{open.length}</b><span>{t.openTasks}</span></div>
              <div className="z-statc"><b className={overdue.length ? "z-red" : ""}>{overdue.length}</b><span>{t.overdue}</span></div>
              <div className="z-statc"><b>{doneThisWeek.length}</b><span>{t.doneWeek}</span></div>
            </div>

            <div className="z-sechead">{t.focusHead}</div>
            {[...overdue, ...dueToday].length === 0 && <div className="z-empty">{t.emptyDue}</div>}
            {[...overdue, ...dueToday].map((task) => (
              <Card key={task.id} task={task} t={t} lang={lang} catColor={catColor}
                actions={<>
                  <button className="z-act main" onClick={() => completeTask(task)}>✓</button>
                  <button className="z-act" onClick={() => toWaitlist(task)}>‖</button>
                </>} />
            ))}
          </>
        )}

        {view === "tasks" && (
          <>
            <div className="z-tabs">
              {LEVELS.map((lv) => (
                <button key={lv} className={"z-tab" + (levelTab === lv ? " on" : "")} onClick={() => setLevelTab(lv)}>
                  {t[lv]} <i>{open.filter((x) => x.level === lv).length}</i>
                </button>
              ))}
            </div>
            <List tasks={open.filter((x) => x.level === levelTab)} t={t} lang={lang} catColor={catColor} empty={t.emptyTasks}
              actions={(task) => <>
                <button className="z-act main" onClick={() => completeTask(task)}>✓</button>
                <button className="z-act" onClick={() => toWaitlist(task)}>‖</button>
                <button className="z-act dim" onClick={() => delTask(task)}>✕</button>
              </>} />
          </>
        )}

        {view === "ana" && (
          <Analysis t={t} lang={lang} done={done} catColor={catColor} totalXp={totalXp} />
        )}

        {view === "wait" && (
          <>
            <div className="z-sechead" style={{ marginTop: 4 }}>{t.adoptAsk}</div>
            <List tasks={wait} t={t} lang={lang} catColor={catColor} empty={t.emptyWait}
              actions={(task) => <>
                <button className="z-act main wide" onClick={() => adoptNextWeek(task)}>→ {t.adoptWeek}</button>
                <button className="z-act dim" onClick={() => delTask(task)}>✕</button>
              </>} />
          </>
        )}
      </main>

      <nav className="z-dock">
        {[
          ["dash", "◇", t.navDash],
          ["tasks", "☰", t.navTasks],
          ["ana", "◔", t.navAna],
          ["wait", "‖", t.navWait, wait.length],
        ].map(([id, ic, label, badge]) => (
          <button key={id} className={"z-dockbtn" + (view === id ? " on" : "")} onClick={() => setView(id)}>
            <span className="z-dockic">{ic}</span><span className="z-docklbl">{label}</span>
            {badge > 0 && <span className="z-dot" />}
          </button>
        ))}
        <button className="z-fab" onClick={() => setShowAdd(true)}>＋</button>
      </nav>

      {showAdd && (
        <AddModal t={t} cats={cats} onAddCat={addCat} onClose={() => setShowAdd(false)}
          onSave={(task) => { addTask(task); setShowAdd(false); }} />
      )}
      {showSettings && (
        <SettingsModal t={t} sentences={sentences} setSentences={setSentences}
          cats={cats} onAddCat={addCat} onDelCat={delCat}
          gem={gem} setGem={setGem}
          notifTime={notifTime} setNotifTime={setNotifTime}
          email={session?.user?.email || "offline"} onSignOut={signOut}
          onClose={() => setShowSettings(false)} />
      )}
      {showCoach && (
        <CoachModal t={t} lang={lang} open={open} wait={wait} doneThisWeek={doneThisWeek}
          cats={cats} onAdd={addTask} onClose={() => setShowCoach(false)} />
      )}
      {showReview && (
        <ReviewModal mode={showReview} t={t} catColor={catColor}
          tasks={tasks.filter((x) => x.status === "open" && x.level === showReview)}
          onDone={completeTask} onWait={toWaitlist}
          onPush={showReview === "week" ? pushNextWeek : pushNextMonth}
          onClose={() => {
            if (showReview === "week") setLastWeekReview(today());
            else setLastMonthReview(today().slice(0, 7));
            setShowReview(null);
          }} />
      )}
    </div>
  );
}

// ---------- lebendes Juwel ----------
function Jewel({ tier }) {
  const glow = 4 + tier * 3;
  return (
    <svg width="58" height="58" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 ${glow}px var(--accGlow))`, flexShrink: 0 }}>
      <defs>
        <linearGradient id="zjg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--acc)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <polygon points="18,18 46,18 56,30 32,56 8,30" fill="url(#zjg)" stroke="var(--acc)" strokeWidth="1.4" strokeLinejoin="round" opacity={tier >= 1 ? 1 : 0.4} />
      {tier >= 2 && <line x1="8" y1="30" x2="56" y2="30" stroke="rgba(11,13,16,.55)" strokeWidth="1.2" />}
      {tier >= 3 && (<>
        <line x1="18" y1="18" x2="26" y2="30" stroke="rgba(11,13,16,.5)" strokeWidth="1.1" />
        <line x1="46" y1="18" x2="38" y2="30" stroke="rgba(11,13,16,.5)" strokeWidth="1.1" />
        <line x1="32" y1="18" x2="32" y2="30" stroke="rgba(11,13,16,.4)" strokeWidth="1" />
      </>)}
      {tier >= 4 && (<>
        <line x1="26" y1="30" x2="32" y2="56" stroke="rgba(11,13,16,.5)" strokeWidth="1.1" />
        <line x1="38" y1="30" x2="32" y2="56" stroke="rgba(11,13,16,.5)" strokeWidth="1.1" />
      </>)}
      {tier >= 5 && (<>
        <circle cx="49" cy="12" r="1.6" fill="#fff" opacity=".9" />
        <circle cx="12" cy="22" r="1.2" fill="#fff" opacity=".7" />
        <path d="M52 8 l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2z" fill="#fff" opacity=".85" />
      </>)}
      <polygon points="20,19 30,19 25,27" fill="rgba(255,255,255,.35)" opacity={0.25 + tier * 0.1} />
    </svg>
  );
}

// ---------- Ring ----------
function Ring({ done, due, t }) {
  const total = done + due;
  const pct = total === 0 ? 0 : done / total;
  const R = 64, C = 2 * Math.PI * R;
  return (
    <div className="z-ringwrap">
      <svg width="170" height="170" viewBox="0 0 170 170">
        <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="6" />
        <circle cx="85" cy="85" r={R} fill="none" stroke="var(--acc)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 85 85)" className="z-ringarc" />
      </svg>
      <div className="z-ringcenter">
        <b>{done}<span className="z-ringof">/{total || "–"}</span></b>
        <span className="z-ringlbl">{t.ringDone}</span>
      </div>
    </div>
  );
}

// ---------- Analyse ----------
function Analysis({ t, lang, done, catColor, totalXp }) {
  const daysWithDone = new Set(done.filter((x) => x.completedAt).map((x) => x.completedAt));
  let streak = 0, probe = today();
  if (!daysWithDone.has(probe)) probe = addDays(probe, -1);
  while (daysWithDone.has(probe)) { streak++; probe = addDays(probe, -1); }

  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today(), -i);
    days7.push({ d, n: done.filter((x) => x.completedAt === d).length });
  }
  const max7 = Math.max(1, ...days7.map((x) => x.n));

  const byLevel = LEVELS.map((lv) => ({ lv, n: done.filter((x) => x.level === lv).length }));
  const maxLv = Math.max(1, ...byLevel.map((x) => x.n));

  const catCount = {};
  done.forEach((x) => { const k = x.category || "–"; catCount[k] = (catCount[k] || 0) + 1; });
  const byCat = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = Math.max(1, ...byCat.map((x) => x[1]));

  const wd = [0, 0, 0, 0, 0, 0, 0];
  done.forEach((x) => { if (x.completedAt) { const d = new Date(x.completedAt + "T12:00:00"); wd[(d.getDay() + 6) % 7]++; } });
  const bestIdx = wd.indexOf(Math.max(...wd));
  const lessons = done.filter((x) => x.isLesson).length;

  const hist = [...done].filter((x) => x.completedAt).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const groups = [];
  hist.forEach((x) => {
    const last = groups[groups.length - 1];
    if (last && last.d === x.completedAt) last.items.push(x);
    else groups.push({ d: x.completedAt, items: [x] });
  });

  const loc = lang === "de" ? "de-DE" : lang === "tr" ? "tr-TR" : "en-GB";

  return (
    <>
      <div className="z-sechead" style={{ marginTop: 8 }}>{t.anaHead}</div>
      <div className="z-anagrid">
        <div className="z-anastat"><b>{done.length}</b><span>{t.statsTotal}</span></div>
        <div className="z-anastat"><b>{streak}</b><span>{t.streak}</span></div>
        <div className="z-anastat"><b>{lessons}</b><span>{t.lessonsDone}</span></div>
        <div className="z-anastat"><b>{totalXp}</b><span>XP</span></div>
      </div>

      <div className="z-anabox">
        <div className="z-analbl">{t.last7}</div>
        <div className="z-bars">
          {days7.map((x) => (
            <div key={x.d} className="z-barcol">
              <div className="z-barwrap"><div className={"z-bar" + (x.d === today() ? " today" : "")} style={{ height: (x.n / max7) * 100 + "%" }} /></div>
              <span className="z-barn">{x.n || ""}</span>
              <span className="z-barlbl">{new Date(x.d + "T12:00:00").toLocaleDateString(loc, { weekday: "short" }).slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="z-anabox">
        <div className="z-analbl">{t.byLevel}</div>
        {byLevel.map((x) => (
          <div key={x.lv} className="z-hrow">
            <span className="z-hlbl">{t[x.lv]}</span>
            <span className="z-htrack"><span className="z-hfill" style={{ width: (x.n / maxLv) * 100 + "%" }} /></span>
            <span className="z-hn">{x.n}</span>
          </div>
        ))}
      </div>

      {byCat.length > 0 && (
        <div className="z-anabox">
          <div className="z-analbl">{t.byCat}</div>
          {byCat.map(([name, n]) => (
            <div key={name} className="z-hrow">
              <span className="z-hlbl"><span className="z-cdot" style={{ background: catColor(name) }} /> {name}</span>
              <span className="z-htrack"><span className="z-hfill" style={{ width: (n / maxCat) * 100 + "%", background: catColor(name) }} /></span>
              <span className="z-hn">{n}</span>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && wd.some((x) => x > 0) && (
        <div className="z-anabox z-bestday">
          <span className="z-analbl" style={{ margin: 0 }}>{t.bestDay}</span>
          <b>{weekdayName(bestIdx, lang)}</b>
        </div>
      )}

      <div className="z-sechead">{t.history}</div>
      {groups.length === 0 && <div className="z-empty">{t.emptyHist}</div>}
      {groups.map((grp) => (
        <div key={grp.d} className="z-histgroup">
          <div className="z-histdate">{grp.d === today() ? t.todayW : fmtFull(grp.d, lang)} <i>· {grp.items.length}</i></div>
          {grp.items.map((x) => (
            <div key={x.id} className="z-histitem">
              <span className="z-cdot" style={{ background: catColor(x.category) }} />
              <span className="z-histtitle">{x.title}</span>
              <span className="z-histmeta">{t[x.level]}{x.isLesson ? " · ◇" : ""} · +{taskXp(x)}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// ---------- Liste & Karte ----------
function List({ tasks, t, lang, catColor, actions, empty }) {
  if (!tasks.length) return <div className="z-empty">{empty}</div>;
  return tasks.map((task) => (
    <Card key={task.id} task={task} t={t} lang={lang} catColor={catColor} actions={actions(task)} />
  ));
}

function Card({ task, t, lang, catColor, actions }) {
  const [expand, setExpand] = useState(false);
  const late = task.status === "open" && task.dueDate && task.dueDate < today();
  return (
    <div className="z-card">
      <span className="z-catbar" style={{ background: catColor(task.category) }} />
      <div className="z-cardbody" onClick={() => task.desc && setExpand((e) => !e)}>
        <div className="z-cardtitle">{task.title}</div>
        {task.desc && <div className={"z-carddesc" + (expand ? " open" : "")}>{task.desc}</div>}
        <div className="z-cardmeta">
          {task.category && <span style={{ color: catColor(task.category) }}>{task.category} · </span>}
          <span>{t[task.level]}</span>
          {task.isLesson && <span> · ◇ {t.lesson}{task.repeat ? ` · ${repLabel(task.repStage || 0, t)}` : ""}</span>}
          {task.dueDate && <span className={late ? " z-red" : ""}> · {t.dueOn} {fmt(task.dueDate, lang)}</span>}
        </div>
      </div>
      <div className="z-cardacts">{actions}</div>
    </div>
  );
}

// ---------- Coach ----------
function CoachModal({ t, lang, open, wait, doneThisWeek, cats, onAdd, onClose }) {
  const [state, setState] = useState("idle"); // idle | loading | ready | error | setup
  const [data, setData] = useState(null);
  const [added, setAdded] = useState({});

  const langName = lang === "de" ? "Deutsch" : lang === "tr" ? "Türkçe" : "English";

  const plan = async () => {
    setState("loading");
    if (!SUPABASE_CONFIGURED) { setState("setup"); return; }
    try {
      const ctx = {
        openTasks: open.map((x) => ({ title: x.title, level: x.level, category: x.category || null, isLesson: !!x.isLesson, dueDate: x.dueDate || null })),
        waitlist: wait.map((x) => ({ title: x.title, level: x.level })),
        completedThisWeek: doneThisWeek.length,
        categories: cats.map((c) => c.name),
        today: today(),
      };
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ctx, langName }),
      });
      if (res.status === 404) { setState("setup"); return; }
      if (!res.ok) throw new Error("coach http " + res.status);
      const parsed = await res.json();
      if (!parsed.analysis || !Array.isArray(parsed.suggestions)) throw new Error("bad shape");
      setData(parsed);
      setState("ready");
    } catch (e) {
      console.error("coach error", e);
      setState("error");
    }
  };

  const addSug = (s, i) => {
    const level = LEVELS.includes(s.level) ? s.level : "week";
    onAdd({
      id: uid(), title: s.title, desc: "", level, category: "",
      isLesson: false, repeat: false, repStage: 0,
      status: "open", createdAt: today(),
      dueDate: level === "day" ? today() : null, completedAt: null,
    });
    setAdded((a) => ({ ...a, [i]: true }));
  };

  return (
    <div className="z-overlay" onClick={onClose}>
      <div className="z-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="z-sheethead">✦ {t.coach}</div>

        {state === "idle" && (<>
          <p className="z-info">{t.coachHint}</p>
          <button className="z-mainbtn" style={{ width: "100%", marginTop: 10 }} onClick={plan}>✦ {t.coachBtn}</button>
        </>)}

        {state === "loading" && <div className="z-coachload">◇<br /><span>{t.coachThink}</span></div>}

        {state === "setup" && <p className="z-info">{t.coachSetup}</p>}

        {state === "error" && (<>
          <p className="z-info">{t.coachErr}</p>
          <button className="z-mainbtn" style={{ width: "100%" }} onClick={plan}>{t.coachAgain}</button>
        </>)}

        {state === "ready" && data && (<>
          <p className="z-coachana">{data.analysis}</p>
          {data.suggestions.map((s, i) => (
            <div key={i} className="z-sug">
              <div className="z-sugbody">
                <div className="z-sugtitle">{s.title}</div>
                <div className="z-sugmeta">{t[LEVELS.includes(s.level) ? s.level : "week"]}</div>
              </div>
              <button className={"z-act" + (added[i] ? " dim" : " main")} disabled={added[i]} onClick={() => addSug(s, i)}>
                {added[i] ? "✓" : "＋"}
              </button>
            </div>
          ))}
          <div className="z-sheetfoot">
            <button className="z-ghostbtn" onClick={plan}>↻ {t.coachAgain}</button>
            <button className="z-mainbtn" onClick={onClose}>{t.save}</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ---------- Wochen-/Monats-Rückblick ----------
function ReviewModal({ mode, t, tasks, catColor, onDone, onWait, onPush, onClose }) {
  const title = mode === "week" ? t.reviewWeek : t.reviewMonth;
  const info = mode === "week" ? t.reviewInfoW : t.reviewInfoM;
  const pushLabel = mode === "week" ? t.adoptWeek : t.nextMonth;
  return (
    <div className="z-overlay" onClick={onClose}>
      <div className="z-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="z-sheethead">◇ {title}</div>
        <p className="z-info">{info}</p>
        {tasks.length === 0 && <div className="z-empty">{t.reviewEmpty}</div>}
        {tasks.map((task) => (
          <div key={task.id} className="z-sug" style={{ flexWrap: "wrap" }}>
            <span className="z-cdot" style={{ background: catColor(task.category) }} />
            <div className="z-sugbody">
              <div className="z-sugtitle">{task.title}</div>
              {task.category && <div className="z-sugmeta">{task.category}</div>}
            </div>
            <div className="z-cardacts" style={{ flexWrap: "wrap" }}>
              <button className="z-act main" onClick={() => onDone(task)}>✓</button>
              <button className="z-act wide" onClick={() => onPush(task)}>→ {pushLabel}</button>
              <button className="z-act" onClick={() => onWait(task)}>‖</button>
            </div>
          </div>
        ))}
        <div className="z-sheetfoot">
          <button className="z-ghostbtn" onClick={onClose}>{t.later}</button>
          <button className="z-mainbtn" onClick={onClose}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Aufgabe anlegen ----------
function AddModal({ t, cats, onAddCat, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [level, setLevel] = useState("day");
  const [category, setCategory] = useState("");
  const [newCat, setNewCat] = useState("");
  const [isLesson, setIsLesson] = useState(null);

  const finish = (repeat) => {
    onSave({
      id: uid(), title: title.trim(), desc: desc.trim(), level, category,
      isLesson: !!isLesson, repeat: !!repeat, repStage: 0,
      status: "open", createdAt: today(),
      dueDate: level === "day" ? today() : null, completedAt: null,
    });
  };

  return (
    <div className="z-overlay" onClick={onClose}>
      <div className="z-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="z-sheethead">{t.addTask}<span className="z-step">{step} / 3</span></div>

        {step === 1 && (<>
          <input className="z-input" placeholder={t.taskTitle} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea className="z-input z-area" placeholder={t.descPh} value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          <div className="z-label">{t.chooseLevel}</div>
          <div className="z-pills">
            {LEVELS.map((lv) => (
              <button key={lv} className={"z-pill" + (level === lv ? " on" : "")} onClick={() => setLevel(lv)}>{t[lv]}</button>
            ))}
          </div>
          <div className="z-label">{t.category}</div>
          <div className="z-pills">
            <button className={"z-pill" + (category === "" ? " on" : "")} onClick={() => setCategory("")}>{t.noCategory}</button>
            {cats.map((c) => (
              <button key={c.name} className={"z-pill" + (category === c.name ? " on" : "")} onClick={() => setCategory(c.name)}>
                <span className="z-cdot" style={{ background: c.color }} />{c.name}
              </button>
            ))}
          </div>
          <div className="z-row">
            <input className="z-input slim" placeholder={t.newCategory} value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button className="z-act main" onClick={() => { const c = onAddCat(newCat); if (c) { setCategory(c.name); setNewCat(""); } }}>＋</button>
          </div>
          <div className="z-sheetfoot">
            <button className="z-ghostbtn" onClick={onClose}>{t.cancel}</button>
            <button className="z-mainbtn" disabled={!title.trim()} onClick={() => setStep(2)}>{t.next}</button>
          </div>
        </>)}

        {step === 2 && (<>
          <div className="z-q">{t.isLesson}</div>
          <div className="z-choice">
            <button className="z-choicebtn" onClick={() => { setIsLesson(true); setStep(3); }}>◇ {t.yes}</button>
            <button className="z-choicebtn" onClick={() => { setIsLesson(false); finish(false); }}>{t.no}</button>
          </div>
          <div className="z-sheetfoot"><button className="z-ghostbtn" onClick={() => setStep(1)}>← {t.back}</button></div>
        </>)}

        {step === 3 && (<>
          <div className="z-q">{t.repeatQ}</div>
          <p className="z-info">{t.repeatInfo}</p>
          <div className="z-choice">
            <button className="z-choicebtn" onClick={() => finish(true)}>↻ {t.yes}</button>
            <button className="z-choicebtn" onClick={() => finish(false)}>{t.no}</button>
          </div>
          <div className="z-sheetfoot"><button className="z-ghostbtn" onClick={() => setStep(2)}>← {t.back}</button></div>
        </>)}
      </div>
    </div>
  );
}

// ---------- Einstellungen ----------
function SettingsModal({ t, sentences, setSentences, cats, onAddCat, onDelCat, gem, setGem, notifTime, setNotifTime, email, onSignOut, onClose }) {
  const [txt, setTxt] = useState("");
  const [catTxt, setCatTxt] = useState("");
  const [nStatus, setNStatus] = useState(notifStatus());

  const enable = async () => setNStatus(await ensurePermission());

  return (
    <div className="z-overlay" onClick={onClose}>
      <div className="z-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="z-sheethead">{t.settings}</div>

        <div className="z-label">{t.gem}</div>
        <div className="z-gems">
          {Object.entries(GEMS).map(([key, val]) => (
            <button key={key} className={"z-gemswatch" + (gem === key ? " on" : "")}
              style={{ "--gc": val.acc, "--gg": val.glow }} onClick={() => setGem(key)}>
              <span className="z-gemball" /><span>{t.gemNames[key]}</span>
            </button>
          ))}
        </div>

        <div className="z-label">{t.notif}</div>
        <div className="z-notifrow">
          {nStatus === "granted" && <span className="z-notifon">{t.notifOn}</span>}
          {nStatus === "default" && <button className="z-mainbtn" style={{ flex: "unset", padding: "10px 16px" }} onClick={enable}>{t.notifEnable}</button>}
          {nStatus === "denied" && <span className="z-info" style={{ margin: 0 }}>{t.notifDenied}</span>}
          {nStatus === "unsupported" && <span className="z-info" style={{ margin: 0 }}>{t.notifUnsupported}</span>}
          {(nStatus === "granted" || nStatus === "default") && (
            <label className="z-timelbl">{t.notifTime}
              <input className="z-input z-time" type="time" value={notifTime} onChange={(e) => setNotifTime(e.target.value)} />
            </label>
          )}
        </div>
        <p className="z-info">{t.notifInfo}</p>

        <div className="z-label">{t.motivation}</div>
        {sentences.map((s, i) => (
          <div key={i} className="z-sent">
            <span>{s}</span>
            <button className="z-act dim" onClick={() => setSentences(sentences.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <div className="z-row">
          <input className="z-input slim" placeholder={t.addSentence} value={txt} onChange={(e) => setTxt(e.target.value)} />
          <button className="z-act main" onClick={() => { if (txt.trim()) { setSentences([...sentences, txt.trim()]); setTxt(""); } }}>＋</button>
        </div>

        <div className="z-label">{t.categories}</div>
        <div className="z-pills">
          {cats.map((c) => (
            <span key={c.name} className="z-pill on">
              <span className="z-cdot" style={{ background: c.color }} />{c.name}
              <button className="z-xin" onClick={() => onDelCat(c.name)}>✕</button>
            </span>
          ))}
        </div>
        <div className="z-row">
          <input className="z-input slim" placeholder={t.newCategory} value={catTxt} onChange={(e) => setCatTxt(e.target.value)} />
          <button className="z-act main" onClick={() => { if (onAddCat(catTxt)) setCatTxt(""); }}>＋</button>
        </div>

        <div className="z-fixed">
          <b>◇ {t.planDays}</b>
          <p>{t.planDaysInfo}</p>
        </div>

        <div className="z-label">{t.account}</div>
        <div className="z-acctrow">
          <span className="z-acctmail">{email}</span>
          <button className="z-ghostbtn" style={{ padding: "9px 14px" }} onClick={onSignOut}>{t.signOut}</button>
        </div>

        <div className="z-sheetfoot">
          <button className="z-mainbtn" onClick={onClose}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Styles ----------
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600&family=Inter:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{background:#0B0D10}
.z-root{min-height:100vh;background:#0B0D10;color:#EDEFF2;font-family:'Inter',sans-serif;max-width:560px;margin:0 auto;position:relative;padding-bottom:130px;overflow-x:hidden}
.z-halo{position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:520px;height:420px;background:radial-gradient(ellipse at center,var(--accSoft),transparent 65%);pointer-events:none;filter:blur(10px)}
.z-loading{display:flex;align-items:center;justify-content:center;min-height:60vh;color:var(--acc);font-size:28px;animation:zpulse 1.4s ease infinite}
@keyframes zpulse{0%,100%{opacity:.4}50%{opacity:1}}
.z-xptoast{position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:40;background:var(--acc);color:#0B0D10;font-family:'Sora',sans-serif;font-weight:600;font-size:14px;padding:8px 16px;border-radius:20px;box-shadow:0 0 24px var(--accGlow);animation:zrise 1.4s ease forwards}
@keyframes zrise{0%{opacity:0;transform:translate(-50%,10px)}15%{opacity:1;transform:translate(-50%,0)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-14px)}}
.z-head{display:flex;justify-content:space-between;align-items:center;padding:22px 20px 6px;position:relative;padding-top:calc(22px + env(safe-area-inset-top))}
.z-wordmark{font-family:'Sora',sans-serif;font-weight:300;font-size:15px;letter-spacing:5px;display:flex;align-items:center;gap:10px}
.z-gemdot{width:7px;height:7px;border-radius:50%;background:var(--acc);box-shadow:0 0 12px var(--accGlow),0 0 4px var(--acc)}
.z-headright{display:flex;gap:4px;align-items:center}
.z-lang{border:none;background:none;color:#5C656F;font-family:'Sora',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:6px 7px;cursor:pointer;border-radius:8px}
.z-lang.on{color:var(--acc)}
.z-icon{border:none;background:rgba(255,255,255,.05);color:#9AA3AD;width:34px;height:34px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:6px}
.z-main{padding:10px 20px;position:relative}
.z-greet{font-family:'Sora',sans-serif;font-weight:300;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#6B747E;margin-top:14px}
.z-motiv{font-family:'Sora',sans-serif;font-weight:400;font-size:21px;line-height:1.5;margin:10px 0 4px;color:#F4F6F8;cursor:pointer;animation:zin .7s ease;min-height:32px}
@keyframes zin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.z-motiv,.z-card,.z-sheet,.z-xptoast{animation:none!important}}
.z-remind{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:16px;background:rgba(255,255,255,.045);border:1px solid var(--accSoft);border-left:3px solid var(--acc);border-radius:14px;padding:10px 10px 10px 14px}
.z-remindtxt{font-size:13px;color:#C4CBD2}
.z-remindtxt b{color:#F4F6F8;font-weight:600}
.z-remindacts{display:flex;gap:6px}
.z-planline{margin:14px 0 0;font-size:12.5px;color:var(--acc);display:flex;flex-direction:column;gap:4px;letter-spacing:.3px}
.z-planline em{color:#6B747E;font-style:normal}
.z-coachcard{display:flex;align-items:center;gap:12px;width:100%;margin-top:16px;background:linear-gradient(120deg,var(--accSoft),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px 16px;color:#F4F6F8;font-family:'Sora',sans-serif;font-size:14px;cursor:pointer;text-align:left}
.z-coachcard.sun{border-color:var(--acc);box-shadow:0 0 22px var(--accSoft)}
.z-coachic{color:var(--acc);font-size:16px}
.z-coachlbl{flex:1}
.z-coacharrow{color:#6B747E}
.z-ringwrap{position:relative;width:170px;margin:24px auto 6px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 18px var(--accSoft))}
.z-ringarc{transition:stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)}
.z-ringcenter{position:absolute;text-align:center}
.z-ringcenter b{font-family:'Sora',sans-serif;font-weight:600;font-size:34px;display:block;line-height:1}
.z-ringof{font-size:16px;color:#6B747E;font-weight:400}
.z-ringlbl{font-size:10.5px;letter-spacing:1.6px;text-transform:uppercase;color:#6B747E}
.z-jewelrow{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:12px 16px;margin:14px 0 4px}
.z-jewelinfo{flex:1}
.z-jeweltier{font-family:'Sora',sans-serif;font-weight:600;font-size:15px}
.z-jewellvl{color:#6B747E;font-weight:400;font-size:12.5px}
.z-xpbar{height:5px;background:rgba(255,255,255,.08);border-radius:3px;margin:7px 0 5px;overflow:hidden}
.z-xpbar span{display:block;height:100%;background:var(--acc);border-radius:3px;box-shadow:0 0 8px var(--accGlow);transition:width .5s ease}
.z-xplbl{font-size:11px;color:#6B747E}
.z-statrow{display:flex;justify-content:center;gap:34px;margin:16px 0 6px}
.z-statc{text-align:center}
.z-statc b{font-family:'Sora',sans-serif;font-size:19px;font-weight:600;display:block}
.z-statc span{font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:#6B747E}
.z-red{color:#FF7B72}
.z-sechead{font-family:'Sora',sans-serif;font-weight:300;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:#6B747E;margin:26px 0 10px}
.z-card{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.045);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:14px 14px 14px 0;margin:10px 0;animation:zin .5s ease}
.z-catbar{width:3px;align-self:stretch;border-radius:0 3px 3px 0;margin-right:2px;min-height:38px}
.z-cardbody{flex:1;min-width:0;cursor:pointer}
.z-cardtitle{font-weight:500;font-size:15px;line-height:1.35}
.z-carddesc{font-size:12.5px;color:#8A929C;margin-top:3px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.z-carddesc.open{-webkit-line-clamp:unset}
.z-cardmeta{font-size:12px;color:#8A929C;margin-top:3px}
.z-cardacts{display:flex;gap:8px;flex-shrink:0}
.z-act{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#C4CBD2;min-width:36px;height:36px;border-radius:11px;font-size:14px;cursor:pointer;font-family:inherit;padding:0 10px}
.z-act.main{background:var(--acc);border-color:var(--acc);color:#0B0D10;font-weight:700;box-shadow:0 0 14px var(--accSoft)}
.z-act.dim{color:#6B747E}
.z-act.wide{font-size:13px}
.z-empty{border:1px dashed rgba(255,255,255,.12);border-radius:16px;padding:26px 18px;text-align:center;color:#6B747E;font-size:13.5px;margin:12px 0}
.z-tabs{display:flex;gap:2px;margin:14px 0 6px;overflow-x:auto}
.z-tab{border:none;background:none;color:#6B747E;font-family:'Sora',sans-serif;font-size:13px;padding:8px 12px;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent}
.z-tab.on{color:#F4F6F8;border-bottom-color:var(--acc)}
.z-tab i{font-style:normal;font-size:11px;color:#5C656F;margin-left:3px}
.z-anagrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.z-anastat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 4px;text-align:center}
.z-anastat b{font-family:'Sora',sans-serif;font-size:20px;font-weight:600;display:block;color:var(--acc)}
.z-anastat span{font-size:9.5px;letter-spacing:.8px;text-transform:uppercase;color:#6B747E}
.z-anabox{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:14px 16px;margin:10px 0}
.z-analbl{font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:#6B747E;margin-bottom:12px;font-family:'Sora',sans-serif}
.z-bars{display:flex;gap:8px;align-items:flex-end;height:96px}
.z-barcol{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
.z-barwrap{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center}
.z-bar{width:60%;max-width:22px;background:rgba(255,255,255,.16);border-radius:5px 5px 2px 2px;min-height:3px;transition:height .5s ease}
.z-bar.today{background:var(--acc);box-shadow:0 0 10px var(--accSoft)}
.z-barn{font-size:10px;color:#8A929C;margin-top:4px;min-height:12px}
.z-barlbl{font-size:9.5px;color:#5C656F;text-transform:uppercase;letter-spacing:.5px}
.z-hrow{display:flex;align-items:center;gap:10px;margin:8px 0}
.z-hlbl{width:86px;font-size:12.5px;color:#C4CBD2;display:flex;align-items:center;gap:6px;flex-shrink:0}
.z-htrack{flex:1;height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
.z-hfill{display:block;height:100%;background:var(--acc);border-radius:3px}
.z-hn{width:22px;text-align:right;font-size:12px;color:#8A929C;font-family:'Sora',sans-serif}
.z-bestday{display:flex;justify-content:space-between;align-items:center}
.z-bestday b{font-family:'Sora',sans-serif;color:var(--acc);font-size:15px}
.z-histgroup{margin:14px 0}
.z-histdate{font-size:12px;color:#8A929C;font-family:'Sora',sans-serif;letter-spacing:.5px;margin-bottom:6px}
.z-histdate i{font-style:normal;color:#5C656F}
.z-histitem{display:flex;align-items:center;gap:9px;padding:9px 12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);border-radius:12px;margin:5px 0}
.z-histtitle{flex:1;font-size:13.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-histmeta{font-size:11px;color:#6B747E;flex-shrink:0}
.z-dock{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:calc(100% - 32px);max-width:520px;display:flex;align-items:center;background:rgba(20,24,29,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:8px;z-index:10;box-shadow:0 12px 40px rgba(0,0,0,.5)}
.z-dockbtn{flex:1;border:none;background:none;color:#6B747E;cursor:pointer;padding:7px 2px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative;font-family:inherit}
.z-dockbtn.on{color:var(--acc)}
.z-dockic{font-size:16px}
.z-docklbl{font-size:9.5px;letter-spacing:.5px}
.z-dot{position:absolute;top:5px;right:calc(50% - 16px);width:6px;height:6px;border-radius:50%;background:#FF7B72}
.z-fab{width:52px;height:52px;border-radius:17px;border:none;background:var(--acc);color:#0B0D10;font-size:24px;font-weight:600;cursor:pointer;margin-left:6px;box-shadow:0 0 22px var(--accGlow);flex-shrink:0}
.z-overlay{position:fixed;inset:0;background:rgba(5,7,9,.7);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:20}
.z-sheet{background:#12151A;border:1px solid rgba(255,255,255,.08);border-bottom:none;border-radius:24px 24px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:22px 20px calc(30px + env(safe-area-inset-bottom));animation:zup .35s cubic-bezier(.3,.9,.4,1)}
@keyframes zup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
.z-sheethead{font-family:'Sora',sans-serif;font-weight:600;font-size:18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.z-step{font-size:11px;color:#5C656F;font-weight:400;letter-spacing:1px}
.z-label{font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:#6B747E;margin:18px 0 8px;font-family:'Sora',sans-serif}
.z-input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:13px 14px;font-size:15px;color:#F4F6F8;font-family:inherit}
.z-input:focus{outline:none;border-color:var(--acc);box-shadow:0 0 0 3px var(--accSoft)}
.z-input::placeholder{color:#5C656F}
.z-input.slim{flex:1}
.z-area{margin-top:8px;resize:vertical;min-height:52px;line-height:1.45}
.z-time{width:auto;padding:8px 10px;margin-left:8px;color-scheme:dark}
.z-timelbl{display:flex;align-items:center;font-size:13px;color:#C4CBD2}
.z-notifrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.z-notifon{color:var(--acc);font-family:'Sora',sans-serif;font-size:13px;font-weight:600}
.z-row{display:flex;gap:8px;margin-top:8px;align-items:center}
.z-pills{display:flex;gap:7px;flex-wrap:wrap}
.z-pill{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#C4CBD2;border-radius:20px;padding:8px 14px;font-size:13px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
.z-pill.on{border-color:var(--acc);color:#F4F6F8;background:var(--accSoft)}
.z-cdot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0}
.z-xin{border:none;background:none;color:#6B747E;cursor:pointer;font-size:10px;padding:0 0 0 3px}
.z-q{font-family:'Sora',sans-serif;font-weight:600;font-size:19px;margin:14px 0 8px}
.z-info{font-size:13px;color:#8A929C;line-height:1.5;margin-bottom:6px}
.z-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}
.z-choicebtn{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.045);color:#F4F6F8;border-radius:16px;padding:22px 10px;font-size:16px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif}
.z-choicebtn:active{border-color:var(--acc);background:var(--accSoft)}
.z-sheetfoot{display:flex;justify-content:space-between;gap:10px;margin-top:20px}
.z-mainbtn{flex:1;border:none;background:var(--acc);color:#0B0D10;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 0 18px var(--accSoft)}
.z-mainbtn:disabled{opacity:.35;box-shadow:none}
.z-ghostbtn{border:1px solid rgba(255,255,255,.12);background:none;color:#9AA3AD;border-radius:14px;padding:14px 18px;font-size:14px;cursor:pointer;font-family:inherit}
.z-sent{display:flex;justify-content:space-between;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:10px 8px 10px 14px;margin:7px 0;font-size:14px;line-height:1.4}
.z-gems{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.z-gemswatch{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);border-radius:15px;padding:12px 4px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:7px;color:#9AA3AD;font-size:11px;font-family:inherit}
.z-gemswatch.on{border-color:var(--gc);color:#F4F6F8;background:rgba(255,255,255,.05)}
.z-gemball{width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.85),var(--gc) 45%,rgba(0,0,0,.35));box-shadow:0 0 14px var(--gg)}
.z-fixed{margin-top:22px;border:1px solid rgba(255,255,255,.08);border-radius:15px;padding:14px;font-size:13px;color:#8A929C;line-height:1.5}
.z-fixed b{color:var(--acc);font-family:'Sora',sans-serif;font-weight:600;font-size:13px;display:block;margin-bottom:4px}
.z-coachload{text-align:center;padding:40px 0;color:var(--acc);font-size:26px;animation:zpulse 1.4s ease infinite}
.z-coachload span{display:block;font-size:13px;color:#8A929C;margin-top:12px;animation:none}
.z-coachana{font-size:14.5px;line-height:1.6;color:#DDE2E7;background:rgba(255,255,255,.04);border-left:3px solid var(--acc);border-radius:0 13px 13px 0;padding:12px 14px;margin-bottom:14px}
.z-sug{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:11px 12px;margin:7px 0}
.z-sugbody{flex:1;min-width:0}
.z-sugtitle{font-size:14px;font-weight:500}
.z-sugmeta{font-size:11.5px;color:#6B747E;margin-top:2px}
.z-authwrap{padding:60px 22px 40px;position:relative}
.z-authlangs{display:flex;justify-content:center;gap:4px;margin:14px 0 26px}
.z-authcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:22px 20px;backdrop-filter:blur(14px)}
.z-authok{color:var(--acc);font-size:13.5px;margin-top:12px;font-family:'Sora',sans-serif}
.z-autherr{color:#FF7B72;font-size:13.5px;margin-top:12px}
.z-acctrow{display:flex;justify-content:space-between;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:8px 8px 8px 14px}
.z-acctmail{font-size:13.5px;color:#C4CBD2;overflow:hidden;text-overflow:ellipsis}
button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
`;
