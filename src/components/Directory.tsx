'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  CATEGORY_ICON,
  CATEGORY_LABELS,
  formatDate,
  isSafeUrl,
  type Entry,
} from '@/lib/entries'
import { Icon } from '@/components/Sprite'

/* ------------------------------------------------------------------
   Filter state — kept in the URL hash so a filtered view is a link.
   (A query string would fight Next's router; the hash never does.)
   ------------------------------------------------------------------ */

type FilterKey = 'q' | 'region' | 'category' | 'animals'
type Filters = Record<FilterKey, string>

const KEYS: FilterKey[] = ['q', 'region', 'category', 'animals']
const EMPTY: Filters = { q: '', region: '', category: '', animals: '' }

function readHash(): Partial<Filters> | null {
  if (typeof window === 'undefined') return null
  const raw = window.location.hash.slice(1)
  if (!raw || raw.indexOf('=') === -1) return null // plain anchor, not filter state

  const params: Record<string, string> = {}
  raw.split('&').forEach((pair) => {
    const idx = pair.indexOf('=')
    if (idx < 1) return
    params[pair.slice(0, idx)] = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '))
  })

  const out: Partial<Filters> = {}
  KEYS.forEach((key) => {
    if (typeof params[key] === 'string') out[key] = params[key]
  })
  return out
}

function writeHash(filters: Filters): void {
  const params: string[] = []
  if (filters.q) params.push(`q=${encodeURIComponent(filters.q)}`)
  if (filters.region) params.push(`region=${encodeURIComponent(filters.region)}`)
  if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`)
  if (filters.animals) params.push(`animals=${encodeURIComponent(filters.animals)}`)

  const hash = params.length ? `#${params.join('&')}` : ''
  try {
    const base = window.location.pathname + window.location.search
    window.history.replaceState(null, '', `${base}${hash}`)
  } catch {
    /* some environments block replaceState — the filters still work */
  }
}

