import { NextApiRequest, NextApiResponse } from 'next'

import { getAdditionalHeader, getUserClaimsFromRequest, fetchREST } from '@/lib/api/util'

async function fetchCartReservations(cartId: string, req: NextApiRequest, res: NextApiResponse) {
  const userClaims = await getUserClaimsFromRequest(req, res)
  const headers = getAdditionalHeader(req)
  return fetchREST(
    { method: 'GET', path: `/commerce/reservation/cart/${cartId}` },
    { headers, userClaims }
  )
}

export default async function getCartReservations(req: NextApiRequest, res: NextApiResponse) {
  try {
    // get variables
    const { query } = req
    const reservations = await fetchCartReservations(query.cartId as string, req, res)
    res.status(200).json(reservations)
  } catch (error) {
    console.error(error)
    const message = 'An unexpected error ocurred'
    res.status(500).json({ data: null, errors: [{ message }] })
  }
}
