/**
 * Import the researched directory into Payload.
 *
 *   npm run seed
 *
 * Sources:
 *   - static-legacy/data/organizations.json: the 43 verified listings
 *   - static-legacy/img/<id>-lg.jpg: the official photographs
 *
 * It is idempotent: listings are matched on their slug, photographs on their
 * filename, and an admin user is only created when there is none. It also
 * publishes public/data/ so the footer's "Raw JSON" and "Every source" links
 * work in the Next.js build.
 */
/* Load .env first, because payload.config reads it during import. */
import 'dotenv/config'

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../payload.config'

interface SourcePhoto {
  thumb: string
  large: string
  width?: number
  height?: number
  credit_url?: string | null
  credit_label?: string | null
}

interface SourceOrg {
  id: string
  name: string
  category: string
  animals: string[]
  region: string
  city?: string | null
  province?: string | null
  description: string
  volunteer_activities?: string[]
  how_to_join?: string | null
  requirements?: string | null
  website?: string | null
  facebook?: string | null
  email?: string | null
  source_url: string
  last_verified: string
  photo?: SourcePhoto | null
}

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const legacyData = path.join(root, 'static-legacy', 'data')
const imgDir = path.join(root, 'static-legacy', 'img')
const publishDir = path.join(root, 'public', 'data')

async function main(): Promise<void> {
  console.log('[seed] main() entered')
  console.log('[seed] DATABASE_URL =', process.env.DATABASE_URL || '(unset)')
  const source: SourceOrg[] = JSON.parse(await fs.readFile(path.join(legacyData, 'organizations.json'), 'utf8'))
  console.log('[seed] source loaded:', source.length)

  const payloadConfig = await config
  console.log('[seed] config resolved')

  const payload = await getPayload({ config: payloadConfig })
  console.log('[seed] payload instance ready')

  /* ---------------------------------------------------------------
     1. An administrator, so /admin can actually be logged into.
     --------------------------------------------------------------- */
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (!existingUsers.totalDocs) {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@pawsandhearts.ph'
    const password = process.env.SEED_ADMIN_PASSWORD || 'paws-and-hearts-local'
    await payload.create({ collection: 'users', data: { email, password } })
    console.log(`  + admin user  ${email}  (password from SEED_ADMIN_PASSWORD)`)
  }

  /* ---------------------------------------------------------------
     2. Photographs. One Payload upload per official image; Payload
        derives the 400×400 thumbnail the directory uses.
     --------------------------------------------------------------- */
  const photoIdByOrg = new Map<string, number>()
  let photosCreated = 0
  let photosExisting = 0
  let photosMissing = 0

  for (const org of source) {
    const large = org.photo?.large
    if (!large) continue

    const filename = path.basename(large)
    const found = await payload.find({
      collection: 'photos',
      limit: 1,
      where: { filename: { equals: filename } },
    })

    if (found.docs[0]) {
      photoIdByOrg.set(org.id, found.docs[0].id)
      photosExisting++
      continue
    }

    try {
      const data = await fs.readFile(path.join(imgDir, filename))
      const created = await payload.create({
        collection: 'photos',
        data: {
          alt: `${org.name}, official photograph`,
          creditUrl: org.photo?.credit_url || undefined,
          creditLabel: org.photo?.credit_label || 'official page',
        },
        file: { data, mimetype: 'image/jpeg', name: filename, size: data.length },
      })
      photoIdByOrg.set(org.id, created.id)
      photosCreated++
    } catch (error) {
      photosMissing++
      console.warn(`  ! no file for ${filename}: ${(error as Error).message}`)
    }
  }

  /* ---------------------------------------------------------------
     3. The listings themselves, in source order.
     --------------------------------------------------------------- */
  let orgsCreated = 0
  let orgsExisting = 0

  for (const [index, org] of source.entries()) {
    const found = await payload.find({
      collection: 'organizations',
      limit: 1,
      where: { slug: { equals: org.id } },
    })

    if (found.docs[0]) {
      orgsExisting++
      continue
    }

    await payload.create({
      collection: 'organizations',
      data: {
        order: index + 1,
        name: org.name,
        slug: org.id,
        category: org.category as 'dogs-cats' | 'wildlife' | 'marine' | 'farm' | 'drives' | 'mixed',
        region: org.region as 'Luzon' | 'Visayas' | 'Mindanao',
        city: org.city || undefined,
        province: org.province || undefined,
        animals: (org.animals || []).map((label) => ({ label })),
        description: org.description,
        volunteerActivities: (org.volunteer_activities || []).map((item) => ({ item })),
        howToJoin: org.how_to_join || undefined,
        requirements: org.requirements || undefined,
        website: org.website || undefined,
        facebook: org.facebook || undefined,
        email: org.email || undefined,
        sourceUrl: org.source_url,
        lastVerified: org.last_verified,
        photo: photoIdByOrg.get(org.id),
      },
    })
    orgsCreated++
  }

  /* ---------------------------------------------------------------
     4. Publish the data files the footer links to.
     --------------------------------------------------------------- */
  await fs.mkdir(publishDir, { recursive: true })
  await fs.copyFile(path.join(legacyData, 'SOURCES.md'), path.join(publishDir, 'SOURCES.md'))

  const published = await payload.find({
    collection: 'organizations',
    depth: 1,
    limit: 500,
    sort: 'order',
  })

  const json = published.docs.map((doc) => {
    const photo = typeof doc.photo === 'object' && doc.photo ? doc.photo : null
    return {
      id: doc.slug,
      name: doc.name,
      category: doc.category,
      animals: (doc.animals || []).map((animal) => animal.label),
      region: doc.region,
      city: doc.city ?? null,
      province: doc.province ?? null,
      description: doc.description,
      volunteer_activities: (doc.volunteerActivities || []).map((activity) => activity.item),
      how_to_join: doc.howToJoin ?? null,
      requirements: doc.requirements ?? null,
      website: doc.website ?? null,
      facebook: doc.facebook ?? null,
      email: doc.email ?? null,
      source_url: doc.sourceUrl,
      last_verified: doc.lastVerified,
      photo: photo
        ? {
            thumb: photo.sizes?.thumb?.url || photo.url || null,
            large: photo.url || null,
            width: photo.width || null,
            height: photo.height || null,
            credit_url: photo.creditUrl || null,
            credit_label: photo.creditLabel || null,
          }
        : null,
    }
  })

  await fs.writeFile(path.join(publishDir, 'organizations.json'), `${JSON.stringify(json, null, 2)}\n`, 'utf8')

  console.log('')
  console.log('  Organizations  ' + orgsCreated + ' created, ' + orgsExisting + ' already present')
  console.log('  Photos         ' + photosCreated + ' created, ' + photosExisting + ' already present' + (photosMissing ? `, ${photosMissing} missing` : ''))
  console.log('  Published      public/data/organizations.json + SOURCES.md (' + json.length + ' listings)')
  console.log('')
}

main()
  /* stdout is a pipe here: let it drain before exiting, or the tail is lost */
  .then(() => new Promise((resolve) => setTimeout(resolve, 400)))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
