# UI_HOME.md

## Status

Draft reference for the first coded prototype.

This document captures the user's current preference for the main screen. It is not a full UI system and does not replace `PRODUCT.md` or `UX_FLOW.md`.

Reference image:

`docs/references/home-reference-01.png`

---

# 1. What We Take From The Reference

## Visual Mood

Use the reference as inspiration for:

- dark, soft mobile interface;
- large friendly typography;
- rounded blocks with calm contrast;
- warm personal feeling without becoming childish;
- clear mobile-first spacing;
- bottom navigation as the main app anchor.

The interface should feel close to a personal daily app, not like a corporate dashboard.

## Top Zone

The top part of the home screen should keep the idea of horizontally scrollable blocks.

In KAMSpace these blocks should not be generic feature cards. They should show current daily information.

Possible first carousel cards:

- Today summary;
- Photo of the day;
- Tomorrow preview;
- nearest important date.

The carousel should be useful even if the user only opens the app for a few seconds.

## Bottom Navigation

Keep the visual idea of a floating bottom navigation bar.

There should be 4 main items:

- Today;
- Tasks;
- Calendar;
- More.

The current reference has 2 visible items. KAMSpace needs 4 because this matches `UX_FLOW.md`.

---

# 2. What We Do Not Take

Remove feature-grid cards from the start screen:

- Lists;
- Calendar;
- Budget;
- Documents;
- Birthdays;
- Menu;
- Schedule;
- Recipes.

KAMSpace should not show a catalog of modules on the main screen.

The main screen is `Today`, so it should answer:

> What is important today?

---

# 3. Main Screen Structure

The first coded version of `Today` should use this structure:

## Header

- space/user name;
- small profile/avatar button;
- current date;
- compact access to settings/profile if needed.

## Horizontal Daily Cards

Scrollable top cards:

- today overview;
- photo of the day prompt/status;
- tomorrow preview;
- nearest date or birthday.

## Today's Information

Below the carousel, show today's real content:

- tasks for today;
- events for today;
- today's menu;
- today's purchases;
- upcoming important dates.

Each block should be compact. The screen should not feel like a large dashboard.

## Quick Add

The main screen needs a fast `+` action.

It should open options:

- New task;
- New event;
- Add purchase;
- Add dish.

Default date:

`today`

---

# 4. Content Rules

The main screen should not duplicate data. It only displays data from other modules:

- task with deadline appears in Today and Calendar;
- menu item appears in Today and Menu;
- purchase with today's date appears in Today and Shopping;
- birthday appears from People;
- important date appears from Us.

If there is no data, use calm empty states:

- no tasks today;
- no events today;
- menu is not planned;
- no purchases for today.

Empty states should include one useful action when appropriate.

---

# 5. First Prototype Decision

For the first implementation:

- use a dark theme direction inspired by the reference;
- create the `Today` screen first;
- replace module tiles with daily content;
- use a 4-item bottom navigation;
- use mock data until backend decisions are made.

The goal is to test the feeling and daily usefulness before designing the entire app.
