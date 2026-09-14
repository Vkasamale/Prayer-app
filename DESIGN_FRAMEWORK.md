# A design framework for working with AI design tools

A reusable method, not a project. Copy this file into any repository, for any
kind of surface — a web app, a mobile app, a slide deck, a set of social
graphics, an email campaign — and hand it to whatever AI tool is doing the
design work.

---

## The problem it solves

The default way to use an AI design tool is to open it, name a project, and
start prompting. That produces generic work, and then a second, longer phase
where you spend time and tokens trying to rescue output that was never going to
be good.

The reason is that a prompt describes one artefact. Nothing carries. The tool
starts from nothing every time, so it falls back on the average of everything it
has seen, which is the definition of generic. Ask for ten screens and you brief
it ten times and get ten slightly different houses.

The fix is to stop briefing artefacts and start building inputs that persist.
Three of them, in order, each built from the one before:

| # | Input | Answers | Built from |
|---|-------|---------|------------|
| 1 | `DESIGN.md` | What does it look like? | Written by hand, or adapted from a public one |
| 2 | Design system | What does that mean *in this tool*? | Input 1 |
| 3 | Template | How is a thing of this kind laid out? | Input 2 |

Then a fourth thing that is not an input but a loop: **feedback written to a file
the tool reads before every future job**, so corrections compound instead of
evaporating.

The prep is front-loaded and it is boring. That is the entire trick. Everything
after it is fast, and it stays fast, because you are never re-explaining your
look and feel.

---

## Input 1: `DESIGN.md`

A plain text rulebook for how a design looks and feels. Tool-agnostic — this is
the one file that works in any AI tool, today and in whatever replaces it.

### What goes in it

Be specific enough that two people reading it would produce the same thing. A
value with a reason attached survives editing; a value on its own gets
overwritten by the next person who thinks they know better.

- **Colour.** Every value as a hex code, each with a name and a job. Not
  "primary" and "secondary" — say what it is *for*. State the one-line rule for
  when an accent may be used, because that rule is what stops it becoming
  decoration.
- **Type.** Families with full fallback stacks. A scale with actual sizes, not
  t-shirt names. Line height, letter spacing, and which weights exist. If one
  family does everything, say so, and say why.
- **Spacing.** The base unit and the scale built on it. Whether the scale is
  strict.
- **Shape and depth.** Corner radius, borders, shadows, elevation. "Every radius
  is zero" is a real answer and a strong one.
- **Components.** How a button, field, card, table, badge and empty state are
  built. Include the states: rest, hover, focus, active, disabled, loading,
  error.
- **Motion.** Durations, easing, what animates and what must not.
- **Voice.** How the words sound. Sentence case or title case, contractions or
  not, banned words, how errors are phrased.
- **Accessibility floor.** Minimum contrast, minimum hit area, focus indicators,
  what must not be conveyed by colour alone. Put it in the file so it is a rule,
  not a review comment.
- **The anti-patterns.** The most valuable section and the one everybody skips.
  What must this design never look like? Name the defaults you are rejecting.
  "No card with a drop shadow on a grey background", "no gradient buttons", "no
  emoji in UI copy". A rule against something is worth more than five rules for
  something, because it removes the template look the tool reaches for by
  default.

### Where to get one

Writing from scratch is the slow path. Two faster ones:

- **Adapt a public one.** Design-system files for major brands are published
  openly. Take the structure, then strip every proprietary value — real brand
  colours, typefaces, logos, names — and replace them with your own judgement.
  Keep the structure and the level of detail; change the content. AI tools will
  decline to copy a real brand's guidelines, and rightly, so the file has to be
  yours before it is useful.
- **Extract one from what you already have.** Point the tool at an existing app,
  site or deck and have it infer the rules it is already following. The fastest
  route when the design exists but has never been written down. Then edit, hard:
  it will faithfully record your accidents alongside your intentions.

### The prompt for cleaning a borrowed file

> Remove the proprietary content from this design file — brand names, real
> colour values, licensed typefaces, logos — and replace them using your own
> judgement. Keep the structure, the level of detail and everything else exactly
> as is. Rename it to `<your system name>`.

Read what comes back before using it. The point of cleaning is that the file
becomes *yours*, and a value you have not looked at is not yours.

---

## Input 2: the design system

`DESIGN.md` is portable. A design system is that same rulebook compiled into the
form one specific tool actually consumes — same colours, same type, same logos,
expressed the way that tool can act on.

The analogy is compiling one program for two machines. Nothing about the software
changes. What changes is the form it is delivered in.

### Building it

1. Start a new project in the tool.
2. Choose the strongest model available and the highest effort setting. This step
   runs once and everything downstream inherits it; it is the worst possible
   place to economise.
3. Give it a short name and a one-line description of the feel — three or four
   adjectives, no more.
4. Upload `DESIGN.md`.
5. Leave the rest of the options alone on the first pass.

Expect it to take real time — on the order of ten to twenty minutes — because it
is not just parsing the file. It is generating sample components and mockups so
the style can be judged by eye rather than read as a specification.

