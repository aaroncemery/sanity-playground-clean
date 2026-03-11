import {defineType, defineField, defineArrayMember} from 'sanity'
import {ShoppingBasket} from 'lucide-react'

// DEMO: validation rules imported from shared package — same logic runs in Studio and in Functions
import {
  skuValidation,
  allergensValidation,
  nutritionFactsValidation,
  caloriesValidation,
  nutritionMacroValidation,
  basePriceValidation,
  productNameValidation,
} from '@repo/burger-haven-validators'

export const product = defineType({
  name: 'product',
  type: 'document',
  title: 'Product (from PIM)',
  icon: ShoppingBasket,
  description: 'Synced from external PIM system. Validated by Functions on write.',
  fields: [
    defineField({
      name: 'sku',
      type: 'string',
      title: 'SKU',
      description: 'Product identifier from PIM (e.g., BH1001)',
      validation: skuValidation,
    }),
    defineField({
      name: 'pimProductId',
      type: 'string',
      title: 'PIM Product ID',
      description: 'External PIM system identifier',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Product Name',
      description: 'Internal product name from PIM',
      validation: productNameValidation,
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          {title: 'Signature Burgers', value: 'burgers'},
          {title: 'Chicken & Sandwiches', value: 'chicken'},
          {title: 'Breakfast', value: 'breakfast'},
          {title: 'Sides & Apps', value: 'sides'},
          {title: 'Drinks & Desserts', value: 'drinks'},
        ],
      },
    }),
    defineField({
      name: 'basePrice',
      type: 'number',
      title: 'Base Price',
      description: 'Default price from PIM (can be overridden by location pricing)',
      validation: basePriceValidation,
    }),
    defineField({
      name: 'allergens',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      title: 'Allergens',
      description:
        '⚠️ CRITICAL: Must be provided by PIM. Functions will reject writes without this.',
      validation: allergensValidation,
      options: {
        list: [
          {title: '🥛 Dairy', value: 'dairy'},
          {title: '🌾 Wheat/Gluten', value: 'wheat'},
          {title: '🫘 Soy', value: 'soy'},
          {title: '🌰 Tree Nuts', value: 'treeNuts'},
          {title: '🦐 Shellfish', value: 'shellfish'},
          {title: '🥚 Eggs', value: 'eggs'},
          {title: '🐟 Fish', value: 'fish'},
          {title: '🥜 Peanuts', value: 'peanuts'},
          {title: '✅ None', value: 'none'},
        ],
      },
    }),
    defineField({
      name: 'nutritionFacts',
      type: 'object',
      title: 'Nutrition Facts',
      description: '⚠️ Required by Functions for compliance',
      validation: nutritionFactsValidation,
      fields: [
        defineField({
          name: 'calories',
          type: 'number',
          title: 'Calories',
          validation: caloriesValidation,
        }),
        defineField({
          name: 'protein',
          type: 'number',
          title: 'Protein (g)',
          validation: nutritionMacroValidation('Protein'),
        }),
        defineField({
          name: 'carbs',
          type: 'number',
          title: 'Carbohydrates (g)',
          validation: nutritionMacroValidation('Carbohydrates'),
        }),
        defineField({
          name: 'fat',
          type: 'number',
          title: 'Fat (g)',
          validation: nutritionMacroValidation('Fat'),
        }),
        defineField({
          name: 'sodium',
          type: 'number',
          title: 'Sodium (mg)',
          validation: nutritionMacroValidation('Sodium'),
        }),
      ],
    }),
    defineField({
      name: 'ingredients',
      type: 'array',
      title: 'Ingredients',
      of: [defineArrayMember({type: 'string'})],
      description: 'List of ingredients from PIM',
    }),
    defineField({
      name: 'pimMetadata',
      type: 'object',
      title: 'PIM Sync Metadata',
      description: 'Tracking information from external PIM',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'lastSyncedAt',
          type: 'datetime',
          title: 'Last Synced',
          readOnly: true,
        }),
        defineField({
          name: 'syncSource',
          type: 'string',
          title: 'Sync Source',
          options: {
            list: [
              {title: 'Akeneo', value: 'akeneo'},
              {title: 'Salsify', value: 'salsify'},
              {title: 'Inriver', value: 'inriver'},
              {title: 'Pimcore', value: 'pimcore'},
              {title: 'Custom PIM', value: 'custom'},
              {title: 'Demo', value: 'demo'},
            ],
          },
        }),
        defineField({
          name: 'syncStatus',
          type: 'string',
          title: 'Sync Status',
          options: {
            list: [
              {title: '✅ Synced', value: 'synced'},
              {title: '⏳ Pending', value: 'pending'},
              {title: '❌ Error', value: 'error'},
              {title: '⚠️ Validation Failed', value: 'validation_failed'},
            ],
          },
        }),
        defineField({
          name: 'validationErrors',
          type: 'array',
          of: [defineArrayMember({type: 'text', rows: 2})],
          title: 'Validation Errors',
          description: 'Errors from last validation attempt',
          readOnly: true,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      category: 'category',
      status: 'pimMetadata.syncStatus',
    },
    prepare({title, subtitle, category, status}: {title?: string; subtitle?: string; category?: string; status?: string}) {
      const statusIcon =
        {
          synced: '✅',
          pending: '⏳',
          error: '❌',
          validation_failed: '⚠️',
        }[status || ''] || '❓'

      return {
        title: title || 'Unnamed Product',
        subtitle: `${subtitle || 'NO-SKU'} • ${category || 'uncategorized'} • ${statusIcon}`,
      }
    },
  },
})
