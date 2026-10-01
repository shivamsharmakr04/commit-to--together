import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDown, ArrowRight, CheckCircle2, Eye, EyeOff,
  Heart, HelpCircle, KeyRound, Lock, Music2,
  Sparkles, Star, Unlock, Volume2, VolumeX, X
} from "lucide-react";
import "./styles.css";

/* =========================================================
   EDIT THIS OBJECT TO PERSONALIZE YOUR PROPOSAL STORY
   ========================================================= */
const DATA = {
  herName: "Her Name",
  nickname: "My Favorite Person",
  yourName: "Himanshu",
  secretPassword: "forever",

  secretNote: {
    author: "Himanshu",
    quote: "“In a world full of beautiful things,\nsomehow my heart still chooses you.”"
  },

  intro: {
    title: "I made something for you…",
    subtitle: "A secret universe hidden behind our magic word."
  },

  hero: {
    quote: "And then… somehow, you became my favorite person."
  },

  memories: [
    {
      date: "The Beginning",
      title: "Our First Conversation",
      text: "We started talking casually, and neither of us realized how deeply everything was about to change.",
      image: "/photos/photo1.jpg"
    },
    {
      date: "A Special Day",
      title: "Our First Meeting",
      text: "Seeing you for the first time in person—I still remember every tiny detail of that day.",
      image: "/photos/photo2.jpg"
    },
    {
      date: "Pure Happiness",
      title: "Funny & Inside Joke Moments",
      text: "The endless laughs, inside jokes, and random late-night conversations that only we understand.",
      image: "/photos/photo3.jpg"
    }
  ],

  reasons: [
    {
      title: "I like your smile.",
      detail: "The way it lights up your entire face and instantly changes my mood."
    },
    {
      title: "I like the way you talk.",
      detail: "How easily ordinary conversations become my favorite part of the day."
    },
    {
      title: "I like the little things.",
      detail: "The subtle habits and cute expressions you don't even realize I notice."
    },
    {
      title: "I like how warm being with you feels.",
      detail: "Because being around you feels strangely and comfortably like home."
    },
    {
      title: "I like how genuine you are.",
      detail: "Completely, unapologetically, beautifully yourself."
    },
    {
      title: "The truth is… I don't just like you anymore.",
      detail: "It grew into something so much deeper than words could ever describe.",
      isSpecial: true
    }
  ],

  confession: [
    "I've been trying to find the right words…",
    "But maybe the simplest words are the most honest ones.",
    "I really, really like you. ❤️"
  ],

  proposal: {
    message:
      "I don't know exactly when it happened, but somewhere between our conversations, our laughs, and all those little moments… you became someone incredibly special to me.\n\nYou became someone I look forward to talking to, someone whose smile can change my entire day, and someone I don't want to imagine my future without.\n\nSo today, I just want to ask you one simple thing — will you let me make you smile a little more often? ❤️",
    question: "Will you be mine? ❤️"
  },

  accepted: {
    title: "YOU JUST MADE ME THE HAPPIEST PERSON ❤️",
    subtitle: "And now our next chapter begins…",
    quote: "“This website has an ending, but our story doesn't.”"
  },

  nextChapter: [
    { emoji: "🌍", title: "Our First Trip", text: "Take a trip somewhere neither of us has ever been." },
    { emoji: "📸", title: "Our Next Photo", text: "Take that ridiculously perfect picture together." },
    { emoji: "🌅", title: "A Sunset Together", text: "Watch a quiet sunset with nowhere else to be." },
    { emoji: "☕", title: "A Thousand Ordinary Days", text: "Turn everyday coffee and chats into forever memories." },
    { emoji: "❤️", title: "And Hopefully… A Lot More Memories", text: "Create another hundred chapters that deserve their own website." }
  ]
};

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

function BlinkingHeartBackground() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        id: i,
        left: `${(i * 17.3 + Math.sin(i * 3) * 12) % 96 + 2}%`,
        top: `${(i * 13.7 + Math.cos(i * 2) * 15) % 94 + 3}%`,
        blinkDur: `${1.3 + (i % 6) * 0.35}s`,
        delay: `${(i % 10) * 0.2}s`,
        size: Math.floor(10 + (i % 5) * 4),
        color: ["#ff5b9d", "#ff94c7", "#ff2e83", "#ffd1dc", "#b084ff", "#ff75ac"][i % 6]
      })),
    []
  );

  return (
    <div className="blinking-hearts-bg" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="bg-blinking-heart"
          style={{
            left: h.left,
            top: h.top,
            fontSize: `${h.size}px`,
            color: h.color,
            animationDuration: h.blinkDur,
            animationDelay: h.delay
          }}
        >
          <Heart fill="currentColor" size={h.size} />
        </span>
      ))}
    </div>
  );
}

