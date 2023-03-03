import React from 'react'

import { Card, CardMedia, Grid, Typography } from '@mui/material'
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
  contentStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: { md: '285px', xs: '205px' },
    width: '100%',
    margin: '0px',
    padding: '0px',
    outline: 'none',
    borderRadius: '0px',
  },
  title: {
    padding: '0 0 10px',
    fontWeight: 500,
  },
}

function HeroItem(props: ItemProps) {
  const { imageUrl, imageAlt, imageLink } = props

  return (
    <Card sx={styles.contentStyle}>
      <CardMedia
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: { xs: 'end', md: 'center' },
        }}
      >
        <Link href={imageLink}>
          <KiboImage
            src={imageUrl}
            alt={imageUrl ? imageAlt : 'product-image-alt'}
            layout="fill"
            objectFit="fill"
            data-testid="product-image"
          />
        </Link>
      </CardMedia>
    </Card>
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
                marginTop: '-23px',
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
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      //   rowSpacing={1}
      columns={{ xs: 2, sm: 8, md: 12 }}
      //   columnSpacing={{ xs: 3, sm: 4, md: 4 }}
    >
      {bannerCarouselItems.map((carouselItem: HeroCarouselProps, index: any) => (
        <Grid key={index} item xs={2} sm={4} md={4}>
          <CarouselItems {...carouselItem} />
        </Grid>
      ))}
    </Grid>
  )
}

export default BannerCarousel
