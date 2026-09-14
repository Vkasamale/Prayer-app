# Template brief — every screen this app has

Stage 4 of `DESIGN_ROADMAP.md`. Paste this into Claude Design, in the project
that holds the `Aged Scroll` design system, with `DESIGN.md` and `VOICE.md`
already loaded.

**The roadmap said six screens. It is thirteen**, once sign-in, the team's tabs
and the empty states are counted. Every one is listed below with its real
content, taken from the working app rather than invented.

---

## How to ask for it

> Build a screen template for this app from the `Aged Scroll` design system.
> Thirteen artboards, phone width, in the order listed. Use the exact copy given
> — it is final and has been through a voice pass. Do not add headings,
> encouragement, icons or illustrations that are not listed. Ask me anything you
> need before you build.

**Phone width is not a preference.** This is opened on a phone, usually
one-handed, often by someone upset. A desktop-first layout gets rebuilt later at
the only size that matters.

---

## Rules that apply to every screen

- **The page is a leaf of an old book.** Spine down the left where the parchment
  darkens into the gutter; gilt block edge down the right. The two edges are not
  the same — a book has one spine.
- **The scroll is a motif, never the page.** It appears on the running head and
  on fields that are written in. Nowhere else.
- **Nothing is a card.** No panel with a radius and a shadow. Every corner radius
  is zero.
- **One typeface**, Petrona, for everything.
- **Red only for words Christ speaks.** At most once per screen.
- **No icons, no illustrations, no emoji, no logo** on screens 1–7.
- Max width 32rem, centred; asymmetric horizontal padding, wider on the spine
  side.

---

# Part one — the congregation's screens

Screens 1 to 7. No sign-in, no account, no church name anywhere.

---

## Screen 1 — Identity choice · `/`

The first thing anyone sees. Its only job is one decision.

- **Running head** (scroll, small): `PRAYER REQUESTS`
- **Title**: `Share what is on your heart.`
- **Verse, in red** — Christ is speaking:
  > `28` Come to me, all you who are weary and burdened, and I will give you
  > rest.
  > `MATTHEW 11:28 (NIV)`

  Verse number as a small superior figure; reference beneath in small caps.
- **Two paths**, numbered entries ruled off from each other, sitting directly on
  the parchment. **Not cards. Equal visual weight.**

  1. **Stay anonymous** — No name, nothing kept. We will not know who you are,
     and we will not try to find out — unless you ask us to get in touch, and
     leave a number for that alone.
  2. **Share your name** — Your first name, last name and phone number. The
     prayer team can pray for you by name, and reach you if you would like to
     talk.

  **Anonymous is first and this is deliberate.** The usual pattern buries it as a
  grey afterthought, which tells someone the way they want to do this is the
  lesser way. This app exists for the person who will not walk to the front.
- **A quieter line below the rule**: `Not a prayer request? Ask a question or
  leave a note.` Ink, underlined in the rule colour. Never blue.
- **Two quiet buttons**: `Share this with someone` · `Scan QR code`
- **Footer**, small:
  > **Only the prayer team and church leadership can read what you send.** It is
  > not posted anywhere, not shown to the congregation, and not shared outside
  > that team.
  >
  > Choosing to stay anonymous keeps you anonymous. There is no sign-in here, and
  > never will be.
  >
  > If you share your name, the church keeps your contact details so the team can
  > follow up. Ask any time and we will remove them.
- **Colophon**, smallest type on the page — the NIV copyright notice, set the
  size a book sets its printing notice.

---

## Screen 2 — Request form, anonymous · `/request?identity=anonymous`

The longest screen in the app. Order matters and is not negotiable.

- **Crisis notice first**, before anything else. A preface in italic between two
  rules — not a box, not an alert, no icon:
  > **Nobody is reading this page right now.** The prayer team prays over these
  > at the Wednesday evening prayer meeting.
  >
  > If you are in danger, call the police on `997` or an ambulance on `998`.

  The numbers are tap-to-call links.
- **Title**: `What are your prayer requests or praises?`
- **Membership**, radio group, no container around the options:
  `Are you a member of Flood Blantyre Church? (optional)` — Yes · No · Prefer not
  to say
- **Prayer topic**, checkbox group. Hint: `Tick as many as fit, or none at all.`
  Thirteen options: Health and healing · Mental health · Provision and finances ·
  Work and studies · Family · Marriage and relationships · Grief and loss ·
  Guidance and decisions · Faith · Someone I love · Protection and safety ·
  Giving thanks · Something else
- **The request** — on a scroll. Label: `Write your prayer request below`. Seven
  rows. **No box inside the scroll**: no border, no fill edge, just the parchment
  darkening slightly toward the bottom. Beneath it, small:
  `Nothing you write here is tied to you. No name, no number, no sign-in.`
- **One checkbox**: `I would like someone to talk to, not only prayer.`
- **Primary button**, solid ink, square, full width: `Send to the prayer team`

---

## Screen 3 — Request form, named · `/request?identity=named`

Same screen, with the identity fields **first**, before the membership question.
They used to sit at the bottom, after the request was already written, which is
the wrong end.

- `First name` · `Last name`
- `Phone number`, with the hint: `Only the church leadership sees this. The
  prayer team prays for you by first name.` Directly beneath the number, a
  checkbox: `This number is on WhatsApp`
- Then membership, prayer topic, request, counselling checkbox, button — exactly
  as screen 2, minus the anonymity note under the textarea.

---

## Screen 4 — The counselling block, opened

A variant, not a screen of its own: what appears when `I would like someone to
talk to` is ticked. Indented under it.

- **Anonymous path only** — a phone field on a scroll:
  `Please put a phone number that we can reach you on.`
  Hint: `No name needed. This number is kept with this request only and is seen
  by church leadership alone.`
  With `This number is on WhatsApp` beneath the input.
