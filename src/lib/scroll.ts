/**
 * In-page navigation.
 *
 * Lenis owns the scroll position while it is running (see Motion), so every
 * jump — nav, hero, footer, skip link — goes through here instead of the
 * browser's native anchor jump.
 */

interface LenisLike {
  scrollTo: (target: Element, options?: Record<string, unknown>) => void
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToId(id: string): void {
  if (typeof window === 'undefined') return
  const target = document.getElementById(id)
  if (!target) return

  const lenis = (window as unknown as { __lenis?: LenisLike | null }).__lenis
  if (lenis) {
    lenis.scrollTo(target, { offset: -84, duration: 1.15 })
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }

  /* Keyboard users should land where the page landed. */
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
