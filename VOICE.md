# Voice principles

How this app talks. Upload alongside `DESIGN.md` as the voice file for the
`Aged Scroll` design system — `DESIGN.md` governs how it looks, this governs how
it sounds.

Every example below is real copy from the working app, not invented for this
document.

---

## Who is reading

One person, on a phone, who has decided to ask for prayer and has not yet decided
to go through with it. Possibly upset. Possibly in a room with other people.
Possibly wary of the church.

They will read perhaps forty words before deciding whether this is for them.

**Nobody reads this twice.** There is no onboarding, no second visit, no learning
curve to climb. Every sentence is read once, cold, by someone whose attention is
elsewhere.

---

## The five rules

### 1. Say the true thing, including when it is unhelpful

The most important sentence in the app is a disappointment:

> **Nobody is reading this page right now.** Requests are prayed over at the
> Wednesday evening prayer meeting, so please do not wait here for a reply.

Every instinct in product writing says soften that. Do not. Someone in crisis
deciding whether to sit and wait for an answer needs the real answer, and a warm
sentence that leaves them waiting is worse than a cold one that does not.

Name the day. "Soon" is not a fact.

### 2. Never promise what nobody can deliver

The church has no crisis line and nobody on call. So the app does not say "we are
here for you", does not say "someone will be in touch shortly", and does not imply
a person is at the other end.

Where a promise would be false, give a fact instead — including a phone number
that belongs to someone else:

> If you are in danger, call the police on 997 or an ambulance on 998.

### 3. Plain, short, and never cheerful

Someone may be writing about a death. There are no exclamation marks in this app,
no congratulation on sending, no encouragement to "share your heart with the
community". Warmth is carried by being useful and honest, never by enthusiasm.

### 4. Labels are instructions, not nouns

A label names what to do, not what the box is called.

| Write this | Not this |
|---|---|
| Write your prayer request below | Your request |
| Please put a phone number that we can reach you on. | Contact number |
| Are you a member of Flood Blantyre Church? (optional) | Membership |

### 5. Cut the sentence that explains the last sentence

The strongest edit made to this app was deleting copy, not adding it. All of
these were removed and nothing was lost:

- *"As much or as little as you want. Only the prayer team and church leadership
  read it, exactly as you wrote it."*
- *"It helps the prayer team pray through similar things together."*
- *"...and is deleted with it. It is never linked to anything else you have
  sent."*

Each was true. Each was answering a question nobody had asked yet. If a sentence
justifies, reassures about, or elaborates on the sentence above it, delete it and
see whether anyone misses it.

---

## Errors

An error says what happened, then what to do, and never blames the reader. It
also reassures that nothing was lost, because that is the actual fear:

> That did not send. Your words are still here — please try once more.

> Leave a phone number so someone can reach you.

> That is longer than we can accept. Please shorten it a little.

**Never surface a raw database or system error.** It means nothing to the person
reading it, and this is the worst possible moment to show someone a stack trace.

---

## Confirmation

The end of the flow closes the loop and then gets out of the way. It does not
celebrate.

> **It is with the prayer team.** They will pray over it at the Wednesday evening
> prayer meeting. We do not know who you are, and we will not try to find out.

Note the second half changes with the path taken — a named request gets *"They
have your number if you asked to talk."* The app says what is true of **this**
person, not what is true in general.

---

## Privacy is stated as fact, never as reassurance

Say what happens to the words. Do not say "we take your privacy seriously".

> Only the prayer team and church leadership can read what you send. It is not
> posted anywhere, not shown to the congregation, and not shared outside that
> team.

> Choosing to stay anonymous keeps you anonymous. There is no sign-in here, and
> never will be.

> No name, nothing kept. We will not know who you are, and we will not try to
> find out — unless you ask us to get in touch, and leave a number for that
> alone.

That last one is the model for the whole app: a plain promise, and the one
exception to it, in the same breath.

---

## Mechanics

- **Sentence case** everywhere. Headings, labels, buttons.
- **No exclamation marks.** None.
- **No emoji.** Not in copy, not in labels, not anywhere.
- **British English.** *Organise*, *apologise*, *counselling*.
- **Second person, plural first person.** "You" for the reader; "we" for the
  church. Never "the user", never "users".
- **Contractions are fine** — "do not" and "don't" both appear. Choose by rhythm,
  not by rule. Formality is not the same as gravity.
- **Bold is for the one sentence that must not be missed**, at most once per
  block. Usually the unwelcome fact.
- **Buttons are verbs**: "Send to the prayer team", "Send it", "Mark prayed
  over", "Share this with someone".

---

## Words this app does not use

| Banned | Why |
|---|---|
| Submit | This is a prayer, not a form to a council office. Use *send*. |
| User | A person. Say *you*, or *someone*. |
| Journey, space, community | Church marketing vocabulary. |
| Reach out | Say *get in touch*, or *talk to*. |
| We're here for you | Nobody is. See rule 2. |
| Feel free to | Filler. Delete the phrase, keep the sentence. |
| Simply, just, easily | Tells someone their difficulty is their fault. |
| Oops, Whoops, Uh-oh | Nothing here is funny. |
| Powered by, Built with | This is not a product launch. |

---

## The name of the church

**The church is never named on the congregation's side** of the app — not in the
heading, not in the footer, not in the page title.

Someone may pass this link to a friend who has no warm feelings towards the
church, or towards church in general, and a name at the top gives them a reason to
close the tab before reading a word.

The single exception is the membership question on the form — *"Are you a member
of Flood Blantyre Church? (optional)"* — where the name is the question. The
prayer team's own pages, behind a sign-in, name the church freely.

---

## Scripture

Two verses appear, both NIV, both load-bearing rather than decorative.

- Set a verse in red **only when Christ is the speaker.** Matthew 11:28 on the
  first screen is red. 1 Peter 5:7 on the confirmation screen is Peter, so it is
  ink italic. This is the red-letter convention and it is the reason red exists in
  the palette at all.
- Always attribute: book, chapter, verse, translation.
- The NIV is copyrighted. Biblica permit up to 500 verses non-commercially
  provided their notice appears, and it does, as a colophon at the foot of the
  first screen. Two verses is well inside that. **If this app ever takes money,
  the permission has to be looked at again.**
- Do not add more verses. Two carry weight. Six would read as decoration.

---

## A test before shipping any sentence

Read it aloud as though to someone who has just told you something painful.

If it sounds like a brochure, a form, or a chatbot, rewrite it. If it sounds like
a person telling the truth plainly, it is right.
