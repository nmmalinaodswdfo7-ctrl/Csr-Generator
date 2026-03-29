# Local Asset Bundling Guide

## Purpose

This guide explains how to remove the project’s runtime dependence on remote CDNs and replace those dependencies with local project-managed assets.

The goal is to make the app:

- more reliable in Electron release
- more stable when internet access is slow or unavailable
- easier to pass QA/security review
- more predictable in print preview and export

This guide is written as a plain-text implementation plan, not as code.

## Current Problem

The project currently loads important assets from the internet at runtime, including:

- Tailwind CSS via CDN
- Google Fonts
- Paged.js from a CDN
- html2pdf from a CDN

That creates these risks:

- styling can fail or change if a CDN is unavailable
- Electron release may behave differently from development
- QA may flag production dependence on third-party runtime assets
- export and print flows become more fragile

## Final Goal

After this work is complete, the app should:

- load styles locally
- load fonts locally
- load export/print libraries locally
- work without internet-dependent frontend assets
- behave the same in browser dev, Electron dev, and Electron release

## Recommended Migration Order

Do not replace everything at once.

The safest order is:

1. Tailwind local build
2. Local fonts
3. Local html2pdf
4. Local Paged.js
5. Full regression testing

This order reduces the chance of breaking print/export while large styling changes are still being introduced.

## Step 1: Install Local Tailwind Build Tooling

### What to install

Install Tailwind locally in the project root as a development dependency.

Recommended packages:

- `tailwindcss`
- keep using `postcss`
- keep using `autoprefixer`

### Where to run it

Run the install command in the project root:

- `c:\Users\Batosai\Desktop\CSR GENERATOR original`

### Command

- `npm install -D tailwindcss`

If `postcss` and `autoprefixer` are already present, only Tailwind needs to be added.

### Why

The current Tailwind CDN script generates styles at runtime in the browser.

For production, the better model is:

- compile Tailwind ahead of time
- ship one generated CSS file with the app

### Expected result

The project will generate a real local CSS asset instead of depending on the Tailwind CDN script.

## Step 2: Create Tailwind Configuration

### Create a Tailwind config file

Add a project-level Tailwind configuration file.

### Where to put it

Put it in the project root:

- `tailwind.config.js`

Its job is to scan all files that use Tailwind classes.

The scan paths should include at minimum:

- `main/index.html`
- `main/*.html`
- `main/*.js`

If class strings are created dynamically in JS, make sure the config still includes the files where those class names appear.

### Why

Without correct scan paths, Tailwind may remove classes you are still using.

This is especially important in this project because:

- many UI sections are rendered dynamically from JavaScript
- modal markup and stepper markup are partly generated in JS

## Step 3: Create PostCSS Configuration

### Create a PostCSS config file

Add a PostCSS configuration file in the project root.

### Where to put it

Put it in the project root:

- `postcss.config.js`

It should use:

- Tailwind
- Autoprefixer

### Why

This gives you a repeatable CSS build flow for both development and release packaging.

## Step 4: Create a CSS Source File

### Create one source stylesheet

Add a source file for the app styles, for example:

- `main/styles/app.css`

### Where to put it

Create this folder path:

- `main/styles/`

Then add:

- `main/styles/app.css`

This file should become the main CSS input for the app.

### What should go into it

It should include:

- Tailwind base
- Tailwind components
- Tailwind utilities
- local `@font-face` declarations
- any shared project-level CSS that should not live inline in HTML

### Why

This becomes the single controlled source for bundled styling.

## Step 5: Generate a Local Built CSS File

### Create one compiled output file

Generate a compiled CSS file, for example:

- `main/styles/app.generated.css`

This is the file the app will actually load.

### Where to put it

Put the output beside the source stylesheet:

- `main/styles/app.generated.css`

### Command

Run this from the project root after the Tailwind and PostCSS config are ready:

- `npx tailwindcss -i ./main/styles/app.css -o ./main/styles/app.generated.css --minify`

### Optional development command

Use this while working on styles:

- `npx tailwindcss -i ./main/styles/app.css -o ./main/styles/app.generated.css --watch`

### Why

The app should load a built artifact, not regenerate Tailwind styles at runtime.

## Step 6: Replace Google Fonts With Local Fonts

### Current best path for this project

The project already contains local fonts under:

- `assets/fonts/Public_Sans`
- `assets/fonts/Lexend`
- `assets/fonts/Inter`

That is a strong starting point.

### What to do

1. Identify which font files are actually needed.
2. Define local `@font-face` rules in the app stylesheet.
3. Use local relative asset paths.
4. Remove Google Fonts `<link>` tags from HTML files.

### Where to put the font rules

Put the local font declarations in:

- `main/styles/app.css`

### What to update

Replace runtime Google Fonts links in:

- `main/index.html`
- `main/csr-template.html`
- `main/scsr-template.html`

### Why

This keeps typography consistent even without internet access.

## Step 7: Replace Tailwind CDN Script

### What to remove

Remove the runtime Tailwind CDN script from:

- `main/index.html`
- `main/csr-template.html`
- `main/scsr-template.html`

### What to add instead

Add a `<link>` to the generated local CSS file.

