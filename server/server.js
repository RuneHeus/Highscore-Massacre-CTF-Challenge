import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { createScoreHandlers } from "./scoreHandlers.js";

const app = express();
app.disable("x-powered-by");
const prisma = new PrismaClient();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_LORE_ROOT = path.resolve(__dirname, "../public");
const SANDBOX_ALLOWED_ROOT = path.resolve(__dirname, "../sandbox");

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000"
]);

// Helper to handle errors consistently
const handleError = (res, err, statusCode = 500) => {
  console.error(err);
  res.status(statusCode).json({ success: false, error: "Internal server error" });
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join("; ")
  );
  next();
});

const handlers = createScoreHandlers(prisma, { onError: handleError });

app.post("/score", (req, res) => handlers.handlePostScore(req, res));

app.get("/leaderboard/:gameId", (req, res) => handlers.handleGetLeaderboard(req, res));

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../public", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

const VIRTUAL_ROOTS = {
  public: PUBLIC_LORE_ROOT,
  sandbox: SANDBOX_ALLOWED_ROOT
};

app.get("/lore/book", (req, res) => {
  const virtualPath = (req.query.path || "").replace(/^\/+/, "");

  if (virtualPath === "") {
    const rootLinks = Object.keys(VIRTUAL_ROOTS)
      .map(name => `<li><a href="/lore/book?path=${name}/">${name}/</a></li>`)
      .join("");

    return res.send(renderPage("Archive Root", rootLinks));
  }

  const [rootName, ...rest] = virtualPath.split("/");

  const baseRoot = VIRTUAL_ROOTS[rootName];
  if (!baseRoot) {
    return res.status(403).send("The path collapses into darkness.");
  }

  const relativePath = rest.join("/");
  const resolvedPath = path.resolve(path.join(baseRoot, relativePath));

  if (!resolvedPath.startsWith(baseRoot)) {
    return res.status(403).send("The path collapses into darkness.");
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).send("Nothing remains here.");
  }

  const stat = fs.statSync(resolvedPath);

  // ---- DIRECTORY LISTING ----
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

    const listItems = entries.map(entry => {
      const suffix = entry.isDirectory() ? "/" : "";
      const nextPath = `${rootName}/${relativePath ? relativePath + "/" : ""}${entry.name}`;
      return `<li><a href="/lore/book?path=${encodeURIComponent(nextPath)}">${entry.name}${suffix}</a></li>`;
    }).join("");

    return res.send(
      renderPage(
        `Index of /${rootName}/${relativePath}`,
        listItems || "<li>(empty)</li>"
      )
    );
  }

  // ---- FILE ----
  res.sendFile(resolvedPath);
});

// ---- SIMPLE HTML RENDERER ----
function renderPage(title, listItems) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { background:#000; color:#ccc; font-family: monospace; }
          a { color:#b30000; text-decoration:none; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <ul>${listItems}</ul>
        <p><a href="/lore/book">← root</a></p>
      </body>
    </html>
  `;
}

app.post("/claim-ctf", (req, res) => handlers.handleClaimCtf(req, res));

const DIST_PATH = path.join(__dirname, "../dist");

app.use(express.static(DIST_PATH));

app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});