# AI Decision Helper

Static page that sends a situation plus Option A/B to **Groq** (`llama-3.3-70b-versatile`) and renders JSON scores, insight, and a next action.

Vercel config: `vercel.json`.

## Honest setup

The Groq key must **not** live in client-side `script.js`. Use a tiny serverless proxy, or paste a key only in a local untracked file. A key was previously hardcoded in this repo — **rotate it**.

## Run locally

```bash
git clone https://github.com/hamza2324/ai-decision-helper.git
cd ai-decision-helper
```

Serve the folder (any static server). The browser calls `https://api.groq.com/openai/v1/chat/completions` directly.

## Limitations

- Exposing a Groq key in frontend JavaScript is unsafe.
- Advice is LLM-generated, not professional counseling.
