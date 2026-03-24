# Boxel Quoting Agent — Project Instructions

## Tech Stack

Vanilla HTML/CSS/JS prototype. No frameworks. State managed via localStorage (js/store.js).

## Scope Overlay Sync

When modifying MVP functionality (adding, removing, or changing features in any of the 5 HTML pages),
you MUST also update `js/scope-data.js` to reflect those changes:
- If a new feature/element is added: add a corresponding item in the appropriate group with its targetSelector
- If a feature is removed: remove the item from scope-data or move it to the "Out of Scope" group
- If an element's ID/class changes: update the targetSelector in scope-data to match
- If a new page is added: add a new page entry in SCOPE_DATA with its groups and items

The scope overlay (`js/scope-data.js`) is the source of truth for what the MVP includes.
Keep it in sync with every prototype change.
