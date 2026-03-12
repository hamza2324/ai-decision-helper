const API_KEY = "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";
const MODEL = "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";


const situationEl = document.getElementById("situation");
const optionAEl = document.getElementById("optionA");
const optionBEl = document.getElementById("optionB");
const priorityEl = document.getElementById("priority");
const analyzeBtn = document.getElementById("analyzeBtn");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("results");
const charCountEl = document.getElementById("charCount");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");

const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const scoreAEl = document.getElementById("scoreA");
const scoreBEl = document.getElementById("scoreB");
const barA = document.getElementById("barA");
const barB = document.getElementById("barB");
const summaryAEl = document.getElementById("summaryA");
const summaryBEl = document.getElementById("summaryB");
const insightEl = document.getElementById("insight");
const actionStepEl = document.getElementById("actionStep");
const riskBadge = document.getElementById("riskBadge");
const timeBadge = document.getElementById("timeBadge");
const toneBadge = document.getElementById("toneBadge");
const cardA = document.getElementById("cardA");
const cardB = document.getElementById("cardB");

const placeholders = [
  "Should I quit my job and freelance?",
  "Move to a new city or stay?",
  "Accept this offer or wait for better?"
];

let urgencyValue = "Low";
let placeholderIndex = 0;

const setError = (message) => {
  errorMessage.textContent = message;
  errorBox.classList.add("show");
};

const clearError = () => {
  errorMessage.textContent = "";
  errorBox.classList.remove("show");
};

const showLoading = () => {
  loadingEl.classList.add("show");
  loadingEl.setAttribute("aria-hidden", "false");
};

const hideLoading = () => {
  loadingEl.classList.remove("show");
  loadingEl.setAttribute("aria-hidden", "true");
};

const rotatePlaceholder = () => {
  placeholderIndex = (placeholderIndex + 1) % placeholders.length;
  situationEl.classList.add("placeholder-fade");
  setTimeout(() => {
    situationEl.placeholder = placeholders[placeholderIndex];
    situationEl.classList.remove("placeholder-fade");
  }, 250);
};

setInterval(rotatePlaceholder, 3000);

const updateCharCount = () => {
  charCountEl.textContent = situationEl.value.length.toString();
};

situationEl.addEventListener("input", updateCharCount);

const toggleButtons = document.querySelectorAll(".toggle-btn");

toggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    toggleButtons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    urgencyValue = btn.dataset.value;
  });
});

const setBadge = (el, label, value, color) => {
  el.textContent = `${label}: ${value}`;
  el.style.borderColor = color;
  el.style.background = `${color}22`;
};

const normalizeScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(100, Math.max(0, Math.round(num)));
};

const parseJsonFromText = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw err;
  }
};

const renderResults = (data) => {
  const scoreA = normalizeScore(data.scoreA);
  const scoreB = normalizeScore(data.scoreB);
  const winner = data.winner === "B" ? "B" : "A";

  labelA.textContent = optionAEl.value || "Option A";
  labelB.textContent = optionBEl.value || "Option B";
  scoreAEl.textContent = `${scoreA}%`;
  scoreBEl.textContent = `${scoreB}%`;
  summaryAEl.textContent = data.summaryA || "";
  summaryBEl.textContent = data.summaryB || "";
  insightEl.textContent = data.insight || "";
  actionStepEl.textContent = data.actionStep || "";

  barA.style.width = "0%";
  barB.style.width = "0%";
  requestAnimationFrame(() => {
    barA.style.width = `${scoreA}%`;
    barB.style.width = `${scoreB}%`;
  });

  cardA.style.animation = "none";
  cardB.style.animation = "none";
  cardA.offsetHeight;
  cardB.offsetHeight;
  cardA.style.animation = "";
  cardB.style.animation = "";
  cardA.style.animationDelay = "0ms";
  cardB.style.animationDelay = "120ms";

  cardA.classList.remove("win");
  cardB.classList.remove("win");
  if (winner === "A") {
    cardA.classList.add("win");
  } else {
    cardB.classList.add("win");
  }

  setBadge(riskBadge, "Risk", data.riskLevel || "Medium", "#f59e0b");
  setBadge(timeBadge, "Timeframe", data.timeframe || "Both", "#38bdf8");
  setBadge(toneBadge, "Tone", data.emotionalTone || "Balanced", "#a855f7");

  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
};

