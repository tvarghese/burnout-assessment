# UPSTREAM Jubilee burnout self-check

A private, single-page self-check for teams preparing the UPSTREAM Jubilee Conference. Answers stay in the browser. Nothing is stored or sent to a server.

## Optional local run

Use this when you want to look at the page before pushing. GitHub Actions publishes the site after a push to `main`. You do not need a local server for the deploy itself.

### Docker

The container name is always `burnout-assessment`, and the page is always on port **4781**. Running the command again rebuilds and replaces that same container.

```bash
docker compose up -d --build
```

Open `http://localhost:4781`.

Stop it with:

```bash
docker compose down
```

### Without Docker

From this folder:

```bash
python3 -m http.server 4781
```

Then visit `http://localhost:4781`.

## Host on GitHub Pages

1. Push this repository to the `main` branch.
2. Open the repository **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. The **Deploy to GitHub Pages** workflow runs on every push to `main`.

The address will look like:

`https://<user>.github.io/burnout-assessment/`

If the repository name is different, use that name instead of `burnout-assessment`.

`.nojekyll` is included so GitHub Pages serves these files as a plain static site.

## Edit the questions

Question text lives in the `QUESTIONS` array in `app.js`. Score bands live in `BANDS` in the same file.
