import { NextApiRequest } from 'next'

const getAdditionalHeader = (req: NextApiRequest) => {
  const headers = {} as any
  const forwardedForHeader = req?.headers['x-forwarded-for']
  if (forwardedForHeader) {
    headers['x-forwarded-for'] = forwardedForHeader.toString().split(',')[0]
    return {}
  }
  if (req.cookies?.['kibo_purchase_location']) {
    const location = Buffer.from(req.cookies?.['kibo_purchase_location'], 'base64')
      .toString()
      .replaceAll('"', '')
    headers['x-vol-purchase-location'] = location
  }
  return headers
}

export default getAdditionalHeader
