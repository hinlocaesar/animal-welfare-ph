import { Fragment } from 'react'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { serializeOrg } from '@/lib/entries'
import { Directory } from '@/components/Directory'
import { Hero, type HeroImage, type StackCard } from '@/components/Hero'

export const dynamic = 'force-dynamic'

/* ------------------------------------------------------------------
   Which photograph goes where. The files themselves live in the CMS
   (the `photos` collection); this is only the editorial selection.
   ------------------------------------------------------------------ */

const HERO_FILE = {
  file: 'bantay-pawikan-pawikan-conservation-center-lg.jpg',
  alt: 'Volunteers of the Pawikan Conservation Center in Morong, Bataan',
}

const STACK_FILES = [
  {
    file: 'ivhq-animal-care-palawan-lg.jpg',
    alt: 'A volunteer with rescued dogs in Palawan',
    caption: 'IVHQ · Palawan',
    className: 'sc-1',
    depth: 26,
  },
  {
    file: 'marine-conservation-philippines-lg.jpg',
    alt: 'A whale shark filmed by Marine Conservation Philippines',
    caption: 'MCP · Negros Oriental',
    className: 'sc-2',
    depth: -18,
  },
  {
    file: 'dlsu-pusa-lg.jpg',
    alt: 'Community cats being fed along a street in Manila',
    caption: 'DLSU PUSA · Manila',
    className: 'sc-3',
    depth: 34,
  },
]

const STRIP_FILES = [
  {
    file: 'happy-animals-club-cebu-lg.jpg',
    alt: 'Rescued dogs and cats adopted through Happy Animals Club',
    caption: 'Happy Animals Club, Cebu',
  },
  {
    file: 'dlsu-pusa-lg.jpg',
    alt: 'Community cats being fed along a street in Manila',
    caption: 'DLSU PUSA, Manila',
  },
  {
    file: 'marine-conservation-philippines-lg.jpg',
    alt: 'A whale shark photographed by Marine Conservation Philippines volunteers',
    caption: 'Marine Conservation Philippines',
  },
  {
    file: 'people-and-the-sea-lg.jpg',
    alt: 'Researchers in a small boat off the coast of Cebu',
    caption: 'People and the Sea, Cebu',
  },
]

const ABOUT_FILE = {
  file: 'people-and-the-sea-lg.jpg',
  alt: 'A research team in a small boat off Cebu',
}

const PRACTICES = [
  {
    title: 'Visit first, commit second',
    body: 'Ask for an orientation and a trial day before promising anything recurring. Shelters would rather you show up steadily once a month than burn out in a fortnight.',
  },
  {
    title: 'Ask about the commitment',
    body: 'Clarify hours, minimum tenure, deposits, and whether pre-exposure rabies shots are needed for direct animal care. Know the expectations before you say yes.',
  },
  {
    title: 'Skip wildlife tourism that exploits animals',
    body: 'Avoid venues that let tourists hold, ride or take selfies with wild animals, or that stage performances involving them. Ask instead how your fee or time supports genuine rescue and rehabilitation.',
  },
  {
    title: 'Keep a respectful distance',
    body: "Follow the keepers' lead around wild and rescued animals: no flash photography, no reaching into enclosures, and never feed an animal without clearance.",
  },
  {
    title: 'Bring skills, not just enthusiasm',
    body: 'Photography, transport, spreadsheets, welding, fundraising, translation and weekend driving are all genuinely short on. Say what you’re good at when you apply.',
  },
  {
    title: 'Adopt, foster, or donate, not just visit',
    body: "If you can't give time, fostering an animal or covering a vet bill is often worth more than a single afternoon. Every organization in this directory accepts more than one kind of help.",
  },
]

