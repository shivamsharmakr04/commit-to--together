import React, { useEffect, useState, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDown, ArrowRight, CalendarDays, Check, Copy, Heart,
  LockKeyhole, Music2, Plus, Sparkles, Trash2, Edit3, Share2,
  Clock, Send, Eye, EyeOff, X, Gift, Mail, ChevronRight,
  MessageCircleHeart, Users, AlertCircle, RefreshCw, Globe, Play, Pause
} from "lucide-react";
import "./styles.css";

// Supported Occasion Presets & Metadata
const OCCASION_TYPES = {
  proposal: { emoji: "💍", label: "Proposal", desc: "The eternal question", defaultAsk: "Will you be mine forever?", yes: "A thousand yeses! 💖", time: "Take all the time you need", no: "Always your friend" },
  anniversary: { emoji: "🥂", label: "Anniversary", desc: "Marking shared time", defaultAsk: "Will you celebrate our journey together?", yes: "Wouldn't miss it for the world!", time: "Let me check our calendar", no: "Sending love always" },
  birthday: { emoji: "🎂", label: "Birthday", desc: "A day just for them", defaultAsk: "Will you let me spoil you today?", yes: "Yes, let's celebrate!", time: "I'll let you know soon", no: "Thinking of you always" },
  distance: { emoji: "✈️", label: "Reunion / Distance", desc: "Counting down to meet", defaultAsk: "Will you count down every mile with me?", yes: "Every single day!", time: "Counting down in my heart", no: "Holding you in spirit" },
  wedding: { emoji: "💐", label: "Wedding / Vows", desc: "Private, intimate revelry", defaultAsk: "Will you share this forever moment with me?", yes: "With all my heart!", time: "Cherishing every breath", no: "Forever grateful" },
  because: { emoji: "💌", label: "Just Because", desc: "Spontaneous devotion", defaultAsk: "Will you share this quiet evening with me?", yes: "Yes, always!", time: "Let me think about it", no: "No pressure, ever" }
};

const MOODS = {
  plum: { name: "Plum Velvet", colors: ["#2a1038", "#140d20"], accent: "#FF5B9D" },
  amethyst: { name: "Royal Amethyst", colors: ["#241552", "#10091f"], accent: "#B084FF" },
  champagne: { name: "Champagne Rose", colors: ["#4a2a3a", "#1a0f1c"], accent: "#FFD1DC" },
  roseGold: { name: "Rose Gold", colors: ["#3e1e2d", "#1b0e16"], accent: "#FF94C7" },
  midnight: { name: "Midnight Stardust", colors: ["#111633", "#0a0d1f"], accent: "#82AAFF" }
};

const ZONES = [
  ["New York (EST/EDT)", "America/New_York"],
  ["London (GMT/BST)", "Europe/London"],
  ["Paris / Berlin (CET)", "Europe/Paris"],
  ["Delhi / Mumbai (IST)", "Asia/Kolkata"],
  ["Dubai (GST)", "Asia/Dubai"],
  ["Tokyo (JST)", "Asia/Tokyo"],
  ["Sydney (AEST)", "Australia/Sydney"],
  ["Singapore (SGT)", "Asia/Singapore"],
  ["Los Angeles (PST/PDT)", "America/Los_Angeles"],
  ["Toronto (EST/EDT)", "America/Toronto"],
  ["Chicago (CST/CDT)", "America/Chicago"],
  ["Auckland (NZST)", "Pacific/Auckland"]
];

const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Initial Sample Data for Instant Delight
const DEFAULT_PROFILE = {
  me: "Maya",
  partner: "Liam",
  tzMe: "America/New_York",
  tzP: "Europe/London",
  anniversaryDate: inDays(-1095) // ~3 years ago
};

const DEFAULT_OCCASIONS = [
  {
    id: 1,
    slug: "anniversary-celebration",
    type: "anniversary",
    to: "Liam",
    from: "Maya",
    title: "Three Years Across Oceans",
    date: inDays(12),
    intro: "I built this little corner of the universe just for you.",
    story: "Three years of late-night video calls, airport hugs, and counting down flight numbers. Every mile between New York and London was worth it for the moments we share.",
    ask: "Will you celebrate three years of us together?",
    responseYes: "Yes, with all my heart! 🥂",
    responseTime: "Counting down every second",
    responseNo: "Always loving you",
    closing: "Wherever in the world we find ourselves, you are my home.",
    mood: "plum",
    pass: "",
    live: true,
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    music: "",
    memories: [
      { date: "Year One", title: "First Red-Eye Flight", text: "Seeing you waiting by terminal 4 with that goofy cardboard sign made all 8 hours vanish.", image: "" },
      { date: "Year Two", title: "Hyde Park in the Rain", text: "We shared one tiny umbrella and ended up completely soaked, laughing on the bench.", image: "" }
    ],
    plans: [
      { title: "Sunset Dinner by the Thames", text: "Our favorite table at the riverside cafe." },
      { title: "Weekend trip to the Cotswolds", text: "Hot chocolate by a cobblestone fireplace." }
    ]
  },
  {
    id: 2,
    slug: "birthday-surprise-liam",
    type: "birthday",
    to: "Liam",
    from: "Maya",
    title: "A Midnight Starlight Birthday",
    date: inDays(24),
    intro: "A special package is flying over the Atlantic right now.",
    story: "Another year around the sun for the person who makes every day brighter. Open parcel #3 the moment the clock hits midnight your time in London!",
    ask: "Will you let me spoil you on your birthday?",
    responseYes: "I can't wait! 🎂",
    responseTime: "I'll let you know soon",
    responseNo: "Sending love",
    closing: "You deserve every ounce of magic this year brings.",
    mood: "amethyst",
    pass: "1204",
    live: false,
    coverImage: "",
    music: "",
    memories: [
      { date: "Last Birthday", title: "Synchronized Cake Slices", text: "We both lit candles over FaceTime and blew them out at the exact same second.", image: "" }
    ],
    plans: []
  },
  {
    id: 3,
    slug: "reunion-countdown",
    type: "distance",
    to: "Liam",
    from: "Maya",
    title: "Terminal Arrival Countdown",
    date: inDays(38),
    intro: "The tickets are booked. Heathrow flight BA178.",
    story: "Counting down the days until the screen turns into real hugs. No time zone calculations, no lagging audio, just us.",
    ask: "Will you count down every hour with me?",
    responseYes: "Every single heartbeat! ✈️",
    responseTime: "Counting down in my heart",
    responseNo: "Always with you",
    closing: "See you in 38 days, my love.",
    mood: "champagne",
    pass: "",
    live: true,
    coverImage: "",
    music: "",
    memories: [],
    plans: []
  }
];

const DEFAULT_DROPS = [
  { id: 1, note: "Good morning! Look outside your door for your favorite warm flat white & croissant.", date: inDays(1), time: "08:30", completed: false },
  { id: 2, note: "Check your Spotify notifications for our new shared playlist 🎵", date: inDays(5), time: "18:00", completed: false },
  { id: 3, note: "Unpack parcel marked 'Open on a Rainy Day' from the bookshelf.", date: inDays(10), time: "20:00", completed: false }
];

const DEFAULT_LETTERS = [
  { id: 1, when: "you miss me late at night", content: "Remember that we look at the exact same moon across the ocean. Close your eyes, take a slow deep breath, and remember I am loving you every second, across every mile.", sealed: true },
  { id: 2, when: "you've had an exhausting day", content: "Put your phone down, put on your cozy hoodie, and take a long rest. You work so hard and you never have to prove anything to me. I'm so proud of you, always.", sealed: true },
  { id: 3, when: "we are boarding the flight to see each other", content: "By the time the wheels touch down, no more distance. Just two arms holding you as tight as forever. Can't wait to see your smile at the gate!", sealed: true }
];

