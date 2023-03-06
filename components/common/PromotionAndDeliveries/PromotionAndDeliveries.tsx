import React from 'react'

import { Box, Card, CardMedia } from '@mui/material'
import Link from 'next/link'
import Carousel from 'react-grid-carousel'

import KiboImage from '../KiboImage/KiboImage'

export interface PromotionAndDeliveriesDataProps {
  title: string
  imageUrl: any
  link: string
}

interface PromotionAndDeliveriesProps {
  promotionAndDeliveriesData: PromotionAndDeliveriesDataProps[]
}
const styles = {
  cardRoot: {
    padding: '0.625rem',
    backgroundColor: 'transparent',
    width: {
      xs: 172,
      md: 202,
    },
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0 2px 16px 4px rgb(40 44 63 / 7%)',
      '.quick-view': {
        opacity: 1,
      },
    },
  },
}
const PromotionAndDeliveries = (props: PromotionAndDeliveriesProps) => {
  const { promotionAndDeliveriesData } = props

  return (
    <>
      {promotionAndDeliveriesData?.length > 0 && (
        <Carousel
          cols={4}
          rows={1}
          gap={11}
          responsiveLayout={[
            {
              breakpoint: 1500,
              cols: 6,
            },
            {
              breakpoint: 1200,
              cols: 5,
            },
            {
              breakpoint: 900,
              cols: 4,
            },
            {
              breakpoint: 600,
              cols: 2,
            },
          ]}
          mobileBreakpoint={400}
        >
          {promotionAndDeliveriesData?.map((data, i) => {
            const { title, imageUrl, link } = data
            return (
              <Carousel.Item key={i}>
                <Link href={link} passHref data-testid="promotion-and-deliveries-link">
                  <Card sx={styles.cardRoot}>
                    <CardMedia
                      sx={{
                        width: '100%',
                        height: 80,
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ zIndex: 1 }}>
                        <KiboImage
                          src={imageUrl}
                          alt={imageUrl ? imageUrl : 'product-image-alt'}
                          layout="fill"
                          objectFit="contain"
                          data-testid="promotion-and-deliveries-image"
                        />
                      </Box>
                    </CardMedia>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>{title}</Box>
                  </Card>
                </Link>
              </Carousel.Item>
            )
          })}
        </Carousel>
      )}
    </>
  )
}

export default PromotionAndDeliveries
