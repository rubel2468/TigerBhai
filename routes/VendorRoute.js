// Vendor Dashboard Routes
export const VENDOR_DASHBOARD = '/vendor/dashboard'
export const VENDOR_PRODUCTS = '/vendor/products'
export const VENDOR_PRODUCT_ADD = '/vendor/products/add'
export const VENDOR_PRODUCT_EDIT = '/vendor/products/edit'
export const VENDOR_PRODUCT_EDIT_ID = (id) => id ? `/vendor/products/edit/${id}` : ''
export const VENDOR_PRODUCT_VARIANT_ADD = '/vendor/products/variants/add'
export const VENDOR_PRODUCT_VARIANT_EDIT = (id) => id ? `/vendor/products/variants/edit/${id}` : ''
export const VENDOR_PRODUCT_VARIANT_VIEW = (id) => id ? `/vendor/products/variants/view/${id}` : ''
export const VENDOR_TRASH = '/vendor/trash'
export const VENDOR_ORDERS = '/vendor/orders'
export const VENDOR_ORDER_DETAILS = '/vendor/orders/details'
export const VENDOR_ANALYTICS = '/vendor/analytics'
export const VENDOR_PROFILE = '/vendor/profile'
export const VENDOR_SETTINGS = '/vendor/settings'
export const VENDOR_MESSAGES = '/vendor/messages'

// Vendor Registration Routes
export const VENDOR_REGISTER = '/vendor/register'
export const VENDOR_LOGIN = '/vendor/login'

// Admin Vendor Management Routes
export const ADMIN_VENDORS = '/admin/vendors'
export const ADMIN_VENDOR_DETAILS = '/admin/vendors/details'
export const ADMIN_VENDOR_APPROVE = '/admin/vendors/approve'
export const ADMIN_VENDOR_REJECT = '/admin/vendors/reject'
