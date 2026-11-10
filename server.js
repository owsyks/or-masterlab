const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3456;
const DEFAULT_NIM_API_KEY =
  process.env.NVIDIA_NIM_API_KEY ||
  "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";

let runtimeApiKey = DEFAULT_NIM_API_KEY;

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const TEXT_MODELS = [
  "nvidia/nemotron-3.5-lightning-30b-a3b",
  "nvidia/nemotron-3.5-super-vl-120b-a12b",
  "nvidia/nemotron-3.5-bolt-e4b",
];

const VISION_MODELS = [
  "nvidia/nemotron-3.5-super-vl-120b-a12b",
];

const OR_PROFESSOR_SYSTEM_PROMPT = `You are Prof. RO (Recherche Opérationnelle / Operations Research AI Professor) for 3rd-year Computer Science Engineering (ING3-SI, Université Oran 1 / TELECOM Nancy curriculum, K. ISKAFI textbook).

Your goal is to teach, guide, generate exercises, and correct student work with 100% mathematical rigor AND crystal-clear intuition ("Explain like I'm 5" analogies + exact exam recipes).

KEY CURRICULUM RULES & CONVENTIONS YOU MUST KNOW:
1. CHAPTER 1 - LP Formulation & Graphical Method (Méthode Graphique / Droites Parallèles):
   - Always identify: (a) Decision variables (with units & non-negativity x_j >= 0), (b) Objective function Z (Max profit or Min cost), (c) Linear constraints.
   - Graphical method (2 variables): Plot boundary lines (set inequality to '='), test (0,0) to shade/orient half-planes, identify the feasible convex polygon (polyèdre convexe), label corner vertices (A, B, C...), and evaluate Z at each vertex OR slide the iso-profit line Delta (slope = -c1/c2) away from origin for Max (toward origin for Min).
   - Special cases: Iso-profit parallel to an active constraint edge -> Multiple optimal solutions (whole segment [A,B]); Unbounded region in direction of improvement -> Unbounded (Z -> +infinity); Contradictory constraints -> Infeasible (Ensemble vide).

2. CHAPTERS 2 & 3 - Simplex Algorithm (Tableau & Dictionary Methods):
   - Standard Form: Make all RHS b_i >= 0 first (multiply row by -1 and flip inequality if b_i < 0).
   - <= constraint: add slack variable +e_i (variable d'écart).
   - >= constraint: subtract surplus -e_i and add artificial +a_i (for Big-M / Two-Phase).
   - = constraint: add artificial +a_i.
   - Basic Variables (v.b. / dans la base) vs Non-Basic Variables (v.h.b. = 0). Max number of bases <= C(n+m, m).
   - Tableau Method Conventions (Explain clearly depending on what the student uses):
     * Convention Positif (c_j - z_j): For Max, enter variable with MOST POSITIVE (c_j - z_j > 0); stop when all c_j - z_j <= 0.
     * Convention Négatif (z_j - c_j or -c_j): For Max, enter variable with MOST NEGATIVE value; stop when all >= 0.
   - Leaving Variable (Variable sortante): Minimum ratio test min { b_i / a_{i,e} | a_{i,e} > 0 }. NEVER divide by 0 or a negative number!
   - Pivoting (Gauss-Jordan):
     * Pivot row: R_p' <- R_p / pivot
     * Other rows: R_i' <- R_i - (a_{i,e}) * R_p'

3. CHAPTER 4 - Initialization (Big-M & Two-Phase) & Special Cases:
   - Big-M (Méthode de Grand M): Penalize artificial variables in objective (-M*a_i for Max, +M*a_i for Min). Crucial step before Iteration 1: eliminate artificial variables from the objective row using R_z <- R_z + M * R_i so basic artificial columns have 0 reduced cost!
   - If any artificial variable remains in the basis with value > 0 at the end -> LP is INFEASIBLE.
   - Unboundedness (Non borné): Entering variable column has all a_{i,e} <= 0.
   - Degeneracy (Dégénérescence): A basic variable has b_i = 0 (happens after a tie in the minimum ratio test; geometrically 3+ lines meet at one vertex). Can lead to cycling (Beale's example); prevented by Bland's Rule (pick smallest index on ties).
   - Exam Scope Note: Two-Phase Method and Cutting Planes (Plans Coupants) are marked as optional/excluded from the Oran 1 final exam, whereas Graphical, Simplex Tableau, Big-M, Duality, Complementary Slackness, Sensitivity Analysis, 0/1 Knapsack B&B, and Linearisation are HIGH PRIORITY EXAM TOPICS.

4. CHAPTER 5 - Duality, Complementary Slackness & Dual Simplex:
   - Primal (Max Z = c^T x s.t. A x <= b, x >= 0) <-> Dual (Min W = b^T y s.t. A^T y >= c, y >= 0).
   - Sign rules between Max Primal and Min Dual:
     * Constraint <=  <-->  y_i >= 0
     * Constraint >=  <-->  y_i <= 0
     * Constraint =   <-->  y_i free (libre de signe)
     * Variable x_j >= 0 <--> Dual constraint >=
     * Variable x_j <= 0 <--> Dual constraint <=
     * Variable x_j free <--> Dual constraint =
   - Strong Duality: Z* = W*. Optimal dual values y_i* appear in the final Primal Simplex Tableau under the slack columns e_i (as -(c_{e_i} - z_{e_i})).
   - Complementary Slackness (Écarts complémentaires):
     * (1) If Primal constraint i has slack e_i* > 0 (not tight) => y_i* = 0.
     * (2) If Dual constraint j has surplus > 0 (not tight) => x_j* = 0 (conversely, if x_j* > 0 => Dual constraint j is an exact equality '=').
   - Dual Simplex: Used when solution is Dual-feasible (optimality condition satisfied in Z-row) but Primal-infeasible (some b_i < 0), e.g. after adding a constraint. Leaving variable = most negative b_i; Entering variable = min ratio |(c_j - z_j) / a_{r,j}| over negative pivot row entries a_{r,j} < 0.

5. CHAPTER 6 - Post-Optimal / Sensitivity Analysis (Analyse de Sensibilité):
   - Q1 (Varying c_k): Let c_k_new = c_k + delta.
     * If x_k is non-basic: only its own reduced cost changes by +delta.
     * If x_k is basic in row r: all non-basic reduced costs change by (c_j - z_j)_new = (c_j - z_j)_old - delta * a_{r,j}. Keep all <= 0 (for Max) to find [c_min, c_max]. Optimal point x* stays the same; Z* becomes Z* + delta * x_k*.
   - Q2 (Varying RHS b_i): Let b_i_new = b_i + Delta.
     * Final RHS column updates as b_new = b_old + Delta * (column of slack e_i in final tableau).
     * Set b_new >= 0 for all rows to find valid range [b_min, b_max].
     * Shadow Price (Prix marginal / dual) = y_i*: each +1 unit of resource i increases Z* by y_i* within the valid range.

6. CHAPTER 7 - Integer Programming (PLNE), Branch & Bound & Linearisation:
   - 0/1 Knapsack B&B: Compute efficiency c_j / a_j, sort descending, solve continuous LP relaxation (fill greedily, take fraction of splitting item k). Branch on fractional item x_k = 1 and x_k = 0. Prune node if: (a) weight > W (infeasible), (b) UB <= Incumbent Z_best, or (c) all integer (update Incumbent).
   - Linearisation tricks:
     * Minimax: Min max(f1(x), f2(x)) -> Min t subject to t >= f1(x), t >= f2(x).
     * Absolute value: |x_2 - 10| -> replace x_2 - 10 = u^+ - u^- and |x_2 - 10| = u^+ + u^- with u^+, u^- >= 0.

Formatting instructions:
- Use clean Markdown and LaTeX math ($...$ for inline, $$...$$ for block).
- Be warm, encouraging, structured, and crystal clear.`;

