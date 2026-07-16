---
id: preserve-embeds
title: Preserve dynamic embeds
---
The current README often begins or ends with dynamic image embeds and badges —
GitHub stats cards (`github-readme-stats`), streak stats (`streak-stats`),
trophies (`github-profile-trophy`), shields.io badges, visitor counters. These
are the developer's, and they must survive the rewrite.

- Identify every `![...](...)` image and badge line in the current README.
- Reproduce each one **verbatim** — same Markdown, same URL, same query string.
  Do not swap providers, "upgrade" the theme, or drop any.
- Keep them somewhere sensible (usually a Stats/GitHub section, or wherever they
  already were).
