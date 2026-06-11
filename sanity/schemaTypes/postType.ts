import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ]
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Version 1: single category slug for navigation tabs',
      options: {
        list: [
          {title: 'Эхлэгчдэд', value: 'beginners'},
          {title: 'Bitcoin', value: 'bitcoin'},
          {title: 'Ethereum', value: 'ethereum'},
          {title: 'DeFi', value: 'defi'},
          {title: 'Арилжаа', value: 'trading'},
          {title: 'Түрийвч', value: 'wallet'},
          {title: 'NFT & Web3', value: 'nft-web3'},
          {title: 'Майнинг', value: 'mining'},
          {title: 'Толь бичиг', value: 'dictionary'},
          {title: 'Бидний тухай', value: 'about'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories (legacy)',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
      hidden: true,
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