async function callNimApi({ messages, isVision = false, temperature = 0.3, maxTokens = 3072, customApiKey }) {
  const apiKey = (customApiKey || runtimeApiKey || DEFAULT_NIM_API_KEY).trim();
  const modelsToTry = isVision ? VISION_MODELS : TEXT_MODELS;
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(NIM_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          chat_template_kwargs: { enable_thinking: false },
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`Model ${model} returned HTTP ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      const msg = data.choices?.[0]?.message;
      const content = msg?.content || msg?.reasoning_content || "";
      if (!content) {
        lastError = new Error(`Model ${model} returned empty content`);
        continue;
      }

      return {
        model,
        content,
        reasoning: msg?.reasoning_content || null,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All NVIDIA NIM models failed to respond.");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (req.body) {
    return Promise.resolve(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
  }
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error("Payload too large (max 25MB)"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  const rawUrl =
    req.headers["x-matched-path"] ||
    req.headers["x-vercel-matched-path"] ||
    req.headers["x-forwarded-uri"] ||
    req.url;
  const urlObj = new URL(rawUrl, `http://${req.headers.host || "localhost"}`);
  let pathname = urlObj.pathname;

  if (req.query && req.query.slug) {
    const slugPath = Array.isArray(req.query.slug) ? req.query.slug.join("/") : req.query.slug;
    if (pathname.includes("[...slug]") || pathname.includes("api/index") || pathname === "/api") {
      pathname = "/api/" + slugPath;
    }
  }

  // --------------------------------------------------------------------------
  // API: GET /api/status
  // --------------------------------------------------------------------------
  if (pathname === "/api/status" && req.method === "GET") {
    const maskedKey =
      runtimeApiKey && runtimeApiKey.length > 14
        ? `${runtimeApiKey.slice(0, 10)}...${runtimeApiKey.slice(-4)}`
        : "Configured";
    return sendJson(res, 200, {
      ok: true,
      maskedKey,
      textModels: TEXT_MODELS,
      visionModels: VISION_MODELS,
    });
  }

  // --------------------------------------------------------------------------
  // API: POST /api/config (Update API key at runtime if desired)
  // --------------------------------------------------------------------------
  if (pathname === "/api/config" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      if (body.apiKey && typeof body.apiKey === "string" && body.apiKey.trim().startsWith("nvapi-")) {
        runtimeApiKey = body.apiKey.trim();
        return sendJson(res, 200, {
          ok: true,
          maskedKey: `${runtimeApiKey.slice(0, 10)}...${runtimeApiKey.slice(-4)}`,
        });
      }
      return sendJson(res, 400, { ok: false, error: "Please provide a valid nvapi-... key." });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // API: POST /api/teacher (AI Professor Chat)
  // --------------------------------------------------------------------------
  if (pathname === "/api/teacher" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const { message, history = [], language = "en", contextInfo = "", customApiKey } = body;

      if (!message) {
        return sendJson(res, 400, { ok: false, error: "Message is required." });
      }

      const langInstruction =
        language === "fr"
          ? "Respond primarily in French (with clear mathematical notation)."
          : language === "darija"
          ? "Respond using a friendly mix of Algerian Darija, French OR terms (Simplexe, base, variable d'écart, dualité), and simple everyday analogies!"
          : "Respond primarily in clear English (while mentioning standard French exam terms in parentheses so the student recognizes them on exam day).";

      const messages = [
        {
          role: "system",
          content: `${OR_PROFESSOR_SYSTEM_PROMPT}\n\nLANGUAGE PREFERENCE: ${langInstruction}\n${
            contextInfo ? `\nCURRENT STUDENT CONTEXT:\n${contextInfo}` : ""
          }`,
        },
        ...history.slice(-8).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || ""),
        })),
        { role: "user", content: message },
      ];

      const result = await callNimApi({
        messages,
        isVision: false,
        temperature: 0.35,
        maxTokens: 3072,
        customApiKey,
      });

      return sendJson(res, 200, {
        ok: true,
        model: result.model,
        reply: result.content,
        reasoning: result.reasoning,
      });
    } catch (err) {
      console.error("Teacher API Error:", err);
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // API: POST /api/renew-exo (AI Direct Solution Breakdown & Exam Rules)
  // --------------------------------------------------------------------------
  if (pathname === "/api/renew-exo" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const { topic, difficulty, mathData, language = "en", customApiKey } = body;

      const prompt = `You are a direct, rigorous Operations Research professor.
Provide the DIRECT, CONCISE mathematical solution breakdown and exam guidance for these exact verified mathematical parameters:

TOPIC: ${topic}
DIFFICULTY: ${difficulty}
LANGUAGE: ${language === "fr" ? "French (Français)" : "English"}
EXACT MATHEMATICAL PARAMETERS & VERIFIED SOLUTION:
${JSON.stringify(mathData, null, 2)}

STRICT RULES:
- NEVER write any industrial story, company narrative, factory scenario, or word-problem background. Students want direct mathematics only, no storytelling.
- Output DIRECTLY the mathematical solution insights, pivot rules, and exam traps.

Structure your markdown output concisely (under 160 words):
1. **🎯 Direct Solution Summary**: State optimal objective value $Z^*$ and optimal variables $X^*$ with active constraints.
2. **⚡ Key Method Rules**: 2-3 precise mathematical tips on the exact pivot or bounding rule for this problem.
3. **⚠️ Exam Trap to Avoid**: The #1 error students make on this exact type of problem in exams.`;

      const result = await callNimApi({
        messages: [
          { role: "system", content: OR_PROFESSOR_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        isVision: false,
        temperature: 0.25,
        maxTokens: 600,
        customApiKey,
      });

      return sendJson(res, 200, {
        ok: true,
        model: result.model,
        aiContent: result.content,
      });
    } catch (err) {
      console.error("Renew Exo API Error:", err);
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // API: POST /api/ocr-corrector (Vision OCR + Step-by-Step Math Grader)
  // --------------------------------------------------------------------------
  if (pathname === "/api/ocr-corrector" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const {
        imageBase64,
        studentText = "",
        exerciseTitle = "Operations Research Exercise",
        exerciseStatement = "",
        referenceSolution = "",
        language = "en",
        customApiKey,
      } = body;

      if (!imageBase64 && !studentText.trim()) {
        return sendJson(res, 400, {
          ok: false,
          error: "Please upload an image/photo of your solution or type your solution text.",
        });
      }

      const gradingPrompt = `You are grading a student's Operations Research solution.
LANGUAGE: ${language === "fr" ? "French (Français)" : "English"}

TARGET EXERCISE: ${exerciseTitle}
PROBLEM STATEMENT:
${exerciseStatement || "(Auto-detect the problem from the student's work)"}

VERIFIED REFERENCE SOLUTION (if selected):
${referenceSolution || "(Evaluate mathematical self-consistency of the student's LP/Simplex/Duality/B&B work)"}

${studentText ? `ADDITIONAL STUDENT NOTES / TYPED SOLUTION:\n${studentText}\n` : ""}

Please perform a complete, encouraging, and rigorous evaluation in structured Markdown with these exact sections:
### 1. 🔍 OCR Transcription (What I Read From Your Work)
Transcribe the equations, objective function, constraints, Simplex tableaux, ratios, or Branch-and-Bound nodes visible in the student's image/text using clean LaTeX ($...$ and $$...$$).

### 2. ✅ Step-by-Step Verification
Check each step of the student's work:
- **Formulation & Standard Form** (Variables, Objective, Slack/Surplus/Artificial variables)
- **Entering & Leaving Variable Selection** ($c_j - z_j$ sign convention and minimum ratio test $b_i / a_{ie}$)
- **Pivoting Calculations / Tableaux / B&B Tree** (Check row operations $R_i' \\leftarrow R_i - a_{ie} R_p'$)
- **Conclusion & Optimal Value ($Z^*$, $x^*$)**

### 3. ⚠️ Error Diagnosis & Fixes (Mistakes Pinpointed & Corrected)
If there is any arithmetic mistake, sign flip, wrong pivot choice, or missing constraint, point out the EXACT line/cell where it happened and show how to fix it. If everything is 100% correct, congratulate the student!

### 4. 🏆 Final Grade (/20) & Exam Tips
Give a fair grade out of **20/20** (e.g., **17/20**) with a breakdown of points and 1 key tip for the final exam.`;

      let userContent;
      const hasImage = Boolean(imageBase64 && imageBase64.startsWith("data:image/"));

      if (hasImage) {
        userContent = [
          { type: "text", text: gradingPrompt },
          { type: "image_url", image_url: { url: imageBase64 } },
        ];
      } else {
        userContent = gradingPrompt;
      }

      const result = await callNimApi({
        messages: [
          { role: "system", content: OR_PROFESSOR_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        isVision: hasImage,
        temperature: 0.2,
        maxTokens: 1600,
        customApiKey,
      });

      return sendJson(res, 200, {
        ok: true,
        model: result.model,
        evaluation: result.content,
        reasoning: result.reasoning,
      });
    } catch (err) {
      console.error("OCR Corrector Error:", err);
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // STATIC FILE SERVER (public/)
  // --------------------------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  if (safePath === "/" || safePath === "\\") {
    safePath = "/index.html";
  }
  const filePath = path.join(__dirname, "public", safePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("404 Not Found");
      }
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("500 Internal Server Error");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 OR Study Platform running at: http://localhost:${PORT}`);
    console.log(`🤖 NVIDIA NIM API Key active (${runtimeApiKey.slice(0, 10)}...)`);
    console.log(`================================================================`);
  });
}

module.exports = handleRequest;
module.exports.server = server;
