let locks = 0;
export function lockScroll() {
  if (typeof document === "undefined") return;
  locks += 1;
  document.documentElement.style.overflow = "hidden";
}
export function unlockScroll() {
  if (typeof document === "undefined") return;
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.documentElement.style.overflow = "";
}
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
