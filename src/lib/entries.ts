import type { Organization, Photo } from '@/payload-types'

/**
 * The shape the directory UI expects — deliberately identical to the old static
 * build so the CSS and the markup stay a straight port.
 */
export interface EntryPhoto {
  thumb: string
  large: string
  width: number
  height: number
  creditUrl: string | null
  creditLabel: string | null
}

export interface Entry {
  id: string
  name: string
  category: string
  region: string
  city: string | null
  province: string | null
  description: string
  animals: string[]
  volunteerActivities: string[]
  howToJoin: string | null
  requirements: string | null
  website: string | null
  facebook: string | null
  email: string | null
  sourceUrl: string
  lastVerified: string | null
  photo: EntryPhoto | null
}

export const CATEGORY_LABELS: Record<string, string> = {
  'dogs-cats': 'Dogs & cats',
  wildlife: 'Wildlife',
  marine: 'Marine',
  farm: 'Farm animals',
  drives: 'Drives & clinics',
  mixed: 'Mixed / community',
}

/** Which sprite <symbol> illustrates each category (used when there is no photo). */
export const CATEGORY_ICON: Record<string, string> = {
  'dogs-cats': 'i-dogs-cats',
  wildlife: 'i-wildlife',
  marine: 'i-marine',
  farm: 'i-farm',
  drives: 'i-drives',
  mixed: 'i-mixed',
}

function isPopulated(value: Organization['photo']): value is Photo {
  return !!value && typeof value === 'object' && 'id' in value
}

export function serializePhoto(photo: Organization['photo']): EntryPhoto | null {
  if (!isPopulated(photo)) return null
  const large = photo.url
  if (!large) return null
  return {
    thumb: photo.sizes?.thumb?.url || large,
    large,
    width: photo.width || 1200,
    height: photo.height || 675,
    creditUrl: photo.creditUrl || null,
    creditLabel: photo.creditLabel || null,
  }
}

export function serializeOrg(doc: Organization): Entry {
  return {
    id: doc.slug,
    name: doc.name,
    category: doc.category,
    region: doc.region,
    city: doc.city || null,
    province: doc.province || null,
    description: doc.description || '',
    animals: (doc.animals || []).map((a) => a.label).filter(Boolean),
    volunteerActivities: (doc.volunteerActivities || []).map((a) => a.item).filter(Boolean),
    howToJoin: doc.howToJoin || null,
    requirements: doc.requirements || null,
    website: doc.website || null,
    facebook: doc.facebook || null,
    email: doc.email || null,
    sourceUrl: doc.sourceUrl,
    lastVerified: doc.lastVerified || null,
    photo: serializePhoto(doc.photo),
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const parts = String(iso).split('-')
  if (parts.length !== 3) return iso
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const month = parseInt(parts[1], 10) - 1
  if (isNaN(month) || !months[month]) return iso
  return `${months[month]} ${parseInt(parts[2], 10)}, ${parts[0]}`
}

/** Only http(s) links are ever rendered as links — no mailto:, no javascript:. */
export function isSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}
