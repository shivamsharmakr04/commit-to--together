import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDown, ArrowRight, CalendarDays, Check, Copy, Heart,
  LockKeyhole, Music2, Plus, Sparkles, Trash2
} from "lucide-react";
import "./styles.css";

const occasions = [
  ["proposal", "A proposal", "💍"],
  ["anniversary", "An anniversary", "🥂"],
  ["wedding", "A wedding", "💐"],
  ["pre-wedding", "A pre-wedding moment", "✨"],
  ["birthday", "A birthday", "🎂"],
  ["other", "Just because", "💌"]
];

const prompts = {
  proposal: ["Will you be mine?", "A thousand yeses!", "Take all the time you need.", "Your feelings always come first."],
  anniversary: ["Will you celebrate with me?", "I'd love that!", "Let me check my plans.", "No worries at all."],
  wedding: ["Will you join us for our day?", "I'll be there!", "I'll let you know soon.", "Sending love from afar."],
  "pre-wedding": ["Will you make this moment ours?", "Absolutely!", "I need a little time.", "That's okay, always."],
  birthday: ["Will you celebrate with me?", "Wouldn't miss it!", "I'll let you know soon.", "Sending birthday love!"],
  other: ["Will you make this moment special?", "Yes, let's do it!", "Let me think about it.", "No pressure, ever."]
};

const emptyMemory = () => ({ date: "", title: "", text: "", image: "" });
const emptyPlan = () => ({ title: "", text: "" });

