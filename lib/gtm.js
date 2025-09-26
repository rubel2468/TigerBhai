export const GTM_ID = 'GTM-TW7XR5TX'

export function pushToDataLayer(eventName, payload = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  
  // Enhanced event structure for better GTM compatibility
  const eventData = {
    event: eventName,
    ...payload,
    // Add timestamp for debugging
    timestamp: new Date().toISOString(),
    // Add page info
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  }
  
  // Push primary event
  window.dataLayer.push(eventData)
  
  // Push GA4 compatible events for better tracking
  if (eventName === 'viewcontent') {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: payload.currency || 'BDT',
        value: payload.price || payload.value || 0,
        items: payload.items || [{
          item_id: payload.item_id,
          item_name: payload.item_name,
          item_category: payload.item_category,
          price: payload.price || payload.value || 0,
          quantity: 1
        }]
      }
    })
  }
  
  if (eventName === 'add_to_cart') {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: payload.currency || 'BDT',
        value: payload.value || 0,
        items: payload.items || []
      }
    })
  }
  
  if (eventName === 'initiatecheckout') {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: payload.currency || 'BDT',
        value: payload.value || 0,
        items: payload.items || []
      }
    })
  }
  
  if (eventName === 'purchase') {
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: payload.transaction_id,
        currency: payload.currency || 'BDT',
        value: payload.value || 0,
        items: payload.items || []
      }
    })
  }

  // Optionally forward to pixels when GTM is not managing them
  // To prevent duplicates, set window.__pixelsManagedByGTM = true from GTM if tags are configured there
  try {
    if (typeof window !== 'undefined' && !window.__pixelsManagedByGTM) {
      forwardPixelsIfNeeded(eventName, payload)
    }
  } catch (_) {}
}

export function sendPageView(path) {
  pushToDataLayer('page_view', {
    page_path: path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
  })
}

// Debug function to check GTM events
export function debugGTMEvents() {
  if (typeof window === 'undefined') return
  console.log('GTM Debug Info:')
  console.log('dataLayer:', window.dataLayer)
  console.log('GTM ID:', GTM_ID)
  console.log('Pixels managed by GTM:', window.__pixelsManagedByGTM)
  
  // Check if GTM is loaded
  if (typeof window.google_tag_manager !== 'undefined') {
    console.log('GTM is loaded')
  } else {
    console.log('GTM not detected')
  }
  
  // Check for pixel objects
  console.log('Facebook Pixel:', typeof window.fbq)
  console.log('TikTok Pixel:', typeof window.ttq)
}

// Helper: forward events to pixels only if pixel SDKs are present on page
function forwardPixelsIfNeeded(eventName, payload) {
  const fb = typeof window.fbq === 'function'
  const tt = typeof window.ttq === 'object' && typeof window.ttq.track === 'function'

  if (!fb && !tt) return

  const fbEvt = mapToFacebookEvent(eventName, payload)
  const ttEvt = mapToTikTokEvent(eventName, payload)

  try {
    if (fb && fbEvt) {
      const { name, params } = fbEvt
      window.fbq('track', name, params)
    }
  } catch (_) {}

  try {
    if (tt && ttEvt) {
      const { name, params } = ttEvt
      window.ttq.track(name, params)
    }
  } catch (_) {}
}

// Mapping and normalization (minimal, commerce-focused)
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
  if (params?.value != null) params.value = Number(params.value) || 0
  if (!params.currency && payload.currency) params.currency = payload.currency
  if (!params.content_name && payload.name) params.content_name = payload.name
  if (!params.content_ids && payload.id) params.content_ids = [String(payload.id)]
  if (!params.contents && payload.items) {
    params.contents = (payload.items || []).map((it) => ({
      id: String(it.id ?? it.sku ?? it.product_id ?? it.item_id ?? it.variantId ?? ''),
      quantity: Number(it.quantity ?? 1),
      item_price: Number(it.price ?? it.item_price ?? 0),
    }))
  }
  return params
}

function normalizeTikTokCommerceParams(payload) {
  const params = { ...payload }

  // Ensure value
  if (params?.value != null) {
    params.value = Number(params.value) || 0
  } else if (params?.price != null) {
    params.value = Number(params.price) || 0
  } else if (params?.items && Array.isArray(params.items) && params.items.length > 0) {
    params.value = params.items.reduce((sum, item) => {
      const itemPrice = Number(item.price || item.item_price || 0)
      const quantity = Number(item.quantity || 1)
      return sum + (itemPrice * quantity)
    }, 0)
  }

  // Ensure content_id / content_ids
  if (!params.content_id) {
    if (payload.item_id) {
      params.content_id = String(payload.item_id)
    } else if (payload.id) {
      params.content_id = String(payload.id)
    } else if (params.items && Array.isArray(params.items) && params.items.length > 0) {
      const firstItem = params.items[0]
      params.content_id = String(firstItem.item_id || firstItem.id || firstItem.variantId || '')
    }
  }
  if (!params.content_ids && params.content_id) params.content_ids = [params.content_id]

  // Currency and names
  if (!params.currency && payload.currency) params.currency = payload.currency
  if (!params.content_name && payload.item_name) params.content_name = payload.item_name
  if (!params.content_name && payload.name) params.content_name = payload.name

  // TikTok-specific parameters
  if (!params.content_type && payload.items && Array.isArray(payload.items)) {
    params.content_type = 'product'
  }

  // Contents array for TikTok
  if (!params.contents && params.items) {
    params.contents = (params.items || []).map((it) => ({
      content_id: String(it.item_id || it.id || it.variantId || ''),
      content_name: it.item_name || it.name || '',
      content_category: it.item_category || it.category || '',
      price: Number(it.price || it.item_price || 0),
      quantity: Number(it.quantity || 1),
    }))
  }

  // TikTok expects content_ids as array of strings
  if (params.items && Array.isArray(params.items) && params.items.length > 0) {
    params.content_ids = params.items.map(item => String(item.item_id || item.id || item.variantId || ''))
  }

  // Add description if available
  if (!params.description && payload.description) {
    params.description = payload.description
  }

  // Add order_id for purchase events
  if (!params.order_id && payload.transaction_id) {
    params.order_id = String(payload.transaction_id)
  }

  // Add coupon information
  if (payload.coupon) {
    params.coupon = String(payload.coupon)
  }

  return params
}
