import { Icon } from '@/components/Sprite'
import { ScrollLink } from '@/components/ScrollLink'

export interface HeroImage {
  src: string
  alt: string
}

export interface StackCard extends HeroImage {
  caption: string
  className: string
  depth: number
  width: number
  height: number
}

/**
 * The opening spread: a full-bleed photograph from one of the listings, the
 * headline, the standfirst, three stats and a tilted stack of official photos.
 */
export function Hero({
  hero,
  stack,
  total,
  categories,
}: {
  hero: HeroImage | null
  stack: StackCard[]
  total: number
  categories: number
}) {
  return (
    <section className="hero" aria-labelledby="lead-title">
      <div className="hero-media">
        {hero && (
          <img
            className="hero-bg"
            src={hero.src}
            alt={hero.alt}
            width={960}
            height={488}
            fetchPriority="high"
            decoding="async"
          />
        )}
        <div className="hero-scrim" aria-hidden="true" />
      </div>

      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="kicker">
            <span className="kicker-dot" aria-hidden="true" />
            Volunteering · animal welfare · Philippines
          </p>

          <h1 className="hero-title" id="lead-title" data-split="">
            Where to volunteer with <em>animals</em> in the Philippines
          </h1>

          <p className="standfirst">
            Shelters, rescues, sanctuaries, marine and wildlife programs across three island
            regions — every listing checked against an official website or official Facebook page
            before publication, with the source linked on the entry itself.
          </p>

          <div className="lead-actions">
            <ScrollLink className="btn btn-gold" href="#directory">
              Browse the directory
              <Icon name="i-arrow" size={18} className="ico" />
            </ScrollLink>
            <ScrollLink className="text-link" href="#how-to">
              How to volunteer responsibly
            </ScrollLink>
          </div>

          <dl className="stats">
            <div className="stat">
              <dt>Verified listings</dt>
              <dd data-count="">
                <span id="stat-total">{total}</span>
              </dd>
            </div>
            <div className="stat">
              <dt>Island regions</dt>
              <dd data-count="">3</dd>
            </div>
            <div className="stat">
              <dt>Types of work</dt>
              <dd data-count="">
                <span id="stat-cats">{categories}</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="hero-stack" data-stack="">
          {stack.map((card) => (
            <figure key={card.caption} className={`stack-card ${card.className}`} data-depth={card.depth}>
              <img
                src={card.src}
                alt={card.alt}
                width={card.width}
                height={card.height}
                decoding="async"
              />
              <figcaption>{card.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <ScrollLink className="scroll-cue" href="#directory" aria-label="Scroll to the directory">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 4v14M6 12.5l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ScrollLink>
    </section>
  )
}
