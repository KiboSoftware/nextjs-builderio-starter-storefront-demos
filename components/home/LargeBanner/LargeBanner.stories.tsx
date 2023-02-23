import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import LargeBanner from './LargeBanner'

import LargeBannerImage from '@/public/np_hp_twa_hero_bkg.jpg'

export default {
  title: 'home/LargeBanner',
  component: LargeBanner,
} as ComponentMeta<typeof LargeBanner>

const Template: ComponentStory<typeof LargeBanner> = (args) => <LargeBanner {...args} />

export const Common = Template.bind({})

const bannerItems = {
  title: 'New & Improved',
  subtitle1: 'Tire & Wheel',
  subtitle2: 'Builder',
  buttonTitle: 'Start Building',
  buttonUrl: '/category/591',
  backgroundImageUrl: LargeBannerImage,
}

Common.args = {
  bannerProps: bannerItems,
}