const DEFAULT_REPLIES = [
  { id: 1, occasionTitle: "Three Years Across Oceans", name: "Liam", response: "yes", message: "Three years with you is just the beginning. I love you more than all the miles between us! ❤️", createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
];

// Helper Functions
function getRemainingTime(dateString) {
  if (!dateString) return { d: 0, h: 0, m: 0, s: 0, total: 0 };
  const target = new Date(`${dateString}T00:00:00`).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, total: 0, past: true };
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
    total: diff,
    past: false
  };
}

function getTimezoneStatus(tz) {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { timeZone: tz, hour: "2-digit", minute: "2-digit" });
    const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(now));
    let statusText = "☀️ Out and about";
    let icon = "☀️";
    if (hour < 6 || hour >= 23) {
      statusText = "🌙 Asleep · sweet dreams";
      icon = "🌙";
    } else if (hour < 9) {
      statusText = "☕ Waking up · morning glow";
      icon = "☕";
    } else if (hour < 18) {
      statusText = "☀️ Out and about · busy day";
      icon = "☀️";
    } else {
      statusText = "🌆 Winding down · time to call";
      icon = "🌆";
    }
    return { timeStr, hour, statusText, icon };
  } catch {
    return { timeStr: "--:--", hour: 12, statusText: "Connected", icon: "✨" };
  }
}

// Confetti & Floating Hearts Trigger
function triggerHearts() {
  confetti({
    particleCount: 65,
    spread: 75,
    origin: { y: 0.65 },
    colors: ["#ff5b9d", "#ff94c7", "#ffd1dc", "#b084ff", "#ffffff"]
  });
  for (let i = 0; i < 24; i++) {
    const heart = document.createElement("div");
    heart.className = "hub-falling-heart";
    heart.textContent = ["💖", "❤️", "✨", "💗", "💞"][i % 5];
    heart.style.left = `${Math.random() * 95}vw`;
    heart.style.fontSize = `${16 + Math.random() * 22}px`;
    heart.style.animationDelay = `${Math.random() * 0.7}s`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 3800);
  }
}

// REST API Helper (falls back to LocalStorage safely)
async function api(path, options = {}) {
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
        ...options.headers
      }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Server responded with an issue");
    }
    return await response.json();
  } catch (e) {
    // Return null or let caller catch to handle offline/local mode
    throw e;
  }
}

