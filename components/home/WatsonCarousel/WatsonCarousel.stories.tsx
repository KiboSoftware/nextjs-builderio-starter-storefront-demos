import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import WatsonCarousel from './WatsonCarousel'

export default {
  title: 'home/WatsonCarousel',
  component: WatsonCarousel,
  parameters: { layout: 'fullscreen' },
} as ComponentMeta<typeof WatsonCarousel>

const Template: ComponentStory<typeof WatsonCarousel> = (args) => <WatsonCarousel {...args} />

export const Common = Template.bind({})

const heroItems = [
  {
    imageUrl: 'https://cdn-sb.mozu.com/26507-m1/cms/files/655bb09f-e5f2-4027-8cf6-76d0363172d1',
    imageAlt: 'image Alt text',
    imageLink: '/',
  },
  {
    imageUrl: 'https://cdn-sb.mozu.com/26507-m1/cms/files/7b763015-5d76-4c3c-a5fd-6a14a476b56c',
    imageAlt: 'image Alt text',
    imageLink: '/',
  },
]

Common.args = {
  carouselItem: heroItems,
}
