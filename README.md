# IG Insight Studio

Create a simple, clean, modern Instagram Audit web app.

The design should feel like a polished Instagram analytics tool, but keep it minimal and easy to use. Do NOT make it overly complicated or dashboard-heavy.

Visual Style

White background as the main color.

Soft pink accents.

Use Instagram-inspired gradient colors subtly: pink, purple, orange, and blue.

Rounded cards and buttons.

Soft shadows.

Clean modern typography.

Lots of white space.

Cute, premium, friendly aesthetic.

Avoid excessive gradients, animations, charts, icons, or visual clutter.

The overall feeling should be: Instagram + clean SaaS + soft feminine aesthetic.

Landing Page

At the center of the page, create:

Instagram Audit

A short subtitle:

"Discover what's working on your Instagram — and what to improve."

Then a large rounded input:

"Paste Instagram profile URL"

Example placeholder:
"https://instagram.com/username"

Below it, add a prominent pink/Instagram-gradient button:

"Analyze Account"

Add a small line below:

"Get a data-driven content audit in seconds."

Loading State

When the user clicks Analyze Account:

Show a clean loading screen/card with:

"Analyzing your Instagram..."

Then smaller status messages that can change:

"Fetching your content..."
"Analyzing engagement..."
"Finding your top-performing content..."
"Generating recommendations..."

Keep the loading animation subtle.

Results Page

After the backend returns the audit, replace the landing page with a clean results dashboard.

At the top:

"Instagram Content Audit"

Show the analyzed Instagram username/profile if available.

Overview Cards

Create 3–4 simple cards:

Posts Analyzed

Average Engagement

Total Views

Evidence Strength

Use large numbers and small labels.

Overall Performance

Create a clean card containing the AI's overall performance summary.

Top Performers

Create a clean table:

PostReason

Each top-performing post should appear as a row/card.

Underperformers

Create another clean table/card showing:

PostReason

Content Patterns

Display the content patterns as clean bullet cards.

Caption Insights

Display the caption insights in a simple section.

Hashtag Insights

Display hashtag insights in a simple section.

Engagement Patterns

Display engagement insights in a simple section.

Recommendations

This should be one of the most visually prominent sections.

Display each recommendation as a numbered card:

Recommendation
Action

Recommendation
Action

Use subtle pink/Instagram accents.

Data Quality

If data quality issues exist, show a small warning section explaining that some metrics may be unreliable.

Limitations

Show the limitations in a simple collapsible or understated section.

Navigation

Keep navigation extremely simple.

Top-left:
"IG Audit"

Top-right:
"New Audit"

Clicking "New Audit" should return the user to the URL input page.

Responsive Design

The website must work beautifully on:

Desktop

Tablet

Mobile

On mobile, tables should become stacked cards rather than overflowing horizontally.

Important Technical Requirement

Build the frontend so that the Instagram URL input can later call an external backend API.

Create a clean API service/function such as:

analyzeInstagramProfile(instagramUrl)

For now, use mock data if the backend endpoint is not connected yet.

Structure the frontend so that replacing the mock API with the real n8n webhook URL is easy.

The expected backend response will eventually look like:

{
"success": true,
"summary": {
"evidence_strength": "...",
"overall_performance": "..."
},
"top_performers": [],
"underperformers": [],
"content_patterns": [],
"caption_insights": [],
"hashtag_insights": [],
"engagement_patterns": [],
"recommendations": [],
"data_quality_issues": [],
"limitations": []
}

Do not build a complicated authentication system, database, user accounts, payments, admin panel, or unnecessary features.

The goal is a simple single-purpose application:

Paste Instagram URL → Analyze → Beautiful Instagram audit report.

Make the interface feel polished enough that it could be shown to a real client.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/edaf7966-6000-4f26-82b6-93a6a5de8185).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Backend Automation

The backend of this Instagram Audit application is built with **n8n**, providing an end-to-end automation workflow that connects the frontend with Instagram data extraction and AI-powered analysis.

### Workflow

1. **Webhook Trigger** — Receives the Instagram username from the frontend.
2. **Instagram Data Extraction** — Uses **Apify** to collect the required Instagram profile and content data.
3. **Data Processing** — Processes and structures the collected data for analysis.
4. **AI Analysis** — Uses **OpenAI** to analyze the Instagram data and generate actionable audit insights.
5. **Audit Response** — Returns the generated audit results to the frontend.

### Backend Architecture

```text
Frontend
   │
   │ POST Request
   ▼
n8n Production Webhook
   │
   ▼
Apify
   │
   ▼
Data Processing
   │
   ▼
OpenAI
   │
   ▼
Audit Results
   │
   ▼
Frontend

