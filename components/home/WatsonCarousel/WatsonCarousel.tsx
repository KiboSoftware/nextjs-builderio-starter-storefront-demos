import React from 'react'

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
                marginTop: '-30px',
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

function HeroItem(props: ItemProps) {
  const { imageUrl, imageAlt, imageLink } = props

  return (
    <>
      <Link href={imageLink}>
        <KiboImage
          src={imageUrl}
          alt={imageAlt}
          width="0"
          height="0"
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
        />
      </Link>
    </>
  )
}

export default WatsonCarousel
