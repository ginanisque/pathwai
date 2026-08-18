# PathWai

PathWai is a calm, memory-aware travel and immigration-status assistant. Its agent remembers a traveller's explicitly approved preferences, constraints, prior questions, and action plans in CockroachDB, then retrieves relevant context for later conversations. The memory API is deployable on AWS Lambda.

> PathWai provides informational guidance, not legal advice or emergency-service delivery. Use synthetic data for development and verify immigration information with official authorities.

## Hackathon architecture

```text
React/Vite client
  └─ Mobility AI Advisor (explicit memory opt-in and forget controls)
       └─ API Gateway + AWS Lambda
            ├─ Gemini response generation (optional)
            └─ CockroachDB Cloud
                 ├─ structured transactional memories
                 └─ VECTOR(768) similarity search + vector index

Developer workflow
  └─ CockroachDB Cloud Managed MCP Server for schema inspection and safe operations
```

### Required technology use

- **CockroachDB Cloud Managed MCP Server:** used to inspect the Cloud cluster/database, create and verify the memory schema, and audit the resulting vector index.
- **CockroachDB Distributed Vector Indexing:** `pathwai_agent_memories.embedding` is a `VECTOR(768)` column with `pathwai_memories_embedding_idx`. Recall ranks user-scoped memories with the L2 vector operator.
- **AWS Lambda:** `aws/lambda.ts` hosts memory CRUD and the memory-aware agent request. API Gateway exposes the HTTP routes.

Memory is meaningful to the agent: each opted-in question recalls semantically related facts, the answer identifies which memories were used, and the resulting action plan is persisted for future sessions. Users can inspect and forget individual memories.

## Local setup

Requirements: Node.js 24 for the deployed Lambda (Node.js 20+ is sufficient for local development), a CockroachDB Cloud connection string, and optionally a Gemini API key.

```bash
npm install
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local`. Never expose it through a `VITE_` variable or commit it.

Create the schema:

```bash
set -a
source .env.local
set +a
npm run db:migrate
```

Run the app with `npm run dev`. Open the Mobility AI Advisor and select **Enable memory**. The feature is opt-in and warns against storing passport numbers or precise locations.

## Validation

```bash
npm run lint
npm test
npm run build
npm run build:lambda
```

## AWS deployment

The repository contains an AWS SAM template:

```bash
npm run build:lambda
sam build --template-file aws/template.yaml
sam deploy --guided
```

Before deployment, store the CockroachDB connection string in AWS Secrets Manager as `pathwai/database-url`. During guided deployment, provide the optional `GeminiApiKey` and deployed frontend `AllowedOrigin`. Copy the `MemoryApiUrl` stack output into the frontend build environment:

```bash
VITE_AGENT_API_URL=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com npm run build
```

## Frontend hosting

The recommended public-demo topology is:

- **AWS Amplify Hosting:** React/Vite frontend
- **Amazon API Gateway + AWS Lambda:** authenticated agent and memory API
- **AWS Secrets Manager:** CockroachDB connection string
- **CockroachDB Cloud:** durable agent memory and vector search

This repository includes `amplify.yml`, `customHttp.yml`, and `.env.production` for the
deployed `pathwai-memory` API. In AWS Amplify Hosting, connect the GitHub repository,
select the submission branch, and deploy with the detected build specification. Amplify
runs type-checking, tests, and the production build before publishing `dist/`.

After Amplify assigns the public domain, update the backend CORS setting from `*` to that
exact origin and redeploy the `pathwai-memory` stack:

```bash
.tools/bin/sam build --template-file aws/template.yaml --build-dir .aws-sam/build
.tools/bin/sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name pathwai-memory \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ParameterKey=AllowedOrigin,ParameterValue=https://YOUR_AMPLIFY_DOMAIN \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --profile pathwai-deploy \
  --region eu-central-1
```

Do not place `DATABASE_URL`, Firebase private keys, CockroachDB passwords, or AWS
credentials in Amplify environment variables prefixed with `VITE_`; those values become
part of the public browser bundle.

The CockroachDB connection string is resolved from AWS Secrets Manager, and memory routes verify Firebase JWT signature, issuer, audience, expiry, and user identity. Store the optional Gemini key in a server-side secret as well; never expose it to the Vite client.

## Memory API

- `GET /api/memory` — list saved memories
- `POST /api/memory` — save a profile, preference, constraint, conversation, or action plan
- `DELETE /api/memory/:id` — forget one memory
- `POST /api/agent/chat` — recall relevant memories, answer, and persist the new turn

Memory and deployed-agent calls require a Firebase ID token in `Authorization: Bearer <token>`. The Lambda verifies token signature, issuer, audience, expiry and user identity against Google's public signing keys before accessing user-scoped memories.

## Privacy and demo guidance

- Use only synthetic traveller data in demos and tests.
- Memory is disabled until the user opts in.
- Do not store passport numbers, document images, precise locations, abuse narratives, or emergency-contact details in agent memory.
- Database credentials stay in the server/Lambda environment.
- The UI exposes memory provenance and per-memory deletion.
- Document readiness is an AI-generated checklist review, not document authentication or a visa approval prediction. Missing AI fails closed instead of returning synthetic verification.
- Safety and SOS surfaces are prototypes: they do not send SMS/email, notify trusted contacts, or contact emergency services.

## Repository map

- `src/server/agentMemory.ts` — CockroachDB repository and deterministic embedding
- `db/001_agent_memory.sql` — transactional and vector schema
- `aws/lambda.ts` — AWS Lambda agent-memory API
- `aws/template.yaml` — AWS SAM infrastructure
- `src/components/MobilityAiAgentView.tsx` — opt-in, provenance and forget UI

## License

[MIT](LICENSE)
