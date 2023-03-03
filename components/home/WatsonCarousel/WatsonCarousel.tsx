import React from 'react'

import { Card, CardMedia } from '@mui/material'
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
  carouselItem: ItemProps[]
}

const MainStyle = styled('div')({
  display: 'flex',
  color: 'grey.700',
})

const WatsonCarousel = ({ carouselItem }: HeroCarouselProps) => {
  return (
    <>
      {carouselItem?.length > 0 && (
        <MainStyle>
          <Carousel
            navButtonsAlwaysVisible={true}
            swipe={true}
            sx={{ width: '100%' }}
            indicatorContainerProps={{
              style: {
                zIndex: 1,
                marginTop: '-65px',
                position: 'relative',
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

const styles = {
  contentStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '400px',
    width: '100%',
    margin: '0px',
    padding: '0px',
    outline: 'none',
    borderRadius: '0px',
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
            objectFit="contain"
            data-testid="product-image"
          />
        </Link>
      </CardMedia>
    </Card>
  )
}

export default WatsonCarousel
