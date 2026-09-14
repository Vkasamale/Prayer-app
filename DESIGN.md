# Aged Scroll — design system

The rulebook for the prayer request app. Written to be handed to a design tool as
input 1 of the method in `DESIGN_FRAMEWORK.md`.

Everything here is extracted from the working app (`app/globals.css`), so it
describes something that exists rather than something hoped for.

---

## 1. What this is, and who is looking at it

A single-purpose app where someone sends a prayer request to a church prayer
team, with their name or without it. It is opened once, used for two minutes, and
closed. There is no dashboard, no account, no return visit.

Three facts about the reader shape every rule below:

- **They may be upset.** The interface must never be one more thing to work out.
- **They may be in a room with other people.** A screen that lights up a dark
  room is a privacy problem, not a style problem.
- **They may distrust the church.** Nothing may look like marketing.

## 2. The metaphor

**The page is a leaf of an old book.** Aged parchment, iron-gall ink, and two
edges that are not the same: the left is the spine, where the paper curves down
into the gutter and darkens, with a stitched fold hard against the edge; the
right is the outer edge of the block, gilt, with the faint stack of leaves
beneath it. Symmetrical edges read as a border. A book only has one spine.

**The scroll is a motif used inside that page, not the page itself.** It appears
in exactly two places — the running head, and any field that is written in — and
nowhere else. This was tried as a whole-page treatment and rejected: turning the
entire surface into a scroll makes every element on it shout, and the page stops
being something you can read and becomes something you have to look at.

The rule that decides future cases: **a scroll marks where words are set down.**
The title of the leaf, and the space you write in. Everything else is the leaf.

**The book turns its own leaves.** The first screen is a right-hand page, the way
a book falls open. Every navigation turns a leaf: the next screen is a left-hand
page, the one after that a right-hand page again. The spine and the gilt block
edge swap with it, because a leaf carries its own gutter — without that swap the
alternation is just content sliding about, and with it the page has visibly been
turned over. The arriving leaf swings in on its gutter, since paper pivots where
it is bound and not down its middle.

A reload opens the book at the beginning again. A reload is not a page turn.

When a decision is unclear, the question is "what would this be in an old book?"
— and the answer is usually "nothing", which is the right answer.

## 3. Colour

Every value has one job. There are no spare colours.

| Token | Hex | Job |
|---|---|---|
| `--paper` | `#C9B083` | The parchment ground. The whole page sits on it. |
| `--leaf` | `#EADCB8` | A sheet lying on the parchment — the unrolled scrolls. |
| `--raised` | `#D6C096` | A surface lifted very slightly off the ground. |
| `--rule` | `#A68A55` | Hairline rules and dividers. |
| `--ink` | `#3B2B16` | Body text. Iron gall, not black. |
| `--ink-strong` | `#281C0D` | Headings and anything that must carry. |
| `--faded` | `#544326` | Secondary text. Set by contrast, not by taste — see §8. |
| `--gilt` | `#9A7B34` | Focus rings and numerals. Never a fill. |
| `--red` | `#7E2012` | Reserved. See the rule below. |
| `--stave` | `#67472D` | The scroll rod. Dark walnut. |
| `--stave-dark` | `#3D2A18` | Where the rod turns away from the light. |
| `--stave-light` | `#B08A5C` | The highlight along the rod. |
| `--finial` | `#6F533B` | The turned cap at each end of a rod. |
| `--sheet-centre` | `#E7DAC7` | The clean middle of a scroll's sheet. |
| `--sheet-edge` | `#D9C5AA` | The same sheet, approaching its perimeter. |
| `--sheet-stain` | `#AF9467` | Stains and scorch, at the edges. |

**The ground is darker than it was.** It went from `#DED0AB` to `#C9B083` for a
reason worth keeping: a scroll's pale centre is invisible when the sheet and the
page are the same tone. The contrast between sheet and ground is what makes the
scroll read at all. `--faded` was darkened with it, because at the old value it
measured 3.17:1 against the new ground and failed the floor in §8.

**The red rule.** Red is the red-letter convention — the words of Christ — and
nothing else. A verse is set in red only when Christ is the speaker; anyone else,
including Peter and Paul, is ink italic. This means red appears at most once on a
page and never on a control, a link, an error or a heading. The rule is what
stops it becoming an accent colour, and it is the single most important line in
this file.

**The stave gradient.** The rod is a six-stop gradient running top to bottom,
dark at both edges with its highlight a little **above** centre, so it reads as a
cylinder lit from above rather than as a striped bar. Two stops read as flat.

**Ageing.** The ground carries four brown foxing blooms at deliberately uneven
positions, a darkened vignette at the edges where a scroll would be handled, and
an inline SVG turbulence grain at about 8% opacity. All generated, no image
files. The blooms must stay unevenly spaced — regular intervals read instantly as
a pattern and the illusion dies.

