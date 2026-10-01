import type { CollectionConfig } from 'payload'

/**
 * Official photographs, uploaded by the organizations themselves or taken from
 * their own pages. Files are stored in /media (gitignored) and served by Payload
 * at /api/media/file/<filename>.
 */
export const Photos: CollectionConfig = {
  slug: 'photos',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    adminThumbnail: 'thumb',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      {
        name: 'thumb',
        width: 400,
        height: 400,
        // sharp's default fit is 'cover' with a centre crop, giving the square
        // thumbnail the directory uses beside each listing.
        withoutEnlargement: false,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the picture, as shown to screen readers.' },
    },
    {
      name: 'creditUrl',
      type: 'text',
      admin: { description: 'The page the photo came from, linked under every appearance.' },
    },
    {
      name: 'creditLabel',
      type: 'text',
      defaultValue: 'official page',
      admin: { description: 'How that link should read, e.g. "Facebook page".' },
    },
  ],
}