/* INTERACTIVE CLICK/TAP HEART BURST TRAIL */
function HeartClickParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handlePointerDown = (e) => {
      // Don't trigger on inputs or buttons if user is typing
      const id = Date.now() + Math.random();
      const newParticle = {
        id,
        x: e.clientX,
        y: e.clientY,
        size: Math.floor(14 + Math.random() * 16),
        color: ["#ff5b9d", "#ff94c7", "#ff2e83", "#ffd1dc", "#b084ff"][Math.floor(Math.random() * 5)]
      };
      setParticles((prev) => [...prev.slice(-15), newParticle]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 1000);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="click-particles-container" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="click-particle-heart"
          initial={{ opacity: 1, scale: 0.5, x: p.x - p.size / 2, y: p.y - p.size / 2 }}
          animate={{ opacity: 0, scale: 1.6, y: p.y - p.size / 2 - 50, rotate: (Math.random() - 0.5) * 40 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 9999,
            color: p.color
          }}
        >
          <Heart fill="currentColor" size={p.size} />
        </motion.span>
      ))}
    </div>
  );
}

function StarField({ stars }) {
  return (
    <div className="stars">
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [musicOn, setMusicOn] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);

  // Proposal Flow States
  const [suspenseActive, setSuspenseActive] = useState(false);
  const [suspenseStep, setSuspenseStep] = useState(0);
  const [proposalActive, setProposalActive] = useState(false);
  const [needTimeActive, setNeedTimeActive] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [showNextChapter, setShowNextChapter] = useState(false);
  const [secretNoteActive, setSecretNoteActive] = useState(false);

  const audioRef = useRef(null);

  const stars = useMemo(
    () =>
      Array.from({ length: 75 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 61) % 100}%`,
        delay: `${(i % 8) * 0.4}s`,
        size: `${2 + (i % 3)}px`
      })),
    []
  );

  // Timed Suspense Text Progression
  useEffect(() => {
    if (!suspenseActive) return;
    setSuspenseStep(0);
    const t1 = setTimeout(() => setSuspenseStep(1), 2400);
    const t2 = setTimeout(() => setSuspenseStep(2), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [suspenseActive]);

  // Confetti on Acceptance or Unlock
  const triggerConfetti = (count = 45) => {
    const end = Date.now() + 3000;
    const timer = setInterval(() => {
      if (Date.now() > end) return clearInterval(timer);
      confetti({
        particleCount: count,
        spread: 100,
        origin: { x: Math.random(), y: 0.6 }
      });
    }, 280);
  };

  const unlock = () => {
    if (!password.trim()) {
      setError("Please enter our secret password ❤️");
      triggerShake();
      return;
    }

    if (password.trim().toLowerCase() === DATA.secretPassword.toLowerCase()) {
      setError("");
      triggerConfetti(60);
      setUnlocked(true);
    } else {
      setError("Hmm... that's not our secret password ❤️");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
      setMusicOn(false);
    } else {
      try {
        await audioRef.current.play();
        setMusicOn(true);
      } catch (e) {
        console.log("Audio play error:", e);
        setError("Tap again to play music ❤️");
      }
    }
  };

  const handleAcceptProposal = () => {
    setProposalActive(false);
    setProposalAccepted(true);
    triggerConfetti(70);
  };

  // STEP 1 & 2: GATE / OPENING CURIOSITY
  if (!unlocked) {
    const isMatchingLength = password.length >= DATA.secretPassword.length;

    return (
      <div className="app gate-page">
        <BlinkingHeartBackground />
        <StarField stars={stars} />
        <HeartClickParticles />

        <motion.div
          className="gate-wrapper"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="gate-card"
            animate={isShaking ? { x: [-12, 12, -9, 9, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {/* Top Romantic Aura & Icon */}
            <div className="gate-heart-wrapper">
              <div className="gate-aura" />
              <motion.div
                className="gate-heart"
                animate={{ scale: [1, 1.14, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                {isMatchingLength ? (
                  <Unlock className="lock-icon active-glow" size={48} />
                ) : (
                  <Lock className="lock-icon" size={48} />
                )}
              </motion.div>
            </div>

            <div className="gate-badge">
              <Sparkles size={13} className="sparkle-icon" />
              <span>PRIVATE • CREATED FOR YOU</span>
              <Heart size={12} fill="currentColor" className="blinking-heart" />
            </div>

            <h1 className="gate-title gradient-text">{DATA.intro.title}</h1>
            <p className="gate-subtitle">{DATA.intro.subtitle}</p>

            {/* Redesigned Password Entry Container */}
            <div className="password-card-inner">
              <div className={`password-input-group ${error ? "input-error" : ""}`}>
                <div className="input-prefix">
                  <KeyRound size={18} className="key-icon" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secret password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && unlock()}
                  autoFocus
                  aria-label="Secret Password"
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <motion.button
                className="unlock-submit-btn"
                onClick={unlock}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Enter Universe</span>
                <Heart className="beating-heart" size={17} fill="currentColor" />
              </motion.button>
            </div>

            {/* Error Message display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="gate-error-box"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                >
                  <Heart className="blinking-heart" size={15} fill="currentColor" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Hint Section */}
            <div className="hint-section">
              <button
                type="button"
                className="hint-toggle-btn"
                onClick={() => setShowHint(!showHint)}
              >
                <HelpCircle size={15} />
                <span>{showHint ? "Hide hint" : "Need a hint?"}</span>
              </button>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    className="hint-popover"
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  >
                    <p>
                      🔐 <strong>Hint:</strong> The password is{" "}
                      <code className="password-code">forever</code>
                    </p>
                    <button
                      type="button"
                      className="autofill-btn"
                      onClick={() => {
                        setPassword("forever");
                        setError("");
                      }}
                    >
                      <CheckCircle2 size={13} /> Auto-fill password
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app">
      <audio ref={audioRef} loop src="/music/Pehla Nasha Instrumental.mp3" />
      <BlinkingHeartBackground />
      <StarField stars={stars} />
      <HeartClickParticles />

      {/* FLOATING RESPONSIVE MUSIC PLAYER CONTROL */}
      <button className="music-button" onClick={toggleMusic} aria-label="Toggle music">
        <div className="music-icon-wrapper">
          <Music2 size={16} className={musicOn ? "playing-music-icon" : ""} />
        </div>
        <span className="music-text">{musicOn ? "Music Playing ❤️" : "Play Music 🎵"}</span>
        {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      <main>
        {/* HERO SECTION */}
        <section className="hero section">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="hero-inner">
            <div className="orbit-heart">
              <div className="orbit-heart-ring" />
              <Heart fill="currentColor" size={38} />
            </div>
            <p className="eyebrow">
              <Heart className="blinking-heart" size={13} fill="currentColor" />
              WELCOME TO MY LITTLE UNIVERSE
              <Heart className="blinking-heart" size={13} fill="currentColor" />
            </p>
            <h1 className="gradient-text">
              {DATA.herName}
              <br />
              <span>&amp; {DATA.yourName}</span>
            </h1>
            <p className="hero-name">
              <Heart className="beating-heart" size={22} fill="currentColor" />
              {DATA.nickname}
              <Heart className="beating-heart" size={22} fill="currentColor" />
            </p>
            <p className="quote">“{DATA.hero.quote}”</p>
            <a className="scroll-cue" href="#story">
              <ArrowDown size={18} /> Begin our story{" "}
              <Heart className="blinking-heart" size={14} fill="currentColor" />
            </a>
          </motion.div>
        </section>

        {/* STEP 3: YOUR STORY & MEMORIES */}
        <section id="story" className="section">
          <SectionHeading kicker="CHAPTER ONE" title="How we became us" />
          <div className="timeline">
            {DATA.memories.map((m, i) => (
              <motion.article
                className={`timeline-item ${i % 2 ? "right" : ""}`}
                key={m.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
              >
                <div className="timeline-dot">
                  <Heart size={12} fill="currentColor" />
                </div>
                <div className="glass-card story-card">
                  <span className="date">
                    <Heart className="blinking-heart" size={12} fill="currentColor" />
                    {m.date}
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <button className="text-button" onClick={() => setSelectedMemory(m)}>
                    Open memory <Heart className="blinking-heart" size={14} fill="currentColor" />{" "}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* STEP 4: REASONS I LIKE YOU */}
        <section className="section soft-section">
          <SectionHeading kicker="CHAPTER TWO" title="Things I love about you" />
          <div className="reason-grid">
            {DATA.reasons.map((r, i) => (
              <motion.button
                className={`reason-card ${r.isSpecial ? "special-reason" : ""}`}
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                onClick={() => {
                  if (r.isSpecial) {
                    setSuspenseActive(true);
                  } else {
                    setSelectedReason(r);
                  }
                }}
              >
                <div className="reason-card-header">
                  <span className="reason-num">#{String(i + 1).padStart(2, "0")}</span>
                  <Heart className="card-heart" size={18} fill="currentColor" />
                </div>
                <strong>{r.title}</strong>
                <span className="tiny-tap">Tap to reveal secret message ❤️</span>
              </motion.button>
            ))}
          </div>

          <div className="tell-more-wrapper">
            <button className="tell-more-btn" onClick={() => setSuspenseActive(true)}>
              Tell me more <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* STEP 8: OUR NEXT CHAPTER (FUTURE PLANS) */}
        {showNextChapter && (
          <section id="next-chapter" className="section next-chapter-section">
            <SectionHeading kicker="OUR NEXT CHAPTER" title="Things we haven't done yet" />
            <div className="next-chapter-grid">
              {DATA.nextChapter.map((item, i) => (
                <motion.div
                  className="next-chapter-card"
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div className="next-chapter-emoji">{item.emoji}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <footer>
          <div className="footer-content">
            <p className="footer-text">
              Made with too much love by {DATA.yourName}{" "}
              <Heart className="beating-heart" size={16} fill="currentColor" />
            </p>
            <button className="secret-message-btn" onClick={() => setSecretNoteActive(true)}>
              <Sparkles size={16} color="#ff94c7" />
              <span>Click for a secret note</span>
              <Heart size={15} fill="#ff5b9d" color="#ff5b9d" />
            </button>
          </div>
        </footer>
      </main>

      {/* MODALS & OVERLAYS */}
      <AnimatePresence>
        {/* MEMORY MODAL */}
        {selectedMemory && (
          <Modal onClose={() => setSelectedMemory(null)}>
            <span className="date">
              <Heart className="blinking-heart" size={13} fill="currentColor" /> {selectedMemory.date}
            </span>
            <h2 className="gradient-text">{selectedMemory.title}</h2>
            <div className="modal-image-placeholder">
              <Heart size={48} fill="currentColor" className="beating-heart" />
              <p className="photo-caption">{selectedMemory.title}</p>
            </div>
            <p className="modal-text-content">{selectedMemory.text}</p>
          </Modal>
        )}

        {/* REASON SECRET MESSAGE MODAL */}
        {selectedReason && (
          <Modal onClose={() => setSelectedReason(null)}>
            <div style={{ textAlign: "center" }}>
              <Heart fill="currentColor" size={44} className="pink-heart beating-heart" />
              <p className="eyebrow" style={{ marginTop: "14px" }}>
                <Heart className="blinking-heart" size={12} fill="currentColor" />
                SECRET MESSAGE
                <Heart className="blinking-heart" size={12} fill="currentColor" />
              </p>
              <h2 className="gradient-text">{selectedReason.title}</h2>
              <p
                className="proposal-message"
                style={{ fontSize: "1.15rem", lineHeight: "1.85", color: "#e4ddf0", margin: "22px 0 30px" }}
              >
                {selectedReason.detail}
              </p>
              <button className="secondary-button" onClick={() => setSelectedReason(null)}>
                Close ❤️
              </button>
            </div>
          </Modal>
        )}

        {/* FOOTER SECRET NOTE MODAL */}
        {secretNoteActive && (
          <Modal onClose={() => setSecretNoteActive(false)} customClass="secret-note-modal">
            <div className="secret-note-content">
              <div className="secret-note-icons">
                <Heart size={24} fill="#ff5b9d" color="#ff5b9d" className="glow-icon" />
                <Sparkles size={20} color="#ff94c7" className="glow-icon sparkle-center" />
                <Heart size={24} fill="#ff5b9d" color="#ff5b9d" className="glow-icon" />
              </div>

              <div className="secret-note-eyebrow">
                <Heart size={12} fill="currentColor" />
                <span>A SECRET NOTE</span>
                <Heart size={12} fill="currentColor" />
              </div>

              <blockquote className="secret-note-quote">
                {DATA.secretNote?.quote || "“In a world full of beautiful things,\nsomehow my heart still chooses you.”"}
              </blockquote>

              <div className="secret-note-author">
                — {DATA.secretNote?.author || DATA.yourName} <Heart size={16} fill="#b084ff" color="#b084ff" />
              </div>
            </div>
          </Modal>
        )}

        {/* STEP 5: SUSPENSE SCREEN */}
        {suspenseActive && (
          <motion.div
            className="suspense-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="suspense-content">
              <motion.p
                className="suspense-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={suspenseStep}
                transition={{ duration: 0.8 }}
              >
                {DATA.confession[suspenseStep]}
              </motion.p>

              {suspenseStep < 2 ? (
                <button className="text-button suspense-next-btn" onClick={() => setSuspenseStep((s) => Math.min(s + 1, 2))}>
                  Tap to continue <ArrowRight size={16} />
                </button>
              ) : (
                <motion.button
                  className="suspense-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => {
                    setSuspenseActive(false);
                    setProposalActive(true);
                  }}
                >
                  One last question <Heart size={18} fill="currentColor" className="beating-heart" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 6: PROPOSAL SCREEN ("WILL YOU BE MINE?") */}
        {proposalActive && (
          <motion.div
            className="proposal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="proposal-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div style={{ marginBottom: "20px" }}>
                <Heart fill="currentColor" size={48} className="beating-heart" />
              </div>
              <h1 className="proposal-name gradient-text">{DATA.herName} ❤️</h1>

              {!needTimeActive ? (
                <>
                  <p className="proposal-message">{DATA.proposal.message}</p>
                  <h2 className="proposal-question">{DATA.proposal.question}</h2>

                  <div className="proposal-buttons">
                    <button className="yes-btn" onClick={handleAcceptProposal}>
                      YES ❤️
                    </button>
                    <button className="need-time-btn" onClick={() => setNeedTimeActive(true)}>
                      I need a little time 🌸
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="gradient-text" style={{ fontSize: "2rem", marginBottom: "16px" }}>
                    🌸 Take all the time you need
                  </h2>
                  <p className="proposal-message">
                    There's zero pressure. I respect your feelings and your pace above everything else.
                    I'll still be right here for you. ❤️
                  </p>
                  <button className="yes-btn" onClick={handleAcceptProposal} style={{ marginTop: "15px" }}>
                    I'm ready now ❤️
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* STEP 7: CELEBRATION OVERLAY */}
        {proposalAccepted && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-card"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="final-hearts">
                <Heart fill="currentColor" size={38} className="beating-heart" />
                <Heart fill="currentColor" size={26} className="blinking-heart" />
                <Heart fill="currentColor" size={46} className="beating-heart" />
                <Heart fill="currentColor" size={26} className="blinking-heart" />
                <Heart fill="currentColor" size={38} className="beating-heart" />
              </div>
              <h1 className="celebration-title gradient-text">{DATA.accepted.title}</h1>
              <p className="celebration-subtitle">{DATA.accepted.subtitle}</p>
              <p className="celebration-quote">{DATA.accepted.quote}</p>

              <button
                className="yes-btn"
                onClick={() => {
                  setProposalAccepted(false);
                  setShowNextChapter(true);
                  setTimeout(() => {
                    const el = document.getElementById("next-chapter");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                Our Next Chapter <ArrowRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeading({ kicker, title }) {
  return (
    <motion.div
      className="section-heading"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      <p className="eyebrow">
        <Heart className="blinking-heart" size={13} fill="currentColor" />
        {kicker}
        <Heart className="blinking-heart" size={13} fill="currentColor" />
      </p>
      <h2 className="gradient-text">{title}</h2>
    </motion.div>
  );
}

function Modal({ children, onClose, customClass = "" }) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`modal ${customClass}`}
        initial={{ y: 25, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