// Main Root Application
export default function App() {
  // Check URL pathname for direct guest or manage links
  const manageMatch = window.location.pathname.match(/^\/manage\/([a-z0-9-]+)\/?$/);
  const eventMatch = window.location.pathname.match(/^\/e\/([a-z0-9-]+)\/?$/);

  // State Management with LocalStorage persistence
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_profile");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [occasions, setOccasions] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_occasions");
      return saved ? JSON.parse(saved) : DEFAULT_OCCASIONS;
    } catch {
      return DEFAULT_OCCASIONS;
    }
  });

  const [drops, setDrops] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_drops");
      return saved ? JSON.parse(saved) : DEFAULT_DROPS;
    } catch {
      return DEFAULT_DROPS;
    }
  });

  const [letters, setLetters] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_letters");
      return saved ? JSON.parse(saved) : DEFAULT_LETTERS;
    } catch {
      return DEFAULT_LETTERS;
    }
  });

  const [replies, setReplies] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_replies");
      return saved ? JSON.parse(saved) : DEFAULT_REPLIES;
    } catch {
      return DEFAULT_REPLIES;
    }
  });

  const [pulsesCount, setPulsesCount] = useState(14);
  const [lastPulseText, setLastPulseText] = useState("A few minutes ago");

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState("occasions"); // 'occasions' | 'create' | 'distance' | 'replies'
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [previewingOccasion, setPreviewingOccasion] = useState(null);
  const [unlockedPreview, setUnlockedPreview] = useState(false);
  const [readingLetter, setReadingLetter] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());

  // Clock Ticker (updates every second for real-time clocks & countdowns)
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("ctt_profile", JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem("ctt_occasions", JSON.stringify(occasions));
    } catch {}
  }, [occasions]);

  useEffect(() => {
    try {
      localStorage.setItem("ctt_drops", JSON.stringify(drops));
    } catch {}
  }, [drops]);

  useEffect(() => {
    try {
      localStorage.setItem("ctt_letters", JSON.stringify(letters));
    } catch {}
  }, [letters]);

  useEffect(() => {
    try {
      localStorage.setItem("ctt_replies", JSON.stringify(replies));
    } catch {}
  }, [replies]);

  // Toast Helper
  const toast = (text, icon = "💖") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // Pulse Interaction
  const handleSendPulse = () => {
    setPulsesCount((p) => p + 1);
    setLastPulseText("Just now");
    triggerHearts();
    toast(`Heart pulse sent to ${profile.partner}!`, "💗");
  };

  // Next Milestone calculation
  const nextMilestone = useMemo(() => {
    const upcoming = [...occasions]
      .filter((o) => {
        const rem = getRemainingTime(o.date);
        return rem.total > 0;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || occasions[0] || null;
  }, [occasions, nowTick]);

  const milestoneRemaining = useMemo(() => {
    if (!nextMilestone) return { d: 0, h: 0, m: 0, s: 0 };
    return getRemainingTime(nextMilestone.date);
  }, [nextMilestone, nowTick]);

  // Render direct routes if requested by URL
  if (manageMatch) {
    return (
      <div className="app">
        <div className="hub-header" style={{ justifyContent: "center" }}>
          <button className="hub-sec-btn sm" onClick={() => window.location.href = "/"}>
            <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to All-in-One Dashboard
          </button>
        </div>
        <ManagePage slug={manageMatch[1]} onBack={() => window.location.href = "/"} />
      </div>
    );
  }

  if (eventMatch) {
    return (
      <div className="app">
        <div className="hub-header" style={{ justifyContent: "center" }}>
          <button className="hub-sec-btn sm" onClick={() => window.location.href = "/"}>
            <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Open All-in-One Dashboard
          </button>
        </div>
        <EventPage slug={eventMatch[1]} onBack={() => window.location.href = "/"} />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Dynamic Starfield Background */}
      <div className="stars" aria-hidden="true">
        {[...Array(40)].map((_, i) => (
          <span
            key={i}
            style={{
              top: `${(i * 37) % 98}%`,
              left: `${(i * 59) % 98}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDelay: `${(i * 0.4) % 3.5}s`,
              animationDuration: `${2.5 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Main Unified Header */}
      <header className="hub-header">
        <button className="hub-brand" onClick={() => { setActiveTab("occasions"); setEditingOccasion(null); }}>
          <span className="hub-brand-icon"><Heart size={18} fill="currentColor" /></span>
          <span>Commit to <em>Together</em></span>
        </button>

        <nav className="hub-nav-group">
          <button
            className={`hub-nav-btn ${activeTab === "occasions" ? "active" : ""}`}
            onClick={() => { setActiveTab("occasions"); setEditingOccasion(null); }}
          >
            <Sparkles size={15} /> All Occasions
          </button>
          <button
            className={`hub-nav-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => { setActiveTab("create"); setEditingOccasion(null); }}
          >
            <Plus size={15} /> {editingOccasion ? "Edit Moment" : "Create Moment"}
          </button>
          <button
            className={`hub-nav-btn ${activeTab === "distance" ? "active" : ""}`}
            onClick={() => setActiveTab("distance")}
          >
            <Globe size={15} /> Long Distance Suite
          </button>
          <button
            className={`hub-nav-btn ${activeTab === "replies" ? "active" : ""}`}
            onClick={() => setActiveTab("replies")}
          >
            <MessageCircleHeart size={15} /> Replies ({replies.length})
          </button>
        </nav>

        <div className="hub-header-actions">
          <button
            className="couple-pill-btn"
            onClick={() => setShowProfileModal(true)}
            title="Edit couple names & timezones"
          >
            <Users size={14} /> {profile.me} & {profile.partner}
          </button>
          <button
            className="hub-primary-btn sm"
            onClick={() => {
              setEditingOccasion(null);
              setActiveTab("create");
            }}
          >
            <Plus size={14} /> New Occasion
          </button>
        </div>
      </header>

      {/* Unified View Router */}
      <main className="hub-main">
        {activeTab === "occasions" && (
          <OccasionsHub
            profile={profile}
            occasions={occasions}
            nextMilestone={nextMilestone}
            milestoneRemaining={milestoneRemaining}
            onPreview={(occ) => {
              setPreviewingOccasion(occ);
              setUnlockedPreview(!occ.pass);
            }}
            onEdit={(occ) => {
              setEditingOccasion(occ);
              setActiveTab("create");
            }}
            onDelete={(id) => {
              setOccasions((prev) => prev.filter((o) => o.id !== id));
              toast("Occasion removed", "🗑️");
            }}
            onToggleLive={(id) => {
              setOccasions((prev) =>
                prev.map((o) => (o.id === id ? { ...o, live: !o.live } : o))
              );
              toast("Occasion status updated", "✨");
            }}
            onLaunchTemplate={(typeKey) => {
              const preset = OCCASION_TYPES[typeKey];
              setEditingOccasion({
                id: Date.now(),
                slug: `${typeKey}-${Date.now().toString(36)}`,
                type: typeKey,
                to: profile.partner,
                from: profile.me,
                title: preset.defaultAsk,
                date: inDays(14),
                intro: "I made this little sanctuary corner of the universe just for you.",
                story: "Every moment we share becomes my favorite chapter. I wanted to create something personal for you.",
                ask: preset.defaultAsk,
                responseYes: preset.yes,
                responseTime: preset.time,
                responseNo: preset.no,
                closing: "Whatever your heart says, thank you for being you.",
                mood: "plum",
                pass: "",
                live: true,
                coverImage: "",
                music: "",
                memories: [{ date: "A sweet memory", title: "When we first spoke", text: "I already knew you were someone special.", image: "" }],
                plans: [{ title: "Our next adventure", text: "Somewhere quiet with a beautiful sunset." }]
              });
              setActiveTab("create");
            }}
            toast={toast}
          />
        )}

        {activeTab === "create" && (
          <StudioBuilder
            profile={profile}
            editingOccasion={editingOccasion}
            onSave={(savedOccasion) => {
              setOccasions((prev) => {
                const existing = prev.some((o) => o.id === savedOccasion.id);
                if (existing) {
                  return prev.map((o) => (o.id === savedOccasion.id ? savedOccasion : o));
                }
                return [savedOccasion, ...prev];
              });
              toast(savedOccasion.live ? "Live occasion invitation ready! 💖" : "Secret draft saved! 🔒");
              setActiveTab("occasions");
              setEditingOccasion(null);
            }}
            onCancel={() => {
              setEditingOccasion(null);
              setActiveTab("occasions");
            }}
            toast={toast}
          />
        )}

        {activeTab === "distance" && (
          <LongDistanceSuite
            profile={profile}
            setProfile={setProfile}
            drops={drops}
            setDrops={setDrops}
            letters={letters}
            setLetters={setLetters}
            pulsesCount={pulsesCount}
            lastPulseText={lastPulseText}
            onSendPulse={handleSendPulse}
            onReadLetter={(letter) => setReadingLetter(letter)}
            toast={toast}
          />
        )}

        {activeTab === "replies" && (
          <RepliesHub
            replies={replies}
            occasions={occasions}
            onDeleteReply={(id) => {
              setReplies((prev) => prev.filter((r) => r.id !== id));
              toast("Reply removed", "🗑️");
            }}
            toast={toast}
          />
        )}
      </main>

      {/* Preview / Sanctuary Modal */}
      {previewingOccasion && (
        <PreviewSanctuaryModal
          occasion={previewingOccasion}
          unlocked={unlockedPreview}
          onUnlock={() => {
            setUnlockedPreview(true);
            triggerHearts();
          }}
          onClose={() => setPreviewingOccasion(null)}
          onSendReply={(name, response, message) => {
            const newReply = {
              id: Date.now(),
              occasionTitle: previewingOccasion.title || previewingOccasion.ask,
              name: name || profile.partner,
              response,
              message,
              createdAt: new Date().toISOString()
            };
            setReplies((prev) => [newReply, ...prev]);
            toast("Your answer was recorded in the dashboard! ❤️");
            if (response === "yes") triggerHearts();
          }}
          toast={toast}
        />
      )}

      {/* Letter Reading Modal */}
      {readingLetter && (
        <StationeryLetterModal
          letter={readingLetter}
          partnerName={profile.partner}
          myName={profile.me}
          onClose={() => setReadingLetter(null)}
          onReseal={() => {
            setLetters((prev) =>
              prev.map((l) => (l.id === readingLetter.id ? { ...l, sealed: true } : l))
            );
            setReadingLetter(null);
            toast("Letter resealed with wax! 💌");
          }}
          toast={toast}
        />
      )}

      {/* Couple Profile Edit Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            setProfile(updated);
            setShowProfileModal(false);
            toast("Couple profile updated! 💑");
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Floating Toast Notification Stack */}
      <div className="hub-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="hub-toast-item">
            <span>{t.icon}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      <footer className="studio-footer">
        © 2026 Commit to Together · crafted for love, across any distance <Heart size={13} fill="currentColor" />
      </footer>
    </div>
  );
}

// =========================================================================
// SECTION 1: ALL OCCASIONS DASHBOARD
// =========================================================================
function OccasionsHub({
  profile,
  occasions,
  nextMilestone,
  milestoneRemaining,
  onPreview,
  onEdit,
  onDelete,
  onToggleLive,
  onLaunchTemplate,
  toast
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const myTzInfo = useMemo(() => getTimezoneStatus(profile.tzMe), [profile.tzMe]);
  const partnerTzInfo = useMemo(() => getTimezoneStatus(profile.tzP), [profile.tzP]);

  const filteredOccasions = useMemo(() => {
    return occasions.filter((occ) => {
      if (filterType !== "all" && occ.type !== filterType) return false;
      if (filterStatus === "live" && !occ.live) return false;
      if (filterStatus === "draft" && occ.live) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = (occ.title || "").toLowerCase().includes(query);
        const matchTo = (occ.to || "").toLowerCase().includes(query);
        const matchStory = (occ.story || "").toLowerCase().includes(query);
        if (!matchTitle && !matchTo && !matchStory) return false;
      }
      return true;
    });
  }, [occasions, filterType, filterStatus, search]);

  const nextTypeMeta = nextMilestone ? OCCASION_TYPES[nextMilestone.type] || OCCASION_TYPES.other : null;

  return (
    <div>
      {/* Hero Connected Timeline Card */}
      <section className="hub-hero">
        <div>
          <span className="hub-hero-badge">♥ Connected Timeline</span>
          <h1 className="hub-hero-title">
            Two hearts across any distance: <em>{profile.me} & {profile.partner}</em>
          </h1>
          <p className="hub-hero-sub">
            Manage proposals, anniversaries, birthdays, and surprise notes in one single sanctuary. Everything updates in real time.
          </p>
          <div className="hub-time-chips">
            <span className="hub-time-chip">
              <Clock size={13} /> {profile.me} · {myTzInfo.timeStr} ({myTzInfo.statusText})
            </span>
            <span className="hub-time-chip partner">
              <Heart size={13} fill="currentColor" /> {profile.partner} · {partnerTzInfo.timeStr} ({partnerTzInfo.statusText})
            </span>
          </div>
        </div>

        {/* Milestone Countdown SVG Ring */}
        <div className="hub-milestone-box">
          <div className="ring-svg-container">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#FF5B9D"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="326"
                strokeDashoffset={Math.max(0, 326 * (1 - Math.min(1, milestoneRemaining.d / 45)))}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="ring-inner-text">
              <span>{milestoneRemaining.d}</span>
              <small>DAYS · {milestoneRemaining.h}H</small>
            </div>
          </div>
          <div className="milestone-details">
            <span className="milestone-kicker">Next Milestone</span>
            <h3 className="milestone-title">
              {nextMilestone ? `${nextTypeMeta?.emoji || "✨"} ${nextMilestone.title || nextTypeMeta?.label}` : "No upcoming moments"}
            </h3>
            <span className="milestone-sub">
              {nextMilestone ? `for ${nextMilestone.to || profile.partner} · ${nextMilestone.date}` : "Tap below to create one"}
            </span>
          </div>
        </div>
      </section>

      {/* Celebrations Section Header */}
      <div className="hub-section-head">
        <h2><span>💖</span> Your Celebrations & Moments ({filteredOccasions.length})</h2>
      </div>

      {/* Filter and Search Bar */}
      <div className="hub-controls-bar">
        <input
          type="text"
          className="hub-search-input"
          placeholder="Search by moment, name, or memory…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="hub-filter-pills">
          <button
            className={`hub-filter-pill ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Types
          </button>
          {Object.entries(OCCASION_TYPES).map(([key, item]) => (
            <button
              key={key}
              className={`hub-filter-pill ${filterType === key ? "active" : ""}`}
              onClick={() => setFilterType(key)}
            >
              {item.emoji} {item.label}
            </button>
          ))}
          <button
            className={`hub-filter-pill ${filterStatus === "live" ? "active" : ""}`}
            onClick={() => setFilterStatus(filterStatus === "live" ? "all" : "live")}
          >
            ● Live Only
          </button>
          <button
            className={`hub-filter-pill ${filterStatus === "draft" ? "active" : ""}`}
            onClick={() => setFilterStatus(filterStatus === "draft" ? "all" : "draft")}
          >
            🔒 Drafts
          </button>
        </div>
      </div>

      {/* Occasions Cards Grid */}
      {filteredOccasions.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "48px 20px" }}>
          <Sparkles size={32} color="#FF94C7" style={{ margin: "0 auto 12px" }} />
          <h3>No matching occasions found</h3>
          <p className="muted" style={{ margin: "6px auto 20px", maxWidth: 400 }}>
            {search ? "Try clearing your search query or filters." : "Start by creating a moment or pick a romantic template below."}
          </p>
        </div>
      ) : (
        <div className="hub-card-grid">
          {filteredOccasions.map((occ) => {
            const meta = OCCASION_TYPES[occ.type] || OCCASION_TYPES.other;
            const cd = getRemainingTime(occ.date);
            const shareUrl = `${window.location.origin}/e/${occ.slug || occ.id}`;

            return (
              <article key={occ.id} className="hub-occasion-card">
                <div className="hub-card-top">
                  <span className="hub-card-icon">{meta.emoji}</span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      className={`hub-status-chip ${occ.live ? "live" : "draft"}`}
                      onClick={() => onToggleLive(occ.id)}
                      title="Click to toggle Live / Draft status"
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {occ.live ? "● Live & shared" : "🔒 Secret draft"}
                    </button>
                    {occ.pass && (
                      <span className="hub-status-chip draft" title="Passcode protected">
                        <LockKeyhole size={11} style={{ verticalAlign: "middle" }} />
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="hub-card-title">{occ.title || meta.label}</h3>
                <p className="hub-card-msg">
                  {occ.story || occ.intro || occ.msg || "A sacred sanctuary moment made with devotion."}
                </p>

                {/* Live Countdown Display */}
                <div className="hub-card-countdown">
                  <div className="hub-cd-unit">
                    <b>{cd.d}</b>
                    <small>Days</small>
                  </div>
                  <div className="hub-cd-unit">
                    <b>{cd.h}</b>
                    <small>Hours</small>
                  </div>
                  <div className="hub-cd-unit">
                    <b>{cd.m}</b>
                    <small>Mins</small>
                  </div>
                  <div className="hub-cd-unit">
                    <b>{cd.s}</b>
                    <small>Secs</small>
                  </div>
                </div>

                <div className="hub-card-footer">
                  <span className="muted" style={{ fontSize: "0.78rem" }}>
                    for <strong style={{ color: "#fff" }}>{occ.to || profile.partner}</strong>
                  </span>
                  <div className="hub-card-actions">
                    <button
                      className="hub-primary-btn sm"
                      onClick={() => onPreview(occ)}
                      title="Preview interactive card"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      className="hub-sec-btn sm"
                      onClick={() => onEdit(occ)}
                      title="Edit moment"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      className="hub-sec-btn sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareUrl);
                          toast("Invitation link copied to clipboard! 📋");
                        } catch {
                          toast("Link: " + shareUrl);
                        }
                      }}
                      title="Copy guest link"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      className="hub-sec-btn sm"
                      onClick={() => onDelete(occ.id)}
                      title="Delete occasion"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Romantic Templates Gallery */}
      <div className="hub-section-head" style={{ marginTop: "50px" }}>
        <h2><span>💌</span> Instant Romantic Templates</h2>
      </div>
      <div className="hub-tpl-grid">
        {Object.entries(OCCASION_TYPES).map(([key, tpl]) => (
          <button
            key={key}
            className="hub-tpl-tile"
            onClick={() => onLaunchTemplate(key)}
          >
            <span className="hub-tpl-emoji">{tpl.emoji}</span>
            <strong className="hub-tpl-name">{tpl.label}</strong>
            <span className="hub-tpl-desc">{tpl.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 2: STUDIO BUILDER WITH LIVE INTERACTIVE PREVIEW
// =========================================================================
function StudioBuilder({ profile, editingOccasion, onSave, onCancel, toast }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // Form State
  const [draft, setDraft] = useState(() => {
    if (editingOccasion) return { ...editingOccasion };
    const defaultType = "anniversary";
    const preset = OCCASION_TYPES[defaultType];
    return {
      id: Date.now(),
      slug: `moment-${Date.now().toString(36)}`,
      type: defaultType,
      to: profile.partner,
      from: profile.me,
      title: preset.defaultAsk,
      date: inDays(14),
      intro: "I made this little corner of the universe just for you.",
      story: "Some of my favorite memories are the quiet ones I've shared with you.",
      ask: preset.defaultAsk,
      responseYes: preset.yes,
      responseTime: preset.time,
      responseNo: preset.no,
      closing: "Whatever your heart says, thank you for being you.",
      mood: "plum",
      pass: "",
      live: true,
      coverImage: "",
      music: "",
      memories: [
        { date: "Our First Memory", title: "When our story started", text: "I remember every detail like it was yesterday.", image: "" }
      ],
      plans: [
        { title: "Our next walk together", text: "Somewhere peaceful where time stops." }
      ]
    };
  });

  const change = (field, value) => setDraft((curr) => ({ ...curr, [field]: value }));

  const changeOccasionType = (newType) => {
    const preset = OCCASION_TYPES[newType];
    setDraft((curr) => ({
      ...curr,
      type: newType,
      title: preset.defaultAsk,
      ask: preset.defaultAsk,
      responseYes: preset.yes,
      responseTime: preset.time,
      responseNo: preset.no
    }));
  };

  const handleFinish = (makeLive) => {
    const finalDraft = { ...draft, live: makeLive };
    onSave(finalDraft);
  };

  const activeMood = MOODS[draft.mood] || MOODS.plum;
  const steps = ["Occasion & Theme", "The Couple", "Words & Lock", "Memories & Plans", "Finish & Share"];

  return (
    <div>
      <div className="hub-section-head">
        <div>
          <span className="hub-hero-badge">✦ Sacred Studio</span>
          <h2 style={{ marginTop: 8 }}>
            {editingOccasion ? "Edit Your Little Universe" : "Create an Unforgettable Moment"}
          </h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Customize each memory, choose the mood palette, and watch your card update in real time.
          </p>
        </div>
        <button className="hub-sec-btn sm" onClick={onCancel}>
          Cancel & Back
        </button>
      </div>

      <div className="studio-split-layout">
        {/* Left Side: Builder Controls */}
        <div className="glass" style={{ borderRadius: 24, padding: "clamp(20px, 4vw, 32px)" }}>
          {/* Stepper Tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {steps.map((st, i) => (
              <button
                key={i}
                className={`hub-filter-pill ${step === i ? "active" : ""}`}
                onClick={() => setStep(i)}
              >
                {i + 1}. {st}
              </button>
            ))}
          </div>

          {/* Step 0: Occasion & Theme */}
          {step === 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>Select Occasion</h3>
              <div className="occasion-grid" style={{ marginTop: 12 }}>
                {Object.entries(OCCASION_TYPES).map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    className={`occasion-option ${draft.type === k ? "selected" : ""}`}
                    onClick={() => changeOccasionType(k)}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>

              <h3 style={{ marginTop: 24 }}>Theme Mood Palette</h3>
              <p className="muted" style={{ fontSize: "0.85rem" }}>
                Sets the atmosphere and gradient colors of your interactive card.
              </p>
              <div className="mood-selector">
                {Object.entries(MOODS).map(([k, m]) => (
                  <button
                    key={k}
                    type="button"
                    className={`mood-option-btn ${draft.mood === k ? "active" : ""}`}
                    onClick={() => change("mood", k)}
                  >
                    <span
                      className="mood-swatch"
                      style={{ background: `linear-gradient(135deg, ${m.colors[0]}, ${m.colors[1]})` }}
                    />
                    {m.name}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 24 }}>
                <label className="field wide">
                  <span>Headline / Title</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => change("title", e.target.value)}
                    placeholder="e.g. Three Years Across Oceans"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 1: The Couple & Date */}
          {step === 1 && (
            <div style={{ marginTop: 20 }}>
              <h3>About the Two of You</h3>
              <div className="form-grid" style={{ marginTop: 12 }}>
                <label className="field">
                  <span>Their Name (Recipient)</span>
                  <input
                    type="text"
                    value={draft.to}
                    onChange={(e) => change("to", e.target.value)}
                    placeholder="e.g. Liam"
                  />
                </label>
                <label className="field">
                  <span>Your Name (Creator)</span>
                  <input
                    type="text"
                    value={draft.from}
                    onChange={(e) => change("from", e.target.value)}
                    placeholder="e.g. Maya"
                  />
                </label>
                <label className="field wide">
                  <span>Date of the Moment</span>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => change("date", e.target.value)}
                  />
                </label>
                <label className="field wide">
                  <span>Cover Photo Link (Optional HTTPS URL)</span>
                  <input
                    type="url"
                    value={draft.coverImage}
                    onChange={(e) => change("coverImage", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>
                <label className="field wide">
                  <span>Opening Line</span>
                  <input
                    type="text"
                    value={draft.intro}
                    onChange={(e) => change("intro", e.target.value)}
                    placeholder="A little welcome note"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Words & Passcode */}
          {step === 2 && (
            <div style={{ marginTop: 20 }}>
              <h3>Your Words & Sanctuary Lock</h3>
              <div className="form-grid" style={{ marginTop: 12 }}>
                <label className="field wide">
                  <span>Your Story / Love Letter</span>
                  <textarea
                    rows={4}
                    value={draft.story}
                    onChange={(e) => change("story", e.target.value)}
                    placeholder="Write from your heart…"
                  />
                </label>
                <label className="field wide">
                  <span>The Question / Invitation</span>
                  <input
                    type="text"
                    value={draft.ask}
                    onChange={(e) => change("ask", e.target.value)}
                    placeholder="Will you celebrate with me?"
                  />
                </label>
                <label className="field">
                  <span>Yes Button Text</span>
                  <input
                    type="text"
                    value={draft.responseYes}
                    onChange={(e) => change("responseYes", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Thinking / Time Button Text</span>
                  <input
                    type="text"
                    value={draft.responseTime}
                    onChange={(e) => change("responseTime", e.target.value)}
                  />
                </label>
                <label className="field wide">
                  <span>No-Pressure Reassurance Note</span>
                  <textarea
                    rows={2}
                    value={draft.closing}
                    onChange={(e) => change("closing", e.target.value)}
                  />
                </label>
                <label className="field wide">
                  <span>Secret Passcode (Optional - protects card with lock screen)</span>
                  <input
                    type="text"
                    value={draft.pass}
                    onChange={(e) => change("pass", e.target.value)}
                    placeholder="e.g. 1204 or our special date (leave blank for open access)"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Memories & Next Chapter Plans */}
          {step === 3 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Favorite Memories ({draft.memories.length})</h3>
                <button
                  type="button"
                  className="hub-sec-btn sm"
                  onClick={() =>
                    change("memories", [
                      ...draft.memories,
                      { date: "", title: "", text: "", image: "" }
                    ])
                  }
                >
                  <Plus size={14} /> Add Memory
                </button>
              </div>

              <div className="repeat-list" style={{ marginTop: 12 }}>
                {draft.memories.map((mem, idx) => (
                  <div key={idx} className="repeat-card">
                    <div className="repeat-card-heading">
                      <span>Moment {idx + 1}</span>
                      {draft.memories.length > 1 && (
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() =>
                            change("memories", draft.memories.filter((_, i) => i !== idx))
                          }
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>When</span>
                        <input
                          type="text"
                          value={mem.date}
                          onChange={(e) => {
                            const updated = [...draft.memories];
                            updated[idx].date = e.target.value;
                            change("memories", updated);
                          }}
                          placeholder="e.g. Autumn 2024"
                        />
                      </label>
                      <label className="field">
                        <span>Title</span>
                        <input
                          type="text"
                          value={mem.title}
                          onChange={(e) => {
                            const updated = [...draft.memories];
                            updated[idx].title = e.target.value;
                            change("memories", updated);
                          }}
                          placeholder="Our first coffee"
                        />
                      </label>
                      <label className="field wide">
                        <span>Story</span>
                        <textarea
                          rows={2}
                          value={mem.text}
                          onChange={(e) => {
                            const updated = [...draft.memories];
                            updated[idx].text = e.target.value;
                            change("memories", updated);
                          }}
                          placeholder="What happened in this moment..."
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Finish & Share */}
          {step === 4 && (
            <div style={{ marginTop: 20 }}>
              <h3>Ready to Launch Your Moment</h3>
              <p className="muted" style={{ lineHeight: 1.6 }}>
                You can save this moment as a <strong>Live & Shared</strong> invitation that your partner can view, or as a <strong>Secret Draft</strong> to keep privately in your dashboard.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "24px 0" }}>
                <button
                  type="button"
                  className="hub-primary-btn"
                  onClick={() => handleFinish(true)}
                >
                  🚀 Save & Make Live
                </button>
                <button
                  type="button"
                  className="hub-sec-btn"
                  onClick={() => handleFinish(false)}
                >
                  🔒 Save Secret Draft
                </button>
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              type="button"
              className="hub-sec-btn sm"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                className="hub-primary-btn sm"
                onClick={() => setStep((s) => s + 1)}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                className="hub-primary-btn sm"
                onClick={() => handleFinish(true)}
              >
                Save Moment <Check size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Real-Time Live Preview */}
        <div className="studio-preview-sticky">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="hub-hero-badge">✦ Live Real-Time Preview</span>
            <span className="muted" style={{ fontSize: "0.78rem" }}>
              Theme: {activeMood.name}
            </span>
          </div>

          <InteractiveCardPreview draft={draft} moodMeta={activeMood} toast={toast} />
        </div>
      </div>
    </div>
  );
}

// Interactive Sanctuary Card Preview Component
function InteractiveCardPreview({ draft, moodMeta, toast }) {
  const meta = OCCASION_TYPES[draft.type] || OCCASION_TYPES.other;
  const cd = getRemainingTime(draft.date);

  return (
    <div
      className="sanctuary-card"
      style={{
        "--card-c1": moodMeta.colors[0],
        "--card-c2": moodMeta.colors[1]
      }}
    >
      <div className="sanctuary-big-icon">{meta.emoji}</div>
      <div className="sanctuary-names">
        {draft.from || "You"} ♥ {draft.to || "Your Love"}
      </div>

      <h2 className="sanctuary-title">{draft.title || meta.label}</h2>
      <p className="sanctuary-msg">
        {draft.story || draft.intro || "Your personal story will appear here as you write it…"}
      </p>

      {/* Countdown Clock */}
      <div className="sanctuary-cd">
        <div className="sanctuary-cd-box">
          <b>{cd.d}</b>
          <small>Days</small>
        </div>
        <div className="sanctuary-cd-box">
          <b>{cd.h}</b>
          <small>Hours</small>
        </div>
        <div className="sanctuary-cd-box">
          <b>{cd.m}</b>
          <small>Mins</small>
        </div>
        <div className="sanctuary-cd-box">
          <b>{cd.s}</b>
          <small>Secs</small>
        </div>
      </div>

      <p style={{ fontSize: "0.88rem", color: "#FFD1DC", margin: "14px 0 6px" }}>
        {draft.ask || meta.defaultAsk}
      </p>

      {/* Interactive Response Buttons */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: 14 }}>
        <button
          className="hub-primary-btn sm"
          onClick={() => {
            triggerHearts();
            toast && toast("Preview: Answered Yes! 💖");
          }}
        >
          {draft.responseYes || "Yes, forever 💖"}
        </button>
        <button
          className="hub-sec-btn sm"
          onClick={() => toast && toast("Preview: Answered with thoughtful care ✨")}
        >
          {draft.responseTime || "Let me think"}
        </button>
      </div>

      {draft.pass && (
        <div style={{ marginTop: 14, fontSize: "0.72rem", color: "var(--hub-tx3)" }}>
          🔒 Passcode protected: <strong>{draft.pass}</strong>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SECTION 3: LONG DISTANCE SUITE
// =========================================================================
function LongDistanceSuite({
  profile,
  setProfile,
  drops,
  setDrops,
  letters,
  setLetters,
  pulsesCount,
  lastPulseText,
  onSendPulse,
  onReadLetter,
  toast
}) {
  const [newDropNote, setNewDropNote] = useState("");
  const [newDropDate, setNewDropDate] = useState(inDays(3));
  const [newLetterWhen, setNewLetterWhen] = useState("");
  const [newLetterContent, setNewLetterContent] = useState("");

  const myTzInfo = getTimezoneStatus(profile.tzMe);
  const partnerTzInfo = getTimezoneStatus(profile.tzP);

  const diffHours = partnerTzInfo.hour - myTzInfo.hour;
  const diffString =
    diffHours === 0
      ? "Same time zone"
      : diffHours > 0
      ? `${profile.partner} is ${diffHours} hour${diffHours > 1 ? "s" : ""} ahead`
      : `${profile.partner} is ${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? "s" : ""} behind`;

  const handleAddDrop = (e) => {
    e.preventDefault();
    if (!newDropNote.trim()) return toast("Please write a surprise note first", "✍️");
    const drop = {
      id: Date.now(),
      note: newDropNote.trim(),
      date: newDropDate,
      time: "10:00",
      completed: false
    };
    setDrops((prev) => [drop, ...prev]);
    setNewDropNote("");
    toast("Surprise drop scheduled! 🎁");
  };

  const handleAddLetter = (e) => {
    e.preventDefault();
    if (!newLetterWhen.trim() || !newLetterContent.trim()) {
      return toast("Please write both the prompt and the letter", "✍️");
    }
    const letter = {
      id: Date.now(),
      when: newLetterWhen.trim(),
      content: newLetterContent.trim(),
      sealed: true
    };
    setLetters((prev) => [letter, ...prev]);
    setNewLetterWhen("");
    setNewLetterContent("");
    toast("Love letter sealed with wax! 💌");
  };

  return (
    <div>
      <div className="hub-section-head">
        <div>
          <span className="hub-hero-badge">● Live Sanctuary Link</span>
          <h2 style={{ marginTop: 8 }}>Miles Apart, Hearts Aligned</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Real-time world clocks, smart sleeping/awake status, surprise drops, and sealed "Open When" letters.
          </p>
        </div>
      </div>

      {/* Clocks & Pulse Grid */}
      <div className="distance-clock-grid">
        {/* My Timezone Card */}
        <div className="distance-clock-card">
          <span className="hub-hero-badge">{profile.me}'s Time</span>
          <select
            value={profile.tzMe}
            onChange={(e) => setProfile((p) => ({ ...p, tzMe: e.target.value }))}
          >
            {ZONES.map(([lbl, val]) => (
              <option key={val} value={val}>
                {lbl}
              </option>
            ))}
          </select>
          <div className="distance-clock-display">{myTzInfo.timeStr}</div>
          <div className="distance-status-badge">
            <span>{myTzInfo.icon}</span> {myTzInfo.statusText}
          </div>
        </div>

        {/* Partner Timezone Card */}
        <div className="distance-clock-card">
          <span className="hub-hero-badge">{profile.partner}'s Time</span>
          <select
            value={profile.tzP}
            onChange={(e) => setProfile((p) => ({ ...p, tzP: e.target.value }))}
          >
            {ZONES.map(([lbl, val]) => (
              <option key={val} value={val}>
                {lbl}
              </option>
            ))}
          </select>
          <div className="distance-clock-display">{partnerTzInfo.timeStr}</div>
          <div className="distance-status-badge">
            <span>{partnerTzInfo.icon}</span> {partnerTzInfo.statusText}
          </div>
        </div>

        {/* Interactive Beating Pulse Card */}
        <div className="distance-pulse-card">
          <span className="hub-hero-badge">Live Heartbeat</span>
          <div
            className="pulse-beating-icon"
            onClick={onSendPulse}
            title="Tap to send heart pulse!"
          >
            💗
          </div>
          <p style={{ margin: "4px 0", fontWeight: 600, color: "#fff" }}>
            Tap to send a heart pulse
          </p>
          <span className="muted" style={{ fontSize: "0.78rem" }}>
            {pulsesCount} pulses shared · {lastPulseText}
          </span>
          <div style={{ marginTop: 8, fontSize: "0.74rem", color: "var(--hub-champ)" }}>
            {diffString}
          </div>
        </div>
      </div>

      {/* Scheduled Drops & Sealed Letters Features Grid */}
      <div className="distance-features-grid">
        {/* Schedule a Surprise Drop */}
        <div className="distance-pane">
          <h3>🎁 Schedule a Surprise Drop</h3>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 16px" }}>
            A note or delivery idea that unlocks for {profile.partner} on the exact day.
          </p>
          <form onSubmit={handleAddDrop}>
            <label className="field">
              <span>Surprise Note</span>
              <input
                type="text"
                placeholder="e.g. Look outside your door for your favorite pastry..."
                value={newDropNote}
                onChange={(e) => setNewDropNote(e.target.value)}
              />
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              <span>Delivery Date</span>
              <input
                type="date"
                value={newDropDate}
                onChange={(e) => setNewDropDate(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="hub-primary-btn sm"
              style={{ marginTop: 14 }}
            >
              <Plus size={14} /> Schedule Drop
            </button>
          </form>

          {/* Drops Timeline List */}
          <ul className="distance-timeline">
            {drops.length === 0 ? (
              <li className="muted">No scheduled drops yet.</li>
            ) : (
              drops.map((d) => (
                <li key={d.id} className="distance-timeline-item">
                  <div className="distance-timeline-head">
                    <strong style={{ color: "#fff", fontSize: "0.88rem" }}>{d.note}</strong>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className="hub-status-chip live">{d.date}</span>
                      <button
                        className="remove-button"
                        onClick={() => setDrops((prev) => prev.filter((item) => item.id !== d.id))}
                        title="Remove drop"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Sealed Love Letters */}
        <div className="distance-pane">
          <h3>✉️ "Open When…" Love Letters</h3>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 16px" }}>
            Letters sealed with wax that wait until {profile.partner} needs them most.
          </p>
          <form onSubmit={handleAddLetter}>
            <label className="field">
              <span>Open When…</span>
              <input
                type="text"
                placeholder="e.g. you miss me / you can't sleep..."
                value={newLetterWhen}
                onChange={(e) => setNewLetterWhen(e.target.value)}
              />
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              <span>Letter Words</span>
              <textarea
                rows={3}
                placeholder="Write your heart into this letter..."
                value={newLetterContent}
                onChange={(e) => setNewLetterContent(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="hub-primary-btn sm"
              style={{ marginTop: 14 }}
            >
              <Mail size={14} /> Seal Letter
            </button>
          </form>

          {/* Envelope Grid */}
          <div className="envelope-grid">
            {letters.map((l) => (
              <div
                key={l.id}
                className="envelope-card"
                onClick={() => onReadLetter(l)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="envelope-wax-seal">💌</div>
                  <span className="hub-status-chip draft">
                    {l.sealed ? "🔒 Sealed" : "Unsealed"}
                  </span>
                </div>
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "#fff", display: "block" }}>
                    Open when {l.when}
                  </strong>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>
                    Click to unlock & read
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 4: GUEST REPLIES HUB
// =========================================================================
function RepliesHub({ replies, occasions, onDeleteReply, toast }) {
  return (
    <div>
      <div className="hub-section-head">
        <div>
          <span className="hub-hero-badge">💌 Guest Responses Hub</span>
          <h2 style={{ marginTop: 8 }}>Guest & Partner Answers ({replies.length})</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Private answers sent back from your invitations.
          </p>
        </div>
      </div>

      {replies.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "48px 20px" }}>
          <MessageCircleHeart size={36} color="#FF94C7" style={{ margin: "0 auto 12px" }} />
          <h3>No replies recorded yet</h3>
          <p className="muted" style={{ margin: "6px auto 16px", maxWidth: 420 }}>
            Share your invitation links with your partner or test responding directly from the Card Preview!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {replies.map((r) => (
            <article key={r.id} className="reply-card">
              <div className="reply-top">
                <div>
                  <strong>{r.name}</strong>
                  <span className="muted" style={{ marginLeft: 10, fontSize: "0.78rem" }}>
                    re: {r.occasionTitle || "Special Moment"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`reply-badge ${r.response}`}>
                    {r.response === "yes" ? "Yes! 💖" : r.response === "time" ? "Needs Time" : "Can't Make It"}
                  </span>
                  <button
                    className="remove-button"
                    onClick={() => onDeleteReply(r.id)}
                    title="Remove reply"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {r.message && <p>{r.message}</p>}
              <time>{new Date(r.createdAt).toLocaleString()}</time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// MODAL 1: PREVIEW / SANCTUARY MODAL (WITH PASSCODE GATE)
// =========================================================================
function PreviewSanctuaryModal({ occasion, unlocked, onUnlock, onClose, onSendReply, toast }) {
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const meta = OCCASION_TYPES[occasion.type] || OCCASION_TYPES.other;
  const moodMeta = MOODS[occasion.mood] || MOODS.plum;
  const cd = getRemainingTime(occasion.date);

  const checkPasscode = (e) => {
    e.preventDefault();
    if (passInput.trim() === occasion.pass.trim()) {
      onUnlock();
    } else {
      setPassError("Not quite, my love. Try again.");
    }
  };

  const handleReply = (responseVal) => {
    onSendReply(guestName || occasion.to, responseVal, guestNote);
  };

  return (
    <div className="hub-modal-overlay" onClick={onClose}>
      <div className="hub-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="hub-modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Passcode Lock Gate */}
        {occasion.pass && !unlocked ? (
          <div className="gate-card" style={{ padding: "40px 24px" }}>
            <div className="gate-heart-wrapper">
              <div className="gate-aura" />
              <div className="gate-heart"><Heart size={38} fill="currentColor" /></div>
            </div>
            <span className="gate-badge"><LockKeyhole size={12} /> Sacred Passcode</span>
            <h2 className="gate-title">A quiet universe made just for you</h2>
            <p className="gate-subtitle">Authored with devotion by {occasion.from || "your love"}</p>

            <form onSubmit={checkPasscode} className="password-card-inner">
              <div className="password-input-group">
                <input
                  type="password"
                  placeholder="Enter secret passcode…"
                  value={passInput}
                  onChange={(e) => {
                    setPassInput(e.target.value);
                    setPassError("");
                  }}
                  autoFocus
                />
              </div>
              {passError && <div className="gate-error-box"><AlertCircle size={15} /> {passError}</div>}
              <button type="submit" className="unlock-submit-btn">
                Open our sanctuary <Sparkles size={16} />
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Full Sanctuary Card */
          <div
            className="sanctuary-card"
            style={{
              "--card-c1": moodMeta.colors[0],
              "--card-c2": moodMeta.colors[1],
              borderRadius: 28
            }}
          >
            <div className="sanctuary-big-icon">{meta.emoji}</div>
            <div className="sanctuary-names">
              {occasion.from} ♥ {occasion.to}
            </div>

            <h2 className="sanctuary-title">{occasion.title || meta.label}</h2>
            <p className="sanctuary-msg">{occasion.story || occasion.intro}</p>

            {occasion.coverImage && (
              <img
                src={occasion.coverImage}
                alt="Moment memory"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 14, margin: "14px 0" }}
              />
            )}

            {/* Countdown Clock */}
            <div className="sanctuary-cd">
              <div className="sanctuary-cd-box">
                <b>{cd.d}</b>
                <small>Days</small>
              </div>
              <div className="sanctuary-cd-box">
                <b>{cd.h}</b>
                <small>Hours</small>
              </div>
              <div className="sanctuary-cd-box">
                <b>{cd.m}</b>
                <small>Mins</small>
              </div>
              <div className="sanctuary-cd-box">
                <b>{cd.s}</b>
                <small>Secs</small>
              </div>
            </div>

            <p style={{ fontSize: "1.05rem", color: "#FFD1DC", margin: "18px 0 8px" }}>
              {occasion.ask}
            </p>

            {/* Answer Form */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 18, borderRadius: 18, marginTop: 16 }}>
              <input
                type="text"
                placeholder="Your name..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{ marginBottom: 10, background: "rgba(255,255,255,0.06)" }}
              />
              <textarea
                rows={2}
                placeholder="A sweet note or reply message..."
                value={guestNote}
                onChange={(e) => setGuestNote(e.target.value)}
                style={{ marginBottom: 12, background: "rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  className="hub-primary-btn sm"
                  onClick={() => handleReply("yes")}
                >
                  {occasion.responseYes || "Yes, forever! 💖"}
                </button>
                <button
                  className="hub-sec-btn sm"
                  onClick={() => handleReply("time")}
                >
                  {occasion.responseTime || "Let me think"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// MODAL 2: STATIONERY LETTER READING MODAL
// =========================================================================
function StationeryLetterModal({ letter, partnerName, myName, onClose, onReseal, toast }) {
  return (
    <div className="hub-modal-overlay" onClick={onClose}>
      <div className="hub-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="hub-modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="stationery-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="envelope-wax-seal" style={{ width: 36, height: 36, fontSize: "1rem" }}>💌</div>
            <span className="hub-hero-badge">Private Sealed Note</span>
          </div>

          <h2>Open when {letter.when}</h2>

          <div className="stationery-body">
            {letter.content}
          </div>

          <div style={{ textAlign: "right", fontStyle: "italic", color: "var(--hub-champ)" }}>
            With all my love forever,
            <br />
            <strong>{myName}</strong>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
            <button className="hub-sec-btn sm" onClick={onReseal}>
              🔒 Seal Back with Wax
            </button>
            <button className="hub-primary-btn sm" onClick={onClose}>
              Keep in Heart <Check size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MODAL 3: PROFILE SETTINGS MODAL
// =========================================================================
function ProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...profile });

  return (
    <div className="hub-modal-overlay" onClick={onClose}>
      <div className="hub-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="hub-modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="glass" style={{ borderRadius: 24, padding: "32px 24px" }}>
          <h3>Couple Profile & Sanctuary Time</h3>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0 20px" }}>
            Customize your names and timezones to keep world clocks and countdowns synchronized.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
          >
            <label className="field">
              <span>Your Name</span>
              <input
                type="text"
                value={form.me}
                onChange={(e) => setForm({ ...form, me: e.target.value })}
                required
              />
            </label>

            <label className="field" style={{ marginTop: 12 }}>
              <span>Partner's Name</span>
              <input
                type="text"
                value={form.partner}
                onChange={(e) => setForm({ ...form, partner: e.target.value })}
                required
              />
            </label>

            <label className="field" style={{ marginTop: 12 }}>
              <span>Your Timezone</span>
              <select
                value={form.tzMe}
                onChange={(e) => setForm({ ...form, tzMe: e.target.value })}
              >
                {ZONES.map(([lbl, val]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </select>
            </label>

            <label className="field" style={{ marginTop: 12 }}>
              <span>Partner's Timezone</span>
              <select
                value={form.tzP}
                onChange={(e) => setForm({ ...form, tzP: e.target.value })}
              >
                {ZONES.map(([lbl, val]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button type="button" className="hub-sec-btn sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="hub-primary-btn sm">
                Save Profile <Check size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// GUEST & MANAGE DIRECT PAGES (For URL routes /e/:slug and /manage/:slug)
// =========================================================================
function EventPage({ slug, onBack }) {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyName, setReplyName] = useState("");
  const [replyMsg, setReplyMsg] = useState("");
  const [chosenResp, setChosenResp] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Attempt to load from API or fallback to local occasions
    api(`/api/events/${slug}`)
      .then((res) => {
        setEventData(res.event);
        setLoading(false);
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem("ctt_occasions") || "[]");
          const found = local.find((o) => o.slug === slug || String(o.id) === slug);
          setEventData(found || DEFAULT_OCCASIONS[0]);
        } catch {
          setEventData(DEFAULT_OCCASIONS[0]);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="glass" style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: 40 }}>
        <Sparkles size={32} color="#FF94C7" />
        <h2 style={{ marginTop: 14 }}>Opening sanctuary…</h2>
      </div>
    );
  }

  const moodMeta = MOODS[eventData?.mood] || MOODS.plum;
  const cd = getRemainingTime(eventData?.date);

  const submitReply = (e) => {
    e.preventDefault();
    if (!chosenResp) return;
    setSubmitted(true);
    triggerHearts();
    // Save to local replies
    try {
      const existing = JSON.parse(localStorage.getItem("ctt_replies") || "[]");
      existing.unshift({
        id: Date.now(),
        occasionTitle: eventData.title || eventData.ask,
        name: replyName || eventData.to,
        response: chosenResp,
        message: replyMsg,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("ctt_replies", JSON.stringify(existing));
    } catch {}
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <div
        className="sanctuary-card"
        style={{
          "--card-c1": moodMeta.colors[0],
          "--card-c2": moodMeta.colors[1]
        }}
      >
        <div className="sanctuary-big-icon">💖</div>
        <div className="sanctuary-names">{eventData.from} ♥ {eventData.to}</div>
        <h1 className="sanctuary-title">{eventData.title}</h1>
        <p className="sanctuary-msg">{eventData.story || eventData.intro}</p>

        {eventData.coverImage && (
          <img
            src={eventData.coverImage}
            alt="Cover"
            style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 16, margin: "16px 0" }}
          />
        )}

        <div className="sanctuary-cd">
          <div className="sanctuary-cd-box"><b>{cd.d}</b><small>Days</small></div>
          <div className="sanctuary-cd-box"><b>{cd.h}</b><small>Hours</small></div>
          <div className="sanctuary-cd-box"><b>{cd.m}</b><small>Mins</small></div>
          <div className="sanctuary-cd-box"><b>{cd.s}</b><small>Secs</small></div>
        </div>

        <p style={{ fontSize: "1.1rem", color: "#FFD1DC", margin: "20px 0 10px" }}>
          {eventData.ask}
        </p>

        {submitted ? (
          <div className="reply-thanks" style={{ marginTop: 20 }}>
            <span><Heart size={24} fill="currentColor" /></span>
            <h3>Your answer has been sent!</h3>
            <p>Thank you for sharing what's in your heart. ❤️</p>
          </div>
        ) : (
          <form onSubmit={submitReply} className="rsvp-card" style={{ marginTop: 20 }}>
            <label className="field">
              <span>Your Name</span>
              <input
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="So they know it's you"
                required
              />
            </label>
            <div className="response-options">
              {[
                ["yes", eventData.responseYes || "Yes! 💖"],
                ["time", eventData.responseTime || "Needs Time"],
                ["no", eventData.responseNo || "Always Love"]
              ].map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  className={`response-option ${chosenResp === val ? "chosen" : ""}`}
                  onClick={() => setChosenResp(val)}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <label className="field">
              <span>Your Note (Optional)</span>
              <textarea
                rows={2}
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder="Write a sweet reply message..."
              />
            </label>
            <button type="submit" className="hub-primary-btn" disabled={!chosenResp}>
              Send My Answer <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ManagePage({ slug, onBack }) {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
        <h2>Private Occasion Manager</h2>
        <p className="muted">
          All occasions and replies can now be directly managed from your central all-in-one dashboard.
        </p>
        <button className="hub-primary-btn" style={{ marginTop: 16 }} onClick={onBack}>
          Open All-in-One Dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Mount React Root
createRoot(document.getElementById("root")).render(<App />);
