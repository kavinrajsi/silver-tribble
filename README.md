# KVB

A static marketing landing page for the **Samriddhi 400** deposit scheme (333 & 444 plans). The page presents the scheme's deposit amounts, tenure, special benefits, an "Apply now" lead form with client-side validation, and a FAQ accordion.

Scaffolded with the [Yeoman](https://yeoman.io/) `generator-webapp` and built with a [Gulp](https://gulpjs.com/) pipeline (Sass, Babel, PostCSS/Autoprefixer, image optimization, and live reload via BrowserSync).

## Tech stack

- **Gulp 4** — build and dev-server task runner
- **Sass** — styles (`app/styles/main.scss`)
- **Babel** — ES module → browser-compatible JS transpilation
- **PostCSS** (Autoprefixer, cssnano) — CSS post-processing and minification
- **jQuery 3** — DOM helper (loaded for the page)
- **BrowserSync** — local dev server with live reload
- **Mocha + Chai** — test harness

## Prerequisites

- Node.js `>= 4` (developed on a current LTS/Node 20+)
- npm or yarn (a `yarn.lock` is committed)

## Getting started

```bash
# install dependencies
npm install

# start the dev server with live reload
npm start
```

`npm start` runs `gulp serve`, which compiles styles/scripts and opens the app in your browser with live reload on file changes.

## npm scripts

| Script | Description |
| --- | --- |
| `npm start` | Run the dev server (`gulp serve`) with live reload. |
| `npm run build` | Production build to `dist/` (`NODE_ENV=production gulp`). |
| `npm run serve:dist` | Build and serve the production output. |
| `npm run serve:test` | Serve the test runner (`NODE_ENV=test gulp serve`). |
| `npm test` | Alias for `serve:test`. |
| `npm run tasks` | List all available Gulp tasks. |

## Project structure

```
app/                  # source
├── index.html        # landing page markup
├── images/           # banner art (desktop/mobile, png + webp)
├── scripts/
│   └── main.js       # apply-form validation + AJAX submit + FAQ accordion
├── styles/
│   └── main.scss     # page styles
├── submit.php        # server-side validation + lead email (To/Cc/Bcc)
├── fonts/
├── favicon.ico
└── robots.txt
test/                 # Mocha test runner (test/index.html, test/spec)
gulpfile.js           # build & serve tasks
```

The production build outputs to `dist/`.

## Page behavior

- **Apply form** — fields (name, mobile, email, city, pincode, consent) are validated on blur/change and on submit; inline error messages appear and clear as the user corrects input. On a valid submit the form is sent asynchronously (`fetch`) to `submit.php`, which **re-validates server-side** and emails the lead before returning a JSON result that drives the success/error status message.
- **FAQ accordion** — clicking a question opens it and closes the others, toggling `aria-expanded` for accessibility.

### Form handler (`submit.php`)

`submit.php` re-runs the same validation rules on the server (the client checks are convenience only) and, on success, sends the lead email via PHP's `mail()` to the configured recipients. Configure recipients with environment variables (falling back to the placeholders in the file):

| Variable | Purpose |
| --- | --- |
| `LEAD_MAIL_TO` | Primary recipient(s) — comma-separated |
| `LEAD_MAIL_CC` | Cc recipient(s) — comma-separated (optional) |
| `LEAD_MAIL_BCC` | Bcc recipient(s) — comma-separated (optional) |
| `LEAD_MAIL_FROM` | `From:` address for the outgoing mail |

User input is stripped of CR/LF before going into any mail header to prevent header injection.

> **Note:** `submit.php` requires a PHP-capable host. The local Gulp/BrowserSync dev server serves static files only and will not execute it. The `extras` Gulp task copies `submit.php` into `dist/` on build.

## Conventions

CSS classes use kebab-case with BEM (`block__element--modifier`), e.g. `apply-form__input--error`, `faq-item--open`.
