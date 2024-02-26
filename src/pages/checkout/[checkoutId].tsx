import builder, { Builder, BuilderComponent } from '@builder.io/react'
import { NoSsr } from '@mui/material'
import getConfig from 'next/config'
import ErrorPage from 'next/error'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { checkoutMock, orderMock } from '@/__mocks__/stories'
import {
  StandardShipCheckoutTemplate,
  MultiShipCheckoutTemplate,
} from '@/components/page-templates'
import { CheckoutStepProvider } from '@/context/CheckoutStepContext/CheckoutStepContext'
import { getCheckout, getMultiShipCheckout, updateOrder } from '@/lib/api/operations'

import type { Checkout, CrOrder, CrOrderInput } from '@/lib/gql/types'
import type { NextPage, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

interface CheckoutPageProps {
  checkoutId: string
  checkout: CrOrder | Checkout
  isMultiShipEnabled?: boolean
  perks?: any
}

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

builder.apiVersion = 'v3'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, params, req, res } = context
  const { checkoutId } = params as any
  const { publicRuntimeConfig } = getConfig()
  const isMultiShipEnabled = publicRuntimeConfig.isMultiShipEnabled
  const checkout = isMultiShipEnabled
    ? await getMultiShipCheckout(checkoutId, req as NextApiRequest, res as NextApiResponse)
    : await getCheckout(checkoutId, req as NextApiRequest, res as NextApiResponse)

  const urlPath = '/' + ((params?.page as [])?.join('/') || '')

  const perks = await builder.get('perks', { userAttributes: { urlPath: urlPath } }).toPromise()

  const ipAddress = req?.headers['x-forwarded-for'] as string

  await updateOrder(
    checkoutId,
    { ...checkout, ipAddress: ipAddress?.split(',')[0] } as CrOrderInput,
    req as NextApiRequest,
    res as NextApiResponse
  )

  return {
    props: {
      checkout,
      perks: perks || null,
      checkoutId,
      isMultiShipEnabled: isMultiShipEnabled,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const CheckoutPage: NextPage<CheckoutPageProps> = (props) => {
  const { perks, isMultiShipEnabled, ...rest } = props

  let checkout = props.checkout

  const { t } = useTranslation('common')

  if (!checkout) {
    if (!builder.editingMode && !Builder.isServer) return <ErrorPage statusCode={404} />
    else checkout = isMultiShipEnabled ? checkoutMock.checkout : orderMock.checkout
  }

  const steps = [t('details'), t('shipping'), t('payment'), t('review')]
  const quoteCheckout = !isMultiShipEnabled ? (checkout as CrOrder) : null
  const quoteId = quoteCheckout?.originalQuoteId
  return (
    <NoSsr>
      <CheckoutStepProvider steps={steps} initialActiveStep={quoteId ? 2 : 0}>
        {isMultiShipEnabled ? (
          <MultiShipCheckoutTemplate
            {...rest}
            checkout={checkout as Checkout}
            isMultiShipEnabled={!!isMultiShipEnabled}
          />
        ) : (
          <StandardShipCheckoutTemplate
            {...rest}
            checkout={checkout as CrOrder}
            isMultiShipEnabled={!!isMultiShipEnabled}
            perks={<BuilderComponent model="perks" content={perks} />}
          />
        )}
      </CheckoutStepProvider>
    </NoSsr>
  )
}

export default CheckoutPage
