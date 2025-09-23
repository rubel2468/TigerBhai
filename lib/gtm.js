export const GTM_ID = 'GTM-TW7XR5TX'

export function pushToDataLayer(eventName, payload = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: eventName,
    ...payload,
  })

  // Forward to Facebook Pixel if available
  try {
    if (typeof window.fbq === 'function') {
      const fbPayload = mapToFacebookEvent(eventName, payload)
      if (fbPayload) {
        const { name, params } = fbPayload
        window.fbq('track', name, params)
      }
    }
  } catch (_) {}

  // Forward to TikTok Pixel if available
  try {
    if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') {
      const ttPayload = mapToTikTokEvent(eventName, payload)
      if (ttPayload) {
        const { name, params } = ttPayload
        window.ttq.track(name, params)
      }
    }
  } catch (_) {}
}

export function sendPageView(path) {
  pushToDataLayer('page_view', {
    page_path: path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
  })
}

// Basic event mapping for FB and TikTok
function mapToFacebookEvent(eventName, payload) {
  const lower = String(eventName || '').toLowerCase()
  switch (lower) {
    case 'page_view':
    case 'pageview':
      return { name: 'PageView', params: {} }
    case 'viewcontent':
      return { name: 'ViewContent', params: normalizeCommerceParams(payload) }
    case 'add_to_cart':
    case 'addtocart':
      return { name: 'AddToCart', params: normalizeCommerceParams(payload) }
    case 'initiatecheckout':
      return { name: 'InitiateCheckout', params: normalizeCommerceParams(payload) }
    case 'purchase':
      return { name: 'Purchase', params: normalizeCommerceParams(payload) }
    default:
      // Send custom events as is
      return { name: eventName, params: payload }
  }
}

function mapToTikTokEvent(eventName, payload) {
  const lower = String(eventName || '').toLowerCase()
  switch (lower) {
    case 'page_view':
    case 'pageview':
      return { name: 'PageView', params: {} }
    case 'viewcontent':
      return { name: 'ViewContent', params: normalizeCommerceParams(payload) }
    case 'add_to_cart':
    case 'addtocart':
      return { name: 'AddToCart', params: normalizeCommerceParams(payload) }
    case 'initiatecheckout':
      return { name: 'InitiateCheckout', params: normalizeCommerceParams(payload) }
    case 'purchase':
      return { name: 'CompletePayment', params: normalizeCommerceParams(payload) }
    default:
      return { name: eventName, params: payload }
  }
}

function normalizeCommerceParams(payload) {
  const params = { ...payload }
  // Normalize common fields used by pixels
  if (params?.value != null) {
    params.value = Number(params.value) || 0
  }
  if (!params.currency && payload.currency) params.currency = payload.currency
  if (!params.content_name && payload.name) params.content_name = payload.name
  if (!params.content_ids && payload.id) params.content_ids = [String(payload.id)]
  if (!params.contents && payload.items) {
    params.contents = (payload.items || []).map((it) => ({
      id: String(it.id ?? it.sku ?? it.product_id ?? ''),
      quantity: Number(it.quantity ?? 1),
      item_price: Number(it.price ?? it.item_price ?? 0),
    }))
  }
  return params
}
