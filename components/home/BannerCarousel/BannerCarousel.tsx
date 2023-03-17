import React from 'react'

import { Grid, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Link from 'next/link'
import Carousel from 'react-material-ui-carousel'

import { KiboImage } from '@/components/common'

interface ItemProps {
  imageUrl: any
  imageAlt: string
  imageLink: string
}
export interface HeroCarouselProps {
  title: string
  carouselItem: ItemProps[]
}

interface BannerCarouselProps {
  bannerCarouselItems: HeroCarouselProps[]
}

const MainStyle = styled('div')({
  display: 'flex',
  color: 'grey.700',
})

const styles = {
  title: {
    padding: '0 0 10px',
    fontWeight: 500,
  },
}

function HeroItem(props: ItemProps) {
  const { imageUrl, imageAlt, imageLink } = props

  return (
    <Link href={imageLink}>
      <KiboImage
        src={imageUrl}
        alt={imageUrl ? imageAlt : 'product-image-alt'}
        width="0"
        height="0"
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
      />
    </Link>
  )
}

function CarouselItems({ title, carouselItem }: HeroCarouselProps) {
  return (
    <>
      <Typography variant="subtitle1" sx={styles.title}>
        {title}
      </Typography>
      {carouselItem?.length > 0 && (
        <MainStyle>
          <Carousel
            navButtonsAlwaysVisible={false}
            swipe={true}
            sx={{ width: '100%' }}
            indicatorContainerProps={{
              style: {
                zIndex: 1,
                marginTop: '-30px',
                position: 'relative',
                textAlign: 'right',
              },
            }}
          >
            {carouselItem?.map((item: ItemProps, index: any) => {
              return <HeroItem {...item} key={index} />
            })}
          </Carousel>
        </MainStyle>
      )}
    </>
  )
}

const BannerCarousel = ({ bannerCarouselItems }: BannerCarouselProps) => {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
      {bannerCarouselItems.map((carouselItem: HeroCarouselProps, index: any) => (
        <Grid key={index} item xs={2} sm={4} md={4}>
          <CarouselItems {...carouselItem} />
        </Grid>
      ))}
    </Grid>
  )
}

export default BannerCarousel
