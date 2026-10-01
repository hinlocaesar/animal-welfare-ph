import type { CollectionConfig } from 'payload'

/**
 * One verified animal volunteer opportunity in the Philippines.
 *
 * Everything a visitor needs to decide whether to reach out lives here, plus the
 * source URL that proves the entry was checked. Unknown values are left empty
 * rather than guessed — the admin UI should never be used to invent a contact.
 */
export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'city', 'category', 'lastVerified'],
    description: 'A verified volunteer opportunity. sourceUrl is required — it is the page the listing was checked against.',
  },
  access: {
    // Public read: this data is published on the site anyway.
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'order',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Sort order of the row in the directory (1–43).',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Official name of the organization, as it brands itself.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'kebab-case identifier, used in the listing meta line.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'dogs-cats',
      options: [
        { label: 'Dogs & cats', value: 'dogs-cats' },
        { label: 'Wildlife', value: 'wildlife' },
        { label: 'Marine', value: 'marine' },
        { label: 'Farm animals', value: 'farm' },
        { label: 'Drives & clinics', value: 'drives' },
        { label: 'Mixed / community', value: 'mixed' },
      ],
      admin: { description: 'Drives the icon, tag colour and the "type of work" filter.' },
    },
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [
        { label: 'Luzon', value: 'Luzon' },
        { label: 'Visayas', value: 'Visayas' },
        { label: 'Mindanao', value: 'Mindanao' },
      ],
    },
    {
      name: 'city',
      type: 'text',
      admin: { description: 'Leave empty if the address is not published.' },
    },
    {
      name: 'province',
      type: 'text',
      admin: { description: 'Leave empty if the address is not published.' },
    },
    {
      name: 'animals',
      type: 'array',
      admin: { initCollapsed: true, description: 'Short lowercase labels, e.g. "sea turtles".' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: { description: 'Two or three sentences, in your own words.' },
    },
    {
      name: 'volunteerActivities',
      type: 'array',
      admin: { initCollapsed: true, description: 'What volunteers actually do there.' },
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'howToJoin',
      type: 'textarea',
      admin: { description: 'How someone signs up, based on what the organization says.' },
    },
    {
      name: 'requirements',
      type: 'textarea',
      admin: { description: 'What they require of volunteers. Leave empty when not published.' },
    },
    {
      name: 'website',
      type: 'text',
      admin: { description: 'Full https:// URL, or empty.' },
    },
    {
      name: 'facebook',
      type: 'text',
      admin: { description: 'Full https:// URL of the official page, or empty.' },
    },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'Only a published address — never guess one.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      required: true,
      admin: { description: 'Required. The official page this listing was verified against.' },
    },
    {
      name: 'lastVerified',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'YYYY-MM-DD of the last check against sourceUrl.',
      },
    },
    {
      name: 'photo',
      type: 'relationship',
      relationTo: 'photos',
      admin: { description: 'Official image from the organization’s own page. Optional.' },
    },
  ],
}
