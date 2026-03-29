# Internal Deployment Trust Guide

## Recommended Use For This Project

This project is best deployed first as an internal Windows desktop application for a known office, LGU, or managed team environment.

That means the safest trust strategy is:

- keep the current Electron release flow
- build the installer using the existing safe release pipeline
- use internal certificate trust on managed target PCs
- distribute the installer only through an official internal channel

## Why This Is The Recommended Path

Microsoft Defender SmartScreen trust is not solved by frontend code, CSS, or obfuscation.

For this project, the practical low-risk option is:

- trust the app inside the organization first
- avoid pretending the installer is publicly trusted when it is not
- use managed-machine trust where possible

## Current Build Support Already In The Project

The release script already supports:

- unsigned builds when no signing variables are present
- signed builds when signing variables are provided

Relevant environment variables already recognized by the build:

- `CSC_LINK`
- `WIN_CSC_LINK`
- `CSC_NAME`
- `CSC_KEY_PASSWORD`
- `WIN_CSC_KEY_PASSWORD`

## Internal Deployment Recommendation

### Option A: Managed Internal Trust

Use this when the installer is only for known organization PCs.

Recommended flow:

1. Build the app with the existing safe release flow.
2. If your organization has an internal CA or internal code-signing process, sign the release using that certificate.
3. Install the issuing certificate or trusted publisher certificate on target PCs.
4. Distribute the installer from the organization’s official internal location only.

Examples:

- internal shared drive
- official office file server
- managed deployment tool
- IT-controlled distribution folder

### Option B: Internal Unsigned Testing Only

Use this only for development or early pilot testing.

Recommended flow:

1. Build unsigned using the current release script.
2. Inform internal testers that Windows SmartScreen may appear.
3. Do not use this as the final organization-wide deployment approach.

## What Not To Rely On

These do not reliably make the installer trusted:

- frontend code changes
- CSS changes
- JavaScript obfuscation
- renaming the app
- changing the app icon
- rebuilding an unsigned installer repeatedly

## Public Distribution Note

If this project later becomes a public downloadable application, internal trust is no longer enough.

At that point the safer production path becomes:

- buy a trusted code-signing certificate
- sign the installer and portable EXE consistently
- timestamp signatures
- keep one stable publisher identity
- distribute from one official public source

## Recommended Current Decision

For this project right now:

- keep Electron
- keep the current build pipeline
- treat the app as an internal deployment product
- use internal certificate trust where possible
- use unsigned builds only for development/testing, not as the final trust model

This is the safest current deployment strategy for the project.
