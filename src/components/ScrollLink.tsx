'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { scrollToId } from '@/lib/scroll'

interface ScrollLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: ReactNode
}

/**
 * An ordinary `<a href="#section">` that scrolls through Lenis when it is
 * active, so navigation matches the rest of the motion. Without JavaScript it
 * is still a plain anchor.
 */
export function ScrollLink({ href, children, onClick, ...rest }: ScrollLinkProps) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (href.startsWith('#') && href.length > 1) {
          event.preventDefault()
          scrollToId(href.slice(1))
        }
      }}
    >
      {children}
    </a>
  )
}
