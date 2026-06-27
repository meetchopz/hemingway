# Portfolio & Services — WordPress Theme

A clean, modern, responsive WordPress theme for showcasing a personal **works portfolio** and the **services** you offer. No page builder or paid plugins required.

## What you get

- **Homepage** with a hero, featured projects, services, and a call-to-action.
- **Portfolio** page — a filterable grid of projects (with a single-project detail view).
- **Services** page — a grid of services with icon, description, and price label.
- **About** page — photo + bio + content.
- **Contact** page — a working contact form (emails you directly, with spam honeypot) plus your contact details.
- **Portfolio** and **Services** are managed from the WordPress admin as their own content types — add/edit items without touching code.
- Mobile-friendly nav, sticky header, social links, and Customizer options.

## Installation

### Option A — Upload as a ZIP (easiest)

1. Zip the `portfolio-theme` folder so you have `portfolio-theme.zip` (the zip should contain `style.css` at its top level inside the `portfolio-theme/` folder).
2. In WordPress: **Appearance → Themes → Add New → Upload Theme** → choose the zip → **Install Now** → **Activate**.

### Option B — Upload via FTP / file manager

1. Upload the whole `portfolio-theme` folder to `wp-content/themes/` on your server.
2. In WordPress: **Appearance → Themes** → activate **Portfolio & Services**.

> After activating, go to **Settings → Permalinks** and click **Save Changes** once. This refreshes URL rules so the Portfolio and Service links work.

## First-time setup (5 minutes)

1. **Add projects:** Admin sidebar → **Portfolio → Add New Project**. Give it a title, content, an **excerpt** (used on cards), and a **Featured Image**. Optionally set a *Live/external URL* and a *Project Type* (category).
2. **Add services:** Admin sidebar → **Services → Add New Service**. Set a title, an **excerpt** (shown on the card), and in the side panel an **icon emoji** (e.g. ⚡) and a **price label** (e.g. “From $500”).
3. **Create the pages:** **Pages → Add New** for each of *Portfolio*, *Services*, *About*, *Contact*. In the page editor's right sidebar, under **Template**, pick the matching template (Portfolio / Services / About / Contact).
   - For **About**, set a Featured Image (your photo) and write your bio in the content.
4. **Set the homepage:** **Settings → Reading → Your homepage displays → A static page** and choose a page (or leave on "Your latest posts" — the theme's `front-page.php` renders the designed homepage automatically).
5. **Build the menu:** **Appearance → Menus** → add your pages → assign to the **Primary Menu** location.
6. **Fill in details:** **Appearance → Customize → Theme Options** — set hero text, contact email/phone/location, and social links. (You can also set a logo under **Customize → Site Identity**.)

## Contact form

Submissions are emailed to the address in **Customize → Theme Options → Contact email** (falls back to your admin email). It uses WordPress's `wp_mail()`. If your host doesn't reliably send mail, install an SMTP plugin (e.g. *WP Mail SMTP*) — the form will keep working through it.

## Customizing colors

Open `style.css` and edit the variables at the top under `:root` (e.g. `--pt-accent` for the accent color). Re-upload the file or edit via **Appearance → Theme File Editor**.

## Notes

- This theme lives in `wordpress/portfolio-theme/` in the repository, separate from the Next.js app in the repo root. Only the `portfolio-theme` folder gets uploaded to WordPress.
- Tested against WordPress 6.x, PHP 7.4+.
