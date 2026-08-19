// The prayer categories a person can tick when they submit, and the labels the
// prayer team sees when working through Wednesday's list.
//
// Chosen by the submitter, never inferred. See BACKLOG.md for why automatic
// grouping was set aside.
//
// Kept deliberately short. Every extra option is another decision asked of
// someone who may be upset, and a longer list on a phone screen means more
// scrolling before they reach the box they came to type in.

export const CATEGORIES = [
  { value: 'health', label: 'Health and healing' },
  { value: 'mental_health', label: 'Mental health' },
  { value: 'provision', label: 'Provision and finances' },
  { value: 'work_studies', label: 'Work and studies' },
  { value: 'family', label: 'Family' },
  { value: 'relationships', label: 'Marriage and relationships' },
  { value: 'grief', label: 'Grief and loss' },
  { value: 'guidance', label: 'Guidance and decisions' },
  { value: 'faith', label: 'Faith' },
  // A large share of requests are on behalf of somebody else. Without this they
  // get filed under the wrong theme entirely.
  { value: 'someone_i_love', label: 'Someone I love' },
  { value: 'protection', label: 'Protection and safety' },
  // Not everything coming in is a request, and answered prayer read out at the
  // meeting is worth separating from need.
  { value: 'thanks', label: 'Giving thanks' },
  { value: 'other', label: 'Something else' },
] as const

export type Category = (typeof CATEGORIES)[number]['value']

const LABELS = new Map<string, string>(CATEGORIES.map((c) => [c.value, c.label]))

export function categoryLabel(value: string): string {
  return LABELS.get(value) ?? value
}
