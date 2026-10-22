# Vector Operations Group (VOG) — Organizational Website

A static, single-page site in plain HTML5, CSS3 and vanilla JavaScript. No framework, no build step, no cookies, no analytics, no storage and **no third-party requests** (fonts are self-hosted).

```
index.html                 all content and structure
styles.css                 design tokens + styling
script.js                  progressive enhancement (intro, nav, reveals, accordion, timeline line)
assets/logo.jpg            the supplied VOG logo, unmodified (primary logo)
assets/favicon-32.png      favicons: crop-only copies of the logo, resized
assets/favicon-192.png
assets/apple-touch-icon.png
assets/fonts/              Archivo, Inter, JetBrains Mono (latin subsets, SIL OFL licences included)
```

## Run it

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8080     # http://localhost:8080
```

## Deploy

Upload the folder as-is to any static host (GitHub Pages, Netlify, Cloudflare Pages, nginx, S3 + CDN). No build command; publish directory is `.`

Suggested response headers (set at the host):

```
Content-Security-Policy: default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self'; font-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```
(`'unsafe-inline'` only covers the one-line progressive-enhancement snippet in `<head>`.)

## The logo

`assets/logo.jpg` is the supplied file, byte-for-byte. It is a JPG with an opaque pure-black background (#000), so the page background is also #000 and the logo sits on it without a seam. Nothing is recoloured, blended, masked or redrawn.

Where it is used (search for `logo.jpg` in `index.html`):

| Place | Markup | Notes |
|---|---|---|
| Intro | `.intro__logo img` | V-shaped wipe, then fade out |
| Header | `.brand .logo-crop img` | Tight crop of the empty black margin, aspect ratio preserved |
| Hero | `.hero__logo .logo-frame img` | Full image, `object-fit: contain`, hairline frame |
| Archive | `.tile__logo img` | "Identity" tile |
| Closing | `.closing__logo .logo-frame img` | Revealed on scroll |
| Footer | `.logo-crop--lg img` | Same crop as header, larger |
| Favicons | `assets/favicon-*.png`, `apple-touch-icon.png` | Cropped from the original, then resized only |

**To replace the logo:** overwrite `assets/logo.jpg` with a new square image (the HTML sets `width="1254" height="1254"`; update those if the dimensions differ). If the new artwork is not centred with the same amount of empty margin, adjust `.logo-crop img` (`width`, `left`, `top`) in `styles.css`, and regenerate the three favicon PNGs. If the new logo is not on pure black, change `--c-bg` (and the frame backgrounds) to match its background.

### How the motion follows the logo
The mark is symmetric, sharp-angled and ends in a V-shaped muzzle. So: the logo is revealed by a **V-shaped wipe** (a `clip-path` polygon whose point echoes the muzzle), framed by **hairline corner marks**; the hero background uses **hairlines at the muzzle's diagonal angle**; the navigation's active indicator is a **small V**; the history timeline uses **diamond markers**. Nothing spins, pulses or glitches; the logo is never animated as separate shapes.

## Editing

- **Copy:** plain HTML in `index.html`; sections are commented. History stages are `.stage` items; standards, capabilities and method steps are simple `<li>` lists.
- **Colours / type / spacing:** tokens at the top of `styles.css` (`--c-*`, `--f-*`, `--gutter`, `--section-y`). There is deliberately no accent colour: the logo is monochrome.
- **Archive:** to add approved material, replace a `.tile--ph` figure's `.tile__art` div with `<img src="assets/…" width="…" height="…" loading="lazy" alt="…">`, edit its caption, and remove the "Conceptual placeholder" badge. Strip image metadata (EXIF/location) before publishing.
- **Official links:** a commented `footer__links` example is in the footer. Add only verified URLs. The site ships with no email, social, address or phone details.

## Behaviour notes
- The intro lasts under two seconds, has a **Skip intro** button (and `Esc`), and is not shown if the URL has a `#hash` or the visitor prefers reduced motion.
- With `prefers-reduced-motion: reduce`, transitions and the intro are removed and all content is shown immediately.
- With JavaScript off, all content is visible and the navigation is a plain row of links. A failsafe in `<head>` restores the plain page if `script.js` fails to load.

## Content that still needs confirmation by the VOG team
The history section reproduces the supplied narrative word for word (as the quoted lead of each stage). Everything else is editorial elaboration written for this site and should be checked against reality before publishing:

1. **Stage explanations** under each quote (History): e.g. that selection was "the first act of building the organization" and that considering "only a limited number of people from each group kept the standard high".
2. **Organization framework** (five principles) and **Standards** (seven): written as principles. Confirm they reflect how VOG actually works and that no formal process is implied.
3. **Capabilities** (six areas) and **Method** (six stages): proposed categories. Confirm which areas are accurate for VOG's real scope, and remove any that are not. They are presented as orientation, not services.
4. **People** values and the hero/about copy.
5. The footer statement that VOG makes no claim of government, agency or military affiliation, and that the site uses no cookies or third-party resources (true of the code as shipped; revisit if you add embeds or analytics).
6. **Contact:** the closing section says public channels are not listed. Add verified channels if and when VOG wants them.
7. **Archive:** all tiles except the logo are placeholders labelled as conceptual.

No founding year, names, locations, deployments, clients, credentials or statistics appear anywhere on the site.
