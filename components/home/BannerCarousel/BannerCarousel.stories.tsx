import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import BannerCarousel from './BannerCarousel'
import { bannerCarouselMock } from '@/__mocks__/stories'

export default {
  title: 'home/BannerCarousel',
  component: BannerCarousel,
  parameters: { layout: 'fullscreen' },
} as ComponentMeta<typeof BannerCarousel>

const Template: ComponentStory<typeof BannerCarousel> = (args) => <BannerCarousel {...args} />

export const Common = Template.bind({})

Common.args = bannerCarouselMock
