import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDown, ArrowLeft, ArrowRight, Heart, Lock, Mail, Music2,
  Pause, Play, Sparkles, Star, Volume2, VolumeX, X
} from "lucide-react";
import "./styles.css";

/* =========================
   EDIT THIS OBJECT
   ========================= */
const DATA = {
  herName: "Her Name",
  nickname: "My Favorite Person",
  yourName: "Your Name",
  secretPassword: "forever",

  intro: {
    title: "A tiny universe made for you.",
    subtitle: "Not because it's a special day. Just because you're special to me."
  },

  hero: {
    quote: "Some people become memories. You became my favorite one."
  },

  reasons: [
    "The way your smile changes the whole mood around you.",
    "How you can make ordinary conversations feel special.",
    "That little habit you have that you probably don't even notice.",
    "The way you care about the people you love.",
    "Your laugh — especially when you try not to laugh.",
    "Because being around you feels strangely like home.",
    "You make even boring days worth remembering.",
    "I love how completely, unapologetically you are yourself."
  ],

  memories: [
    {
      date: "The beginning",
      title: "Our first conversation",
      text: "Replace this with the real story of how you first started talking.",
      image: "/photos/photo1.jpg"
    },
    {
      date: "One of my favorites",
      title: "That unforgettable day",
      text: "Write what happened, why it mattered, and the tiny detail you still remember.",
      image: "/photos/photo2.jpg"
    },
    {
      date: "A random beautiful moment",
      title: "Just us",
      text: "Add an inside joke, a funny moment, or something only the two of you understand.",
      image: "/photos/photo3.jpg"
    }
  ],

  ifYouWere: [
    ["🎵", "A song", "I'd keep you on repeat."],
    ["🌸", "A flower", "You'd be the one I'd stop to look at twice."],
    ["🌙", "A night", "The kind I wouldn't want to end."],
    ["🌍", "A place", "Somewhere I'd always want to return to."],
    ["🎬", "A movie", "The one I'd never get tired of watching."]
  ],

  future: [
    "Take a trip somewhere neither of us has been.",
    "Take that ridiculously perfect photo we keep talking about.",
    "Watch a sunset together with nowhere else to be.",
    "Create another hundred memories that deserve their own website."
  ],

  finalMessage:
    "If you ever wonder how special you are, come back here. This website is only a tiny part of what you mean to me."
};

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

function FloatingBlinkingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: `${(i * 2.9 + Math.sin(i * 1.5) * 8) % 100}%`,
        duration: `${7 + (i % 7) * 1.4}s`,
        delay: `${(i % 9) * 0.6}s`,
        blinkDur: `${1.1 + (i % 5) * 0.3}s`,
        size: Math.floor(14 + (i % 5) * 6),
        color: ["#ff5b9d", "#ff94c7", "#ff2e83", "#ffd1dc", "#b084ff", "#ff75ac"][i % 6]
      })),
    []
  );

  return (
    <div className="floating-hearts-container" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            "--duration": h.duration,
            "--blink-dur": h.blinkDur,
            animationDelay: `${h.delay}, ${h.delay}`,
            fontSize: `${h.size}px`,
            color: h.color
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
  const [reason, setReason] = useState(null);
  const [ifYouWere, setIfYouWere] = useState(null);
  const [finalOpen, setFinalOpen] = useState(false);
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

  useEffect(() => {
    if (!finalOpen) return;
    const end = Date.now() + 2600;
    const timer = setInterval(() => {
      if (Date.now() > end) return clearInterval(timer);
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: Math.random(), y: 0.7 }
      });
    }, 320);
    return () => clearInterval(timer);
  }, [finalOpen]);

  const unlock = () => {
    if (password.trim().toLowerCase() === DATA.secretPassword.toLowerCase()) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Hmm... that's not our secret ❤️");
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

  if (!unlocked) {
    return (
      <div className="app">
        <FloatingBlinkingHearts />
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
          <h1 className="gradient-text">{DATA.herName}, this little universe is yours.</h1>
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
              Unlock <Heart className="beating-heart" size={16} fill="currentColor" />
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
            Hint: use your inside joke, special word, or secret password.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app">
      <audio ref={audioRef} loop src="/music/our-song.mp3" />
      <FloatingBlinkingHearts />
      <CursorHeartTrail />
      <StarField stars={stars} />

      <button className="music-button" onClick={toggleMusic} aria-label="Toggle music">
        <Heart className={musicOn ? "beating-heart" : "blinking-heart"} size={16} fill="currentColor" />
        {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        <span>{musicOn ? "Music on ❤️" : "Music off"}</span>
      </button>

      <main>
        <section className="hero section">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="hero-inner">
            <div className="orbit-heart">
              <div className="orbit-heart-ring" />
              <Heart fill="currentColor" size={38} />
            </div>
            <p className="eyebrow">
              <Heart className="blinking-heart" size={13} fill="currentColor" />
              WELCOME TO MY UNIVERSE
              <Heart className="blinking-heart" size={13} fill="currentColor" />
            </p>
            <h1 className="gradient-text">My Little<br /><span>Universe</span></h1>
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

        <section className="section soft-section">
          <SectionHeading kicker="CHAPTER TWO" title="Things I love about you" />
          <div className="reason-grid">
            {DATA.reasons.map((r, i) => (
              <motion.button
                className="reason-card"
                key={i}
                whileHover={{ y: -7, rotate: i % 2 ? 1 : -1, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setReason(r)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span>#{String(i + 1).padStart(2, "0")}</span>
                  <Heart className="card-heart" size={18} fill="currentColor" />
                </div>
                <strong>Tap me ❤️</strong>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionHeading kicker="CHAPTER THREE" title="Little pieces of us" />
          <div className="gallery">
            {DATA.memories.map((m, i) => (
              <motion.button
                className={`photo-card photo-${i + 1}`}
                key={m.title}
                onClick={() => setSelectedMemory(m)}
                whileHover={{ scale: 1.03, rotate: i % 2 ? 2 : -2 }}
              >
                <img src={m.image} alt={m.title} onError={(e) => e.currentTarget.style.display = "none"} />
                <div className="photo-placeholder">
                  <Heart size={34} fill="currentColor" />
                  <span>Add photo{i + 1}.jpg</span>
                </div>
                <div className="photo-caption">
                  <span>
                    <Heart className="blinking-heart" size={12} fill="currentColor" /> {m.date}
                  </span>
                  <strong>{m.title}</strong>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="section soft-section">
          <SectionHeading kicker="A LITTLE GAME" title="If you were..." />
          <div className="choice-row">
            {DATA.ifYouWere.map(([emoji, title, answer], i) => (
              <motion.button
                className="choice-card"
                key={title}
                onClick={() => setIfYouWere({ emoji, title, answer })}
                whileHover={{ y: -8, scale: 1.04 }}
              >
                <span className="choice-emoji">{emoji}</span>
                <span style={{ fontWeight: 600 }}>{title}</span>
                <Heart className="blinking-heart" size={14} fill="currentColor" />
              </motion.button>
            ))}
          </div>
        </section>

        <section className="section voice-section">
          <div className="voice-card">
            <div className="voice-icon">
              <Heart className="beating-heart" size={32} fill="currentColor" />
            </div>
            <p className="eyebrow">
              <Heart className="blinking-heart" size={13} fill="currentColor" />
              A MESSAGE FROM ME
              <Heart className="blinking-heart" size={13} fill="currentColor" />
            </p>
            <h2 className="gradient-text">I could write this...</h2>
            <p>But there are some things that sound better when they're said by the person who means them.</p>
            <div className="fake-player">
              <div className="play-circle">
                <Heart fill="currentColor" size={20} />
              </div>
              <div className="wave">
                {Array.from({ length: 28 }, (_, i) => (
                  <i key={i} style={{ height: `${20 + ((i * 17) % 55)}%` }} />
                ))}
              </div>
              <span style={{ fontWeight: 600, color: "var(--pink2)" }}>01:12</span>
            </div>
            <p className="tiny">Replace this section with your own voice recording for the full effect.</p>
          </div>
        </section>

        <section className="section">
          <SectionHeading kicker="CHAPTER FOUR" title="Things we haven't done yet" />
          <div className="future-list">
            {DATA.future.map((item, i) => (
              <motion.div
                className="future-item"
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <span>0{i + 1}</span>
                <p>{item}</p>
                <Heart className="blinking-heart" size={18} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section final-section">
          <motion.div
            className="final-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="beating-heart" size={36} fill="currentColor" />
            <p className="eyebrow" style={{ marginTop: "16px" }}>
              <Heart className="blinking-heart" size={13} fill="currentColor" />
              ONE LAST SURPRISE
              <Heart className="blinking-heart" size={13} fill="currentColor" />
            </p>
            <h2 className="gradient-text">Wait... I saved something special for you.</h2>
            <button className="primary-button" onClick={() => setFinalOpen(true)}>
              Open the final surprise <Heart size={20} fill="currentColor" className="beating-heart" />
            </button>
          </motion.div>
        </section>

        <footer>
          Made with so much love by {DATA.yourName} <Heart className="beating-heart" size={18} fill="currentColor" />
        </footer>
      </main>

      <AnimatePresence>
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

        {reason && (
          <Modal onClose={() => setReason(null)}>
            <Heart fill="currentColor" size={42} className="pink-heart beating-heart" />
            <p className="eyebrow" style={{ marginTop: "14px" }}>
              REASON #{String(DATA.reasons.indexOf(reason) + 1).padStart(2, "0")}
            </p>
            <h2 className="gradient-text">{reason}</h2>
            <p className="muted">And honestly, I could keep going forever ❤️</p>
          </Modal>
        )}

        {ifYouWere && (
          <Modal onClose={() => setIfYouWere(null)}>
            <div className="big-emoji">{ifYouWere.emoji}</div>
            <p className="eyebrow">
              <Heart className="blinking-heart" size={13} fill="currentColor" /> IF YOU WERE...
            </p>
            <h2 className="gradient-text">{ifYouWere.title}</h2>
            <p className="answer">{ifYouWere.answer}</p>
          </Modal>
        )}

        {finalOpen && (
          <div className="final-overlay">
            <button className="close-final" onClick={() => setFinalOpen(false)}><X /></button>
            <motion.div
              className="final-message"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="final-hearts">
                <Heart fill="currentColor" size={36} className="beating-heart" />
                <Heart fill="currentColor" size={24} className="blinking-heart" />
                <Heart fill="currentColor" size={42} className="beating-heart" />
                <Heart fill="currentColor" size={24} className="blinking-heart" />
                <Heart fill="currentColor" size={36} className="beating-heart" />
              </div>
              <p className="eyebrow">FOR {DATA.herName.toUpperCase()}</p>
              <h2 className="gradient-text">{DATA.finalMessage}</h2>
              <p className="signature">— {DATA.yourName} ❤️</p>
              <button className="secondary-button" onClick={() => setFinalOpen(false)}>
                Keep this little secret ❤️
              </button>
            </motion.div>
          </div>
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