### The reference, and what it actually shows

**Vincent's reference images are the authority on the look.** Three were
supplied and sampled pixel by pixel. They are stock renderings of scrolls, not
photographs of archival manuscripts, and that is a deliberate choice: the target
is the *idea* of an old scroll as a person pictures it, not an accurate record of
a ninth-century skin.

This matters because the two disagree. Digitised manuscripts measure as
desaturated grey-olive, around `#BDB69B` at 15–20% saturation. The reference
images measure warm and tan, `#BFA97E` at **34%** saturation. Archival accuracy
would read as dirty and grey on a phone. The references win.

Measured from the references:

| | Reference |
|---|---|
| Sheet field, mean | `#BFA97E`, saturation 34% |
| Clean centre of the sheet | `#E7DAC7` |
| Near the sheet's edge | `#D9C5AA` |
| Darkest 5% (stains, scorch) | `#AF9467`, saturation 41% |
| Lightest 5% | `#CDC09C`, saturation 24% |
| Stave, mid-length | `#67472D` |
| Finial (the turned end cap) | `#6F533B` |

**Six things the references do that this app does not.** In rough order of how
much each one is costing us:

1. **The sheet is pale in the middle and dark at its edges.** This is the single
   strongest effect in every reference — a broad inward gradient, clean centre,
   stained and scorched perimeter. Ours is flat and even.
2. **Saturation rises as the sheet darkens.** The clean centre is 24%, the
   stains are 41%. This is the one finding that agrees with the manuscripts.
3. **The side edges are ragged.** The silhouette is not a rectangle — it is
   torn, wavy, and irregular, and no two edges match. Ours is a clean box.
4. **The staves are dark walnut, not gold.** `#67472D`, far darker and browner
   than the gilt cylinder currently used.
5. **Every stave has finials** — distinctly wider, darker turned caps at each
   end. A plain uniform cylinder reads as a dowel, not as a scroll rod.
6. **The sheet curls over each stave**, with a visible lip and a shadow cast
   beneath it. The sheet does not simply stop where the rod begins.

**And one rule the references overturn.** Every one of them rolls **top to
bottom** — staves above and below, sheet hanging between. None rolls
side-to-side. The "horizontal scroll for the running head" in §6 was invented,
not observed, and should go: a scroll has its staves at the top and the bottom,
whatever it is being used for.

**Texture is creasing, not foxing.** The references are crumpled — soft diagonal
folds catching light across the whole sheet — with a few hard dark stains near
the edges. Ours has four soft round blooms, which is the wrong texture
altogether.

## 4. Type

**One family throughout: Petrona.** Serif, with `Georgia, 'Times New Roman',
serif` behind it. Display and body are the same family, the way a Bible is set. A
second family would make this look like a website.

| Role | Size | Notes |
|---|---|---|
| Page title | `clamp(2rem, 9vw, 2.75rem)` | Weight 400, line height 1.15, letter spacing -0.01em |
| Body | 1rem | Line height 1.6 |
| Lede | 1rem | `--faded`, max width 28rem |
| Running head | 0.85rem | Uppercase, letter spacing 0.18em |
| Label | 0.9rem | Weight 600 |
| Hint | 0.8rem | `--faded` |
| Colophon | 0.68rem | The copyright notice, set as a book sets its printing notice |

Headings are weight 400, never bold. Scale carries the hierarchy; weight does
not.

**Checked against two sites that set old text for screens**, since both are
solving the same problem this app has:

- *The Public Domain Review* — Alegreya, one serif family across display and
  body, headings at weight 700, body at 16px.
- *Standard Ebooks* — Georgia, justified, 15px over 22.5px (line height 1.5),
  measure 456px, which is around 60–65 characters.

Both use a single serif family for everything, which is the choice this app has
already made. Where they differ from us is weight: both go bold on headings and
we do not. Keep weight 400 — a bold heading on parchment reads as printed
signage rather than a manuscript, and the scale is already doing the work.

The measure is the transferable number: **60–65 characters**. This app's 32rem
at 1rem lands in that range and should stay there.

## 5. Shape, spacing and depth

- **Every corner radius is zero**, except the staves, which are pill-rounded
  because they are cylinders.
- **Page**: max width 32rem, centred, 2rem of vertical padding, 2rem gap between
  blocks. Horizontal padding is deliberately asymmetric — wider on the spine
  side than the gilt side, the way a bound page actually sits.
- **Shadows exist only to make a stave look round** and to lift a scroll off the
  parchment. There is no elevation system and no floating panel.

## 6. Components

### The scroll

One object, used at two sizes and two orientations. A parchment sheet with a
turned stave at each end, lit from above.

- **The staves overhang the sheet on both sides.** This is the whole tell — a
  sheet that ends exactly where its stave ends reads as a box with a stripe on
  it.
