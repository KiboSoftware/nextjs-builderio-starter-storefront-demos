import { Box } from '@mui/system'
import { StaticImageData } from 'next/image'

import KiboImage from '../KiboImage/KiboImage'
import SmallLogo from '@/public/grape-color.png'
import Logo from '@/public/kibo_logo.png'
interface KiboLogoProps {
  logo?: string | StaticImageData // URL or File
  alt?: string
  small?: boolean
}

const styles = {
  logoContainer: {
    width: {
      xs: 33,
      md: 180,
    },
    height: {
      xs: 33,
      md: 180,
    },
  },
  smallLogo: {
    width: 40,
    height: 40,
  },
}

const KiboLogo = ({ logo = Logo, alt = 'kibo-logo', small }: KiboLogoProps) => {
  return (
    <Box width={'100%'} sx={small ? styles.smallLogo : styles.logoContainer}>
      <KiboImage
        src={small ? SmallLogo : Logo}
        alt={alt}
        layout="fill"
        objectFit="contain"
        loading="eager"
      />
    </Box>
  )
}

export default KiboLogo