function matches(org: Entry, filters: Filters): boolean {
  if (filters.region && org.region !== filters.region) return false
  if (filters.category && org.category !== filters.category) return false

  if (filters.animals) {
    const wanted = filters.animals.toLowerCase()
    if (!org.animals.some((animal) => animal.toLowerCase() === wanted)) return false
  }

  if (filters.q) {
    const haystack = [
      org.name,
      org.city,
      org.province,
      org.region,
      org.description,
      org.category,
      org.animals.join(' '),
      org.volunteerActivities.join(' '),
      org.howToJoin,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    /* Every whitespace-separated term must appear somewhere. */
    const terms = filters.q.split(/\s+/).filter(Boolean)
    if (!terms.every((term) => haystack.includes(term))) return false
  }

  return true
}

function isEmail(value: string | null): value is string {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/* ------------------------------------------------------------------
   One row of the index
   ------------------------------------------------------------------ */

function Row({
  org,
  index,
  onOpen,
}: {
  org: Entry
  index: number
  onOpen: (id: string) => void
}) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = !!org.photo && !photoFailed

  const outbound = isSafeUrl(org.website)
    ? ['Website', org.website]
    : isSafeUrl(org.facebook)
      ? ['Facebook', org.facebook]
      : isSafeUrl(org.sourceUrl)
        ? ['Source', org.sourceUrl]
        : null

  const names = org.animals.slice(0, 5)

  return (
    <article
      className={`entry cat-${org.category}`}
      data-id={org.id}
      data-photo={org.photo ? org.photo.large : undefined}
    >
      <span className="entry-no" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>

      {showPhoto ? (
        <img
          className="entry-thumb"
          src={org.photo!.thumb}
          alt=""
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div className="entry-icon" aria-hidden="true">
          <Icon name={CATEGORY_ICON[org.category] || 'i-mixed'} size={28} />
        </div>
      )}

      <div className="entry-body">
        <div className="entry-head">
          <h3>{org.name}</h3>
        </div>

        <p className="entry-loc">
          <Icon name="i-pin" size={14} />
          <span>{[org.city, org.province].filter(Boolean).join(', ') || org.region}</span>
        </p>

        <div className="entry-tags">
          <span className="tag">{org.region}</span>
          <span className="tag tag-cat">{CATEGORY_LABELS[org.category] || org.category}</span>
        </div>

        <p className="entry-desc">{org.description}</p>

        <p className="entry-animals">
          <strong>Animals</strong>
          {' — '}
          {names.join(', ')}
          {org.animals.length > 5 ? ` · +${org.animals.length - 5} more` : ''}
        </p>

        <div className="entry-actions">
          <button
            type="button"
            className="btn btn-line btn-small"
            data-open={org.id}
            aria-haspopup="dialog"
            aria-label={`View details for ${org.name}`}
            onClick={() => onOpen(org.id)}
          >
            View details
          </button>

          {outbound && (
            <a
              className="entry-link"
              href={outbound[1]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {outbound[0]} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------
   Detail dialog
   ------------------------------------------------------------------ */

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="d-section">
      <h4>
        <Icon name={icon} size={15} />
        {title}
      </h4>
      {children}
    </div>
  )
}

function List({ items, plain = false }: { items: string[]; plain?: boolean }) {
  return (
    <ul className={`d-list${plain ? ' d-list-plain' : ''}`}>
      {items.filter(Boolean).map((item, i) => (
        <li key={`${item}-${i}`}>{item}</li>
      ))}
    </ul>
  )
}

function Contact({ href, label, icon, className }: { href: string; label: string; icon: string; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <Icon name={icon} size={17} />
      {label}
    </a>
  )
}

function OrgDialog({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [photoFailed, setPhotoFailed] = useState(false)

  /* open when an entry is chosen, close when it is dismissed */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (entry) {
      if (!dialog.open) {
        setPhotoFailed(false)
        if (typeof dialog.showModal === 'function') dialog.showModal()
        else dialog.setAttribute('open', '')
        if (bodyRef.current) bodyRef.current.scrollTop = 0
        closeRef.current?.focus()
      }
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [entry])

  /* Esc and the native close button both end up here */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const contactRows: Array<{ href: string; label: string; icon: string; className?: string }> = []
  if (entry) {
    if (isSafeUrl(entry.website)) {
      contactRows.push({ href: entry.website, label: 'Visit website', icon: 'i-globe' })
    }
    if (isSafeUrl(entry.facebook)) {
      contactRows.push({
        href: entry.facebook,
        label: 'Facebook page',
        icon: 'i-facebook',
        className: 'icon-facebook',
      })
    }
    if (isEmail(entry.email)) {
      contactRows.push({ href: `mailto:${entry.email}`, label: 'Email them', icon: 'i-mail' })
    }
  }

  return (
    <dialog
      className="org-dialog"
      id="org-dialog"
      aria-labelledby="dialog-title"
      ref={dialogRef}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close()
      }}
    >
      <div className="dialog-shell">
        <button
          className="dialog-close"
          type="button"
          aria-label="Close details"
          ref={closeRef}
          onClick={() => dialogRef.current?.close()}
        >
          <Icon name="i-close" size={22} className="ico" />
        </button>

        <div className="dialog-body" id="dialog-body" ref={bodyRef}>
          {entry && (
            <>
              {entry.photo && !photoFailed && (
                <figure className="d-photo-wrap">
                  <img
                    className="d-photo"
                    src={entry.photo.large}
                    alt={`Official photo of ${entry.name}`}
                    width={entry.photo.width || 960}
                    height={entry.photo.height || 540}
                    decoding="async"
                    onError={() => setPhotoFailed(true)}
                  />
                  {isSafeUrl(entry.photo.creditUrl) && (
                    <figcaption className="d-credit">
                      {'Photo from the org’s '}
                      <a
                        href={entry.photo.creditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {(entry.photo.creditLabel || 'official page') + ' ↗'}
                      </a>
                    </figcaption>
                  )}
                </figure>
              )}

              <div className="d-head">
                <div className="d-icon" aria-hidden="true">
                  <Icon name={CATEGORY_ICON[entry.category] || 'i-mixed'} size={34} />
                </div>
                <div>
                  <h2 className="d-title" id="dialog-title">
                    {entry.name}
                  </h2>
                  <p className="d-loc">
                    <Icon name="i-pin" size={15} />
                    {[entry.city, entry.province, entry.region].filter(Boolean).join(' · ') ||
                      entry.region}
                  </p>
                  <div className="d-tags">
                    <span className="tag tag-cat">
                      {CATEGORY_LABELS[entry.category] || entry.category}
                    </span>
                    <span className="tag">{entry.region}</span>
                  </div>
                </div>
              </div>

              <Section title="About this organization" icon="i-mixed">
                <p>{entry.description || 'No description available.'}</p>
              </Section>

              {entry.volunteerActivities.length > 0 && (
                <Section title="What volunteers do" icon="i-join">
                  <List items={entry.volunteerActivities} plain />
                </Section>
              )}

              {entry.animals.length > 0 && (
                <Section title="Animals they work with" icon="i-paw">
                  <List items={entry.animals} />
                </Section>
              )}

              {entry.howToJoin && (
                <Section title="How to join" icon="i-check">
                  <p>{entry.howToJoin}</p>
                </Section>
              )}

              <Section title="Requirements" icon="i-check">
                <p>
                  {entry.requirements ||
                    'Not specified — ask the organization directly when you reach out.'}
                </p>
              </Section>

              <Section title="Contact & links" icon="i-globe">
                <div className="d-contacts">
                  {contactRows.length
                    ? contactRows.map((row) => <Contact key={row.label} {...row} />)
                    : <span className="is-null">No verified contact link — use the source below.</span>}
                </div>
              </Section>

              <div className="d-meta">
                {isSafeUrl(entry.sourceUrl) && (
                  <span>
                    {'Source: '}
                    <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">
                      verification source ↗
                    </a>
                  </span>
                )}
                {entry.lastVerified && <span>Last verified: {formatDate(entry.lastVerified)}</span>}
                <span>ID: {entry.id}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  )
}

/* ------------------------------------------------------------------
   The directory: filters, count, index, dialog
   ------------------------------------------------------------------ */

export function Directory({ entries }: { entries: Entry[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [openId, setOpenId] = useState<string | null>(null)
  const restored = useRef(false)
  const countRef = useRef<HTMLParagraphElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  /* Restore a shared filtered link once, on mount. */
  useEffect(() => {
    const params = readHash()
    if (params) setFilters({ ...EMPTY, ...params })
    restored.current = true
  }, [])

  /* React to hash changes made elsewhere: a shared link opened over the
     current page, back/forward, or a hand-edited address. Our own writes use
     replaceState, which never fires this event, so there is no loop. Plain
     anchors (no `=`) are ignored — the browser scrolls those natively. */
  useEffect(() => {
    const onHashChange = () => {
      const params = readHash()
      if (params) setFilters({ ...EMPTY, ...params })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  /* write the current filters back into the address bar */
  useEffect(() => {
    if (!restored.current) return
    writeHash(filters)
  }, [filters])

  /* every re-render of the list is announced to the motion layer */
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('ph:render'))
  }, [filters])

  const list = useMemo(() => entries.filter((org) => matches(org, filters)), [entries, filters])

  const animalOptions = useMemo(() => {
    const map: Record<string, string> = {}
    entries.forEach((org) => {
      org.animals.forEach((animal) => {
        if (animal) map[animal.toLowerCase()] = animal
      })
    })
    return Object.keys(map)
      .sort((a, b) => map[a].localeCompare(map[b]))
      .map((key) => map[key])
  }, [entries])

  const filtering = filters.q || filters.region || filters.category || filters.animals
  const countText = filtering
    ? `Showing ${list.length} ${list.length === 1 ? 'organization' : 'organizations'} of ${entries.length}`
    : `Showing all ${list.length} ${list.length === 1 ? 'organization' : 'organizations'}`

  /* small "ticked" flourish on the count, like the static build */
  useEffect(() => {
    const node = countRef.current
    if (!node) return
    node.classList.add('is-updating')
    const timer = window.setTimeout(() => node.classList.remove('is-updating'), 120)
    return () => window.clearTimeout(timer)
  }, [countText])

  const update = (key: FilterKey, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }))

  const clear = useCallback(() => {
    setFilters(EMPTY)
    searchRef.current?.focus()
  }, [])

  const openEntry = openId ? entries.find((org) => org.id === openId) || null : null
  const closeDialog = useCallback(() => setOpenId(null), [])
  const openDialog = useCallback((id: string) => setOpenId(id), [])

  return (
    <>
      <form
        className="filters"
        id="filters"
        role="search"
        aria-label="Filter the directory"
        data-reveal
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="field field-search">
          <label htmlFor="q">Search</label>
          <div className="input-wrap">
            <Icon name="i-search" size={16} className="ico" />
            <input
              type="search"
              id="q"
              name="q"
              placeholder="Cebu, turtles, spay/neuter…"
              autoComplete="off"
              value={filters.q}
              ref={searchRef}
              onChange={(event) => update('q', event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="region">Region</label>
          <select
            id="region"
            name="region"
            value={filters.region}
            onChange={(event) => update('region', event.target.value)}
          >
            <option value="">All regions</option>
            <option value="Luzon">Luzon</option>
            <option value="Visayas">Visayas</option>
            <option value="Mindanao">Mindanao</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="category">Type of work</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={(event) => update('category', event.target.value)}
          >
            <option value="">All types</option>
            <option value="dogs-cats">Dogs &amp; cats</option>
            <option value="wildlife">Wildlife</option>
            <option value="marine">Marine</option>
            <option value="farm">Farm animals</option>
            <option value="drives">Drives &amp; clinics</option>
            <option value="mixed">Mixed / community</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="animals">Animals</label>
          <select
            id="animals"
            name="animals"
            value={filters.animals}
            onChange={(event) => update('animals', event.target.value)}
          >
            <option value="">All animals</option>
            {animalOptions.map((animal) => (
              <option key={animal} value={animal}>
                {animal}
              </option>
            ))}
          </select>
        </div>

        <div className="field field-reset">
          <span className="field-spacer" aria-hidden="true">
            &nbsp;
          </span>
          <button type="button" className="btn btn-line btn-small" id="reset-filters" onClick={clear}>
            Clear filters
          </button>
        </div>
      </form>

      <p className="count" id="result-count" role="status" aria-live="polite" ref={countRef}>
        {countText}
      </p>

      <div className="index" id="entry-index" hidden={list.length === 0}>
        {list.map((org, index) => (
          <Row key={org.id} org={org} index={index} onOpen={openDialog} />
        ))}
      </div>

      <div className="empty" id="empty-state" hidden={list.length !== 0}>
        {entries.length === 0 ? (
          <>
            <p className="empty-title">No listings have been imported yet.</p>
            <p>
              Run <code>npm run seed</code> to load the verified directory from the source data.
            </p>
          </>
        ) : (
          <>
            <p className="empty-title">No entries match those filters.</p>
            <p>
              Try a wider region, or clear the search box — there are {entries.length} listings in
              total.
            </p>
            <button
              type="button"
              className="btn btn-line btn-small"
              id="empty-reset"
              onClick={clear}
            >
              Clear filters
            </button>
          </>
        )}
      </div>

      <OrgDialog entry={openEntry} onClose={closeDialog} />
    </>
  )
}