function createDraft(occasion = "proposal") {
  const [ask, yes, time, no] = prompts[occasion];
  return {
    occasion,
    creatorName: "",
    recipientName: "",
    title: ask,
    date: "",
    intro: "I made this little corner of the universe just for you.",
    story: "Some of my favorite moments are the ones I've shared with you. I wanted to make something personal to celebrate this chapter of our story.",
    ask,
    responseYes: yes,
    responseTime: time,
    responseNo: no,
    closing: "Whatever your answer, thank you for being you. This moment is yours, and there is never any pressure.",
    coverImage: "",
    music: "",
    memories: [emptyMemory()],
    plans: []
  };
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

function App() {
  const manageMatch = window.location.pathname.match(/^\/manage\/([a-z0-9-]+)\/?$/);
  const eventMatch = window.location.pathname.match(/^\/e\/([a-z0-9-]+)\/?$/);
  if (manageMatch) return <ManagePage slug={manageMatch[1]} />;
  if (eventMatch) return <EventPage slug={eventMatch[1]} />;
  return <CreatePage />;
}

function Brand({ subtle = false }) {
  return (
    <a className={`studio-brand ${subtle ? "subtle" : ""}`} href="/" aria-label="Commit to Together home">
      <span className="brand-mark"><Heart size={19} fill="currentColor" /></span>
      <span>commit to <strong>together</strong></span>
    </a>
  );
}

function PageShell({ children, compact = false }) {
  return (
    <div className="studio-page">
      <div className="studio-orb orb-one" />
      <div className="studio-orb orb-two" />
      <header className="studio-header"><Brand /><span className="header-note"><Sparkles size={14} /> made for your moment</span></header>
      <main className={`studio-main ${compact ? "compact" : ""}`}>{children}</main>
      <footer className="studio-footer">A little universe, made with love <Heart size={13} fill="currentColor" /></footer>
    </div>
  );
}

function CreatePage() {
  const [draft, setDraft] = useState(() => createDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState("");

  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const changeOccasion = (occasion) => {
    const [ask, yes, time, no] = prompts[occasion];
    setDraft((current) => ({ ...current, occasion, title: ask, ask, responseYes: yes, responseTime: time, responseNo: no }));
  };

  const createEvent = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api("/api/events", { method: "POST", body: JSON.stringify({ event: draft }) });
      setCreated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value, name) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(name);
    } catch {
      setError("Clipboard access is unavailable. You can select and copy the link instead.");
    }
  };

  if (created) {
    const eventUrl = `${window.location.origin}/e/${created.slug}`;
    const manageUrl = `${window.location.origin}/manage/${created.slug}#${created.managementToken}`;
    return (
      <PageShell compact>
        <section className="success-card">
          <div className="success-icon"><Check size={29} /></div>
          <p className="studio-kicker">YOUR LITTLE UNIVERSE IS READY</p>
          <h1 className="studio-title">A moment made <em>just for them.</em></h1>
          <p className="studio-copy">Your page is live. Share the invitation link, and keep your private owner link somewhere safe.</p>
          <div className="share-box">
            <label htmlFor="share-link">Guest invitation</label>
            <div className="share-row"><input id="share-link" readOnly value={eventUrl} /><button className="icon-button" onClick={() => copy(eventUrl, "guest")} aria-label="Copy guest link"><Copy size={17} /></button></div>
            {copied === "guest" && <span className="copy-feedback">Copied!</span>}
          </div>
          <div className="share-box owner-share">
            <label htmlFor="owner-link"><LockKeyhole size={13} /> Private management link — keep this secret</label>
            <div className="share-row"><input id="owner-link" readOnly value={manageUrl} /><button className="icon-button" onClick={() => copy(manageUrl, "owner")} aria-label="Copy private owner link"><Copy size={17} /></button></div>
            {copied === "owner" && <span className="copy-feedback">Copied!</span>}
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="success-actions">
            <a className="primary-action" href={`/e/${created.slug}`}>Preview invitation <ArrowRight size={17} /></a>
            <a className="secondary-action" href={manageUrl}>Manage your page</a>
          </div>
          <p className="security-note">The private link is shown only once. Save it now to edit your page and see guest replies.</p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="builder-intro">
        <p className="studio-kicker"><span /> FOR THE MOMENTS THAT MATTER</p>
        <h1 className="studio-title">Turn your story into <em>a little universe.</em></h1>
        <p className="studio-copy">Create a heartfelt, shareable page for a proposal, anniversary, wedding, birthday, or any moment worth remembering.</p>
        <div className="intro-points"><span><Heart size={15} /> Your words, your way</span><span><LockKeyhole size={15} /> Private owner link</span><span><Sparkles size={15} /> Ready to share</span></div>
      </section>

      <form className="builder-card" onSubmit={createEvent}>
        <div className="form-heading"><span className="step-number">01</span><div><h2>What's the occasion?</h2><p>Pick a starting point; you can customize every word.</p></div></div>
        <div className="occasion-grid">
          {occasions.map(([value, label, emoji]) => (
            <button key={value} type="button" className={`occasion-option ${draft.occasion === value ? "selected" : ""}`} onClick={() => changeOccasion(value)}>
              <span>{emoji}</span>{label}
            </button>
          ))}
        </div>

        <div className="form-heading second"><span className="step-number">02</span><div><h2>Make it personal</h2><p>Start with the two of you and the feeling you want to share.</p></div></div>
        <div className="form-grid">
          <Field label="Your name" value={draft.creatorName} onChange={(value) => change("creatorName", value)} placeholder="The person making this" required />
          <Field label="Their name" value={draft.recipientName} onChange={(value) => change("recipientName", value)} placeholder="The person it's for" required />
          <Field label="Page headline" value={draft.title} onChange={(value) => change("title", value)} placeholder="A few words that feel like you" required wide />
          <Field label="Date (optional)" type="date" value={draft.date} onChange={(value) => change("date", value)} />
          <Field label="Cover photo link (optional)" type="url" value={draft.coverImage} onChange={(value) => change("coverImage", value)} placeholder="https://…" />
          <Field label="Opening line" value={draft.intro} onChange={(value) => change("intro", value)} placeholder="A little welcome message" required wide />
          <TextField label="Your story" value={draft.story} onChange={(value) => change("story", value)} placeholder="What makes this moment special?" rows={4} required wide />
        </div>

        <div className="form-heading second">
          <span className="step-number">03</span>
          <div><h2>Add favorite moments</h2><p>Share the memories that brought you here. Photos are optional HTTPS image links.</p></div>
        </div>
        <div className="repeat-list">
          {draft.memories.map((memory, index) => (
            <div className="repeat-card" key={index}>
              <div className="repeat-card-heading"><span>Moment {String(index + 1).padStart(2, "0")}</span>{draft.memories.length > 1 && <button type="button" className="remove-button" onClick={() => change("memories", draft.memories.filter((_, i) => i !== index))}><Trash2 size={15} /> Remove</button>}</div>
              <div className="form-grid">
                <Field label="When" value={memory.date} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "date", value)} placeholder="The beginning" />
                <Field label="Moment title" value={memory.title} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "title", value)} placeholder="Our first conversation" required />
                <TextField label="What happened?" value={memory.text} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "text", value)} placeholder="Tell this little part of your story…" rows={3} required wide />
                <Field label="Photo link (optional)" type="url" value={memory.image} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "image", value)} placeholder="https://…" wide />
              </div>
            </div>
          ))}
          <button type="button" className="add-button" disabled={draft.memories.length >= 8} onClick={() => change("memories", [...draft.memories, emptyMemory()])}><Plus size={16} /> Add a memory</button>
        </div>

        <div className="form-heading second"><span className="step-number">04</span><div><h2>Write the invitation</h2><p>Make the big question yours, and let them answer in their own time.</p></div></div>
        <div className="form-grid">
          <TextField label="Your invitation or question" value={draft.ask} onChange={(value) => change("ask", value)} rows={2} required wide />
          <Field label="Yes button" value={draft.responseYes} onChange={(value) => change("responseYes", value)} required />
          <Field label="Take-time button" value={draft.responseTime} onChange={(value) => change("responseTime", value)} required />
          <Field label="No button" value={draft.responseNo} onChange={(value) => change("responseNo", value)} required />
          <TextField label="A no-pressure note" value={draft.closing} onChange={(value) => change("closing", value)} rows={3} required wide />
        </div>

        <div className="form-heading second"><span className="step-number">05</span><div><h2>Dream about what's next</h2><p>Optional little plans for your next chapter together.</p></div></div>
        <div className="repeat-list">
          {draft.plans.map((plan, index) => (
            <div className="repeat-card compact-repeat" key={index}>
              <div className="repeat-card-heading"><span>Idea {String(index + 1).padStart(2, "0")}</span>{draft.plans.length > 1 && <button type="button" className="remove-button" onClick={() => change("plans", draft.plans.filter((_, i) => i !== index))}><Trash2 size={15} /> Remove</button>}</div>
              <div className="form-grid">
                <Field label="Plan" value={plan.title} onChange={(value) => updateArrayItem(draft, setDraft, "plans", index, "title", value)} placeholder="A sunset together" required />
                <Field label="A few details" value={plan.text} onChange={(value) => updateArrayItem(draft, setDraft, "plans", index, "text", value)} placeholder="Watch the sky change colors." required />
              </div>
            </div>
          ))}
          <button type="button" className="add-button" disabled={draft.plans.length >= 8} onClick={() => change("plans", [...draft.plans, emptyPlan()])}><Plus size={16} /> Add a future plan</button>
        </div>

        <div className="form-grid optional-last">
          <Field label="Song link (optional)" type="url" value={draft.music} onChange={(value) => change("music", value)} placeholder="https://… direct audio link" wide />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="submit-row"><p>Your invitation is unlisted. Only people with its link can view it.</p><button className="primary-action submit-button" disabled={busy}>{busy ? "Creating your page…" : "Create my invitation"} <ArrowRight size={18} /></button></div>
      </form>
    </PageShell>
  );
}