- **Both paths** — radio group: `How would you rather talk?` — Over the phone ·
  Meet in person

---

## Screen 5 — Sent · after submitting

Closes the loop and gets out of the way. **Does not celebrate.**

- **Running head**: `PRAYER REQUESTS`
- **Title**: `It is with the prayer team.`
- **Lede**: `They will pray over it at the Wednesday evening prayer meeting.`
  followed by either `We do not know who you are, and we will not try to find
  out.` (anonymous) or `They have your number if you asked to talk.` (named)
- **Verse, in ink italic — not red.** Peter is speaking, not Christ:
  > `7` Cast all your anxiety on him because he cares for you.
  > `1 PETER 5:7 (NIV)`
- **The crisis notice again**:
  > **Please do not wait on this page for a reply.** Nobody is reading it.
  >
  > If you are in danger, call the police on `997` or an ambulance on `998`.
- **One path**: `Send another request` — Starts again from the beginning.
- `Share this with someone` · `Scan QR code`

---

## Screen 6 — Questions and notes · `/questions`

Deliberately the plainest screen in the app. **No crisis notice, no categories,
no counselling path** — everything that makes the prayer form careful would make
this one feel heavier than what it collects.

- **Running head**: `QUESTIONS AND NOTES`
- **Title**: `Ask a question or leave a note.`
- **Lede**: `Anything that is not a prayer request — a question for the church, a
  comment, something you think we should know.`
- **Phone field**, on a scroll: `A number to reach you on (optional)`
  Hint: `Without one there is no way to answer you.`
  With `This number is on WhatsApp` beneath it.
- **The note**, on a scroll: `Write your question or note below`
- **Button**: `Send`

No name is asked for, and that is deliberate: the named path creates a person
record and demands a full name and number together, which is far more than a
question is worth.

---

## Screen 7 — Question sent

- **Running head**: `QUESTIONS AND NOTES`
- **Title**: `It has been sent.`
- **Lede**, whichever is true: `Someone will get back to you on the number you
  left.` or `Nobody is reading this page, so please do not wait here for a
  reply.`
- **One path**: `Back to prayer requests`

---

# Part two — the prayer team's screens

Screens 8 to 13, behind a sign-in. **Here the church is named**, and the layout
may be wider. This half has never had a design pass and holds the most
website-looking surfaces left in the app — it needs the most attention.

---

## Screen 8 — Sign in · `/team`

- **Eyebrow**: `Flood Blantyre Church`
- **Title**: `Prayer team`
- **Lede**: `Accounts are set up by the church. There is no sign-up here.`
- `Email` · `Password`
- **Button**: `Sign in`
- **Error, deliberately vague**: `That email and password did not match.` Naming
  which half was wrong would tell anyone probing this page which addresses belong
  to the team.

---

## Screen 9 — The list, waiting · `/team`

The working screen. This is used standing up, in a room, on a Wednesday evening.

- **Header row**: eyebrow `Flood Blantyre Church`, title `Prayer team`, and a
  quiet `Sign out` at the right.
- **Tabs**: `Waiting (n)` · `Prayed over (n)` · `Questions (n)` · `Wants to talk
  (n)` *(leadership only)* · `Totals`
- **A toggle**: `Group by what it is about`
- **Grouped view** — a summary line, then collapsible groups by category, closed
  by default. One opens at a time. Requests with no category collect at the end
  under `Not sorted`.
- **A request** is a ruled entry, **not a card**:
  - Meta line: `Anonymous` or the first name · optional tags `Wants to talk`,
    `Urgent` · the date, e.g. `13 Sep`
  - The body, as written
  - If it has more than one category: `Also: Family, Grief and loss`
  - Three quiet actions: `Mark prayed over` · `Flag urgent` · `Delete`
    (`Delete` is the only destructive control in the app and should read as it)
  - A redacted row shows `Cleared by the retention policy.` in italic
- **Empty state**: `Nothing is waiting. The list is clear.`

---

## Screen 10 — The list, prayed over

Identical, with empty state: `Nothing has been marked prayed over yet.` The
action on each row reads `Move back to waiting`.

---

## Screen 11 — Questions tab

The same list styling, holding questions rather than prayer requests. **No
category grouping** — questions carry none.

Empty state: `No questions or notes have come in.`

---

## Screen 12 — Totals

Counts live behind a tab because they used to sit above the list and take most of
the first screen on a phone, so the team scrolled past the tracking to reach the
work.

- **Time window tabs** across the top.
- **Four figures**: `requests in total` · `still waiting` · `different people` ·
  `asked to talk`. Large numeral, small label beneath.
- **A note**: `N anonymous and N named. The anonymous figure counts browsers, not
  people, so it is a floor — the same person on a new phone counts twice.`
- **A twelve-month trend**, which counts redacted rows so history does not
  rewrite itself as it ages. Empty state: `Nothing yet. This fills in as requests
  come in.`
- **A second note**: `Of those who answered, N said they are part of the church
  and N said they are not. N did not say.`

---

## Screen 13 — Wants to talk · leadership only

The only screen where contact details appear. The prayer team cannot reach this,
and that has been proven from a real signed-in session, not assumed.

Each entry: who, how they would rather be contacted, the number, whether it is on
WhatsApp.

Empty state: `Nobody has asked to talk.`

---

## What to review hardest

1. **Screens 9 to 13.** Never designed, most card-like, used most often.
2. **The borderless fields on screens 2, 3, 6.** Do they read as fields at all on
   a phone? This is the biggest open risk in the design.
3. **Screen 2 at full length.** It is long. Does it feel like a form to fill or a
   page to leave?
4. **The crisis notice.** It must be impossible to miss and impossible to mistake
   for decoration — without becoming an alert box.
