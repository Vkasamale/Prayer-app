-- Questions and notes, alongside prayer requests.
--
-- The congregation asked for somewhere to send a question or a note that is not
-- a prayer request. It is the same submission in every respect except what the
-- prayer team does with it, so it is a third kind rather than a second table:
-- the same row-level security, the same retention, the same redaction, the same
-- team view, with no new surface to secure.
--
-- No transaction here on purpose. A new enum value cannot be used by other
-- statements in the transaction that adds it, and wrapping this in begin/commit
-- is the usual way that bites. It is a single idempotent statement.

alter type submission_kind add value if not exists 'question';

-- Nothing else changes. submit_prayer already takes submission_kind as a
-- parameter, submissions_for_team already carries the kind column, and the
-- grants from 0011 are on columns, not values.

-- Verification: the live database must list three values.
--
--   select enum_range(null::submission_kind);
--     -> {prayer,counseling,question}
