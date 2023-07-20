import vercelFetch from '@vercel/fetch'

import { apiAuthClient } from './api-auth-client'
import { getTenantApiUrl } from './config-helpers'

const fetch = vercelFetch()

const fetcher = async ({ method = 'GET', path = '', body }: any, options: any) => {
  const authToken = await apiAuthClient.getAccessToken()
  const response = await fetch(`${getTenantApiUrl()}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
      'x-vol-user-claims': options?.userClaims,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return await response.json()
}
export default fetcher
