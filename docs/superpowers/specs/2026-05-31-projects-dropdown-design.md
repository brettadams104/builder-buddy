# Projects Dropdown — Design Spec
**Date:** 2026-05-31
**Status:** Approved

## Overview

Replace the horizontal scrolling project cards on the dashboard with a collapsible Projects button. Designed for older/less tech-savvy users who find horizontal scroll unintuitive.

## Design

**Button:** A full-width "Projects" button on the dashboard showing the count of active projects as a badge (e.g. "Projects — 4 active"). Tapping toggles the list open/closed.

**Dropdown list:** When open, a vertical list appears beneath the button. Each row shows:
- Project color dot
- Project name (bold)
- Project address (small gray text)
- Urgent task count badge (red, only shown if > 0)

Tapping any project row navigates to `/projects/[id]/notes`.

**Behavior:**
- Defaults to closed on page load
- Stays open if user navigates back (handled by client state reset on mount)
- No animation required — simple show/hide

## Files Changed

- `app/(app)/dashboard/page.tsx` — replace project cards section with `<ProjectsDropdown>`
- `app/(app)/dashboard/projects-dropdown.tsx` — new client component

## Out of Scope

- Search/filter within dropdown
- Archived projects (active only)