function updateArrayItem(draft, setDraft, field, index, key, value) {
  setDraft({ ...draft, [field]: draft[field].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) });
}

function Field({ label, value, onChange, placeholder = "", type = "text", required = false, wide = false }) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span><input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>;
}

function TextField({ label, value, onChange, placeholder = "", rows = 3, required = false, wide = false }) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span><textarea value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} required={required} /></label>;
}

function ManagePage({ slug }) {
  const [draft, setDraft] = useState(null);
  const [replies, setReplies] = useState([]);
  const [token] = useState(() => window.location.hash.slice(1));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    if (!token) {
      setError("This private management link is missing its access key. Use the original owner link you saved.");
      setLoading(false);
      return () => { active = false; };
    }
    api(`/api/events/${slug}/manage`, { token })
      .then((result) => {
        if (!active) return;
        setDraft(result.event);
        setReplies(result.replies);
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, token]);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api(`/api/events/${slug}/manage`, { method: "PUT", token, body: JSON.stringify({ event: draft }) });
      setNotice(result.message);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageShell compact><StatusCard title="Opening your private page…" /></PageShell>;
  if (!draft) return <PageShell compact><StatusCard title="We couldn't open this page" message={error} /></PageShell>;
  return (
    <PageShell>
      <section className="manage-intro"><p className="studio-kicker">PRIVATE EVENT DASHBOARD</p><h1 className="studio-title">Your page, <em>your moment.</em></h1><p className="studio-copy">Update the invitation anytime and see the replies your guests have shared.</p><a className="text-link" href={`/e/${slug}`} target="_blank" rel="noreferrer">Open guest view <ArrowRight size={15} /></a></section>
      <form className="builder-card manage-form" onSubmit={save}>
        <div className="form-heading"><span className="step-number"><Heart size={16} /></span><div><h2>Edit your invitation</h2><p>Your private access key is stored in this link's fragment, not sent to the server.</p></div></div>
        <div className="form-grid">
          <Field label="Your name" value={draft.creatorName} onChange={(value) => setDraft({ ...draft, creatorName: value })} required />
          <Field label="Their name" value={draft.recipientName} onChange={(value) => setDraft({ ...draft, recipientName: value })} required />
          <Field label="Page headline" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} required wide />
          <Field label="Date (optional)" type="date" value={draft.date} onChange={(value) => setDraft({ ...draft, date: value })} />
          <Field label="Cover photo link (optional)" type="url" value={draft.coverImage} onChange={(value) => setDraft({ ...draft, coverImage: value })} placeholder="https://…" />
          <Field label="Opening line" value={draft.intro} onChange={(value) => setDraft({ ...draft, intro: value })} required wide />
          <TextField label="Your story" value={draft.story} onChange={(value) => setDraft({ ...draft, story: value })} rows={4} required wide />
          <TextField label="Your invitation or question" value={draft.ask} onChange={(value) => setDraft({ ...draft, ask: value })} rows={2} required wide />
          <Field label="Yes button" value={draft.responseYes} onChange={(value) => setDraft({ ...draft, responseYes: value })} required />
          <Field label="Take-time button" value={draft.responseTime} onChange={(value) => setDraft({ ...draft, responseTime: value })} required />
          <Field label="No button" value={draft.responseNo} onChange={(value) => setDraft({ ...draft, responseNo: value })} required />
          <TextField label="A no-pressure note" value={draft.closing} onChange={(value) => setDraft({ ...draft, closing: value })} rows={3} required wide />
        </div>
        <div className="form-heading second"><span className="step-number">♥</span><div><h2>Story moments</h2><p>Add a title and story for each moment. Remove a card to leave it off the page.</p></div></div>
        <div className="repeat-list">
          {draft.memories.map((memory, index) => (
            <div className="repeat-card" key={index}>
              <div className="repeat-card-heading"><span>Moment {index + 1}</span><button type="button" className="remove-button" onClick={() => setDraft({ ...draft, memories: draft.memories.filter((_, i) => i !== index) })}><Trash2 size={15} /> Remove</button></div>
              <div className="form-grid">
                <Field label="When" value={memory.date} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "date", value)} />
                <Field label="Moment title" value={memory.title} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "title", value)} required />
                <TextField label="What happened?" value={memory.text} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "text", value)} rows={3} required wide />
                <Field label="Photo link (optional)" type="url" value={memory.image} onChange={(value) => updateArrayItem(draft, setDraft, "memories", index, "image", value)} wide />
              </div>
            </div>
          ))}
          {draft.memories.length < 8 && <button type="button" className="add-button" onClick={() => setDraft({ ...draft, memories: [...draft.memories, emptyMemory()] })}><Plus size={16} /> Add a memory</button>}
        </div>
        <div className="form-heading second"><span className="step-number">♥</span><div><h2>Next chapter ideas</h2><p>These are optional. Add a few plans or remove all of them.</p></div></div>
        <div className="repeat-list">
          {draft.plans.map((plan, index) => (
            <div className="repeat-card compact-repeat" key={index}>
              <div className="repeat-card-heading"><span>Idea {index + 1}</span><button type="button" className="remove-button" onClick={() => setDraft({ ...draft, plans: draft.plans.filter((_, i) => i !== index) })}><Trash2 size={15} /> Remove</button></div>
              <div className="form-grid">
                <Field label="Plan" value={plan.title} onChange={(value) => updateArrayItem(draft, setDraft, "plans", index, "title", value)} required />
                <Field label="A few details" value={plan.text} onChange={(value) => updateArrayItem(draft, setDraft, "plans", index, "text", value)} required />
              </div>
            </div>
          ))}
          {draft.plans.length < 8 && <button type="button" className="add-button" onClick={() => setDraft({ ...draft, plans: [...draft.plans, emptyPlan()] })}><Plus size={16} /> Add a future plan</button>}
        </div>
        <div className="form-grid optional-last"><Field label="Song link (optional)" type="url" value={draft.music} onChange={(value) => setDraft({ ...draft, music: value })} placeholder="https://… direct audio link" wide /></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status"><Check size={16} /> {notice}</p>}
        <div className="submit-row"><p>Changes appear on the shared invitation as soon as you save.</p><button className="primary-action submit-button" disabled={busy}>{busy ? "Saving…" : "Save changes"} <Check size={17} /></button></div>
      </form>
      <section className="replies-section">
        <div className="form-heading"><span className="step-number">{replies.length}</span><div><h2>Guest replies</h2><p>Replies are private and visible only from this owner page.</p></div></div>
        {replies.length === 0 ? <div className="empty-replies">No replies yet. Share your invitation to get started. <Heart size={15} /></div> : (
          <div className="reply-list">{replies.map((reply) => (
            <article className="reply-card" key={reply.id}>
              <div className="reply-top"><strong>{reply.name}</strong><span className={`reply-badge ${reply.response}`}>{reply.response === "yes" ? "Yes!" : reply.response === "time" ? "Needs time" : "Can't make it"}</span></div>
              {reply.message && <p>{reply.message}</p>}<time>{new Date(reply.createdAt).toLocaleString()}</time>
            </article>
          ))}</div>
        )}
      </section>
    </PageShell>
  );
}

