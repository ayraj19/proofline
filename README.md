# Proofline landing page

Static site: `index.html`, `styles.css`, `script.js`. No build step.

## Deploy on GitHub Pages
1. Create a new GitHub repository and upload these files to its root.
2. Go to Settings > Pages, set Source to "Deploy from a branch", pick `main` and `/ (root)`, then Save.
3. Your site goes live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Before you launch
- Replace "Proofline" with your product name (index.html, page title).
- Connect the signup form: create a free form at https://formspree.io and replace `YOUR_FORM_ID` in index.html.
- Replace `hello@example.com` with your email (index.html and script.js).
- Calculator win rates (20% without proof, 55% with) are illustrative; adjust in script.js (`WIN_WITHOUT`, `WIN_WITH`).
