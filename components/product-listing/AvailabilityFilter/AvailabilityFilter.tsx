import React, { useEffect, useMemo, useState } from 'react'

import {
  FormControlLabel,
  Box,
  Checkbox,
  Typography,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { FullWidthDivider } from '@/components/common'
import { StoreLocatorDialog } from '@/components/dialogs'
import { useModalContext } from '@/context'
import { useGetPurchaseLocation } from '@/hooks'
import { storeLocationGetters } from '@/lib/getters'
import { setPurchaseLocationCookie } from '@/lib/helpers'

const styles = {
  filterBy: {
    padding: { xs: '0 1rem', md: '0' },
    margin: '12px 0',
    typography: 'body2',
    fontWeight: 'bold',
    display: { xs: 'flex' },
    justifyContent: { xs: 'space-between' },
    alignItems: { xs: 'center' },
  },
  Close: {
    display: {
      md: 'none',
    },
    cursor: 'pointer',
    color: 'grey.600',
  },
  label: {
    typography: 'body2',
  },
}

const NoStoreSelected = (props: any) => {
  const { showModal, closeModal } = useModalContext()
  const { t } = useTranslation('common')
  const onStoreLocatorClick = () => {
    showModal({
      Component: StoreLocatorDialog,
      props: {
        handleSetStore: async (selectedStore: any) => {
          setPurchaseLocationCookie(storeLocationGetters.getCode(selectedStore))
          closeModal()
        },
      },
    })
  }

  return (
    <Box alignContent="center">
      <MuiLink
        component="button"
        variant="caption"
        color="text.primary"
        onClick={onStoreLocatorClick}
      >
        {' '}
        {t('select-store')}
      </MuiLink>
    </Box>
  )
}
const AvailabilityFilter = ({
  title,
  handleToggleBOPIS,
  handleToggleDelivery,
  handleToggleSTH,
}: any) => {
  const { data: purchaseLocation } = useGetPurchaseLocation()
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))
  const router = useRouter()
  const [filterBOPIS, setFilterBOPIS] = useState<boolean>(router.query.methodbopis ? true : false)
  const [filterDelivery, setFilterDelivery] = useState<boolean>(
    router.query.methoddelivery ? true : false
  )
  const [filterSTH, setFilterSTH] = useState<boolean>(router.query.methodsth ? true : false)

  const onToggleBOPIS = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.checked)
    setFilterBOPIS(event.target.checked)
  }
  const onToggleDelivery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDelivery(event.target.checked)
  }
  const onToggleSTH = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterSTH(event.target.checked)
  }
  const buildMethodFilters = () => {
    const filters: any = {}
    if (filterBOPIS) {
      filters.methodbopis = storeLocationGetters.getCode(purchaseLocation)
    }
    if (filterDelivery) {
      filters.methoddelivery = storeLocationGetters.getCode(purchaseLocation)
    }
    if (filterSTH) {
      filters.methodsth = storeLocationGetters.getZip(purchaseLocation)
    }
    return filters
  }
  const updateRoute = () => {
    const { methodbopis, methoddelivery, methodsth, ...rest } = router.query
    router.push(
      {
        pathname: router?.pathname,
        query: {
          ...rest,
          ...buildMethodFilters(),
        },
      },
      undefined,
      { scroll: false, shallow: true }
    )
  }

  useEffect(() => {
    updateRoute()
  }, [filterBOPIS, filterDelivery, filterSTH])

  return (
    <Box sx={{ margin: '12px 0 35px' }}>
      <Box sx={{ ...styles.filterBy }}>
        <Typography
          variant={mdScreen ? 'h3' : 'h2'}
          color="GrayText.primary"
          sx={{ fontWeight: 'bold' }}
        >
          Shopping Method
        </Typography>
      </Box>
      {mdScreen ? <Divider sx={{ borderColor: 'grey.500' }} /> : <FullWidthDivider />}
      {purchaseLocation?.name && (
        <>
          <FormControlLabel
            control={<Checkbox size="small" checked={filterBOPIS} onChange={onToggleBOPIS} />}
            label={`Pickup: ${storeLocationGetters.getName(purchaseLocation)}`}
            sx={{ ...styles.label }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={filterDelivery} onChange={onToggleDelivery} />}
            label={`Deliver to: ${storeLocationGetters.getZip(purchaseLocation)}`}
            sx={{ ...styles.label }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={filterSTH} onChange={onToggleSTH} />}
            label={`Ship to: ${storeLocationGetters.getZip(purchaseLocation)}`}
            sx={{ ...styles.label }}
          />
        </>
      )}
      {!purchaseLocation?.name && <NoStoreSelected />}
    </Box>
  )
}

export default AvailabilityFilter
