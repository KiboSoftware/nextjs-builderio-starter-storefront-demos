import { CategorySearchParams } from '../types'

import { QueryProductSearchArgs } from '@/lib/gql/types'

function getFacetValueFilter(categoryCode: string, filters: Array<string> = []) {
  let facetValueFilter = ''
  if (categoryCode) {
    facetValueFilter = `categoryCode:${categoryCode},`
  }
  return facetValueFilter + filters
}

const buildMethodFilter = ({ methodbopis, methoddelivery, methodsth }: any) => {
  const methodFilter = []
  if (methodbopis) {
    methodFilter.push(
      `((locationsInStock in [${methodbopis}] and fulfillmentTypesSupported eq InStorePickup))`
    )
  }
  if (methoddelivery) {
    methodFilter.push(
      `((locationsInStock in [${methoddelivery}] and fulfillmentTypesSupported eq Delivery))`
    )
  }
  if (methodsth) {
    let categoryId = ''
    if (methodsth === '804' || methodsth === '906') {
      categoryId = methodsth === 906 ? '3836' : '3835'
      methodFilter.push(`(categoryId req ${categoryId})`)
    }
  }
  return methodFilter.length ? methodFilter.join(' or ') : null
}
export const buildProductSearchParams = ({
  categoryCode = '',
  pageSize,
  filters = [],
  startIndex = 0,
  sort = '',
  search = '',
  filter = '',
  methodbopis = '',
  methodsth = '',
  methoddelivery = '',
}: any): QueryProductSearchArgs => {
  let facetTemplate = ''
  let facetHierValue = ''
  let facet = ''
  facetTemplate = `categoryCode:${categoryCode || '_root'}`
  if (categoryCode) {
    facetHierValue = `categoryCode:${categoryCode}`
    facet = 'categoryCode'
    filter = `categoryCode req ${categoryCode}`
  }
  const methodFilter = buildMethodFilter({ methodbopis, methoddelivery, methodsth })
  if (methodFilter) {
    filter = filter?.length ? `${filter} and ${methodFilter}` : methodFilter
  }
  const facetValueFilter = getFacetValueFilter(categoryCode, filters)
  return {
    query: search,
    startIndex: Number(startIndex),
    pageSize: Number(pageSize),
    sortBy: sort,
    facet,
    facetHierValue,
    facetTemplate,
    facetValueFilter,
    filter,
  }
}
