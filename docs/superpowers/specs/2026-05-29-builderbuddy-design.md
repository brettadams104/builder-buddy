# BuilderBuddy — Design Spec
**Date:** 2026-05-29  
**Status:** Approved

---

## Overview

BuilderBuddy is an internal communication and project management tool for small custom home builders. It solves the broken communication problem that costs small teams time and client trust — missed updates, forgotten conversations, and no single source of truth for what's happening on each job.

Built for teams of 1–5. v1 is for Brett's team of 3 (owner, construction manager, Brett). No client-facing access in v1.

---

## Users

- **Owner** — creates/manages projects, assigns tasks, uses lookbook with clients
- **Project Manager / Construction Manager** — posts notes, manages trades, updates task status
- **Labor/Construction Manager (Brett)** — same access as above

All three roles have identical permissions in v1. Anyone can create, assign, and complete tasks. No role-based restrictions.

Authentication via Supabase Auth (email/password). Admin creates team accounts — no self-signup.

---

## Home Screen

Three stacked sections:

1. **Active Projects** — horizontally scrollable cards. Each card shows project name, address, and an urgent task indicator dot. Tap a card to open the project.
2. **Master Calendar** — all scheduled events across all projects, color-coded by project. Tap an event to jump to that project's calendar.
3. **My Tasks** — personally assigned tasks across all projects, sorted Urgent → Moderate → Low. Shows task name, project name, and due date. Tap to mark done or navigate to the project.

---

## Projects

Each project represents one house/build. Projects have a name, address, and a color selected from a preset palette of 8 colors when the project is created (used for calendar color-coding).

### Notes Tab
- Running feed of timestamped updates, newest first
- Any team member can post
- Each note shows author name, timestamp, and content
- No editing or deleting — notes are a permanent record

### Tasks Tab
- Each task has: title, assignee (team member), priority (Urgent / Moderate / Low), status (Not Done / Done / Rescheduled), optional due date
- Anyone can create a task and assign it to anyone
- Urgent tasks trigger an SMS notification to the assignee via Twilio
- Tasks sorted by: Urgent first, then by due date

### Calendar Tab
- Events scoped to this project
- Each event has: title, date, optional time, optional linked contact
- Events feed into the master calendar on the home screen, color-coded by project color
- Tap an event to view/edit

### Files Tab
- Custom folders created by team members (name them anything: Permits, Kitchen Photos, Contracts, Inspections, etc.)
- Inside each folder: upload photos (phone or camera) and documents (PDF, etc.)
- Supabase Storage handles file storage
- No folder hierarchy — one level of folders per project is sufficient

### Contacts Tab
- Team members attach contacts from the shared directory to this project
- Shows name, trade, phone number
- Tap phone number to call directly (tel: link)

---

## Contacts Directory

Shared across the entire team. One source of truth for all trade contacts.

Each contact:
- Name
- Company (optional)
- Trade/Role (Electrician, Plumber, Drywaller, Painter, Framer, etc. — free text)
- Phone number (tap to call)
- Notes (optional — anything worth remembering)

Contacts can be attached to multiple projects. Browse directory by trade type to filter quickly.

---

## Lookbook

Completely separate from active projects. A curated portfolio for client-facing presentations.

### Browse by House
- Zillow-style listing cards: hero photo, home name/address, year
- Tap a card → room folders inside (Kitchen, Master Bathroom, Living Room, etc.)
- Tap a room folder → photo grid for that room

### Browse by Room
- Filter row across the top: Kitchen, Bathroom, Bedroom, Exterior, etc.
- Tap a room type → grid of all photos of that type across every house
- Used mid-client-meeting: "Let me show you some kitchens we've done"

### Adding Entries
- Manual and independent from active projects
- Upload hero photo, create room folders, upload curated photos
- No connection to project notes/tasks/files

---

## Notifications

- **Trigger:** Task created or assigned with Urgent priority only
- **Channel:** SMS via Twilio
- **Recipient:** The assignee
- **Message format:** "[Project Name] — Urgent task assigned to you: [Task Title]"
- No notifications for Moderate or Low priority tasks
- No email notifications in v1

---

## Data Model (Supabase)

```
profiles         — id, name, email, role, phone
projects         — id, name, address, color, status (active/archived), created_at
notes            — id, project_id, author_id, content, created_at
tasks            — id, project_id, title, assignee_id, priority, status, due_date, created_at
events           — id, project_id, title, date, time, contact_id (nullable), created_at
folders          — id, project_id, name, created_at
files            — id, folder_id, name, url, type (image/document), created_at
contacts         — id, name, company, trade, phone, notes, created_at
project_contacts — project_id, contact_id (join table)
lookbook_homes   — id, name, address, year, hero_photo_url, created_at
lookbook_rooms   — id, home_id, room_type, created_at
lookbook_photos  — id, room_id, url, created_at
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database + Auth | Supabase (separate project from taxidermy portal) |
| File Storage | Supabase Storage |
| Styling | Tailwind CSS |
| SMS | Twilio |
| Deployment | Vercel (separate from taxidermy portal) |
| Repo | GitHub — new repo `builder-buddy` |

---

## Design

- **Header:** Deep navy (`#1e3a5f`) with white text and white hamburger menu
- **Content:** White cards, light gray background — same clean approach as taxidermy portal
- **Project colors:** Each project gets an assigned color for calendar color-coding
- **Mobile-first:** Primary use is on-site from a phone

---

## Out of Scope for v1

- Client portal / client-facing access
- Document e-signatures
- Budget tracking / cost management
- Photo annotation
- Push notifications (SMS only)
- Offline mode
