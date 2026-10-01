import { getPayload } from 'payload'

import config from '@/payload.config'
import { formatDate } from '@/lib/entries'
import { ScrollLink } from '@/components/ScrollLink'

/** Latest verification date across the directory, straight from the database. */
async function lastChecked(): Promise<string> {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const result = await payload.find({
      collection: 'organizations',
      limit: 1,
      sort: '-lastVerified',
      where: { lastVerified: { exists: true } },
    })
    return (result.docs[0]?.lastVerified as string) || ''
  } catch {
    return ''
  }
}

export async function Footer() {
  const updated = await lastChecked()

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <p className="footer-name">
            Paws &amp; Hearts <span className="brand-ph">PH</span>
          </p>
          <p className="footer-tag">
            A volunteer directory for animals in the Philippines. Independent, non-commercial, and
            not affiliated with any organization listed.
          </p>
          <p className="footer-tag">
            Photographs belong to the organizations shown and are credited where they appear; they
            can be removed on request.
          </p>
        </div>

        <div className="footer-col">
          <h2 className="footer-h">Data</h2>
          <ul>
            <li>
              <a href="/data/organizations.json">organizations.json</a>
            </li>
            <li>
              <a href="/data/SOURCES.md">SOURCES.md</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h2 className="footer-h">Jump to</h2>
          <ul>
            <li>
              <ScrollLink href="#directory">Directory</ScrollLink>
            </li>
            <li>
              <ScrollLink href="#how-to">Volunteer responsibly</ScrollLink>
            </li>
            <li>
              <ScrollLink href="#about">About the data</ScrollLink>
            </li>
          </ul>
        </div>

        <div className="footer-col footer-note">
          <h2 className="footer-h">Please note</h2>
          <p>
            {updated ? (
              <>
                Listings are collected from public sources and were last checked on{' '}
                <strong id="footer-updated">{formatDate(updated)}</strong>.{' '}
              </>
            ) : (
              <>
                Listings are collected from public sources and re-checked as they change.{' '}
              </>
            )}
            <strong>Always confirm opportunities directly with each organization</strong> before
            visiting, donating or committing your time.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="wrap">
          <p>
            Paws &amp; Hearts PH · edition of <time dateTime="2026-09-30">30 September 2026</time>{' '}
            · Fraunces &amp; IBM Plex · motion by GSAP + Lenis
          </p>
        </div>
      </div>
    </footer>
  )
}