### Reviewing it

Review the mockups, not the values. The file already said `#1B1510`; what you
need to know is what `#1B1510` looks like next to everything else at the size it
will actually be used.

Give feedback in plain English, one change at a time, and say what is wrong
rather than prescribing the fix: "the dark tone reads blue next to the paper, use
this hex instead" beats "change the dark tone".

### Loading it with the rest of your assets

Once the look is right, add the things every future job would otherwise need
re-uploading:

- **Logos**, in every variant you actually use.
- **Icons** you reach for repeatedly.
- **A voice or tone file**, so copy sounds like you rather than like a tool. This
  is worth more than people expect: it is the difference between output you edit
  and output you rewrite.

Say what you have uploaded and what each thing is for. From then on, every design
can use them without you ever uploading them again.

---

## Input 3: the template

A pre-built artefact in your style that every new piece of work starts from.

The division of labour matters and is easy to blur:

- **The design system owns how things look.** Colour, type, logo, components.
- **The template owns how a thing of this kind is arranged.** Which parts exist
  and in what order.

For a deck: title, section divider, two-column, quote, closing. For a web app:
the shell, navigation, a list view, a detail view, a form, an empty state, an
error state. For a newsletter: header, body block, callout, footer.

Ask for it once, from inside the project that holds the design system, and let
the tool choose the number of parts. Then review it much harder than feels
necessary — every future piece of work inherits it, so an error here is an error
you will be correcting for months. Bad density, weak hierarchy, an ugly variant:
say so now.

Feedback at this stage should be structural and blunt:

> Apply the background treatment to every layout with a light background, not
> only the covers. Drop the orange variant. Scale the type up to fill the empty
> space. Put the logo in the bottom-left footer.

---

## The loop: feedback that compounds

This is the part that separates a one-off from a system, and it is the single
highest-value habit here.

Most feedback dies on the artefact it was about. To stop that, ask for the
correction *and* for it to be written down somewhere the tool reads before every
future job — a `CLAUDE.md`, an `AGENTS.md`, a standing-instructions file,
whatever the tool honours:

> Review my feedback below. In addition to making the edits, create (or update) a
> `CLAUDE.md` that you will read before every future design in this project, and
> record these as standing instructions.
>
> - Make the eyebrow labels more prominent — a container around them, perhaps.
> - Icons should all have transparent backgrounds.

From then on, new work starts a **new chat inside the same project** rather than a
new project. The chat is fresh; the standing instructions are not. That is the
whole mechanism, and it is why corrections accumulate instead of being re-made.

**Rule of thumb:** if you would be annoyed to give the same note twice, it belongs
in the file.

---

## Two kinds of edit, and when to use which

Once something is generated, changes come in two shapes. Using the wrong one is
how people end up fighting the tool.

**Surgical — one thing, one place.**

- *Direct manipulation.* Select the element and change it yourself: size, weight,
  colour. Fastest for anything you can already see.
- *Annotation.* Draw on the thing and describe the change in words. Right when
  the change concerns a relationship between elements rather than a property of
  one — "these two need to be told apart more clearly" is hard to say in
  coordinates and trivial to circle.

**Global — one decision, everywhere.**

- *Toggles.* Ask for a switch for any decision that recurs across the whole
  artefact: show the logo or not, numbering on or off, dense or comfortable. Then
  flip between them and look, instead of committing and regenerating. Save the
  state you want as the default.

The test: **does this decision appear in more than one place?** If yes, it wants a
toggle. If no, edit or annotate it.

---

## Export

Prefer a self-contained file that opens anywhere over a format that needs the
tool that made it. A standalone HTML file opens in any browser, on any machine,
for anyone you send it to, with no account and no import step.

Ask for the affordances the format allows and the native one does not — a
presenter view with speaker notes, a print stylesheet, keyboard navigation. These
are cheap to request and nobody thinks to.

Keep the platform-native export (PDF, PowerPoint, PNG) for when someone else has
to edit it in their own tool.

---

## The order, on one page

1. Write or adapt `DESIGN.md`. Strip anything proprietary. Include the
   anti-patterns.
2. Build the design system from it. Strongest model, highest effort, once.
3. Review the mockups by eye. Fix the palette here, not later.
4. Load in logos, icons and a voice file.
5. Generate a template for the kind of thing you make. Review it hard.
6. Make the real thing from the template, and answer the tool's clarifying
   questions properly — that is the cheapest time you will ever spend.
7. Give feedback, and have every general note written to the standing
   instructions file.
8. Start the next piece as a new chat in the same project. Never a new project.

## What to check before you blame the tool

- Is the correction in the standing instructions file, or did you only say it in
  a chat?
- Are you in the project that holds the design system, or did you start a fresh
  one?
- Does `DESIGN.md` actually say what you wanted, or did you assume it?
- Did you review the template, or only the first artefact made from it?
- Are you fixing a global decision one instance at a time?