### Where to update it

Update these files:

- `main/index.html`
- `main/csr-template.html`
- `main/scsr-template.html`

### Important note

The current HTML also includes inline Tailwind config blocks.

Those settings need to be migrated into the local Tailwind configuration so the generated CSS matches the existing design.

### Why

If you only remove the CDN script without moving the config, the app styling will drift or break.

## Step 8: Replace html2pdf CDN With Local Vendor File

### Current dependency

The project currently loads html2pdf from a remote CDN.

### Best path

Vendor the exact browser bundle locally.

Recommended location:

- `libraries/html2pdf/`

### Where to put it

Create:

- `libraries/html2pdf/`

### What to do

1. Download or install the exact version currently used.
2. Place the browser bundle in the local vendor folder.
3. Update `main/index.html` to reference the local file.
4. Remove the remote CDN reference.

### Command option

If you want to fetch it through npm first, run from the project root:

- `npm install html2pdf.js`

Then place the browser-ready file you will actually use inside:

- `libraries/html2pdf/`

### Why

This keeps the export-related frontend behavior stable and self-contained.

## Step 9: Replace Paged.js CDN With Local Vendor File

### Current dependency

CSR and SCSR templates currently load Paged.js from a CDN.

### Best path

Vendor a pinned browser build locally.

Recommended location:

- `libraries/pagedjs/`

### Where to put it

Create:

- `libraries/pagedjs/`

### What to do

1. Install or download the exact version you want to standardize on.
2. Place the browser build in the local vendor folder.
3. Update:
   - `main/csr-template.html`
   - `main/scsr-template.html`
4. Remove the remote Paged.js script references.

### Command option

If you want to fetch it through npm first, run from the project root:

- `npm install pagedjs`

Then place the browser build you want to standardize on inside:

- `libraries/pagedjs/`

### Why

Paged.js affects print/export layout and pagination, so having a local pinned version is much safer.

## Step 10: Add Build Commands

### Add package scripts

Create package scripts for:

- building the local CSS
- optionally watching CSS during development

### Where to put them

Add them to:

- `package.json`

### Recommended script direction

Add:

- one script for CSS build
- one script for CSS watch
- optionally one script that runs CSS build before packaging

### Why

This makes the workflow repeatable for:

- development
- release preparation
- QA reproduction

## Step 11: Make Release Packaging Include The New Local Assets

### What to verify

The Electron packaging config must include:

- generated CSS file
- vendored html2pdf
- vendored Paged.js
- local fonts

### Why

If the release build does not include these files, Electron release will still break even if the source app works locally.

### In this project

Your current release packaging already includes:

- `assets/**/*`
- `libraries/**/*`
- `main/**/*`

### Where to verify it

Check:

- `electron-builder.json`
- `electron-builder.safe.json`
- `electron-builder.safe.icon.json`

That is good.

Still, after the migration, verify that the new built CSS and vendor files are actually inside the packaged app.

## Step 12: Regression Testing After Each Phase

### After Tailwind local build

Test:

- main layout
- buttons
- modals
- stepper
- responsive behavior
- dark/light styling if applicable

### After local fonts

Test:

- typography spacing
- line wrapping
- modal labels
- headings
- print preview text flow

### After local html2pdf

Test:

- export flow
- browser/open preview behavior
- missing script errors

### After local Paged.js

Test:

- CSR print preview
- SCSR print preview
- PDF export
- pagination
- heading continuity
- footer/page count

## Step 13: Final QA Validation

After the migration is complete, verify these outcomes:

- the app still works when internet access is disconnected
- Electron release still loads correctly
- print/export still renders correctly
- no runtime errors appear because of missing remote resources
- styling matches the current intended design

## Recommended File Direction

This is the cleanest project structure direction:

- `main/styles/app.css`
- `main/styles/app.generated.css`
- `libraries/html2pdf/...`
- `libraries/pagedjs/...`
- `assets/fonts/...`

This fits your existing project layout well.

## Simple Command Summary

Run these in the project root:

- `npm install -D tailwindcss`
- `npm install html2pdf.js`
- `npm install pagedjs`
- `npx tailwindcss -i ./main/styles/app.css -o ./main/styles/app.generated.css --minify`

Create or update these files:

- `tailwind.config.js`
- `postcss.config.js`
- `main/styles/app.css`
- `main/styles/app.generated.css`
- `main/index.html`
- `main/csr-template.html`
- `main/scsr-template.html`
- `libraries/html2pdf/`
- `libraries/pagedjs/`

## Most Important Warning

Do not remove all CDN assets in one pass and then try to debug everything afterward.

The safest approach is:

- migrate one dependency group at a time
- test immediately
- only continue once the previous phase is stable

This is especially important because:

- Tailwind affects almost every screen
- fonts affect wrapping and print layout
- Paged.js affects pagination
- html2pdf affects export

## Final Recommendation

For this project, the safest bundling strategy is to replace all runtime CDN dependencies with local project-managed assets in phases. Start with Tailwind and fonts, then move html2pdf and Paged.js locally, update all HTML entry points to use the new local assets, and test after each phase. This will make the app more stable, more QA-friendly, and much less dependent on internet/CDN availability.