function EventPage({ slug }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    let active = true;
    api(`/api/events/${slug}`)
      .then((result) => { if (active) setEvent(result.event); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const sendReply = async (submission) => {
    submission.preventDefault();
    setError("");
    if (!response) {
      setError("Choose the response that feels right for you.");
      return;
    }
    setBusy(true);
    try {
      await api(`/api/events/${slug}/replies`, { method: "POST", body: JSON.stringify({ name, message, response }) });
      setSent(true);
      if (response === "yes") confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 }, colors: ["#ff5b9d", "#ff94c7", "#ffd1dc", "#b084ff"] });
    } catch (replyError) {
      setError(replyError.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageShell compact><StatusCard title="Gathering a little stardust…" /></PageShell>;
  if (!event) return <PageShell compact><StatusCard title="This universe isn't here" message={error} /></PageShell>;

  const occasion = occasions.find(([value]) => value === event.occasion);
  const date = event.date ? new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { dateStyle: "long" }) : "";

  return (
    <div className="invitation-page">
      <div className="invitation-glow" />
      <header className="invitation-header"><Brand subtle /><span>{occasion?.[2]} {occasion?.[1]}</span></header>
      {event.music && <audio id="event-music" loop src={event.music} preload="none" />}
      {event.music && <button className="invitation-music" onClick={async () => {
        const audio = document.getElementById("event-music");
        if (!audio) return;
        if (musicOn) { audio.pause(); setMusicOn(false); }
        else {
          try { await audio.play(); setMusicOn(true); }
          catch { setError("Your browser couldn't play that audio link."); }
        }
      }}><Music2 size={15} /> {musicOn ? "Pause the song" : "Play our song"}</button>}
      <main>
        <section className="invitation-hero">
          <motion.div className="invitation-heart" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Heart size={32} fill="currentColor" /></motion.div>
          <p className="studio-kicker">{event.creatorName} MADE THIS FOR YOU</p>
          <h1>{event.recipientName}<span>&amp; {event.creatorName}</span></h1>
          <p className="invitation-date">{date && <><CalendarDays size={15} /> {date}<span className="date-divider">·</span></>}<span>{event.title}</span></p>
          <p className="invitation-intro">{event.intro}</p>
          {event.coverImage && <img className="cover-photo" src={event.coverImage} alt={`A special photo for ${event.recipientName}`} />}
          <a className="invitation-scroll" href="#our-story">Step inside <ArrowDown size={16} /></a>
        </section>

        <section id="our-story" className="invitation-section">
          <p className="studio-kicker">THE STORY SO FAR</p><h2>Every little moment <em>led here.</em></h2>
          <div className="story-letter"><span className="letter-heart"><Heart size={17} fill="currentColor" /></span><p>{event.story}</p><span className="letter-signoff">With all my heart, {event.creatorName}</span></div>
          {event.memories.length > 0 && <div className="memory-grid">{event.memories.map((memory, index) => (
            <motion.article className="memory-card" key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {memory.image ? <img src={memory.image} alt={memory.title} loading="lazy" /> : <div className="memory-art"><Heart size={26} fill="currentColor" /></div>}
              <div className="memory-copy">{memory.date && <span>{memory.date}</span>}<h3>{memory.title}</h3><p>{memory.text}</p></div>
            </motion.article>
          ))}</div>}
        </section>

        <section className="invitation-section invitation-question">
          <p className="studio-kicker">ONE LITTLE QUESTION</p><h2>{event.ask}</h2>
          <p>{event.closing}</p>
          {sent ? (
            <div className="reply-thanks"><span><Heart size={20} fill="currentColor" /></span><h3>Your answer has been sent.</h3><p>Thank you for sharing what's in your heart. {event.response === "time" ? "Take all the time you need." : "This moment is yours, just as you are."}</p></div>
          ) : (
            <form className="rsvp-card" onSubmit={sendReply}>
              <label className="field"><span>Your name</span><input value={name} onChange={(input) => setName(input.target.value)} placeholder="So they know it's you" maxLength={80} required /></label>
              <div className="response-options" role="group" aria-label="Choose your response">
                {[["yes", event.responseYes], ["time", event.responseTime], ["no", event.responseNo]].map(([value, label]) => (
                  <button className={`response-option ${response === value ? "chosen" : ""}`} type="button" key={value} aria-pressed={response === value} onClick={() => setResponse(value)}>{label}</button>
                ))}
              </div>
              <label className="field"><span>A note (optional)</span><textarea value={message} onChange={(input) => setMessage(input.target.value)} placeholder="Share a little more, if you'd like…" rows={3} maxLength={500} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-action rsvp-submit" disabled={busy}>{busy ? "Sending…" : "Send my answer"} <ArrowRight size={17} /></button>
            </form>
          )}
        </section>

        {event.plans.length > 0 && <section className="invitation-section future-section"><p className="studio-kicker">THE NEXT CHAPTER</p><h2>Little dreams for <em>what comes next.</em></h2><div className="future-grid">{event.plans.map((plan, index) => <article className="future-card" key={index}><span>0{index + 1}</span><h3>{plan.title}</h3><p>{plan.text}</p></article>)}</div></section>}
      </main>
      <footer className="invitation-footer">Made with love by {event.creatorName} <Heart size={14} fill="currentColor" /><a href="/">Make a little universe of your own <ArrowRight size={13} /></a></footer>
    </div>
  );
}

function StatusCard({ title, message }) {
  return <section className="status-card"><div className="success-icon"><Heart size={23} fill="currentColor" /></div><h1>{title}</h1>{message && <p>{message}</p>}<a className="primary-action" href="/">Back to home <ArrowRight size={16} /></a></section>;
}

createRoot(document.getElementById("root")).render(<App />);
