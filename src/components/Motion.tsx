'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/**
 * The motion layer, a React port of the static build's motion.js.
 *
 * Two rules:
 *   1. The page is complete and readable without it: nothing here hides content
 *      in CSS, and if the visitor prefers reduced motion (or a library fails to
 *      load) this component does nothing but the scroll progress bar.
 *   2. Everything it adds is undone on unmount, so React's own rendering always
 *      stays the source of truth.
 */

function setLenis(instance: Lenis | null): void {
  ;(window as unknown as { __lenis?: Lenis | null }).__lenis = instance
}

function countUp(node: HTMLElement): void {
  const target = parseInt((node.textContent || '').replace(/[^\d]/g, ''), 10)
  if (isNaN(target) || target < 1) return
  const duration = 1200
  let start: number | null = null
  let frame = 0

  const step = (now: number) => {
    if (start === null) start = now
    const p = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    node.textContent = String(Math.round(target * eased))
    if (p < 1) frame = window.requestAnimationFrame(step)
    else node.textContent = String(target)
  }
  frame = window.requestAnimationFrame(step)
  node.dataset.countFrame = String(frame)
}

/* ---------------------------------------------------------------
   Cursor-following photo preview on directory rows.
   A background-image div, so it never changes the page's <img> math.
   --------------------------------------------------------------- */
function setupPreview(): (() => void) | null {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return null
  const indexEl = document.getElementById('entry-index')
  if (!indexEl) return null

  let pv: HTMLDivElement | null = null
  let pvImg: HTMLDivElement | null = null
  let pvLabel: HTMLSpanElement | null = null
  let px = 0
  let ty = 0
  let tx = 0
  let py = 0
  let looping = false
  let alive = true

  const ensurePreview = () => {
    if (pv) return pv
    pv = document.createElement('div')
    pv.className = 'hover-preview'
    pv.setAttribute('aria-hidden', 'true')
    pvImg = document.createElement('div')
    pvImg.className = 'hp-img'
    pvLabel = document.createElement('span')
    pvLabel.className = 'hp-label'
    const inner = document.createElement('div')
    inner.className = 'hover-preview-inner'
    inner.appendChild(pvImg)
    inner.appendChild(pvLabel)
    pv.appendChild(inner)
    document.body.appendChild(pv)
    return pv
  }

  const paint = () => {
    if (pv) pv.style.transform = `translate3d(${px}px,${py}px,0)`
  }

  const loop = () => {
    if (!alive) return
    px += (tx - px) * 0.17
    py += (ty - py) * 0.17
    paint()
    window.requestAnimationFrame(loop)
  }

  const place = (event: MouseEvent) => {
    const w = 232
    const h = 210
    tx = Math.min(event.clientX + 34, window.innerWidth - w - 14)
    ty = Math.min(Math.max(event.clientY - h / 2, 14), window.innerHeight - h - 14)
    px = tx
    py = ty
    paint()
  }

  const onOver = (event: Event) => {
    const target = event.target as Element | null
    const row = target?.closest ? target.closest('.entry') : null
    if (!row) return
    const src = row.getAttribute('data-photo')
    if (!src) return
    ensurePreview()
    if (pvImg) pvImg.style.backgroundImage = `url("${src}")`
    const heading = row.querySelector('h3')
    if (pvLabel) pvLabel.textContent = heading ? heading.textContent || '' : ''
    pv?.classList.add('is-visible')
    if (!looping) {
      looping = true
      window.requestAnimationFrame(loop)
    }
  }

  const hide = () => pv?.classList.remove('is-visible')

  document.addEventListener('mousemove', place, { passive: true })
  indexEl.addEventListener('mouseover', onOver)
  indexEl.addEventListener('mouseleave', hide)
  document.addEventListener('mouseleave', hide)

  return () => {
    alive = false
    document.removeEventListener('mousemove', place)
    indexEl.removeEventListener('mouseover', onOver)
    indexEl.removeEventListener('mouseleave', hide)
    document.removeEventListener('mouseleave', hide)
    pv?.remove()
  }
}

