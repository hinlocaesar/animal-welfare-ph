'use client'

import { useCallback, useEffect, useState } from 'react'

import { Icon } from '@/components/Sprite'
import { ScrollLink } from '@/components/ScrollLink'

/** Below this width the nav collapses into the hamburger (matches the CSS). */
const DESKTOP = 960

export function Header() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const onResize = () => {
      if (window.innerWidth >= DESKTOP) close()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [close])

  return (
    <header className="site-header" id="top">
      <div className="wrap nameplate">
        <ScrollLink className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="i-paw" size={24} />
          </span>
          <span className="brand-text">
            Paws &amp; Hearts <span className="brand-ph">PH</span>
          </span>
        </ScrollLink>

        <button
          type="button"
          className="nav-toggle"
          id="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="nav-toggle-lines" aria-hidden="true" />
          <span className="visually-hidden">Menu</span>
        </button>

        <nav
          className={`site-nav${open ? ' is-open' : ''}`}
          id="site-nav"
          aria-label="Primary"
        >
          <ul>
            <li>
              <ScrollLink href="#directory" onClick={close}>
                Directory
              </ScrollLink>
            </li>
            <li>
              <ScrollLink href="#how-to" onClick={close}>
                Volunteer responsibly
              </ScrollLink>
            </li>
            <li>
              <ScrollLink href="#about" onClick={close}>
                About the data
              </ScrollLink>
            </li>
          </ul>
          <ScrollLink className="btn btn-gold btn-small nav-cta" href="#directory" onClick={close}>
            See the directory
            <Icon name="i-arrow" size={16} className="ico" />
          </ScrollLink>
        </nav>
      </div>
    </header>
  )
}
