import { BuilderComponent, builder, Builder } from '@builder.io/react'
import getConfig from 'next/config'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { SmallBanner } from '@/components/home'
import { CartTemplate } from '@/components/page-templates'
import { ProductRecommendations } from '@/components/product'
import { getCart } from '@/lib/api/operations/'

import type { NextPage, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

Builder.registerComponent(SmallBanner, {
  name: 'SmallBanner',
  inputs: [
    {
      name: 'bannerProps',
      type: 'object',
      defaultValue: {
        title: 'Save up to 50% + Free Shipping',
        subtitle: 'Valid through 10/31.',
        callToAction: { title: 'Shop Now', url: '/category/deals' },
        backgroundColor: '#A12E87',
      },
      subFields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'subtitle',
          type: 'string',
        },
        {
          name: 'callToAction',
          type: 'object',
          subFields: [
            {
              name: 'title',
              type: 'string',
            },
            {
              name: 'url',
              type: 'string',
            },
          ],
        },
        {
          name: 'backgroundColor',
          type: 'string',
        },
      ],
    },
  ],
})

Builder.registerComponent(ProductRecommendations, {
  name: 'ProductRecommendations',
  inputs: [
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'productCodes',
      type: 'KiboCommerceProductsList',
    },
  ],
})

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res } = context
  const response = await getCart(req as NextApiRequest, res as NextApiResponse)
  const { serverRuntimeConfig } = getConfig()
  const isMultiShipEnabled = serverRuntimeConfig.isMultiShipEnabled
  const { cartTopSection, cartBottomSection } = publicRuntimeConfig?.builderIO?.modelKeys || {}
  const cartTopContentSection = await builder.get(cartTopSection).promise()
  const cartBottomContentSection = await builder.get(cartBottomSection).promise()

  return {
    props: {
      isMultiShipEnabled,
      cart: response?.currentCart || null,
      cartTopContentSection: cartTopContentSection || null,
      cartBottomContentSection: cartBottomContentSection || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const CartPage: NextPage = (props: any) => {
  const { cartTopContentSection, cartBottomContentSection } = props
  const { cartTopSection, cartBottomSection } = publicRuntimeConfig?.builderIO?.modelKeys || {}
  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CartTemplate
        {...props}
        cartTopContentSection={
          cartTopContentSection && (
            <BuilderComponent model={cartTopSection} content={cartTopContentSection} />
          )
        }
        cartBottomContentSection={
          cartBottomContentSection && (
            <BuilderComponent model={cartBottomSection} content={cartBottomContentSection} />
          )
        }
      />
    </>
  )
}

export default CartPage
