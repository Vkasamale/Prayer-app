# Design roadmap

The plan for taking this app's design through Claude Design, step by step.

Three files, three different jobs — do not confuse them:

| File | Job |
|---|---|
| `DESIGN_FRAMEWORK.md` | The generic method. Reusable on any project. |
| `DESIGN.md` | The rulebook for *this* app. Colours, type, components, anti-patterns. |
| `VOICE.md` | How it sounds. Uploaded alongside `DESIGN.md`. |
| `TEMPLATE_BRIEF.md` | Every screen, with its real copy. Pasted in at stage 4. |
| **`DESIGN_ROADMAP.md`** (this file) | The sequence. What happens, in what order, who does it, and how we know it is done. |

**Owner column:** *Vincent* means it happens in the Claude Design interface and
only he can do it. *Agent* means it happens in this repository. Nothing is
blocked on both at once.

---

## Stage 0 — The rulebook

**Owner:** Agent · **Status:** done

`DESIGN.md` is written and corrected. It documents the app as it actually is,
which as of now means: the page is a leaf of an old book, and the scroll is a
motif used in exactly two places.

**Exit criteria**

- [x] `DESIGN.md` exists and covers colour, type, spacing, components, voice,
      accessibility and anti-patterns.
- [ ] Vincent has read section 9 (anti-patterns) and section 2 (the metaphor)
      and disagrees with nothing in them.

That second box is the real gate. Every stage below inherits this file, so a rule
you disagree with here becomes a rule you fight for the rest of the project. Ten
minutes spent here is the cheapest ten minutes in the plan.

---

## Stage 1 — Build the design system

**Owner:** Vincent · **Status:** done · **Time:** about 15 minutes of waiting

1. Open Claude Design. Start a **new project**.
2. Model: the strongest available. Effort: **max**. This runs once and everything
   downstream inherits the result, so it is the worst possible place to
   economise.
3. Click **Create design system**.
4. Name: `Aged Scroll`
5. Description: `Aged parchment, iron-gall ink, quiet, unhurried.`
6. Scroll past every other option — leave them all alone on the first pass.
7. Upload `DESIGN.md`.
8. Send, and leave it. It is generating sample components and mockups so the
   style can be judged by eye rather than read as a specification.

**Exit criteria**

- [x] A design system named `Aged Scroll` exists.
- [x] It has produced mockups to look at.

---

## Stage 2 — Review the mockups

**Owner:** Vincent, then Agent · **Time:** 15 minutes

Review the **mockups, not the values**. `DESIGN.md` already said `#DED0AB`. What
you cannot know until you see it is what `#DED0AB` looks like beside `#3B2B16` at
the size it will really be used, on a phone, in a room with the lights on.

Use the feedback button. One change per note. Say what is **wrong**, not what to
do about it — "the parchment reads yellow next to the ink" gets a better answer
than "change the parchment".

The four things worth deciding here, because they are expensive to change later:

1. **Is the parchment right, or too brown?** It was cream until this session.
2. **Is the ink dark enough to read comfortably outdoors?**
3. **Does the gilt work as a focus ring, or does it disappear?**
4. **Do the borderless text fields read as fields at all?** This is the biggest
   open risk in the current design — see `DESIGN.md` §6.

Then bring the corrected values back here and the Agent applies them to the real
app. The design system is not the app; nothing ships until it lands in
`app/globals.css`.

**Exit criteria**

- [ ] The palette is settled and matches between Claude Design and
      `app/globals.css`.
- [ ] `DESIGN.md` updated if any rule changed — not just the CSS.

---

## Stage 3 — Load the standing assets

**Owner:** Vincent · **Time:** 5 minutes

Upload the things every future design would otherwise need re-uploading, and say
what each one is for:

- **The church logo**, in every variant that exists.
- **A voice file.** Upload `VOICE.md`. It is written for exactly this and every
  example in it is real copy from the app. It is the difference between copy you
  edit and copy you rewrite.
