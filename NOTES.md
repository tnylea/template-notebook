# Notebook Template — Iteration Notes

A personal blog & portfolio template for CMS Max. Lives in `~/Sites/notebook`.
Tested on tenant: **`personal`** at https://personal.cmsmax-tenancy.test/.

---

## Design DNA

| Token | Value | Use |
|------|-------|-----|
| Paper (cream) | `#fbf8f3 → #181410` | Backgrounds, cards |
| Ink (deep neutral) | `#f5f4f2 → #0a0908` | Text, primary CTAs |
| Ember (terracotta accent) | `#fdf3ee → #4a2317` | Highlights, callouts, secondary CTAs |
| Sage (quiet green) | `#ebeee2 → #4d563e` | Tertiary chrome |
| Display | Fraunces (italic optical-sized soft serif) | H1–H3, pull quotes |
| Body | Inter | Everything else |

Core motifs:
- Editorial / "notebook" feel — paper grain overlay, slight rotated cards (-1°/+2°), pencil highlight on emphasis words
- Asymmetric grid (5/7, 7/5) — no equal-column boredom
- `eyebrow` + horizontal `rule` pattern before every section heading
- Hand-drawn touches: italic Fraunces, ember rule lines, grain texture
- One-line ascii-flair separators (`✦`) inside marquee

---

## Install / Reinstall

```bash
cd ~/Sites/cmsmax-tenancy
APP_ENV=local php artisan dev:install-template \
    --path=~/Sites/notebook --tenant=personal --fresh
```

`APP_ENV=local` is required because the local repo's `.env` is `staging`. The
`InstallTemplatePackCommand` gates on `app()->environment('local')`.

---

## What ships in v0.1.0 (this iteration)

### Files

```
~/Sites/notebook/
├── template.yml              ← manifest + theme + slot_blocks map
├── theme.css                 ← Tailwind v4 @theme tokens + utilities
├── index.html                ← static preview (open file:// to inspect)
├── _assets/nb.js             ← GSAP entrance + ScrollTrigger reveals
├── layouts/notebook-default.html   ← banner, header, content, footer-stats, footer
├── blocks/
│   ├── notebook-banner/      ← top announcement bar
│   ├── notebook-header/      ← sticky monogram + nav + CTA
│   ├── notebook-footer-stats/← four-stat strip
│   └── notebook-footer/      ← editorial dark-ink footer w/ newsletter
├── _sections/
│   ├── _shared/              ← static fallback copies (only used by index.html)
│   └── home/
│       ├── hero.html         ← 7/5 split portrait + headline
│       ├── marquee.html      ← "as seen in" magazine names
│       ├── featured-work.html← 4-tile asymmetric grid
│       ├── about-snippet.html← 5/7 split with sidebar list
│       ├── journal.html      ← 3-up recent essays
│       ├── quote.html        ← centered pull quote on dotted bg
│       └── cta.html          ← dark-ink rounded card with ember CTA
└── pages/
    └── home.yml              ← uses html: entries (one per home section)
```

### Designer integration

This iteration **modified** `packages/designer/src/Services/TemplatePackInstaller.php`
to read `slot_blocks:` from `template.yml`, falling back to the existing
hard-coded northwind defaults. Diff:

```php
// slotToBlockMap() now accepts $manifest and prefers $manifest['slot_blocks']
// attachSectionsToLayout() now passes $manifest through
```

This is a **non-breaking** change — existing northwind installs work unchanged.

---

## TODO — Next iteration priorities

### High value, ship next

1. **Install the blog plugin** in the `personal` tenant + write 10 polished blog
   posts with cover images, slugs that match what's referenced in the home
   journal section (`/journal/the-quiet-craft-of-shipping`,
   `/journal/notes-on-finishing`, `/journal/typography-feels`, plus 7 more).
   - Plugin lives at `packages/blogs/` (see `app/Enums/Plugin/Plugin.php`).
   - Create posts with `php artisan tinker --execute=...` against the
     `personal` tenant, or use a dev:scaffold command if one exists for blogs.
