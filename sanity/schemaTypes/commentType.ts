import {defineType, defineField} from 'sanity'

export const commentType = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'comment',
      type: 'text',
      title: 'Comment',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'post',
      type: 'reference',
      to: [{type: 'post'}],
      title: 'Post',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'parent',
      type: 'reference',
      to: [{type: 'comment'}],
      title: 'Parent Comment',
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
    }),
  ],
})
