// Child-safety guards: a user who is 15 or younger can only message or add
// people whose age is 19 or younger, to prevent predatory contact.

export function getAge(user) {
  if (!user?.birthday) return null;
  const b = new Date(user.birthday);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age < 0 ? 0 : age;
}

export function isProtectedMinor(user) {
  const a = getAge(user);
  return a !== null && a <= 15;
}

const MINOR_MAX_CONTACT_AGE = 19;

// Returns { allowed: boolean, reason?: string }.
// Non-minors can contact anyone. A protected minor can only contact someone
// whose age is at most MINOR_MAX_CONTACT_AGE; an unknown-age target is blocked
// for minors (safety-first) so adults can't bypass the guard by omitting a birthday.
export function canContact(actor, target) {
  if (!isProtectedMinor(actor)) return { allowed: true };
  const ta = getAge(target);
  if (ta === null) {
    return { allowed: false, reason: "For your safety, you can only message or add people with a verified age of 19 or younger." };
  }
  if (ta > MINOR_MAX_CONTACT_AGE) {
    return { allowed: false, reason: "For your safety, you can only message or add people 19 or younger." };
  }
  return { allowed: true };
}