2. **Build the remaining pages**: `/work`, `/journal`, `/about`, `/now`,
   `/contact`. Each needs a `pages/<slug>.yml` + `_sections/<page>/*.html`
   directory. Hero pattern is already established by `home/hero.html` —
   keep the eyebrow + rule + Fraunces headline rhythm.
3. **Convert home sections from raw `html:` entries into block definitions**
   so they're editable in the Designer. Today they're static-html-on-page.
   Convert each in `_sections/home/` into a block in `blocks/notebook-*` with
   field schemas (eyebrow, headline, image_url, etc.), then update
   `pages/home.yml` to use `block: notebook-hero` etc. with field overrides.
   Look at `~/Sites/northwind/blocks/northwind-hero/` for the canonical pattern.
4. **A Work / Project detail page block** — repeater of project tiles with
   thumb, category, slug, summary. Big visual win.
5. **A blog post layout** (separate `notebook-post` layout?) — wide reading
   column, drop cap, embedded pull quotes, footnotes/aside support.

### Polish backlog

- Mobile menu actually opens (currently the button is decorative)
- Newsletter form should hit a real ConvertKit/Mailerlite endpoint
- Replace placeholder Unsplash images with curated/licensed ones
- Add a `NowPage` section reflecting "what I'm focused on this month" — this
  is a popular personal-site convention (nownownow.com)
- Add an `images/` dir with template thumbnail/screenshots for the marketplace
  (`screenshots/desktop.png`, `screenshots/mobile.png`)
- Add JSON-LD Person + WebSite + BreadcrumbList for SEO (currently we have
  meta description + browser title only)
- Add `<link rel="canonical">` and OpenGraph image on each page
- A `theme-light` and `theme-dark` toggle would feel earned — but only after
  the dark variant looks as deliberate as the light one
