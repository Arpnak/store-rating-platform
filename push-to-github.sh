#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# push-to-github.sh
# Run this ONCE after creating the repo on GitHub.
# Usage: bash push-to-github.sh
# ─────────────────────────────────────────────────────────────────────

GITHUB_USERNAME="Arpnak"
REPO_NAME="store-rating-platform"
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "→ Adding remote origin: $REMOTE_URL"
git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"

echo "→ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your repo is live at: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
