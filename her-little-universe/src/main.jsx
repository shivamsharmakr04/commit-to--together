import React, { useEffect, useState, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
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

// Clean default profile using browser's real local timezone
const DEFAULT_PROFILE = {
  me: "",
  partner: "",
  tzMe: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York" : "America/New_York",
  tzP: "Europe/London"
};

// Clean out any legacy mock/fake data from previous sessions
(() => {
  try {
    const rawProfile = localStorage.getItem("ctt_profile");
    if (rawProfile && (rawProfile.includes("Maya") || rawProfile.includes("Liam"))) {
      localStorage.removeItem("ctt_profile");
      localStorage.removeItem("ctt_occasions");
      localStorage.removeItem("ctt_drops");
      localStorage.removeItem("ctt_letters");
      localStorage.removeItem("ctt_replies");
    }
  } catch {}
})();

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
  for (let i = 0; i < 22; i++) {
    const heart = document.createElement("div");
    heart.className = "hub-falling-heart";
    heart.textContent = ["💖", "❤️", "✨", "💗", "💞"][i % 5];
    heart.style.left = `${Math.random() * 95}vw`;
    heart.style.fontSize = `${16 + Math.random() * 20}px`;
    heart.style.animationDelay = `${Math.random() * 0.7}s`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 3800);
  }
}

// API helper
async function api(path, options = {}) {
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
    throw new Error(err.error || "Server issue");
  }
  return await response.json();
}

