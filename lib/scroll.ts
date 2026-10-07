/** Anchor scroll that respects prefers-reduced-motion. */
export function scrollToId(id: string, behavior?: ScrollBehavior) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resolved: ScrollBehavior =
    behavior ?? (reduceMotion ? 'auto' : 'smooth');

  // window.scrollTo is more reliable than scrollIntoView when body overflow
  // was recently toggled by a modal lock.
  const headerOffset = 56;
  const top = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - headerOffset,
  );
  window.scrollTo({ top, behavior: resolved });
}
