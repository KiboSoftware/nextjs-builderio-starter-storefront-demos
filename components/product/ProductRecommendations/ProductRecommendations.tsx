import React from 'react'

import { Grid, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import Carousel from 'react-grid-carousel'

import { ProductCard } from '@/components/product'
import { useProductsQueries } from '@/hooks'
import { productGetters } from '@/lib/getters'
import { uiHelpers } from '@/lib/helpers'

import type { Product } from '@/lib/gql/types'

export interface ProductRecommendationsProps {
  title: string
  productCodes: Array<string>
}

const ProductRecommendations = (props: ProductRecommendationsProps) => {
  const { title, productCodes } = props
  const { t } = useTranslation('common')
  const { getProductLink } = uiHelpers()
  const { data: productSearchResult } = useProductsQueries(productCodes)
  const products = productSearchResult?.items as Product[]

  return (
    <>
      {productCodes?.length > 0 && (
        <Grid item xs={12} sx={{ p: { xs: 1, md: 5 }, marginY: 2 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '2rem',
              justifyContent: 'center',
              color: '#009aa9',
            }}
          >
            {title}
          </Typography>
          <Carousel
            cols={5}
            rows={1}
            gap={11}
            responsiveLayout={[
              {
                breakpoint: 1200,
                cols: 4,
              },
              {
                breakpoint: 990,
                cols: 3,
              },
              {
                breakpoint: 600,
                cols: 2,
              },
            ]}
            mobileBreakpoint={400}
            loop
          >
            {products?.map((product, i) => (
              <Carousel.Item key={i}>
                <ProductCard
                  imageUrl={
                    productGetters.getCoverImage(product) &&
                    productGetters.handleProtocolRelativeUrl(productGetters.getCoverImage(product))
                  }
                  link={getProductLink(product?.productCode as string)}
                  price={t<string>('currency', {
                    val: productGetters.getPrice(product).regular,
                  })}
                  {...(productGetters.getPrice(product).special && {
                    salePrice: t<string>('currency', {
                      val: productGetters.getPrice(product).special,
                    }),
                  })}
                  title={productGetters.getName(product) as string}
                  rating={productGetters.getRating(product)}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Grid>
      )}
    </>
  )
}

export default ProductRecommendations
