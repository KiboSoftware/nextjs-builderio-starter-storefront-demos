import { NextApiRequest } from 'next'

import { getAdditionalHeader } from '../util'
import { fetcher } from '@/lib/api/util'
import { getProductQuery } from '@/lib/gql/queries'

export default async function getProduct(productCode: string, req: NextApiRequest) {
  const variables = {
    productCode,
  }
  console.log('has req', !!req)
  const headers = req ? getAdditionalHeader(req) : {}
  console.log('headers', headers)
  const response = await fetcher({ query: getProductQuery, variables }, { headers })
  return response.data?.product
}