// Main Root Application
export default function App() {
  const manageMatch = window.location.pathname.match(/^\/manage\/([a-z0-9-]+)\/?$/);
  const eventMatch = window.location.pathname.match(/^\/e\/([a-z0-9-]+)\/?$/);

  // Clean State Management (Saved in LocalStorage)
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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [drops, setDrops] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_drops");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [letters, setLetters] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_letters");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [replies, setReplies] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_replies");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pulsesCount, setPulsesCount] = useState(() => {
    try {
      const saved = localStorage.getItem("ctt_pulses");
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [lastPulseText, setLastPulseText] = useState("No pulses sent yet");

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState("occasions");
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [previewingOccasion, setPreviewingOccasion] = useState(null);
  const [unlockedPreview, setUnlockedPreview] = useState(false);
  const [readingLetter, setReadingLetter] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());

  // Clock Ticker (updates every second)
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to LocalStorage
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

  useEffect(() => {
    try {
      localStorage.setItem("ctt_pulses", String(pulsesCount));
    } catch {}
  }, [pulsesCount]);

  const toast = (text, icon = "💖") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleSendPulse = () => {
    setPulsesCount((p) => p + 1);
    setLastPulseText("Just now");
    triggerHearts();
    const partnerName = profile.partner || "your partner";
    toast(`Heart pulse sent to ${partnerName}!`, "💗");
  };

  // Next Milestone calculation
  const nextMilestone = useMemo(() => {
    const upcoming = occasions
      .filter((o) => getRemainingTime(o.date).total > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || null;
  }, [occasions, nowTick]);

  const milestoneRemaining = useMemo(() => {
    if (!nextMilestone) return { d: 0, h: 0, m: 0, s: 0 };
    return getRemainingTime(nextMilestone.date);
  }, [nextMilestone, nowTick]);

  // URL route handlers
  if (manageMatch) {
    return (
      <div className="app">
        <div className="hub-header" style={{ justifyContent: "center" }}>
          <button className="hub-sec-btn sm" onClick={() => window.location.href = "/"}>
            <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Return to Dashboard
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
            <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Open Dashboard
          </button>
        </div>
        <EventPage slug={eventMatch[1]} onBack={() => window.location.href = "/"} />
      </div>
    );
  }

  const coupleDisplayName =
    profile.me && profile.partner
      ? `${profile.me} & ${profile.partner}`
      : profile.me || profile.partner
      ? profile.me || profile.partner
      : "Set Names";

  return (
    <div className="app">
      {/* Background Starfield */}
      <div className="stars" aria-hidden="true">
        {[...Array(30)].map((_, i) => (
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

      {/* Clean Navigation Bar */}
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
            <MessageCircleHeart size={15} /> Replies {replies.length > 0 ? `(${replies.length})` : ""}
          </button>
        </nav>

        <div className="hub-header-actions">
          <button
            className="couple-pill-btn"
            onClick={() => setShowProfileModal(true)}
            title="Set or edit names"
          >
            <Users size={14} /> {coupleDisplayName}
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

      {/* Main View Router */}
      <main className="hub-main">
        {activeTab === "occasions" && (
          <OccasionsHub
            profile={profile}
            occasions={occasions}
            nextMilestone={nextMilestone}
            milestoneRemaining={milestoneRemaining}
            onOpenProfile={() => setShowProfileModal(true)}
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
              toast("Occasion deleted", "🗑️");
            }}
            onToggleLive={(id) => {
              setOccasions((prev) =>
                prev.map((o) => (o.id === id ? { ...o, live: !o.live } : o))
              );
              toast("Status updated", "✨");
            }}
            onLaunchTemplate={(typeKey) => {
              const preset = OCCASION_TYPES[typeKey];
              setEditingOccasion({
                id: Date.now(),
                slug: `${typeKey}-${Date.now().toString(36)}`,
                type: typeKey,
                to: profile.partner || "",
                from: profile.me || "",
                title: preset.defaultAsk,
                date: inDays(14),
                intro: "I made this little sanctuary corner of the universe just for you.",
                story: "",
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
                memories: [{ date: "", title: "", text: "", image: "" }],
                plans: []
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
              toast(savedOccasion.live ? "Live invitation ready! 💖" : "Secret draft saved! 🔒");
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
            onDeleteReply={(id) => {
              setReplies((prev) => prev.filter((r) => r.id !== id));
              toast("Reply removed", "🗑️");
            }}
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
              name: name || profile.partner || "Guest",
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

      {/* Stationery Letter Modal */}
      {readingLetter && (
        <StationeryLetterModal
          letter={readingLetter}
          myName={profile.me || "Me"}
          onClose={() => setReadingLetter(null)}
          onReseal={() => {
            setLetters((prev) =>
              prev.map((l) => (l.id === readingLetter.id ? { ...l, sealed: true } : l))
            );
            setReadingLetter(null);
            toast("Letter resealed! 💌");
          }}
        />
      )}

      {/* Couple Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            setProfile(updated);
            setShowProfileModal(false);
            toast("Names updated! 💑");
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Floating Toasts */}
      <div className="hub-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="hub-toast-item">
            <span>{t.icon}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      <footer className="studio-footer">
        Commit to Together · crafted with love <Heart size={13} fill="currentColor" />
      </footer>
    </div>
  );
}

// =========================================================================
// SECTION 1: CLEAN OCCASIONS DASHBOARD
// =========================================================================
function OccasionsHub({
  profile,
  occasions,
  nextMilestone,
  milestoneRemaining,
  onOpenProfile,
  onPreview,
  onEdit,
  onDelete,
  onToggleLive,
  onLaunchTemplate,
  toast
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const myTzInfo = useMemo(() => getTimezoneStatus(profile.tzMe), [profile.tzMe]);
  const partnerTzInfo = useMemo(() => getTimezoneStatus(profile.tzP), [profile.tzP]);

  const hasCoupleNames = Boolean(profile.me && profile.partner);

  const filteredOccasions = useMemo(() => {
    return occasions.filter((occ) => {
      if (filterType !== "all" && occ.type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (occ.title || "").toLowerCase().includes(q);
        const matchTo = (occ.to || "").toLowerCase().includes(q);
        if (!matchTitle && !matchTo) return false;
      }
      return true;
    });
  }, [occasions, filterType, search]);

  const nextTypeMeta = nextMilestone ? OCCASION_TYPES[nextMilestone.type] || OCCASION_TYPES.other : null;

  return (
    <div>
      {/* Clean Hero Card */}
      <section className="hub-hero">
        <div>
          <span className="hub-hero-badge">✦ Sanctuary Timeline</span>
          <h1 className="hub-hero-title">
            {hasCoupleNames ? (
              <>Two hearts, connected: <em>{profile.me} & {profile.partner}</em></>
            ) : (
              <>Your Private <em>Celebration Sanctuary</em></>
            )}
          </h1>
          <p className="hub-hero-sub">
            Plan, share, and countdown to your most meaningful moments — proposals, anniversaries, birthdays, and reunions.
          </p>

          <div className="hub-time-chips">
            {hasCoupleNames ? (
              <>
                <span className="hub-time-chip">
                  <Clock size={13} /> {profile.me} · {myTzInfo.timeStr}
                </span>
                <span className="hub-time-chip partner">
                  <Heart size={13} fill="currentColor" /> {profile.partner} · {partnerTzInfo.timeStr}
                </span>
              </>
            ) : (
              <button
                className="couple-pill-btn"
                onClick={onOpenProfile}
              >
                <Users size={14} /> Personalize with You & Your Partner's Names
              </button>
            )}
          </div>
        </div>

        {/* Milestone Box or Clean Welcome */}
        <div className="hub-milestone-box">
          {nextMilestone ? (
            <>
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
                  />
                </svg>
                <div className="ring-inner-text">
                  <span>{milestoneRemaining.d}</span>
                  <small>DAYS</small>
                </div>
              </div>
              <div className="milestone-details">
                <span className="milestone-kicker">Next Milestone</span>
                <h3 className="milestone-title">
                  {nextTypeMeta?.emoji} {nextMilestone.title || nextTypeMeta?.label}
                </h3>
                <span className="milestone-sub">
                  {nextMilestone.to ? `for ${nextMilestone.to} · ` : ""}{nextMilestone.date}
                </span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", width: "100%", padding: "10px 0" }}>
              <Sparkles size={28} color="#FF94C7" style={{ margin: "0 auto 8px" }} />
              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Ready for your first moment</h3>
              <p className="muted" style={{ margin: "0 0 12px", fontSize: "0.82rem" }}>
                Pick a template below or click create to start.
              </p>
              <button
                className="hub-primary-btn sm"
                onClick={() => onLaunchTemplate("proposal")}
              >
                <Plus size={14} /> Create Moment
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Occasions Section */}
      <div className="hub-section-head">
        <h2><span>💖</span> Your Celebrations ({occasions.length})</h2>
      </div>

      {/* Only show search/filter controls if there are multiple occasions */}
      {occasions.length > 1 && (
        <div className="hub-controls-bar">
          <input
            type="text"
            className="hub-search-input"
            placeholder="Search moments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="hub-filter-pills">
            <button
              className={`hub-filter-pill ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            {Object.entries(OCCASION_TYPES).map(([k, meta]) => (
              <button
                key={k}
                className={`hub-filter-pill ${filterType === k ? "active" : ""}`}
                onClick={() => setFilterType(k)}
              >
                {meta.emoji} {meta.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Occasions List or Empty State */}
      {occasions.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "40px 20px", borderRadius: 20 }}>
          <Sparkles size={32} color="#FF94C7" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ margin: "0 0 6px" }}>No celebrations yet</h3>
          <p className="muted" style={{ margin: "0 auto 18px", maxWidth: 440, fontSize: "0.9rem" }}>
            Choose a romantic template below or create a custom invitation card in minutes.
          </p>
        </div>
      ) : filteredOccasions.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "30px 20px", borderRadius: 20 }}>
          <p className="muted">No moments match your search.</p>
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
                      title="Toggle Live / Draft"
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {occ.live ? "● Live" : "🔒 Draft"}
                    </button>
                    {occ.pass && (
                      <span className="hub-status-chip draft" title="Passcode protected">
                        <LockKeyhole size={11} />
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="hub-card-title">{occ.title || meta.label}</h3>
                <p className="hub-card-msg">
                  {occ.story || occ.intro || occ.ask || "A sacred sanctuary moment."}
                </p>

                {/* Countdown Display */}
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
                    {occ.to ? `for ${occ.to}` : "Private moment"}
                  </span>
                  <div className="hub-card-actions">
                    <button
                      className="hub-primary-btn sm"
                      onClick={() => onPreview(occ)}
                      title="Preview card"
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
                          toast("Invitation link copied! 📋");
                        } catch {
                          toast("Link: " + shareUrl);
                        }
                      }}
                      title="Copy link"
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

      {/* Templates Gallery */}
      <div className="hub-section-head" style={{ marginTop: "44px" }}>
        <h2><span>💌</span> Start from a Clean Template</h2>
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
// SECTION 2: CLEAN STUDIO BUILDER WITH REAL-TIME PREVIEW
// =========================================================================
function StudioBuilder({ profile, editingOccasion, onSave, onCancel, toast }) {
  const [step, setStep] = useState(0);

  const [draft, setDraft] = useState(() => {
    if (editingOccasion) return { ...editingOccasion };
    const defaultType = "proposal";
    const preset = OCCASION_TYPES[defaultType];
    return {
      id: Date.now(),
      slug: `moment-${Date.now().toString(36)}`,
      type: defaultType,
      to: profile.partner || "",
      from: profile.me || "",
      title: preset.defaultAsk,
      date: inDays(14),
      intro: "I made this little corner of the universe just for you.",
      story: "",
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
      memories: [{ date: "", title: "", text: "", image: "" }],
      plans: []
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
    onSave({ ...draft, live: makeLive });
  };

  const activeMood = MOODS[draft.mood] || MOODS.plum;
  const steps = ["Occasion & Theme", "Details", "Vows & Passcode", "Memories", "Save & Share"];

  return (
    <div>
      <div className="hub-section-head">
        <div>
          <span className="hub-hero-badge">✦ Studio Builder</span>
          <h2 style={{ marginTop: 8 }}>
            {editingOccasion ? "Edit Moment" : "Create a New Moment"}
          </h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Fill in your details and watch the live preview update in real time.
          </p>
        </div>
        <button className="hub-sec-btn sm" onClick={onCancel}>
          Cancel & Back
        </button>
      </div>

      <div className="studio-split-layout">
        {/* Left Form */}
        <div className="glass" style={{ borderRadius: 24, padding: "clamp(20px, 4vw, 30px)" }}>
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

          {/* Step 0: Type & Mood */}
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

              <div style={{ marginTop: 20 }}>
                <label className="field wide">
                  <span>Headline / Title</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => change("title", e.target.value)}
                    placeholder="e.g. Will you be mine forever?"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 1: Names & Date */}
          {step === 1 && (
            <div style={{ marginTop: 20 }}>
              <h3>Details</h3>
              <div className="form-grid" style={{ marginTop: 12 }}>
                <label className="field">
                  <span>Their Name</span>
                  <input
                    type="text"
                    value={draft.to}
                    onChange={(e) => change("to", e.target.value)}
                    placeholder="Recipient's name"
                  />
                </label>
                <label className="field">
                  <span>Your Name</span>
                  <input
                    type="text"
                    value={draft.from}
                    onChange={(e) => change("from", e.target.value)}
                    placeholder="Your name"
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
                  <span>Opening Line</span>
                  <input
                    type="text"
                    value={draft.intro}
                    onChange={(e) => change("intro", e.target.value)}
                    placeholder="A welcome message"
                  />
                </label>
                <label className="field wide">
                  <span>Cover Photo Link (Optional HTTPS)</span>
                  <input
                    type="url"
                    value={draft.coverImage}
                    onChange={(e) => change("coverImage", e.target.value)}
                    placeholder="https://..."
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Words & Lock */}
          {step === 2 && (
            <div style={{ marginTop: 20 }}>
              <h3>Your Words & Lock</h3>
              <div className="form-grid" style={{ marginTop: 12 }}>
                <label className="field wide">
                  <span>Story / Love Letter</span>
                  <textarea
                    rows={4}
                    value={draft.story}
                    onChange={(e) => change("story", e.target.value)}
                    placeholder="Tell your story or personal vow..."
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
                  <span>Yes Button</span>
                  <input
                    type="text"
                    value={draft.responseYes}
                    onChange={(e) => change("responseYes", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Thinking / Time Button</span>
                  <input
                    type="text"
                    value={draft.responseTime}
                    onChange={(e) => change("responseTime", e.target.value)}
                  />
                </label>
                <label className="field wide">
                  <span>Secret Passcode (Optional - protects card with lock screen)</span>
                  <input
                    type="text"
                    value={draft.pass}
                    onChange={(e) => change("pass", e.target.value)}
                    placeholder="Leave empty for public access, or enter a secret key"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Memories */}
          {step === 3 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Favorite Memories</h3>
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
                      <span>Memory {idx + 1}</span>
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
                          placeholder="e.g. First summer"
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
                          placeholder="Memory title"
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

          {/* Step 4: Save & Share */}
          {step === 4 && (
            <div style={{ marginTop: 20 }}>
              <h3>Ready to Save</h3>
              <p className="muted" style={{ lineHeight: 1.6 }}>
                Save as a <strong>Live</strong> moment to generate a shareable link for your partner, or keep it as a <strong>Secret Draft</strong>.
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

          {/* Controls */}
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

        {/* Live Preview */}
        <div className="studio-preview-sticky">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="hub-hero-badge">✦ Live Card Preview</span>
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
        {draft.story || draft.intro || "Your story will appear here as you write it…"}
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

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: 14 }}>
        <button
          className="hub-primary-btn sm"
          onClick={() => {
            triggerHearts();
            toast && toast("Preview: Answered Yes! 💖");
          }}
        >
          {draft.responseYes || "Yes! 💖"}
        </button>
        <button
          className="hub-sec-btn sm"
          onClick={() => toast && toast("Preview: Thinking ✨")}
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
// SECTION 3: CLEAN LONG DISTANCE SUITE
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
  const partnerName = profile.partner || "Partner";
  const myName = profile.me || "You";

  const diffString =
    diffHours === 0
      ? "Same time zone"
      : diffHours > 0
      ? `${partnerName} is ${diffHours} hour${diffHours > 1 ? "s" : ""} ahead`
      : `${partnerName} is ${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? "s" : ""} behind`;

  const handleAddDrop = (e) => {
    e.preventDefault();
    if (!newDropNote.trim()) return toast("Please write a surprise note", "✍️");
    const drop = {
      id: Date.now(),
      note: newDropNote.trim(),
      date: newDropDate
    };
    setDrops((prev) => [drop, ...prev]);
    setNewDropNote("");
    toast("Surprise drop scheduled! 🎁");
  };

  const handleAddLetter = (e) => {
    e.preventDefault();
    if (!newLetterWhen.trim() || !newLetterContent.trim()) {
      return toast("Please write both the prompt and letter words", "✍️");
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
    toast("Love letter sealed! 💌");
  };

  return (
    <div>
      <div className="hub-section-head">
        <div>
          <span className="hub-hero-badge">● Long Distance Suite</span>
          <h2 style={{ marginTop: 8 }}>Miles Apart, Hearts Aligned</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Real-time world clocks, smart day/night status, surprise drops, and sealed "Open When" letters.
          </p>
        </div>
      </div>

      {/* Clocks & Pulse Grid */}
      <div className="distance-clock-grid">
        <div className="distance-clock-card">
          <span className="hub-hero-badge">{myName}'s Time</span>
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

        <div className="distance-clock-card">
          <span className="hub-hero-badge">{partnerName}'s Time</span>
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
            {pulsesCount > 0 ? `${pulsesCount} pulses sent · ${lastPulseText}` : "Tap to send your first pulse"}
          </span>
          <div style={{ marginTop: 8, fontSize: "0.74rem", color: "var(--hub-champ)" }}>
            {diffString}
          </div>
        </div>
      </div>

      {/* Drops & Letters */}
      <div className="distance-features-grid">
        {/* Drops */}
        <div className="distance-pane">
          <h3>🎁 Schedule a Surprise Drop</h3>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 16px" }}>
            A surprise note or delivery scheduled for an exact date.
          </p>
          <form onSubmit={handleAddDrop}>
            <label className="field">
              <span>Surprise Note</span>
              <input
                type="text"
                placeholder="e.g. Look outside your door..."
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

        {/* Sealed Letters */}
        <div className="distance-pane">
          <h3>✉️ "Open When…" Love Letters</h3>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 16px" }}>
            Letters sealed with wax waiting until your partner needs them.
          </p>
          <form onSubmit={handleAddLetter}>
            <label className="field">
              <span>Open When…</span>
              <input
                type="text"
                placeholder="e.g. you miss me / you need a smile..."
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

          <div className="envelope-grid">
            {letters.length === 0 ? (
              <div className="muted" style={{ gridColumn: "1 / -1", padding: "14px 0" }}>
                No sealed letters yet. Write your first letter above.
              </div>
            ) : (
              letters.map((l) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 4: CLEAN REPLIES HUB
// =========================================================================
function RepliesHub({ replies, onDeleteReply }) {
  return (
    <div>
      <div className="hub-section-head">
        <div>
          <span className="hub-hero-badge">💌 Responses</span>
          <h2 style={{ marginTop: 8 }}>Guest & Partner Answers ({replies.length})</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Private replies sent back from your invitations.
          </p>
        </div>
      </div>

      {replies.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "40px 20px", borderRadius: 20 }}>
          <MessageCircleHeart size={36} color="#FF94C7" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ margin: "0 0 6px" }}>No replies yet</h3>
          <p className="muted" style={{ margin: "0 auto", maxWidth: 400, fontSize: "0.88rem" }}>
            When someone answers your invitations, their responses and notes will appear here privately.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
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
// MODALS
// =========================================================================
function PreviewSanctuaryModal({ occasion, unlocked, onUnlock, onClose, onSendReply, toast }) {
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");

  const meta = OCCASION_TYPES[occasion.type] || OCCASION_TYPES.other;
  const moodMeta = MOODS[occasion.mood] || MOODS.plum;
  const cd = getRemainingTime(occasion.date);

  const checkPasscode = (e) => {
    e.preventDefault();
    if (passInput.trim() === occasion.pass.trim()) {
      onUnlock();
    } else {
      setPassError("Incorrect passcode. Please try again.");
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

        {occasion.pass && !unlocked ? (
          <div className="gate-card" style={{ padding: "36px 20px" }}>
            <div className="gate-heart-wrapper">
              <div className="gate-aura" />
              <div className="gate-heart"><Heart size={36} fill="currentColor" /></div>
            </div>
            <span className="gate-badge"><LockKeyhole size={12} /> Sacred Passcode</span>
            <h2 className="gate-title" style={{ fontSize: "1.7rem" }}>A moment made just for you</h2>
            <p className="gate-subtitle">Authored with devotion by {occasion.from || "your love"}</p>

            <form onSubmit={checkPasscode} className="password-card-inner">
              <div className="password-input-group">
                <input
                  type="password"
                  placeholder="Enter passcode…"
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
                Open sanctuary <Sparkles size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div
            className="sanctuary-card"
            style={{
              "--card-c1": moodMeta.colors[0],
              "--card-c2": moodMeta.colors[1],
              borderRadius: 26
            }}
          >
            <div className="sanctuary-big-icon">{meta.emoji}</div>
            <div className="sanctuary-names">
              {occasion.from || "You"} ♥ {occasion.to || "Partner"}
            </div>

            <h2 className="sanctuary-title">{occasion.title || meta.label}</h2>
            <p className="sanctuary-msg">{occasion.story || occasion.intro}</p>

            {occasion.coverImage && (
              <img
                src={occasion.coverImage}
                alt="Cover"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 14, margin: "14px 0" }}
              />
            )}

            <div className="sanctuary-cd">
              <div className="sanctuary-cd-box"><b>{cd.d}</b><small>Days</small></div>
              <div className="sanctuary-cd-box"><b>{cd.h}</b><small>Hours</small></div>
              <div className="sanctuary-cd-box"><b>{cd.m}</b><small>Mins</small></div>
              <div className="sanctuary-cd-box"><b>{cd.s}</b><small>Secs</small></div>
            </div>

            <p style={{ fontSize: "1.05rem", color: "#FFD1DC", margin: "18px 0 8px" }}>
              {occasion.ask}
            </p>

            <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, marginTop: 14 }}>
              <input
                type="text"
                placeholder="Your name..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{ marginBottom: 8, background: "rgba(255,255,255,0.06)" }}
              />
              <textarea
                rows={2}
                placeholder="A sweet reply note..."
                value={guestNote}
                onChange={(e) => setGuestNote(e.target.value)}
                style={{ marginBottom: 10, background: "rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  className="hub-primary-btn sm"
                  onClick={() => handleReply("yes")}
                >
                  {occasion.responseYes || "Yes! 💖"}
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

function StationeryLetterModal({ letter, myName, onClose, onReseal }) {
  return (
    <div className="hub-modal-overlay" onClick={onClose}>
      <div className="hub-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="hub-modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="stationery-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="envelope-wax-seal" style={{ width: 36, height: 36, fontSize: "1rem" }}>💌</div>
            <span className="hub-hero-badge">Sealed Note</span>
          </div>

          <h2>Open when {letter.when}</h2>

          <div className="stationery-body">
            {letter.content}
          </div>

          <div style={{ textAlign: "right", fontStyle: "italic", color: "var(--hub-champ)" }}>
            With love,
            <br />
            <strong>{myName}</strong>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
            <button className="hub-sec-btn sm" onClick={onReseal}>
              🔒 Reseal with Wax
            </button>
            <button className="hub-primary-btn sm" onClick={onClose}>
              Close <Check size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...profile });

  return (
    <div className="hub-modal-overlay" onClick={onClose}>
      <div className="hub-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="hub-modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="glass" style={{ borderRadius: 24, padding: "30px 22px" }}>
          <h3>Couple Profile</h3>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0 18px" }}>
            Set your names and time zones to personalize your clocks and invitations.
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
                placeholder="e.g. Maya"
                value={form.me}
                onChange={(e) => setForm({ ...form, me: e.target.value })}
              />
            </label>

            <label className="field" style={{ marginTop: 12 }}>
              <span>Partner's Name</span>
              <input
                type="text"
                placeholder="e.g. Liam"
                value={form.partner}
                onChange={(e) => setForm({ ...form, partner: e.target.value })}
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

            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button type="button" className="hub-sec-btn sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="hub-primary-btn sm">
                Save Names <Check size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Direct URL Viewers
function EventPage({ slug }) {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyName, setReplyName] = useState("");
  const [replyMsg, setReplyMsg] = useState("");
  const [chosenResp, setChosenResp] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api(`/api/events/${slug}`)
      .then((res) => {
        setEventData(res.event);
        setLoading(false);
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem("ctt_occasions") || "[]");
          const found = local.find((o) => o.slug === slug || String(o.id) === slug);
          setEventData(found || null);
        } catch {
          setEventData(null);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="glass" style={{ maxWidth: 450, margin: "80px auto", textAlign: "center", padding: 36 }}>
        <Sparkles size={28} color="#FF94C7" />
        <h2 style={{ marginTop: 12 }}>Opening sanctuary…</h2>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="glass" style={{ maxWidth: 450, margin: "80px auto", textAlign: "center", padding: 36 }}>
        <h2>Invitation Not Found</h2>
        <p className="muted">This moment may have been removed or the link is incorrect.</p>
        <a className="hub-primary-btn sm" href="/" style={{ marginTop: 16 }}>
          Go to Dashboard
        </a>
      </div>
    );
  }

  const moodMeta = MOODS[eventData.mood] || MOODS.plum;
  const cd = getRemainingTime(eventData.date);

  const submitReply = (e) => {
    e.preventDefault();
    if (!chosenResp) return;
    setSubmitted(true);
    triggerHearts();
    try {
      const existing = JSON.parse(localStorage.getItem("ctt_replies") || "[]");
      existing.unshift({
        id: Date.now(),
        occasionTitle: eventData.title || eventData.ask,
        name: replyName || eventData.to || "Guest",
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
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 16, margin: "16px 0" }}
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
                placeholder="Your name"
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
              <span>A Note (Optional)</span>
              <textarea
                rows={2}
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder="Share a sweet reply..."
              />
            </label>
            <button type="submit" className="hub-primary-btn" disabled={!chosenResp}>
              Send Answer <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ManagePage({ slug, onBack }) {
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <div className="glass" style={{ padding: 30, borderRadius: 24, textAlign: "center" }}>
        <h2>Private Occasion Manager</h2>
        <p className="muted" style={{ margin: "10px 0 20px" }}>
          Manage all your occasions, links, and replies from the main dashboard.
        </p>
        <button className="hub-primary-btn sm" onClick={onBack}>
          Open All-in-One Dashboard <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
