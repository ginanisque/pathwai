# PathWAI Demo Video Script

Target length: 2 minutes 45 seconds  
Demo URL: https://main.d3stapbc49hg8.amplifyapp.com/  
Repository: https://github.com/ginanisque/pathwai

## Before recording

- Use a synthetic Firebase account and synthetic traveller details only.
- Confirm the latest Amplify deployment is successful.
- Confirm the AWS agent has Gemini configured; otherwise describe the response as memory-only.
- Prepare one safe memory such as: “I prefer a monthly housing budget below €1,200.”
- Do not upload real passports, statements, contact details, or location data.
- Close unrelated tabs and increase browser zoom enough for labels to remain readable.

## 0:00–0:15 — Introduce the problem

**On screen:** Open the PathWAI landing page and pause on the traveller banner.

**Narration:**

> International travel and relocation involve changing requirements, scattered documents, and repeated questions. PathWAI is a memory-aware mobility assistant that helps travellers organize their context and turn it into clear next actions without pretending to replace official authorities or legal advice.

## 0:15–0:35 — Start a synthetic journey

**On screen:** Select **Start Travel Planning**. Enter a synthetic route such as Nigeria to Portugal, choose remote work, and initialize the roadmap.

**Narration:**

> I start with only the essentials: origin, destination, purpose, and intended visa route. PathWAI turns those inputs into a structured workspace for planning, document readiness, destination research, and milestones.

## 0:35–0:55 — Show truthful readiness guidance

**On screen:** Open the pre-departure readiness review. Point to **Checklist Readiness** and the official-source disclaimer.

**Narration:**

> The readiness score is deliberately framed as a checklist—not a probability of visa approval. Self-reported information is not treated as verified evidence, and travellers are prompted to confirm changing thresholds and procedures with official authorities before acting.

## 0:55–1:15 — Explain the qualifying architecture

**On screen:** Briefly show the architecture section in the GitHub README.

**Narration:**

> The React frontend is hosted with AWS Amplify. Authenticated agent requests go through API Gateway to an AWS Lambda function. Database credentials stay in AWS Secrets Manager, while CockroachDB Cloud stores user-scoped structured memories and performs vector similarity search over 768-dimensional embeddings.

## 1:15–1:40 — Save an explicit memory

**On screen:** Sign in, open **Mobility AI Advisor**, enable persistent memory, and show the privacy notice. Ask: “Remember that I prefer a monthly housing budget below €1,200.”

**Narration:**

> Persistent memory is disabled by default. After explicit opt-in, the authenticated Lambda can save a minimized preference in CockroachDB. PathWAI rejects patterns such as passport numbers and precise coordinates, and the user can inspect what was stored.

## 1:40–2:05 — Demonstrate recall

**On screen:** Refresh the page or begin a visibly new chat. Ask: “How should that preference change my Portugal plan?” Show the recalled-memory panel and the answer.

**Narration:**

> In a later interaction, the agent retrieves semantically relevant memories for this Firebase user only. The recalled housing constraint changes the recommendation, and the interface shows the memory’s type, timestamp, and provenance instead of hiding the context used.

## 2:05–2:25 — Demonstrate user control

**On screen:** Select **Forget** beside the housing preference, confirm it disappears, and repeat the question if time permits.

**Narration:**

> Memory remains under the traveller’s control. A user can forget an individual item, and future answers no longer receive that context. High-risk document scans, emergency contacts, and precise locations are intentionally excluded from agent memory.

## 2:25–2:40 — Show failure honesty

**On screen:** Briefly show the document-readiness panel or its disclaimer. Do not upload a real document.

**Narration:**

> PathWAI also fails closed. If AI is unavailable, it does not fabricate successful document extraction. Metadata-only files remain pending review with zero extraction confidence, and every recommendation is presented as informational guidance requiring official verification.

## 2:40–2:55 — Close

**On screen:** Return to the landing page, then show the public GitHub repository and MIT license.

**Narration:**

> PathWAI demonstrates a safer kind of continuous travel assistance: explicit memory, authenticated retrieval, visible provenance, and user-controlled deletion—built with AWS, CockroachDB, Gemini, Firebase, and Codex. The application and MIT-licensed source are publicly available.

## Recording checklist

- Keep the final video below the event’s maximum duration.
- Show the public URL in the browser address bar.
- Show one successful save, one cross-session recall, and one deletion.
- Keep the CockroachDB and AWS explanation under 25 seconds.
- Avoid displaying `.env`, AWS Secrets Manager values, access keys, database URLs, or personal data.
- Add captions and trim loading delays.
- Verify the recorded URLs and on-screen text before uploading.
