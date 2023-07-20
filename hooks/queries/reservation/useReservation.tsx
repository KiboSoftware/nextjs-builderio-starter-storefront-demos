/**
 * @module useGetCategoryTree
 */
import { useQuery } from '@tanstack/react-query'
import fetch from 'isomorphic-unfetch'

import { cartKeys } from '@/lib/react-query/queryKeys'
import type { Maybe, PrCategory } from '@/lib/gql/types'

const fetchReservation = async (cartId: string) => {
  const endpoint = `/api/reservation?cartId=${cartId}`
  const response = await fetch(endpoint)
  return response.json()
}

/**
 * [Query hook] useGetCategoryTree fetches the data from the GET api call to the <b>/api/category-tree</b>
 *
 * Description : Fetches categories and all related sub categories for the storefront
 *
 * Parameters passed to function fetchCategoryTree()
 *
 * On success, returns the category data items
 *
 * @param initialData stores the category data for the storefront present on server side. Used to check if the data has got stale, if not; cached data is returned.
 *
 * @returns category and related children catagories
 */
export const useReservation = (cartId: string): any => {
  const {
    data = [],
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [cartKeys.all, cartId],
    queryFn: () => fetchReservation(cartId),
    refetchOnMount: true,
  } as any)

  return { data, isLoading, isSuccess }
}