export function Motion() {
  useEffect(() => {
    const docEl = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* --- scroll progress + sticky header state (always on) --- */
    const bar = document.getElementById('progress-bar')
    const header = document.querySelector<HTMLElement>('.site-header')
    let queued = false

    const paint = () => {
      queued = false
      const max = docEl.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`
      if (header) header.classList.toggle('is-solid', window.scrollY > 30)
    }

    const onScroll = () => {
      if (!queued) {
        queued = true
        window.requestAnimationFrame(paint)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', paint)
    paint()

    /* --- counters count up when a stat enters the viewport --- */
    let observer: IntersectionObserver | null = null
    if (!reduced && 'IntersectionObserver' in window) {
      const counters = document.querySelectorAll<HTMLElement>('[data-count]')
      if (counters.length) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return
              observer?.unobserve(entry.target)
              countUp(entry.target as HTMLElement)
            })
          },
          { threshold: 0.6 },
        )
        counters.forEach((node) => observer?.observe(node))
      }
    }

    const teardownPreview = setupPreview()

    /* --- everything below animates: skip it entirely when motion is off --- */
    let teardownAnimation: (() => void) | null = null

    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger)

      /* Lenis owns the scroll position while it runs. */
      let lenis: Lenis | null = null
      try {
        lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 })
        setLenis(lenis)
        docEl.classList.add('has-lenis')
        lenis.on('scroll', () => ScrollTrigger.update())
        gsap.ticker.add(lenisRaf)
        gsap.ticker.lagSmoothing(0)
      } catch {
        setLenis(null)
      }

      function lenisRaf(time: number) {
        lenis?.raf(time * 1000)
      }

      /* Split the headline into words for the intro, and remember the
         original markup so a remount (Strict Mode) can start over. */
      const title = document.querySelector<HTMLElement>('[data-split]')
      const originalTitle = title ? title.innerHTML : null
      let words: Element[] = []
      if (title) {
        splitWords(title)
        words = Array.from(title.querySelectorAll('.wi'))
      }

      const ctx = gsap.context(() => {
        /* intro timeline */
        const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })

        if (words.length) {
          gsap.set(words, { yPercent: 118 })
          intro.to(words, { yPercent: 0, duration: 1.1, stagger: 0.045 }, 0.15)
        }

        ;['.kicker', '.standfirst', '.lead-actions', '.stats'].forEach((selector, i) => {
          const node = document.querySelector(selector)
          if (!node) return
          gsap.set(node, { opacity: 0, y: 26 })
          intro.to(node, { opacity: 1, y: 0, duration: 0.9 }, 0.35 + i * 0.11)
        })

        const cards = gsap.utils.toArray<HTMLElement>('.stack-card')
        if (cards.length) {
          gsap.set(cards, { opacity: 0, y: 70, scale: 0.9 })
          intro.to(cards, { opacity: 1, y: 0, scale: 1, duration: 1.15, stagger: 0.13 }, 0.5)
        }

        /* hero background + photo stack drift as you leave the hero */
        gsap.to('.hero-bg', {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('.hero-stack', {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })

        /* pointer tilt on the photo stack */
        const stack = document.querySelector<HTMLElement>('[data-stack]')
        const hero = document.querySelector<HTMLElement>('.hero')
        if (stack && hero && cards.length) {
          gsap.set(stack, { transformPerspective: 1100 })
          const tiltX = gsap.quickTo(stack, 'rotationY', { duration: 0.7, ease: 'power3' })
          const tiltY = gsap.quickTo(stack, 'rotationX', { duration: 0.7, ease: 'power3' })
          const cardX = cards.map((card) => {
            const depth = parseFloat(card.getAttribute('data-depth') || '') || 14
            return { fn: gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power3' }), depth }
          })

          const onMove = (event: MouseEvent) => {
            const r = hero.getBoundingClientRect()
            const nx = (event.clientX - r.left) / r.width - 0.5
            const ny = (event.clientY - r.top) / r.height - 0.5
            tiltX(nx * 9)
            tiltY(-ny * 7)
            cardX.forEach((c) => c.fn(nx * c.depth))
          }
          const onLeave = () => {
            tiltX(0)
            tiltY(0)
            cardX.forEach((c) => c.fn(0))
          }

          hero.addEventListener('mousemove', onMove)
          hero.addEventListener('mouseleave', onLeave)
        }

        /* scroll reveals */
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((node) => {
          gsap.from(node, {
            opacity: 0,
            y: 28,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 88%', once: true },
          })
        })

        /* directory rows: first reveal on scroll, then on every re-filter */
        const indexRoot = document.getElementById('entry-index')
        let revealed = false

        const animateRows = (rows: Element[]) => {
          if (!rows.length) return
          gsap.fromTo(
            rows,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.02,
              ease: 'power2.out',
              overwrite: true,
              immediateRender: false,
            },
          )
        }

        if (indexRoot) {
          ScrollTrigger.create({
            trigger: indexRoot,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              revealed = true
              animateRows(gsap.utils.toArray('#entry-index .entry'))
            },
          })
        }

        const onRender = () => {
          if (!revealed || !indexRoot) return
          const r = indexRoot.getBoundingClientRect()
          if (!(r.top < window.innerHeight * 0.95 && r.bottom > 0)) return
          animateRows(gsap.utils.toArray('#entry-index .entry'))
        }
        document.addEventListener('ph:render', onRender)

        const refresh = () => ScrollTrigger.refresh()
        window.addEventListener('load', refresh)
        document.fonts?.ready.then(refresh).catch(() => undefined)
      })

      teardownAnimation = () => {
        document.removeEventListener('ph:render', () => undefined)
        window.removeEventListener('load', () => undefined)
        ctx.revert()
        gsap.ticker.remove(lenisRaf)
        setLenis(null)
        lenis?.destroy()
        docEl.classList.remove('has-lenis')
        if (title && originalTitle !== null) {
          title.innerHTML = originalTitle
        }
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', paint)
      observer?.disconnect()
      teardownPreview?.()
      teardownAnimation?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

/* Wrap a text node's words in .w > .wi spans for the intro animation. */
function splitWords(node: HTMLElement): void {
  const kids = Array.from(node.childNodes)
  node.textContent = '' // rebuild from the snapshot, or the heading prints twice
  kids.forEach((kid) => {
    if (kid.nodeType === Node.TEXT_NODE) {
      const parts = (kid.textContent || '').split(/(\s+)/)
      parts.forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          node.appendChild(document.createTextNode(part))
          return
        }
        const w = document.createElement('span')
        w.className = 'w'
        const wi = document.createElement('span')
        wi.className = 'wi'
        wi.textContent = part
        w.appendChild(wi)
        node.appendChild(w)
      })
    } else if (kid.nodeType === Node.ELEMENT_NODE) {
      const w = document.createElement('span')
      w.className = 'w'
      const wi = document.createElement('span')
      wi.className = 'wi'
      wi.appendChild(kid)
      w.appendChild(wi)
      node.appendChild(w)
    }
  })
}