- **Nothing else.** This app has no icon set and should not acquire one — see the
  anti-patterns.

Note the tension and decide it deliberately: the logo must **never** appear on
the congregation's side of the app (`DESIGN.md` §9). It is for print material,
the poster and the card. Say so when you upload it, or it will end up on the
first screen.

**Exit criteria**

- [ ] Logo and voice principles are in the design system.
- [ ] It has been told the logo is print-only.

---

## Stage 4 — The template: thirteen screens

**Owner:** Vincent to generate, Agent to implement · **Time:** 20 minutes

For a slide deck the template is a set of slide layouts. For an app it is the
screen inventory.

**Paste `TEMPLATE_BRIEF.md` into Claude Design.** It holds all thirteen screens
with their real copy, the prompt to ask with, and the rules that apply to every
screen. This stage was first written as "six screens"; counting sign-in, the
team's four tabs and the empty states, it is thirteen.

Ask for all of them in one go, at phone width. Phone first is not a preference
here: this is opened on a phone, usually one-handed, often by someone upset.

Review the template **harder than feels necessary**. Every future change inherits
it. Screens 9 to 13 are the ones to look at longest — the team's half has never
been through a design pass and holds the most card-like surfaces left in the app.

**Exit criteria**

- [ ] All thirteen screens exist as artboards.
- [ ] Each has been reviewed at phone width.
- [ ] The team's screens no longer look like a dashboard.

---

## Stage 5 — Make the corrections compound

**Owner:** Agent · **Time:** ongoing, a minute at a time

This is the stage that separates a system from a one-off, and it is the one
everybody skips.

Every general note — anything that would apply to the next screen as much as this
one — gets written into `AGENTS.md` under a design heading, in this repository,
where every future session reads it before touching anything.

Inside Claude Design, ask for the same thing:

> In addition to making these edits, create or update a `CLAUDE.md` you will read
> before every future design in this project, and record these as standing
> instructions.

**The test:** if you would be annoyed to give the same note twice, it belongs in a
file, not in a chat.

From then on, new design work starts a **new chat in the same project**, never a
new project. The chat is fresh; the standing instructions are not.

**Exit criteria**

- [ ] `AGENTS.md` has a design section holding every general rule learned.
- [ ] Claude Design has its own standing-instructions file.

---

## Stage 6 — Ship it

**Owner:** Agent, with Vincent deploying

1. Apply the settled design to the real app.
2. `npx tsc --noEmit`, then check every screen in the running app at phone width.
3. `npm run verify` — twelve checks — and `npm run verify:team` — ten.
4. Commit.
5. Deploy: `npx vercel --prod --build-env VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD)`.
   The `--build-env` is not optional; without it the build stamp ships as `local`
   and the twelfth check fails on a good deployment.
6. Confirm the live page's `build-commit` matches `HEAD`.

**Exit criteria**

- [ ] Live site serves the new design and `verify` passes twelve.

---

## Two decisions still open

Neither blocks Stage 1. Both should be answered before Stage 6.

1. **Is the aged parchment staying, or does it go back to cream?** The page was
   cream until this session. Aged is currently in the working tree, uncommitted.
2. **Does the bright page cost the discretion the old dark one bought?** The
   original palette existed so a person at the back of a room would not be lit up
   by their own screen. Parchment is brighter still. This one is not settled from
   a mockup — it is asked of the testers, in a room, with the lights off.

---

## Order of play, one line each

1. Vincent reads `DESIGN.md` §2 and §9 and objects now or not at all.
2. Vincent builds the design system from it. Max effort, once.
3. Both review the mockups. Palette gets settled and copied into the real CSS.
4. Vincent uploads logo and voice. Logo is marked print-only.
5. Template of six screens, reviewed at phone width. Screen 6 gets the most time.
6. Every general note goes into `AGENTS.md` and into Claude Design's own standing
   instructions.
7. Apply, verify, commit, deploy, confirm the commit stamp.
