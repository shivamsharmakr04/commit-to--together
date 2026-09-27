import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDown, ArrowRight, Heart, Lock, Mail, Music2,
  Play, Sparkles, Star, Volume2, VolumeX, X
} from "lucide-react";
import "./styles.css";

/* =========================================================
   EDIT THIS OBJECT TO PERSONALIZE YOUR PROPOSAL STORY
   ========================================================= */
const DATA = {
  herName: "Her Name",
  nickname: "My Favorite Person",
  yourName: "Your Name",
  secretPassword: "forever",

  intro: {
    title: "I made something for you…",
    subtitle: "but there's one thing I haven't told you yet."
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
  ],

  secretNote: {
    buttonText: "💌 Open Secret Note",
    title: "P.S. One last secret…",
    message: "No matter how many days pass, how far we travel, or how busy life gets—you will always have a piece of my heart that belongs only to you. Thank you for being in my life. ❤️"
  }
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

function CursorHeartTrail() {
  const [trails, setTrails] = useState([]);

  useEffect(() => {
    let id = 0;
    const handlePointerMove = (e) => {
      if (Math.random() > 0.45) return;
      const newTrail = {
        id: id++,
        x: e.clientX,
        y: e.clientY,
        size: Math.floor(Math.random() * 10) + 12,
        rotation: Math.floor(Math.random() * 60) - 30,
      };
      setTrails((prev) => [...prev.slice(-18), newTrail]);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <>
      {trails.map((t) => (
        <span
          key={t.id}
          className="trail-heart"
          style={{
            left: t.x,
            top: t.y,
            fontSize: `${t.size}px`,
            transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`
          }}
        >
          ❤️
        </span>
      ))}
    </>
  );
}

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  
  // Proposal Flow States
  const [suspenseActive, setSuspenseActive] = useState(false);
  const [suspenseStep, setSuspenseStep] = useState(0);
  const [proposalActive, setProposalActive] = useState(false);
  const [needTimeActive, setNeedTimeActive] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [showNextChapter, setShowNextChapter] = useState(false);
  const [secretNoteOpen, setSecretNoteOpen] = useState(false);

  const audioRef = useRef(null);

  const stars = useMemo(
    () => Array.from({ length: 75 }, (_, i) => ({
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
    const t1 = setTimeout(() => setSuspenseStep(1), 2200);
    const t2 = setTimeout(() => setSuspenseStep(2), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [suspenseActive]);

  // Confetti on Acceptance
  const triggerConfetti = () => {
    const end = Date.now() + 3500;
    const timer = setInterval(() => {
      if (Date.now() > end) return clearInterval(timer);
      confetti({
        particleCount: 45,
        spread: 110,
        origin: { x: Math.random(), y: 0.65 }
      });
    }, 300);
  };

  const unlock = () => {
    if (password.trim().toLowerCase() === DATA.secretPassword.toLowerCase()) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Hmm... that's not our secret password ❤️");
    }
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
      } catch {
        setError("Add your music file at public/music/our-song.mp3");
      }
    }
  };

  const handleAcceptProposal = () => {
    setProposalActive(false);
    setProposalAccepted(true);
    triggerConfetti();
  };

  // STEP 1 & 2: GATE / OPENING CURIOSITY
  if (!unlocked) {
    return (
      <div className="app">
        <BlinkingHeartBackground />
        <CursorHeartTrail />
        <StarField stars={stars} />
        <motion.div
          className="gate"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="gate-heart-wrapper">
            <div className="gate-aura" />
            <motion.div
              className="gate-heart"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart fill="currentColor" size={54} />
            </motion.div>
          </div>
          <p className="eyebrow">
            <Heart className="blinking-heart" size={13} fill="currentColor" />
            PRIVATE • JUST FOR YOU
            <Heart className="blinking-heart" size={13} fill="currentColor" />
          </p>
          <h1 className="gradient-text">{DATA.intro.title}</h1>
          <p className="muted">{DATA.intro.subtitle}</p>

          <div className="password-box">
            <Lock size={18} style={{ color: "var(--pink)" }} />
            <input
              type="password"
              placeholder="Enter our secret password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
            />
            <button onClick={unlock}>
              Enter My Little Universe <Heart className="beating-heart" size={16} fill="currentColor" />
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p className="error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                <Heart className="blinking-heart" size={14} fill="currentColor" /> {error}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="tiny" style={{ marginTop: "18px" }}>
            🔐 Hint: Only one person knows the password…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app">
      <audio ref={audioRef} loop src="/music/our-song.mp3" />
      <BlinkingHeartBackground />
      <CursorHeartTrail />
      <StarField stars={stars} />

      <button className="music-button" onClick={toggleMusic} aria-label="Toggle music">
        <Heart className={musicOn ? "beating-heart" : "blinking-heart"} size={16} fill="currentColor" />
        {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        <span>{musicOn ? "Music on ❤️" : "Music off"}</span>
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
            <h1 className="gradient-text">{DATA.herName}<br /><span>&amp; {DATA.yourName}</span></h1>
            <p className="hero-name">
              <Heart className="beating-heart" size={22} fill="currentColor" />
              {DATA.nickname}
              <Heart className="beating-heart" size={22} fill="currentColor" />
            </p>
            <p className="quote">“{DATA.hero.quote}”</p>
            <a className="scroll-cue" href="#story">
              <ArrowDown size={18} /> Begin our story <Heart className="blinking-heart" size={14} fill="currentColor" />
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
                viewport={{ once: true, amount: 0.25 }}
                variants={fadeUp}
              >
                <div className="timeline-dot"><Heart size={12} fill="currentColor" /></div>
                <div className="glass-card story-card">
                  <span className="date">
                    <Heart className="blinking-heart" size={12} fill="currentColor" />
                    {m.date}
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <button className="text-button" onClick={() => setSelectedMemory(m)}>
                    Open memory <Heart className="blinking-heart" size={14} fill="currentColor" /> <ArrowRight size={16} />
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
              <motion.div
                className={`reason-card ${r.isSpecial ? "special-reason" : ""}`}
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span>#{String(i + 1).padStart(2, "0")}</span>
                  <Heart className="card-heart" size={18} fill="currentColor" />
                </div>
                <strong>{r.title}</strong>
                <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.95rem" }}>{r.detail}</p>
              </motion.div>
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

        {/* SECRET MESSAGE BUTTON */}
        <div className="secret-btn-container">
          <button className="primary-button" onClick={() => setSecretNoteOpen(true)}>
            {DATA.secretNote.buttonText} <Heart size={18} fill="currentColor" className="beating-heart" />
          </button>
        </div>


        <footer>
          Made with so much love by {DATA.yourName} <Heart className="beating-heart" size={18} fill="currentColor" />
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
            <div className="modal-image">
              <img src={selectedMemory.image} alt="" onError={(e) => e.currentTarget.style.display = "none"} />
              <Heart size={44} fill="currentColor" className="beating-heart" />
            </div>
            <p>{selectedMemory.text}</p>
          </Modal>
        )}

        {/* SECRET NOTE MODAL */}
        {secretNoteOpen && (
          <Modal onClose={() => setSecretNoteOpen(false)}>
            <div style={{ textAlign: "center" }}>
              <Mail size={42} className="pink-heart beating-heart" />
              <p className="eyebrow" style={{ marginTop: "14px" }}>
                <Heart className="blinking-heart" size={12} fill="currentColor" />
                SECRET NOTE FOR YOU
                <Heart className="blinking-heart" size={12} fill="currentColor" />
              </p>
              <h2 className="gradient-text">{DATA.secretNote.title}</h2>
              <p className="proposal-message" style={{ fontSize: "1.1rem", lineHeight: "1.85", color: "#e4ddf0", margin: "22px 0 30px" }}>
                {DATA.secretNote.message}
              </p>
              <button className="secondary-button" onClick={() => setSecretNoteOpen(false)}>
                Keep this secret safe ❤️
              </button>
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
                <button className="text-button" onClick={() => setSuspenseStep((s) => Math.min(s + 1, 2))}>
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

        {/* STEP 6: ACTUAL PROPOSAL SCREEN ("WILL YOU BE MINE?") */}
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

        {/* STEP 7: CELEBRATION OVERLAY (AFTER CLICKING YES) */}
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

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ y: 25, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={19} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
