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
│   └── main.js       # apply-form validation + FAQ accordion
├── styles/
│   └── main.scss     # page styles
├── fonts/
├── favicon.ico
└── robots.txt
test/                 # Mocha test runner (test/index.html, test/spec)
gulpfile.js           # build & serve tasks
```

The production build outputs to `dist/`.

## Page behavior

- **Apply form** — fields (name, mobile, email, city, pincode) are validated on blur and on submit; inline error messages appear and clear as the user corrects input.
- **FAQ accordion** — clicking a question opens it and closes the others, toggling `aria-expanded` for accessibility.

## Conventions

CSS classes use kebab-case with BEM (`block__element--modifier`), e.g. `apply-form__input--error`, `faq-item--open`.
