import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(root, "dist");
const databasePath = process.env.DATABASE_PATH || path.join(root, "data", "events.sqlite");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const occasions = new Set(["proposal", "anniversary", "wedding", "pre-wedding", "birthday", "other"]);
const responses = new Set(["yes", "time", "no"]);
const maximumBodyBytes = 256 * 1024;

await mkdir(path.dirname(databasePath), { recursive: true });
const database = new Database(databasePath);
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS events (
    slug TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    edit_token_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_slug TEXT NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
    name TEXT NOT NULL,
    response TEXT NOT NULL CHECK (response IN ('yes', 'time', 'no')),
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS replies_event_created ON replies(event_slug, created_at DESC);
`);

const insertEvent = database.prepare(
  "INSERT INTO events (slug, content, edit_token_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
);
const updateEvent = database.prepare(
  "UPDATE events SET content = ?, updated_at = ? WHERE slug = ?"
);
const insertReply = database.prepare(
  "INSERT INTO replies (event_slug, name, response, message, created_at) VALUES (?, ?, ?, ?, ?)"
);

function sendJson(response, status, data) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin"
  });
  response.end(JSON.stringify(data));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maximumBodyBytes) {
        reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new Error("Expected a JSON object.");
        }
        resolve(body);
      } catch {
        reject(Object.assign(new Error("Please send a valid JSON object."), { status: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function text(value, label, maximum, required = false) {
  if (typeof value !== "string") {
    if (required) throw Object.assign(new Error(`${label} is required.`), { status: 400 });
    return "";
  }
  const clean = value.trim();
  if (required && !clean) {
    throw Object.assign(new Error(`${label} is required.`), { status: 400 });
  }
  if (clean.length > maximum) {
    throw Object.assign(new Error(`${label} must be ${maximum} characters or fewer.`), { status: 400 });
  }
  return clean;
}

function imageUrl(value, label) {
  const clean = text(value, label, 2048);
  if (!clean) return "";
  let url;
  try {
    url = new URL(clean);
  } catch {
    throw Object.assign(new Error(`${label} must be a valid HTTPS link.`), { status: 400 });
  }
  if (url.protocol !== "https:") {
    throw Object.assign(new Error(`${label} must use HTTPS.`), { status: 400 });
  }
  return url.toString();
}

function cleanEvent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw Object.assign(new Error("Event details are required."), { status: 400 });
  }
  if (!occasions.has(input.occasion)) {
    throw Object.assign(new Error("Choose a supported event type."), { status: 400 });
  }
  if (!Array.isArray(input.memories) || input.memories.length > 8) {
    throw Object.assign(new Error("Add no more than eight story moments."), { status: 400 });
  }
  if (!Array.isArray(input.plans) || input.plans.length > 8) {
    throw Object.assign(new Error("Add no more than eight next-chapter ideas."), { status: 400 });
  }
  const date = text(input.date, "Event date", 32);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw Object.assign(new Error("Enter a valid event date."), { status: 400 });
  }
  const memories = input.memories.map((memory, index) => {
    if (!memory || typeof memory !== "object" || Array.isArray(memory)) {
      throw Object.assign(new Error(`Story moment ${index + 1} is invalid.`), { status: 400 });
    }
    return {
      date: text(memory.date, `Moment ${index + 1} date`, 60),
      title: text(memory.title, `Moment ${index + 1} title`, 100, true),
      text: text(memory.text, `Moment ${index + 1} story`, 1200, true),
      image: imageUrl(memory.image, `Moment ${index + 1} image`)
    };
  });
  const plans = input.plans.map((plan, index) => {
    if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
      throw Object.assign(new Error(`Next-chapter idea ${index + 1} is invalid.`), { status: 400 });
    }
    return {
      title: text(plan.title, `Idea ${index + 1} title`, 100, true),
      text: text(plan.text, `Idea ${index + 1} description`, 400, true)
    };
  });
  return {
    occasion: input.occasion,
    creatorName: text(input.creatorName, "Your name", 80, true),
    recipientName: text(input.recipientName, "Their name", 80, true),
    title: text(input.title, "Page title", 120, true),
    date,
    intro: text(input.intro, "Opening message", 500, true),
    story: text(input.story, "Your story", 3000, true),
    ask: text(input.ask, "Invitation", 240, true),
    responseYes: text(input.responseYes, "Yes response", 240, true),
    responseTime: text(input.responseTime, "Take-time response", 240, true),
    responseNo: text(input.responseNo, "No response", 240, true),
    closing: text(input.closing, "Closing note", 500, true),
    coverImage: imageUrl(input.coverImage, "Cover image"),
    music: imageUrl(input.music, "Song link"),
    memories,
    plans
  };
}

function tokenDigest(token) {
  return createHash("sha256").update(token).digest("hex");
}

function ownerAuthorized(request, storedHash) {
  const match = /^Bearer ([A-Za-z0-9_-]{40,100})$/.exec(request.headers.authorization || "");
  if (!match) return false;
  const supplied = Buffer.from(tokenDigest(match[1]), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function safeSlug(title) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "little-universe";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

async function serveStatic(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: "Invalid URL path." });
    return;
  }
  const asset = requestedPath === "/"
    ? path.join(publicDirectory, "index.html")
    : path.resolve(publicDirectory, `.${requestedPath}`);
  if (!asset.startsWith(`${publicDirectory}${path.sep}`) && asset !== path.join(publicDirectory, "index.html")) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }
  let file = asset;
  try {
    if (!(await stat(file)).isFile()) throw new Error("Not a file");
  } catch {
    file = path.join(publicDirectory, "index.html");
  }
  const mime = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".mp3": "audio/mpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
  }[path.extname(file).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "content-type": mime,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "cache-control": file.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
    "content-security-policy": "default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; worker-src 'self' blob:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
  });
  if (request.method === "HEAD") {
    response.end();
  } else {
    createReadStream(file).pipe(response);
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  const pathname = requestUrl.pathname;
  try {
    if (pathname === "/api/health" && request.method === "GET") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (pathname === "/api/events" && request.method === "POST") {
      const body = await readJson(request);
      const event = cleanEvent(body.event);
      const slug = safeSlug(event.title);
      const token = randomBytes(32).toString("base64url");
      const now = new Date().toISOString();
      insertEvent.run(slug, JSON.stringify(event), tokenDigest(token), now, now);
      sendJson(response, 201, { slug, managementToken: token });
      return;
    }

    const eventMatch = /^\/api\/events\/([a-z0-9-]+)$/.exec(pathname);
    if (eventMatch && request.method === "GET") {
      const row = database.prepare("SELECT content FROM events WHERE slug = ?").get(eventMatch[1]);
      if (!row) {
        sendJson(response, 404, { error: "This event page could not be found." });
        return;
      }
      sendJson(response, 200, { event: JSON.parse(row.content) });
      return;
    }

    const replyMatch = /^\/api\/events\/([a-z0-9-]+)\/replies$/.exec(pathname);
    if (replyMatch && request.method === "POST") {
      if (!database.prepare("SELECT 1 FROM events WHERE slug = ?").get(replyMatch[1])) {
        sendJson(response, 404, { error: "This event page could not be found." });
        return;
      }
      const body = await readJson(request);
      const name = text(body.name, "Your name", 80, true);
      const responseType = body.response;
      if (!responses.has(responseType)) {
        sendJson(response, 400, { error: "Choose one of the response options." });
        return;
      }
      const message = text(body.message, "Your note", 500);
      insertReply.run(replyMatch[1], name, responseType, message, new Date().toISOString());
      sendJson(response, 201, { message: "Your response has been sent. Thank you!" });
      return;
    }

    const manageMatch = /^\/api\/events\/([a-z0-9-]+)\/manage$/.exec(pathname);
    if (manageMatch && (request.method === "GET" || request.method === "PUT")) {
      const row = database.prepare("SELECT content, edit_token_hash FROM events WHERE slug = ?").get(manageMatch[1]);
      if (!row) {
        sendJson(response, 404, { error: "This event page could not be found." });
        return;
      }
      if (!ownerAuthorized(request, row.edit_token_hash)) {
        sendJson(response, 401, { error: "The private management link is invalid or expired." });
        return;
      }
      if (request.method === "PUT") {
        const body = await readJson(request);
        const event = cleanEvent(body.event);
        updateEvent.run(JSON.stringify(event), new Date().toISOString(), manageMatch[1]);
        sendJson(response, 200, { message: "Your event page has been updated." });
        return;
      }
      const replies = database.prepare(
        "SELECT id, name, response, message, created_at AS createdAt FROM replies WHERE event_slug = ? ORDER BY id DESC LIMIT 200"
      ).all(manageMatch[1]);
      sendJson(response, 200, { event: JSON.parse(row.content), replies });
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "API route not found." });
      return;
    }
    await serveStatic(request, response, pathname);
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    const status = Number(error.status) || 500;
    if (status >= 500) console.error("Request failed:", error.message);
    sendJson(response, status, {
      error: status >= 500 ? "The server could not complete that request." : error.message
    });
  }
});

server.listen(port, host, () => {
  console.log(`Commit to Together is listening on http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => {
      database.close();
      process.exit(0);
    });
  });
}
