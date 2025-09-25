export const GTM_ID = 'GTM-TW7XR5TX'

export function pushToDataLayer(eventName, payload = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  // Primary event push
  window.dataLayer.push({
    event: eventName,
    ...payload,
  })

  // Also push alias event names that GTM containers commonly use
  try {
    const lower = String(eventName || '').toLowerCase()
    const aliases = []
    if (lower === 'viewcontent') {
      aliases.push('view_content', 'ViewContent')
    }
    if (lower === 'initiatecheckout') {
      aliases.push('initiate_checkout', 'InitiateCheckout')
    }
    // Push each alias variant if needed
    aliases.forEach((evt) => {
      window.dataLayer.push({ event: evt, ...payload })
    })
  } catch (_) {}

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
      return { name: 'ViewContent', params: normalizeTikTokCommerceParams(payload) }
    case 'add_to_cart':
    case 'addtocart':
      return { name: 'AddToCart', params: normalizeTikTokCommerceParams(payload) }
    case 'initiatecheckout':
      return { name: 'InitiateCheckout', params: normalizeTikTokCommerceParams(payload) }
    case 'purchase':
      return { name: 'CompletePayment', params: normalizeTikTokCommerceParams(payload) }
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

function normalizeTikTokCommerceParams(payload) {
  const params = { ...payload }
  
  // TikTok-specific parameter normalization
  // Ensure value parameter is always present for ROAS calculation
  if (params?.value != null) {
    params.value = Number(params.value) || 0
  } else if (params?.price != null) {
    params.value = Number(params.price) || 0
  } else if (params?.items && Array.isArray(params.items) && params.items.length > 0) {
    // Calculate value from items if not provided
    params.value = params.items.reduce((sum, item) => {
      const itemPrice = Number(item.price || item.item_price || 0)
      const quantity = Number(item.quantity || 1)
      return sum + (itemPrice * quantity)
    }, 0)
  }
  
  // Ensure content_id is present for TikTok Video Shopping Ads (VSA)
  // Priority: direct item_id/id, then first item's item_id, then first item's id
  if (!params.content_id) {
    if (payload.item_id) {
      params.content_id = String(payload.item_id)
    } else if (payload.id) {
      params.content_id = String(payload.id)
    } else if (params.items && Array.isArray(params.items) && params.items.length > 0) {
      // Use first item's ID as content_id
      const firstItem = params.items[0]
      params.content_id = String(firstItem.item_id || firstItem.id || firstItem.variantId || '')
    }
  }
  
  // Normalize other TikTok-specific fields
  if (!params.currency && payload.currency) params.currency = payload.currency
  if (!params.content_name && payload.item_name) params.content_name = payload.item_name
  if (!params.content_name && payload.name) params.content_name = payload.name
  
  // TikTok expects content_ids as array
  if (!params.content_ids && params.content_id) {
    params.content_ids = [params.content_id]
  }
  
  // Normalize contents array for TikTok
  if (!params.contents && params.items) {
    params.contents = (params.items || []).map((it) => ({
      content_id: String(it.item_id || it.id || it.variantId || ''),
      content_name: it.item_name || it.name || '',
      content_category: it.item_category || it.category || '',
      price: Number(it.price || it.item_price || 0),
      quantity: Number(it.quantity || 1),
    }))
  }
  
  return params
}
