import { BuilderComponent, builder, Builder } from '@builder.io/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import getConfig from 'next/config'

import CmsHomePageProducts from '../../cms/components/CmsHomePageProducts/CmsHomePageProducts'
import { KiboHeroCarousel, ContentTile, SmallBanner, LargeBanner } from '@/components/home'
import { FullWidthLayout } from '@/components/layout'
import { ProductRecommendations } from '@/components/product'
import getCategoryTree from '@/lib/api/operations/get-category-tree'
import type { CategoryTreeResponse, NextPageWithLayout } from '@/lib/types'
import ProActiv from '@/public/proactiv-routine.png'

import type { GetStaticPropsContext } from 'next'

interface HomePageProps {
  page: any
}

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

Builder.registerComponent(KiboHeroCarousel, {
  name: 'KiboHeroCarousel',
  inputs: [
    {
      name: 'carouselItem',
      type: 'list',
      defaultValue: [
        {
          imageUrl:
            'https://cdn-stg1.mozu.com/30707-m1/cms/files/e8d10d21-2653-4171-885e-0c5b3e215283?maxWidth=769',
          mobileImageUrl:
            'https://cdn-stg1.mozu.com/30707-m1/cms/files/e8d10d21-2653-4171-885e-0c5b3e215283?maxWidth=769',
          imageAlt: 'image Alt text',
          title: 'CLEAR SKIN,',
          subtitle: 'BE MINE!',
          description: "Science-backed routines with skin-loving ingredients you'll be crushing on",
          buttonText: 'get started',
          buttonLink: 'https://',
        },
        {
          imageUrl:
            'https://cdn-stg1.mozu.com/30707-m1/cms/files/205c05ae-dd32-4514-aae4-38762c732865?quality=80&maxWidth=769',
          mobileImageUrl:
            'https://cdn-stg1.mozu.com/30707-m1/cms/files/205c05ae-dd32-4514-aae4-38762c732865?quality=80&maxWidth=769',
          imageAlt: 'image Alt text',
          title: ' 3 routines,',
          subtitle: '1 perfect match.',
          description:
            "Discover the routine that's right for you with our dermatologist-developed skincare quiz.",
          buttonText: 'take the quiz',
          contentPosition: 'right',
          buttonLink: 'https://',
        },
      ],
      subFields: [
        {
          name: 'mobileImageUrl',
          type: 'file',
        },
        {
          name: 'mobileImageUrl',
          type: 'file',
        },
        {
          name: 'imageAlt',
          type: 'string',
        },
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'subtitle',
          type: 'string',
        },
        {
          name: 'description',
          type: 'string',
        },
        {
          name: 'buttonText',
          type: 'string',
        },
        {
          name: 'buttonLink',
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
      type: 'KiboCommerceProduct', // 'ShopifyCollectionHandle',
    },
  ],
})

Builder.registerComponent(CmsHomePageProducts, {
  name: 'CmsHomePageProducts',
  inputs: [
    {
      name: 'recentlyViewed',
      type: 'object',
      defaultValue: {
        title: 'Recently Viewed and Related',
      },
      subFields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'productCodes',
          type: 'KiboCommerceProductsList',
        },
      ],
    },
    {
      name: 'topSellings',
      type: 'object',
      defaultValue: {
        title: 'Top-selling products',
      },
      subFields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'productCodes',
          type: 'KiboCommerceProductsList',
        },
      ],
    },
  ],
})
Builder.registerComponent(LargeBanner, {
  name: 'LargeBanner',
  inputs: [
    {
      name: 'bannerProps',
      type: 'object',
      defaultValue: {
        title: 'Supercharge your routine - for free.',
        subtitle1: 'Choose one of two free gifts when you subscribe.',
        subtitle2:
          'Clear Skin SPF 30 is a 3-in-1 formula that protects, hydrates, and controls shine without causing breakouts.',
        buttonTitle: 'choose routine',
        buttonUrl: '/',
        backgroundImageUrl: ProActiv,
      },
      subFields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'subtitle1',
          type: 'string',
        },
        {
          name: 'subtitle2',
          type: 'string',
        },
        {
          name: 'buttonTitle',
          type: 'string',
        },
        {
          name: 'buttonUrl',
          type: 'string',
        },
        {
          name: 'backgroundImageUrl',
          type: 'string',
        },
      ],
    },
  ],
})
Builder.registerComponent(ContentTile, {
  name: 'ContentTile',
  inputs: [
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'largeTileProps',
      type: 'list',
      defaultValue: [
        {
          imgSource:
            'https://cdn-sb.mozu.com/26507-m1/cms/files/beaf1756-46ed-4ff5-bc20-49a2116b620e',
          title: 'Up to 50% off running gear',
          subtitle: 'Save on selected footwear, equipment and more',
          link1: { title: 'top deals', url: '/category/deals' },
          link2: { title: 'club deals', url: '/category/deals' },
          link3: { title: 'footwear deals', url: '/category/deals' },
        },
        {
          imgSource:
            'https://cdn-sb.mozu.com/26507-m1/cms/files/9a4155da-c985-44ef-9ac9-fa9cb3bde811',
          title: 'Up to 50% off Nike gear',
          subtitle: 'Save big on clothing and footwear from Nike',
          link1: { title: 'shop mens', url: '/category/deals' },
          link2: { title: 'shop womens', url: '/category/deals' },
          link3: { title: 'shop kids', url: '/category/deals' },
        },
      ],
      subFields: [
        {
          name: 'imgSource',
          type: 'string',
        },
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'link1',
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
          name: 'link2',
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
          name: 'link3',
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
      ],
    },
    {
      name: 'smallTileProps',
      type: 'list',
      defaultValue: [
        {
          imgSource:
            'https://cdn-sb.mozu.com/26507-m1/cms/files/8f3ec3c0-d72b-4369-bf0b-07f3849ad567',
          title: 'Dress for Any Occasion',
          subtitle: 'Dress your best and shine brighter than the sun',
          tileType: 'small',
          link1: { title: 'mens', url: '/category/deals' },
          link2: { title: 'womens', url: '/category/deals' },
          link3: { title: 'kids', url: '/category/deals' },
        },
        {
          imgSource:
            'https://cdn-sb.mozu.com/26507-m1/cms/files/4b2f2a04-765e-4d74-b83b-2df909cc48a6',
          title: 'Plenty to Play With',
          subtitle: 'Unwind this summer with deals on top gear',
          tileType: 'small',
          link1: { title: 'beach', url: '/category/deals' },
          link2: { title: 'bbq', url: '/category/deals' },
          link3: { title: 'hiking', url: '/category/deals' },
        },
        {
          imgSource:
            'https://cdn-sb.mozu.com/26507-m1/cms/files/d7127fd3-3656-4fea-bff7-47063154459c',
          title: 'Power to a Healthier You',
          subtitle: 'Clothing and gear for strength and cardio',
          tileType: 'small',
          link1: { title: 'strength training', url: '/category/deals' },
          link2: { title: 'cardio workout', url: '/category/deals' },
          link3: { title: 'fitness deals', url: '/category/deals' },
        },
        {
          imgSource:
            'https://cdn-sb.mozu.com/26507-m1/cms/files/ebdbfa1e-a3a1-4035-8aa3-e90f59a9478b',
          title: 'Get Your Golf On',
          subtitle: 'Tee up and bring your A-game',
          tileType: 'small',
          link1: { title: 'golf shirts', url: '/category/deals' },
          link2: { title: 'golf pants', url: '/category/deals' },
          link3: { title: 'golf footwear', url: '/category/deals' },
        },
      ],
      subFields: [
        {
          name: 'imgSource',
          type: 'string',
        },
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'subtitle',
          type: 'string',
        },
        {
          name: 'link1',
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
          name: 'link2',
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
          name: 'link3',
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
      ],
    },
  ],
})

export async function getStaticProps(context: GetStaticPropsContext) {
  const { locale } = context
  const categoriesTree: CategoryTreeResponse = await getCategoryTree()

  const page = await builder
    .get('proactiv-page', {
      userAttributes: {
        urlPath: '/',
      },
    })
    .toPromise()

  return {
    props: {
      page: page || null,
      categoriesTree,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
    revalidate: 60,
  }
}

const Home: NextPageWithLayout<HomePageProps> = (props) => {
  const { page } = props
  return (
    <>
      <BuilderComponent model="proactiv-page" content={page} />
    </>
  )
}

Home.getLayout = FullWidthLayout

export default Home
