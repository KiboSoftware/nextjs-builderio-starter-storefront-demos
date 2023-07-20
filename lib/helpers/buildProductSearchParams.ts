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
    methodFilter.push(`((locationsInStock in [1413] and categoryId eq 3822))`)
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
  }
  const methodFilter = buildMethodFilter({ methodbopis, methoddelivery, methodsth })
  if (methodFilter) {
    filter = filter?.length ? `${filter} or ${methodFilter}` : methodFilter
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