const MARQUEE = [
  'Luzon',
  'Visayas',
  'Mindanao',
  'dogs',
  'cats',
  'sea turtles',
  'whale sharks',
  'tarsiers',
  'carabaos',
]

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [orgResult, photoResult] = await Promise.all([
    payload.find({ collection: 'organizations', sort: 'order', limit: 200 }),
    payload.find({ collection: 'photos', limit: 400 }),
  ])

  const entries = orgResult.docs.map(serializeOrg)

  const photos = new Map<string, (typeof photoResult.docs)[number]>()
  photoResult.docs.forEach((photo) => {
    if (photo.filename) photos.set(photo.filename, photo)
  })

  const pick = (file: string) => {
    const photo = photos.get(file)
    if (!photo?.url) return null
    return {
      photo,
      src: photo.url,
      width: photo.width || 1200,
      height: photo.height || 675,
    }
  }

  const heroPhoto = pick(HERO_FILE.file)
  const hero: HeroImage | null = heroPhoto ? { src: heroPhoto.src, alt: HERO_FILE.alt } : null

  const stack: StackCard[] = STACK_FILES.flatMap((item) => {
    const photo = pick(item.file)
    if (!photo) return []
    return [
      {
        src: photo.src,
        alt: item.alt,
        caption: item.caption,
        className: item.className,
        depth: item.depth,
        width: photo.width,
        height: photo.height,
      },
    ]
  })

  const strip = STRIP_FILES.flatMap((item) => {
    const photo = pick(item.file)
    if (!photo) return []
    return [
      {
        ...item,
        src: photo.src,
        width: photo.width,
        height: photo.height,
        creditUrl: photo.photo.creditUrl || null,
        creditLabel: photo.photo.creditLabel || null,
      },
    ]
  })

  const about = pick(ABOUT_FILE.file)

  const total = entries.length
  const categories = new Set(entries.map((entry) => entry.category)).size

  /* the ticker: a flat run of words and paws, played twice for a seamless loop */
  const ticker = [
    <span className="mq" key="lead">
      {total} verified listings
    </span>,
    <svg className="mq-ico" key="lead-ico">
      <use href="#i-paw" />
    </svg>,
    ...MARQUEE.flatMap((word, i) => [
      <span className="mq" key={`${word}-word`}>
        {word}
      </span>,
      <svg className="mq-ico" key={`${word}-ico`}>
        <use href={i % 2 === 0 ? '#i-sparkle' : '#i-paw'} />
      </svg>,
    ]),
  ]

  return (
    <>
      <Hero hero={hero} stack={stack} total={total} categories={categories} />

      {/* ======================= MARQUEE ======================= */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {ticker}
          {ticker.map((node, i) => (
            <Fragment key={`again-${i}`}>{node}</Fragment>
          ))}
        </div>
      </div>

      {/* ======================= DIRECTORY ======================= */}
      <section className="section" id="directory" aria-labelledby="directory-title">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="rail-label">01: The directory</p>
            <h2 id="directory-title">Every listing we could verify</h2>
            <p className="section-sub">
              Search by name, city or animal, then narrow by region, type of work, or the animals
              you want to be around. Filters are kept in the page address, so a filtered view can
              be shared as a link.
            </p>
          </header>

          <Directory entries={entries} />
        </div>
      </section>

      {/* ======================= PRACTICES + PLATES ======================= */}
      <section className="section section-glow" id="how-to" aria-labelledby="howto-title">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="rail-label">02: Good practice</p>
            <h2 id="howto-title">
              How to volunteer <em>responsibly</em>
            </h2>
            <p className="section-sub">
              A little care makes you a better volunteer, and makes life easier for the people and
              animals already there.
            </p>
          </header>

          <ol className="practices">
            {PRACTICES.map((practice, i) => (
              <li key={practice.title} data-reveal="">
                <span className="no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="prac-body">
                  <h3>{practice.title}</h3>
                  <p>{practice.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="rail-label strip-label">Plates: from the organizations themselves</p>
          <ul className="photo-strip">
            {strip.map((item) => (
              <li key={item.file} data-reveal="">
                <figure>
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    width={item.width}
                    height={item.height}
                  />
                  <figcaption>
                    {item.caption}
                    {item.creditUrl && (
                      <>
                        {' · '}
                        <a href={item.creditUrl} target="_blank" rel="noopener noreferrer">
                          {item.creditLabel || 'official page'} ↗
                        </a>
                      </>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ======================= ABOUT ======================= */}
      <section className="section" id="about" aria-labelledby="about-title">
        <div className="wrap about-inner">
          <div className="about-copy" data-reveal="">
            <p className="rail-label">03: Method</p>
            <h2 id="about-title">How this directory was built</h2>
            <p>
              Every organization here was found through public web research and confirmed against
              an official website, an official Facebook page, or another primary source. That
              source is listed on each entry. Fields that could not be verified are left blank or{' '}
              <code>null</code> rather than guessed.
            </p>
            <p>
              Listings change: pages get taken down, programs pause, email addresses go stale.
              Please confirm details directly with the organization before you travel or commit
              your time.
            </p>
            <p>
              Some candidates were deliberately left out: pages that had gone dark, phone-only
              groups, hosts we could not confirm, and venues that let tourists handle wild
              animals. The rejections and the reasons are written down in <code>SOURCES.md</code>.
            </p>
            <p className="about-links">
              <a className="btn btn-line btn-small" href="/data/SOURCES.md">
                Every source
              </a>
              <a className="btn btn-line btn-small" href="/data/organizations.json">
                Raw JSON
              </a>
            </p>
          </div>

          <div className="about-panel" data-reveal="">
            <figure className="about-figure">
              {about && (
                <>
                  <img
                    className="about-photo"
                    src={about.src}
                    alt={ABOUT_FILE.alt}
                    loading="lazy"
                    decoding="async"
                    width={about.width}
                    height={about.height}
                  />
                  <figcaption>
                    People and the Sea, Cebu.{' '}
                    {about.photo.creditUrl ? (
                      <a
                        href={about.photo.creditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Photo: {about.photo.creditLabel || 'official Facebook page'} ↗
                      </a>
                    ) : (
                      'Photo: official Facebook page'
                    )}
                  </figcaption>
                </>
              )}
            </figure>

            <h3>What&apos;s in a listing</h3>
            <ul className="checklist">
              <li>Where it is: region, city, province</li>
              <li>What animals it works with</li>
              <li>Real volunteer activities</li>
              <li>How to actually join</li>
              <li>Requirements and contact links</li>
              <li>A source URL and a verification date</li>
            </ul>
          </div>
        </div>
      </section>

    </>
  )
}