- The sheet darkens where it meets each stave, and is faintly cupped across its
  width, the way a sheet held at two ends always is.

**Staves are always at the top and the bottom**, never at the sides. Every
reference image rolls top to bottom; a side-rolling scroll was invented and is
wrong. Used at two sizes: small for the running head, larger for any field that
is written in.

Each stave carries **finials** — wider, darker turned caps at both ends,
`#6F533B` against a stave body of `#67472D`. Dark walnut, not gilt. A uniform
cylinder with no caps reads as a dowel.

The sheet **curls over** each stave: a visible lip, and a shadow cast beneath it
onto the sheet. It does not stop flat where the rod begins.

The sheet is **pale at its centre and dark at its edges** — `#E7DAC7` in the
clean middle, `#D9C5AA` approaching the perimeter, with harder stains at
`#AF9467`. Saturation rises as it darkens: 24% in the clean field, 41% in the
stains.

The **side edges are ragged**, not straight. Torn and irregular, and no two
alike.

Two scrolls in a row must never let their staves touch — one stave under another
reads as a single fat bar with a seam.

### Text fields

A field lives on a vertical scroll and **has no edge of its own**. No border, no
box. What marks the writing area is the parchment darkening very slightly toward
the bottom, the way a sheet does where it has been written on most. It fades out
of the sheet rather than being cut from it.

Because the boundary is invisible, the states that remain must be loud: focus is
a full 2px gilt outline, offset from the sheet.

### Choices

Radio buttons and checkboxes have **no container** — the tick or the dot is the
control and is visible on its own. Minimum hit area 2.75rem, because this is
tapped one-handed by someone who may be upset.

Groups of choices are **not** put on scrolls. A row of tick boxes on its own
scroll would make picking a topic look as weighty as writing the request.

### Paths

The identity choices are numbered entries ruled off from one another, sitting
directly on the parchment. Both are given equal visual weight, and the anonymous
option is listed first. The usual pattern buries the anonymous option as a grey
afterthought, which tells someone the way they want to do this is the lesser way.
This app exists for the person who will not walk to the front.

### Buttons

One primary action per screen: solid ink, square, full width. Secondary actions
are quiet — text with a hairline border, no fill.

## 7. Voice

- **Plain, short, and never cheerful.** Someone may be writing about a death.
- **Say the true thing, including when it is unhelpful.** "Nobody is reading this
  page right now" is the most important sentence in the app.
- **Never promise what cannot be delivered.** No "we're here for you" when nobody
  is on call.
- Sentence case everywhere. No exclamation marks. No emoji, ever.
- Errors say what to do next and never blame: "That did not send. Your words are
  still here — please try once more."
- Labels are instructions, not nouns: "Write your prayer request below", not
  "Your request".
- Never surface a raw database or system error. It means nothing to the reader
  and this is the worst possible moment to show someone a stack trace.

## 8. Accessibility floor

- Body text meets WCAG AA against the parchment. Check every new colour pair; the
  palette is low-contrast by nature and it is easy to go under.
- Every interactive target is at least 2.75rem tall.
- Focus is always visible and always the gilt outline. It is never removed, and
  on the borderless fields it is doing the work a border normally does.
- Nothing is conveyed by colour alone. The red verse is also italic and also
  attributed.
- Grain, foxing and shadows are decorative and hidden from assistive technology.
- Every control has a real label. No placeholder-as-label.

## 9. Anti-patterns — what this must never look like

- **Nothing is a card.** No panel with a radius and a drop shadow on a tinted
  ground. A card is the most website-looking object there is.
- **No second typeface**, and no sans-serif anywhere.
- **No red that is not a quotation of Christ.** Not on a button, a link, an error
  or a badge.
- **No blue links.** Links are ink, underlined in the rule colour.
- **No icons, no illustrations, no stock photography, no emoji.**
- **No gradient buttons, no glassmorphism, no neumorphism.**
- **No animation.** Nothing slides, fades, bounces or pulses.
- **No progress bars, no step counters, no confetti on success.**
- **No church branding on the congregation's side.** Someone may pass the link to
  a friend who has no warm feelings toward church; a name at the top gives them a
  reason to close the tab before reading a word.
- **No image files for texture.** Grain, foxing and staves are all generated, so
  they stretch to any size and load instantly.
- **The scroll is never the page.** It is the running head and the write-in
  fields. It is not the background, not a section wrapper, not a card by another
  name.

## 10. The open risk, stated plainly

This palette is bright. It replaced a dark one, and the dark one existed for a
reason: a person at the back of a room should not be lit up by their own screen.
That reason has not gone away — it is now carried by the writing and by the
absence of any church name rather than by the colour.

Anyone extending this design should know that a bright page in a dark room is
conspicuous in a way the old one was not, and that this is the largest unresolved
question in the design. It is to be tested with real users, not decided from a
mockup.
