import { NextApiRequest } from 'next'
import getConfig from 'next/config'

import { getAdditionalHeader } from '../util'
import { fetcher } from '@/lib/api/util'
import cache from '@/lib/api/util/cache'
import { getCategoryTreeQuery } from '@/lib/gql/queries'

const { serverRuntimeConfig } = getConfig()
const cacheKey = serverRuntimeConfig.cacheKey
const cacheTimeOut = serverRuntimeConfig.cacheTimeOut

const removeHiddenCategories = (category: any) => {
  const { childrenCategories = [] } = category || {}
  category.childrenCategories = childrenCategories.filter((child: any) => child.isDisplayed)
  if (category.childrenCategories.length) {
    for (const child of childrenCategories) {
      removeHiddenCategories(child)
    }
  }
  return category
}
export default async function getCategoryTree(req?: NextApiRequest) {
  try {
    const cachedItems = cache.get(cacheKey)
    if (cachedItems) return cachedItems

    if (!cachedItems) {
      const headers = req ? getAdditionalHeader(req) : {}

      const response = await fetcher({ query: getCategoryTreeQuery, variables: {} }, { headers })
      let items = response?.data?.categoriesTree?.items || []
      const filteredCats = removeHiddenCategories({
        childrenCategories: items,
        isDisplayed: true,
      } as any)
      items = filteredCats.childrenCategories
      if (items.length) {
        cache.set(cacheKey, items, cacheTimeOut)
      }

      return items
    }
  } catch (error) {
    console.log(error)
  }
}
