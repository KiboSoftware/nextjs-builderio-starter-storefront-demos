import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import PromotionAndDeliveries from './PromotionAndDeliveries'
import { promotionAndDeliveriesMock } from '@/__mocks__/stories'

export default {
  title: 'Product/Product Recommendations',
  component: PromotionAndDeliveries,
} as ComponentMeta<typeof PromotionAndDeliveries>

const Template: ComponentStory<typeof PromotionAndDeliveries> = (args) => (
  <PromotionAndDeliveries {...args} />
)

export const Common = Template.bind({})
Common.args = promotionAndDeliveriesMock
