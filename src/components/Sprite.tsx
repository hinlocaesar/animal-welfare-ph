import type { SVGProps } from 'react'

/**
 * Inline SVG sprite — every icon the site uses lives in one <defs> block so each
 * call site is a tiny <use href="#…"> reference. No icon font, no requests.
 */

/** Symbols drawn on the 64×64 paw grid (category + brand marks). */
const LARGE = new Set([
  'i-paw',
  'i-dogs-cats',
  'i-wildlife',
  'i-marine',
  'i-farm',
  'i-drives',
  'i-mixed',
])

export function Sprite() {
  return (
    <svg
      className="sprite"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <symbol id="i-paw" viewBox="0 0 64 64">
          <ellipse cx="20" cy="17" rx="7" ry="9.5" transform="rotate(-16 20 17)" />
          <ellipse cx="44" cy="17" rx="7" ry="9.5" transform="rotate(16 44 17)" />
          <ellipse cx="9" cy="34" rx="6.2" ry="8" transform="rotate(-30 9 34)" />
          <ellipse cx="55" cy="34" rx="6.2" ry="8" transform="rotate(30 55 34)" />
          <path d="M32 30c8.6 0 16.6 6.4 16.6 14.6 0 6.4-5.2 10.4-11.4 10.4-2.6 0-3.9-1-5.2-1s-2.6 1-5.2 1c-6.2 0-11.4-4-11.4-10.4C15.4 36.4 23.4 30 32 30z" />
        </symbol>
        <symbol id="i-dogs-cats" viewBox="0 0 64 64">
          <path
            d="M14 24c0-6 3.6-11 8-11s8 5 8 11v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M34 24c0-6 3.6-11 8-11s8 5 8 11v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M32 26c9 0 17 7.6 17 17.5S41.4 58 32 58s-17-7.6-17-14.5S23 26 32 26z" />
          <circle cx="25.5" cy="40" r="2.8" fill="#121110" />
          <circle cx="38.5" cy="40" r="2.8" fill="#121110" />
          <path
            d="M28.5 48.5c1.9 2 5.1 2 7 0"
            fill="none"
            stroke="#121110"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-wildlife" viewBox="0 0 64 64">
          <path d="M54 10C30 10 14 20 14 38c0 5 1.7 9.4 4.6 12.6C21.6 40 30.5 31 42 27c-9.7 7.3-16 17.4-18.4 29.4C34.4 57.6 54 51 54 10z" />
        </symbol>
        <symbol id="i-marine" viewBox="0 0 64 64">
          <path
            d="M6 26c5.3 0 5.3 5 10.7 5s5.3-5 10.6-5 5.4 5 10.7 5 5.3-5 10.7-5 5.3 5 10.6 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M6 41c5.3 0 5.3 5 10.7 5s5.3-5 10.6-5 5.4 5 10.7 5 5.3-5 10.7-5 5.3 5 10.6 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M32 6c4 5.5 8 8.5 14 9-4.5 3.5-7 7.5-8 13-3.5-4.5-7.5-7-13-7.5 3-3.5 5-7.5 5-12.5"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-farm" viewBox="0 0 64 64">
          <path
            d="M6 26 32 10l26 16v28a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V26z"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M24 57V37h16v20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M32 37v20M24 47h16" fill="none" stroke="currentColor" strokeWidth="4" />
        </symbol>
        <symbol id="i-drives" viewBox="0 0 64 64">
          <path
            d="M37 8 56 27M45 16 30 31"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M32 26 12 46l6 6 20-20z"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M20 34l6 6M26 28l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M10 44l4 4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </symbol>
        <symbol id="i-mixed" viewBox="0 0 64 64">
          <path
            d="M32 56S8 42 8 26.5C8 18.5 14 13 21 13c4.6 0 8.6 2.3 11 6 2.4-3.7 6.4-6 11-6 7 0 13 5.5 13 13.5C56 42 32 56 32 56z"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <use href="#i-paw" x="21" y="22" width="22" height="22" opacity=".95" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path
            d="M5 12h13M12 5.5 18.5 12 12 18.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M3.4 12h17.2M12 3.4c2.6 2.6 3.9 5.5 3.9 8.6s-1.3 6-3.9 8.6c-2.6-2.6-3.9-5.5-3.9-8.6s1.3-6 3.9-8.6z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </symbol>
        <symbol id="i-facebook" viewBox="0 0 24 24">
          <path
            d="M13.5 21v-8h2.7l.5-3.2h-3.2V7.7c0-.9.3-1.6 1.7-1.6h1.6V3.2C16.4 3.1 15.4 3 14.3 3c-2.5 0-4.2 1.5-4.2 4.3v2.5H7.4V13h2.7v8z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-mail" viewBox="0 0 24 24">
          <rect x="3" y="5.5" width="18" height="13" rx="2.4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m4 7.5 8 5.5 8-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path
            d="M12 21.5s7-6.3 7-11.4A7 7 0 0 0 5 10.1c0 5.1 7 11.4 7 11.4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="i-close" viewBox="0 0 24 24">
          <path
            d="m6.5 6.5 11 11M17.5 6.5l-11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path
            d="m5 12.5 4.5 4.5L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-join" viewBox="0 0 24 24">
          <path
            d="M3 9.5 8 5l4 2.5L16 5l5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 12.5 10 16l2.5-2.5L15 16l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24">
          <path
            d="M12 2.5c.7 4.9 2.6 6.8 7.5 7.5-4.9.7-6.8 2.6-7.5 7.5-.7-4.9-2.6-6.8-7.5-7.5 4.9-.7 6.8-2.6 7.5-7.5z"
            fill="currentColor"
          />
        </symbol>
      </defs>
    </svg>
  )
}

type IconProps = SVGProps<SVGSVGElement> & {
  name: string
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const viewBox = LARGE.has(name) ? '0 0 64 64' : '0 0 24 24'
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <use href={`#${name}`} />
    </svg>
  )
}