const buildPrompt = () => {
  const situation = situationEl.value.trim();
  const optionA = optionAEl.value.trim();
  const optionB = optionBEl.value.trim();
  const priority = priorityEl.value || "Not specified";
  const urgency = urgencyValue;

  return {
    system: "You are a wise, empathetic decision coach. Analyze the user's situation with emotional intelligence. Return a JSON object with: { scoreA: number(0-100), scoreB: number(0-100), winner: 'A' or 'B', summaryA: string (2 sentences, pros/cons of option A), summaryB: string (2 sentences, pros/cons of option B), insight: string (1 powerful paragraph - honest, warm, direct advice), riskLevel: 'Low'|'Medium'|'High', timeframe: 'Short-term win'|'Long-term win'|'Both', emotionalTone: 'Logical'|'Emotional'|'Balanced', actionStep: string (one concrete next step the user can take today) }. Return ONLY the JSON object.",
    user: `Situation: ${situation}\nOption A: ${optionA}\nOption B: ${optionB}\nPriority: ${priority}\nUrgency: ${urgency}`
  };
};

const validateInputs = () => {
  if (!situationEl.value.trim()) {
    setError("Please describe your situation so the analysis can be meaningful.");
    return false;
  }
  if (!optionAEl.value.trim() || !optionBEl.value.trim()) {
    setError("Please fill in both Option A and Option B.");
    return false;
  }
  return true;
};

const analyzeDecision = async () => {
  clearError();
  if (!validateInputs()) {
    return;
  }

  if (!API_KEY || API_KEY === "your-key-here") {
    setError("Add your Groq API key in script.js (API_KEY) before analyzing.");
    return;
  }

  const { system, user } = buildPrompt();

  try {
    showLoading();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.4
      })
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const payload = await response.json();
    if (!response.ok) {
      const apiMessage = payload?.error?.message || "The analysis service could not be reached.";
      throw new Error(apiMessage);
    }

    const message = payload.choices?.[0]?.message?.content || "";
    const data = parseJsonFromText(message);
    renderResults(data);
  } catch (err) {
    setError(err?.message || "We couldn't analyze that right now. Please try again in a moment.");
  } finally {
    hideLoading();
  }
};

analyzeBtn.addEventListener("click", analyzeDecision);
retryBtn.addEventListener("click", analyzeDecision);

copyBtn.addEventListener("click", async () => {
  const text = `${insightEl.textContent}\n\nNext step: ${actionStepEl.textContent}`.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy Insight";
    }, 1800);
  } catch (err) {
    copyBtn.textContent = "Copy failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy Insight";
    }, 1800);
  }
});

resetBtn.addEventListener("click", () => {
  situationEl.value = "";
  optionAEl.value = "";
  optionBEl.value = "";
  priorityEl.value = "";
  updateCharCount();
  resultsEl.hidden = true;
  barA.style.width = "0%";
  barB.style.width = "0%";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const canvas = document.getElementById("orb-canvas");
const ctx = canvas.getContext("2d");
let orbs = [];

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const createOrbs = () => {
  orbs = Array.from({ length: 14 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 20 + Math.random() * 60,
    vx: -0.2 + Math.random() * 0.4,
    vy: -0.2 + Math.random() * 0.4,
    alpha: 0.05 + Math.random() * 0.15
  }));
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  orbs.forEach((orb) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(56, 189, 248, ${orb.alpha})`;
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.fill();

    orb.x += orb.vx;
    orb.y += orb.vy;

    if (orb.x < -orb.r) orb.x = canvas.width + orb.r;
    if (orb.x > canvas.width + orb.r) orb.x = -orb.r;
    if (orb.y < -orb.r) orb.y = canvas.height + orb.r;
    if (orb.y > canvas.height + orb.r) orb.y = -orb.r;
  });
  requestAnimationFrame(draw);
};

resizeCanvas();
createOrbs();
draw();
window.addEventListener("resize", () => {
  resizeCanvas();
  createOrbs();
});

updateCharCount();