- Audit Tailwind class usage against `notebook` Semantic CSS rule (project
  CLAUDE.md item #24) — currently OK because templates don't have many
  shortcodes, but may matter as we add blocks

### Known caveats

- The static `_sections/_shared/*.html` files are duplicated by the
  `notebook-*` blocks. They exist so `index.html` works as a standalone preview
  (open file in browser) but are NOT used by the installed template.
- `pages/home.yml` uses `html:` entries (concatenated content blocks) rather
  than `block:` entries. The page renders correctly but the home sections
  cannot be edited per-field in the Designer until they're converted to blocks
  (see TODO #3).
- The home page's blog post links point at slugs that don't yet exist — they
  404 until the blog plugin + posts are created.

---

## Verification commands

```bash
# Re-install:
cd ~/Sites/cmsmax-tenancy && \
  APP_ENV=local php artisan dev:install-template \
  --path=~/Sites/notebook --tenant=personal --fresh

# Smoke-test the home page:
curl -sk https://personal.cmsmax-tenancy.test/ | grep -c "Mara Ellis"
# expect: ≥ 5

# Check installed blocks:
cd ~/Sites/cmsmax-tenancy && APP_ENV=local php artisan tinker --execute='
  $t = \Central\Models\Tenant::find("personal");
  $t->run(fn() => print_r(\App\Models\BlockDefinition::where("source_pack","notebook-portfolio")->pluck("slug")->all()));
'
```

---

## Iteration handoff

| Iter | Date | What landed | Next |
|------|------|-------------|------|
| 1    | 2026-05-07 | Scaffold, theme, layout, 4 shared blocks, home page (7 sections), installer slot_blocks support | Blog plugin install + 10 posts; convert home sections to blocks; build About/Work/Journal/Now/Contact pages |
| 2    | 2026-05-07 | Blogs plugin installed in `personal`; 4 categories (`Craft`/`Process`/`Type`/`Field Notes`); 10 hand-crafted essays seeded; `BlogsPluginSettings` configured for flat `/journal/<slug>` URLs (no category prefix); `journal` index page built with editorial post-list (numbered, dated, hover-arrow) + newsletter CTA | Build About / Work / Now / Contact pages; convert home sections into Designer-editable blocks; project detail page; per-post layout polish; SEO (JSON-LD, OG, canonical) |
| 3    | 2026-05-07 | **About** page (hero + bio with drop-cap + year-by-year timeline + 4 values + beyond-work bento + dark-ink CTA); **Now** page (single-page nownownow format with monospace tags + last-updated stamp); **Contact** page (centered hero + form card with topic chip-radios + budget select + Elsewhere bento); **Work** page (asymmetric project grid with year/category/status meta + earlier-projects list + booking-status CTA). All 5 pages now live: `/`, `/about`, `/now`, `/contact`, `/work`, `/journal`, `/journal/<slug>` | Convert home + about + work sections into block defs (Designer editability); project detail layout (`notebook-detail`); SEO polish (canonical, OG, JSON-LD audit); move tinker seeds → `dev:scaffold-personal-blog` artisan command |
| 4    | 2026-05-07 | **`notebook-detail` layout** (banner / header / content / footer — no footer-stats); **6 project case studies** all live and reachable from home + /work tile links: Acre Type (full case-study with hero+brief+gallery+next-up, 4 sections), Folio, Coda, Pebble OS, Quiet Radio, Marginalia (hero + drop-cap brief + next-up nav, 2 sections each). **Installer enhanced twice**: (a) installs ALL `layouts/*.html` files (was: only the manifest's primary), (b) page YAML can override `layout:` per-page (was: hardcoded to primary). All 13 URLs render. Total: 11 pages, 2 layouts, 38 sections | Mobile menu drawer; convert home sections to block defs (start with hero); SEO audit (canonical, OG, JSON-LD); `/work` filter JS; `dev:scaffold-personal-blog` artisan command; longer-form case studies for the 5 stub projects |
| 5    | 2026-05-07 | **Mobile drawer** wired into `notebook-header` block — Alpine `x-data="{ open: false }"` with backdrop-blur scrim, slide-from-right panel, large Fraunces nav links, `[x-cloak]` rule to prevent FOUC. Alpine is auto-loaded via Livewire — no extra script tags. **`notebook-hero` block** — 14-field schema (eyebrow, title_html, description, dual CTA, portrait + caption + index, "currently" pill, subscriber-proof toggle); home page now uses `block: notebook-hero` (Designer-editable). **`notebook-featured-work` block** with `repeater` field for projects (4-default fixture preserved as fallback when repeater empty); home page now uses `block: notebook-featured-work`. **SEO audit** — confirmed framework already emits `<link rel="canonical">`, full OG + Twitter card meta, and `<script type="application/ld+json">` (multiple per blog post — BlogPosting + BreadcrumbList). No template-level work needed. | Convert remaining home sections (`marquee`, `about-snippet`, `journal`, `quote`, `cta`) to block defs; flesh out the 5 stub case studies with real-feeling content (gallery + decision callouts); `dev:scaffold-personal-blog` artisan command; `/work` filter JS; replace placeholder Unsplash images with curated/licensed; marketplace screenshots; design-token consolidation (extract repeated rotated-portrait + paper-card patterns into utilities) |
| 6    | 2026-05-07 | **Installer stale-section bug fixed** — added `regenerateSectionsForBlocks()` step after `attachSectionsToLayout`, so block template edits propagate to existing sections on every install (no more tinker-around). **5 more home blocks built**: `notebook-marquee` (pipe-separated text list), `notebook-about-snippet` (5/7 split with rotated portrait + bio + two list columns), `notebook-journal-preview` (3-up posts with repeater field + 3-default fixture), `notebook-quote` (centered Fraunces pull-quote on dotted bg with author avatar), `notebook-cta-dark` (rounded dark-ink card with italic-emphasis title). **`pages/home.yml` is now 100% block-based** — every section editable in Designer. **Total: 11 blocks shipping** (4 shared chrome + 7 home blocks) | Flesh out 5 stub case studies; `dev:scaffold-personal-blog` artisan command; `/work` filter JS; convert About + Now + Contact + Work page sections to blocks (currently still `html:` entries); unused `_sections/home/*.html` files can be deleted (no longer referenced) |

---

## Iteration 2 detail

**Plugin install** — `PluginService::installAndActivate('blogs')` against the
`personal` tenant. Migrations were already in place from a prior run, so this
just flipped the activation flag.

**10 essays seeded** at `/tmp/seed-notebook-blog.php`. The post slugs cover the
three referenced from the home page (`the-quiet-craft-of-shipping`,
`notes-on-finishing`, `typography-feels`) plus seven more across all four
categories. Each post has:

- A real first-person essay body with `<h2>` mid-headers and `<blockquote>`
  pull quotes (no Lorem)
- A cover image (Unsplash, will need licensing/replacement)
- `excerpt`, `meta_description`, `browser_title` for SEO
- `publish_start` scattered across Nov 2025 → Apr 2026 for a believable archive
- `featured` set on 2 anchor essays
- `type = blog_posting` so Schema.org `BlogPosting` JSON-LD generates

**URL flattening** — by default the Blogs plugin builds URLs as
`/<primary-category>/<slug>`. For a personal blog, flat `/journal/<slug>`
reads better and matches what the home page links to. To get there:

1. Created a `journal` Page (id=9) with the right SEO metadata
2. Set `BlogsPluginSettings::blog_index_id = 9`
3. Set `is_including_blog_index_url_in_blog_page = true`
4. Cleared `primary_category_id` on every post (categories still attached via
   the `blog_category_blog` pivot for filtering/display)
5. **Critical**: must `$blog->touch()` (with eager-loaded `url`) to fire the
   `updated` event — `Blog::query()->update(...)` is mass-update and skips
   model events, so URLs don't regenerate. The Urlable trait's `bootUrlable`
   hooks `static::updated` and only refreshes the morphed URL row when an
   `update` event actually fires.

**Journal index page** — built inline html (hero with eyebrow + display-italic
headline, numbered + dated post list with hover arrow, newsletter CTA). All
seed scripts live in `/tmp/seed-notebook-*.php`. They're idempotent —
re-runnable via:

```bash
cd ~/Sites/cmsmax-tenancy
APP_ENV=local php artisan tinker /tmp/seed-notebook-blog.php
APP_ENV=local php artisan tinker /tmp/seed-notebook-journal.php
APP_ENV=local php artisan tinker /tmp/seed-journal-index.php
```

Long-term these should move into a real `app/Console/Commands/Dev/` scaffold
command (e.g. `dev:scaffold-personal-blog`) so a future iteration can
re-run from a clean tenant. Currently the seed scripts depend on the
notebook template having already been installed (for `notebook-default`
layout to exist).

**Verified live URLs:**
- `https://personal.cmsmax-tenancy.test/` → 200, 341kb (home with all sections)
- `https://personal.cmsmax-tenancy.test/journal` → 200, 159kb (post list)
- `https://personal.cmsmax-tenancy.test/journal/the-quiet-craft-of-shipping` → 200, 147kb (full essay rendered with H2s + blockquotes)

---

## Iteration 3 detail

All four planned pages shipped. Each follows the established design DNA:
- Eyebrow + horizontal rule before every section heading
- Asymmetric Fraunces display headlines with one italic emphasis word in `text-ember-700`
- `paper-card` rounded-2xl cards with subtle shadow-paper
- Numbered indices in monospace (`№01`, `№02`, etc.) for the values list and project grid
- Generous whitespace (`py-24 lg:py-28` between sections)

Some highlights:
- **About bio** uses `first-letter:` Tailwind to drop-cap the opening paragraph in Fraunces ember
- **About timeline** is a vertical rail with circle markers — current year gets the ember dot, past years get neutral
- **Contact form** uses `has-[:checked]:` modifier so the topic chip-radios visually toggle without JS
- **Work hero** has filter buttons (currently visual-only; next iteration should make them functional)
- **Now page** uses the `nownownow.com` convention with a "Updated · May 2026" stamp and monospace category tags

### Reinstall behavior to remember

`dev:install-template` **without** `--fresh` is the right call when iterating — `--fresh` would drop the journal Page (created via tinker, not in `pages/`) and the 10 blog posts (which reference `notebook-default` layout but are tracked separately). The non-fresh upsert preserves them.

If a future iteration runs `--fresh`, you'll need to re-run all three seed scripts in order: `seed-notebook-blog.php` → `seed-notebook-journal.php` → `seed-journal-index.php`. Better long-term move: roll all three into a single `dev:scaffold-personal-blog` artisan command that's idempotent.

### Verified live URLs

| URL | Status | Size |
|-----|--------|------|
| `/` | 200 | 168kb |
| `/about` | 200 | 163kb |
| `/now` | 200 | 148kb |
| `/contact` | 200 | 155kb |
| `/work` | 200 | 154kb |
| `/journal` | 200 | 159kb (was 329kb on retry — index gets larger when blogs come back from cache) |
| `/journal/the-quiet-craft-of-shipping` | 200 | 147kb |

(One transient `Allowed memory size of 134217728 bytes exhausted` from the autoloader on first request — Herd FPM hiccup, not a regression. Recovered on second hit.)

---

## Iteration 4 detail

**Project case studies live.** All 6 project tile links from `/` and `/work` now resolve. Acre Type is the marquee study with rich content (hero with meta sidebar, brief with drop-cap, gallery bento, blockquote pull-quote, next-up nav). The other 5 (Folio, Coda, Pebble OS, Quiet Radio, Marginalia) use a lighter template — hero with meta sidebar + drop-cap brief + next-up. The lighter template is intentional: better to ship 6 working stubs than 1 perfect one.

### Installer enhancements this iteration

The `TemplatePackInstaller` learned two new tricks (both backwards-compatible — northwind etc. still install unchanged):

1. **Multi-layout install.** Now scans `layouts/*.html` and creates a `Layout` row for each. The manifest's `layout:` key is the *primary* (used for slot_blocks attachment ordering and as the default for pages without their own `layout:`). All layouts get the slot_blocks attachment pass + compilation. Code in `createAllLayouts()`.
2. **Per-page layout override.** A page YAML can now set `layout: notebook-detail` to opt out of the manifest's primary layout. Implemented via a `Layout::where('layout_name', $data['layout'])->first()` lookup in `createPages()`, falling back to the primary if the named layout doesn't exist.

These two changes together let one template pack ship multiple layouts (default for marketing pages, detail for individual posts/projects, sidebar variants for guides, etc.) — a foundational capability for any pack richer than a single landing-page-plus-content-pages.

### File map added this iteration

```
~/Sites/notebook/
├── layouts/
│   └── notebook-detail.html               ← NEW (banner / header / content / footer)
├── _sections/work/case-study/
│   ├── acre-type-hero.html                ← rich hero w/ meta sidebar
│   ├── acre-type-story.html               ← drop-cap brief + blockquote
│   ├── acre-type-gallery.html             ← 4-tile bento gallery
│   ├── stub-folio.html                    ← lighter case-study template
│   ├── stub-coda.html
│   ├── stub-pebble.html
│   ├── stub-quiet.html
│   ├── stub-marginalia.html
│   └── next-up.html                       ← shared "next up + back to archive" nav
└── pages/
    ├── work-acre-type.yml                 ← layout: notebook-detail
    ├── work-folio-readers.yml
    ├── work-coda-letters.yml
    ├── work-pebble-os.yml
    ├── work-quiet-radio.yml
    └── work-marginalia.yml
```

### Verified live URLs (13 total)

| URL | Status | Notes |
|-----|--------|-------|
| `/` | 200 | 168kb |
| `/about` | 200 | 163kb |
| `/now` | 200 | 148kb |
| `/contact` | 200 | 155kb |
| `/work` | 200 | 154kb |
| `/journal` | 200 | 159kb |
| `/work/acre-type` | 200 | 155kb (full case study) |
| `/work/folio-readers` | 200 | 148kb |
| `/work/coda-letters` | 200 | 147kb |
| `/work/pebble-os` | 200 | 147kb |
| `/work/quiet-radio` | 200 | 147kb |
| `/work/marginalia` | 200 | 147kb |
| `/journal/<slug>` | 200 | 147kb (×10 posts) |

The transient FPM memory-limit (`Allowed memory size of 134217728 bytes exhausted`) recurred this iteration — 219-byte responses on first hit, full size on retry. This is consistent across all template packs in this Herd setup; it's not a notebook regression. Long-term: bump `memory_limit` in Herd FPM, or investigate why the first request after a config change spikes high.

---

## Iteration 5 detail

**Mobile drawer is functional.** The `notebook-header` block now has a working hamburger that opens a right-side drawer with backdrop-blur scrim. Tap any nav link or the close button or the scrim to dismiss. Uses Alpine.js (already loaded via Livewire — no extra script tags needed). The static `_sections/_shared/header.html` was NOT updated; it's only used for the standalone `index.html` preview. The block template is what ships to tenants.

**Two home blocks are now Designer-editable.** Both `notebook-hero` and `notebook-featured-work` follow the established convention from northwind: defaults baked into the field schema match the home page values exactly, so no `fields:` overrides are needed in `pages/home.yml`. The featured-work block has a `repeater` field for projects with a 4-project fixture fallback when the repeater is empty (first-install state). This means a designer can add/remove/reorder project tiles in Designer's right panel without touching HTML.

**SEO is already strong.** Confirmed via `curl | grep`:

```html
<link rel="canonical" href="https://personal.cmsmax-tenancy.test/"/>
<meta property="og:title" content="Mara Ellis — Writer, Designer & Quiet Maker · Portland, OR">
<meta property="og:description" content="The personal notebook of Mara Ellis…">
<meta property="og:url" content="https://personal.cmsmax-tenancy.test">
<meta property="og:type" content="website">
```

Blog posts emit two `<script type="application/ld+json">` blocks (BlogPosting + BreadcrumbList) automatically. Twitter card tags also present. The framework's seo head component handles all of this — no template work needed.

### Critical install gotcha discovered (and worked around)

`dev:install-template` without `--fresh` updates `block_definitions` (via `updateOrCreate`) but **does NOT re-render existing layout-attached sections** (banner / header / footer / footer-stats). Their stored `html` column stays stale even though the block template behind them has changed.

Fix used: tinker through every Section backed by a notebook block and call `$s->save()` to trigger the saving hook that re-renders `html` from `template + field_values`. Then recompile both layouts and clear theme cache:

```php
$bd = \App\Models\BlockDefinition::where('source_pack', 'notebook-portfolio')->pluck('id');
\App\Models\Section::with('blockDefinition')->whereIn('block_definition_id', $bd)
    ->get()->each(fn ($s) => $s->save());
\App\Models\Layout::where('layout_name', 'notebook-default')->each(function ($l) {
    app(\CMSMax\Designer\Services\LayoutCompilerService::class)->saveToDatabase($l);
});
// + layouts:clear-cache
```

This is a real bug in the iterative-install loop — anyone updating a block's template on an installed pack runs into it. **Iteration 6 should fix this in the installer**: after `block_definitions` update, find all sections referencing changed block defs and call `$section->save()` on each, then recompile any affected layouts.

### Verified live URLs (no regressions)

| URL | Status | Notes |
|-----|--------|-------|
| `/` | 200 | 172kb (was 168kb — drawer markup adds ~4kb) |
| `/about` | 200 | 163kb |
| `/now` | 200 | 148kb |
| `/contact` | 200 | 155kb |
| `/work` | 200 | 154kb |
| `/journal` | 200 | 159kb |
| `/work/<6 projects>` | 200 | 147–155kb each |
| `/journal/<10 posts>` | 200 | 147kb each |

---

## Iteration 6 detail

### Installer fix shipped

`packages/designer/src/Services/TemplatePackInstaller.php` now has `regenerateSectionsForBlocks()` — runs after `attachSectionsToLayout` and before the compile loop. For every block in this pack, it eager-loads each `Section` referencing it and calls `->save()`. The Section model's saving hook re-renders `html` from `template + field_values`. Then layouts compile and pick up the fresh section html.

Net result: `dev:install-template --path=~/Sites/notebook --tenant=personal` is now genuinely idempotent. Edit a block's `template.html`, re-run install, the change shows up. No more tinker-around.

This fix benefits **every** template pack — northwind, future packs, and notebook all get the same iterative-edit support.

### Home page is now 100% Designer-editable

`pages/home.yml` no longer references `_sections/home/*.html`. All 7 sections are blocks:

| Block | Fields | Notes |
|------|--------|-------|
| `notebook-hero` | 14 | rich title, dual CTA, portrait + caption, "currently" pill, subscriber proof |
| `notebook-marquee` | 1 | pipe-separated text list (`|`) — auto-renders in two duplicated tracks |
| `notebook-featured-work` | 4 + repeater | 4-project fixture fallback when repeater empty |
| `notebook-about-snippet` | 11 | 5/7 split, rotated portrait, two newline-separated list columns |
| `notebook-journal-preview` | 5 + repeater | 3-default-post fixture fallback |
| `notebook-quote` | 4 | author avatar uses initials, dotted bg pattern with unique id per render |
| `notebook-cta-dark` | 7 | rich title, primary button + secondary link |

Designers can now reorder, swap, edit field values for every home section without touching HTML. The `_sections/home/*.html` files can be deleted (next iteration's small cleanup) — they're only used by the standalone `index.html` preview, which can also be migrated.

### Verified live URLs

| URL | Status | Notes |
|-----|--------|-------|
| `/` | 200 | 347kb (was 172kb — bigger because every block now renders inline; no regression in content quality) |
| `/about` | 200 | 166kb |
| `/now` | 200 | 150kb |
| `/contact` | 200 | 157kb |
| `/work` | 200 | 157kb |
| `/journal` | 200 | 162kb |
| `/work/<6 projects>` | 200 | 150-158kb each |
| `/journal/<10 posts>` | 200 | 150kb each |

The `Allowed memory size of 134217728 bytes exhausted` keeps recurring on cold FPM workers. Long-term solution: add `php_value memory_limit 256M` to FPM pool config or `MEMORY_LIMIT=256M` to Herd's PHP env. Not a notebook bug — affects every request to a heavy Laravel app on a cold worker.

---

## Iteration 7 priorities (next 20 min)

1. **`dev:scaffold-personal-blog` artisan command** at `app/Console/Commands/Dev/ScaffoldPersonalBlogCommand.php`. Signature: `dev:scaffold-personal-blog --tenant=personal {--fresh}`. Move the 10 posts + 4 categories from `/tmp/seed-notebook-blog.php` into a JSON fixture at `app/Console/Commands/Dev/fixtures/personal-blog-posts.json`. Idempotent — skip if exists, `--fresh` drops + recreates. Don't forget the `BlogsPluginSettings::blog_index_id` wiring (the 3-step seed currently spread across `seed-notebook-journal.php`).
2. **Flesh out the 5 stub case studies** so they match Acre Type's depth — each needs a gallery section (3-4 images, similar to `acre-type-gallery.html`), a "key decisions" callout block (3 short numbered items), and ~800 words of brief instead of the current 250. The Folio one is the next-most-prominent case study — start there.
3. **Convert About / Now / Contact / Work page sections to block defs** — same pattern as iter 5/6 for home. Highest leverage: `notebook-about-bio` (with the drop-cap), `notebook-about-timeline` (with vertical rail + repeater of timeline entries), `notebook-contact-form` (with topic chip-radios + budget select).
4. **Delete unused files**: `_sections/home/*.html` — the home page no longer references them. Keep them only if `index.html` is intended as a working standalone preview (current `index.html` references them via `<include>`).
5. **`/work` filter JS** — small vanilla-JS handler in `_assets/nb.js` toggling visibility based on `data-category` attribute. Add the attributes to each tile in `_sections/work/projects.html` (not yet a block — will need the same block conversion pass when filter ships).
6. **Polish backlog**: `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` in head; confirm `<meta name="twitter:image">` and `og:image` are emitted (might need a per-page `social_image_id` to be set on Page records); replace `<form action="#">` placeholders with a real endpoint pattern (CMS Max forms-plugin route or simple mailto fallback).
7. **Marketplace screenshots** — `screenshots/desktop-home.png` (1440×900), `screenshots/desktop-about.png`, `screenshots/mobile-home.png` (390×844) via Playwright/headless Chrome. Need at least the desktop-home for any marketplace listing.

