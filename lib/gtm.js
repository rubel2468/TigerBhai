export const GTM_ID = 'GTM-TW7XR5TX'

export function pushToDataLayer(eventName, payload = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  
  // Single clean event push to GTM
  window.dataLayer.push({
    event: eventName,
    ...payload,
  })
}

export function sendPageView(path) {
  pushToDataLayer('page_view', {
    page_path: path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
  })
}

// GTM will handle all pixel events through triggers and tags
// No direct pixel calls needed - GTM manages Facebook and TikTok pixels
