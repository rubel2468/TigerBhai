// Utility for generating blur placeholders for images
export const generateBlurDataURL = (width = 10, height = 10) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  
  // Create a simple gradient blur placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}

// Pre-generated blur data URL for better performance
export const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

// Image optimization helpers
export const getImageSizes = (breakpoint = 'default') => {
  const sizes = {
    mobile: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    desktop: '(max-width: 1200px) 50vw, 25vw',
    hero: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw',
    thumbnail: '(max-width: 768px) 25vw, 20vw',
    default: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
  }
  return sizes[breakpoint] || sizes.default
}

export const getImageQuality = (priority = false) => {
  return priority ? 80 : 70
}
