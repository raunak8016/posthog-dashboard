# PostHog Engineering Impact Dashboard

React + FastAPI dashboard showing the top 5 most impactful engineers in the PostHog/posthog repo over the last 90 days.

## Stack

- **Frontend**: React + Vite → deployed to GitHub Pages
- **Backend**: Python + FastAPI → deployed to AWS App Runner

## Local development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GitHub token
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend (AWS App Runner)
1. Build and push Docker image to ECR (see deployment guide)
2. Create App Runner service pointing at ECR image
3. Add `GITHUB_TOKEN` env var in App Runner console
4. Copy the App Runner URL

### Frontend (GitHub Pages)
1. Add `VITE_API_URL` secret in GitHub repo settings → Secrets → Actions
2. Push to `main` — GitHub Actions handles the rest

Live at: `https://<your-username>.github.io/posthog-dashboard/`

## Impact scoring

| Signal | Weight | How it's measured |
|---|---|---|
| PR complexity | 30% | log(additions + deletions + files×10) |
| Review depth | 25% | reviews left × quality weight |
| Breadth | 15% | distinct codebase areas touched |
| Consistency | 15% | active weeks ÷ 13 |
| Unblocking ratio | 15% | reviews given ÷ own PRs |
