import { useState, useEffect } from 'react'

/**
 * Custom hook for lazy loading icons to reduce bundle size
 * @param {string} iconLibrary - The icon library to load ('react-icons' or 'lucide-react')
 * @param {string} iconName - The specific icon name to load
 * @returns {React.Component|null} - The loaded icon component or null while loading
 */
export const useLazyIcons = (iconLibrary, iconName) => {
  const [IconComponent, setIconComponent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadIcon = async () => {
      try {
        setLoading(true)
        
        if (iconLibrary === 'react-icons') {
          // Split react-icons by category for better tree shaking
          const iconMap = {
            'io': () => import('react-icons/io'),
            'io5': () => import('react-icons/io5'),
            'md': () => import('react-icons/md'),
            'ai': () => import('react-icons/ai'),
            'fa': () => import('react-icons/fa'),
            'ti': () => import('react-icons/ti'),
            'fi': () => import('react-icons/fi'),
            'hi': () => import('react-icons/hi2'),
            'gi': () => import('react-icons/gi'),
            'bi': () => import('react-icons/bi'),
            'tb': () => import('react-icons/tb'),
            'vsc': () => import('react-icons/vsc')
          }
          
          const category = iconName.match(/^([A-Za-z]+)/)?.[1]?.toLowerCase()
          const loadFunction = iconMap[category] || iconMap['io'] // fallback to io
          
          const module = await loadFunction()
          setIconComponent(() => module[iconName])
        } else if (iconLibrary === 'lucide-react') {
          const module = await import('lucide-react')
          setIconComponent(() => module[iconName])
        }
      } catch (error) {
        console.warn(`Failed to load icon ${iconName} from ${iconLibrary}:`, error)
        setIconComponent(null)
      } finally {
        setLoading(false)
      }
    }

    if (iconName) {
      loadIcon()
    }
  }, [iconLibrary, iconName])

  return { IconComponent, loading }
}

/**
 * Hook for loading multiple icons at once
 * @param {Array} iconConfigs - Array of {library, name} objects
 * @returns {Object} - Object with icon components and loading state
 */
export const useLazyIconsBatch = (iconConfigs) => {
  const [icons, setIcons] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadIcons = async () => {
      try {
        setLoading(true)
        const loadedIcons = {}

        for (const config of iconConfigs) {
          const { library, name, key } = config
          
          if (library === 'react-icons') {
            const category = name.match(/^([A-Za-z]+)/)?.[1]?.toLowerCase()
            const iconMap = {
              'io': () => import('react-icons/io'),
              'io5': () => import('react-icons/io5'),
              'md': () => import('react-icons/md'),
              'ai': () => import('react-icons/ai'),
              'fa': () => import('react-icons/fa'),
              'ti': () => import('react-icons/ti'),
              'fi': () => import('react-icons/fi'),
              'hi': () => import('react-icons/hi2'),
              'gi': () => import('react-icons/gi'),
              'bi': () => import('react-icons/bi'),
              'tb': () => import('react-icons/tb'),
              'vsc': () => import('react-icons/vsc')
            }
            
            const loadFunction = iconMap[category] || iconMap['io']
            const module = await loadFunction()
            loadedIcons[key || name] = module[name]
          } else if (library === 'lucide-react') {
            const module = await import('lucide-react')
            loadedIcons[key || name] = module[name]
          }
        }

        setIcons(loadedIcons)
      } catch (error) {
        console.warn('Failed to load icons:', error)
      } finally {
        setLoading(false)
      }
    }

    if (iconConfigs?.length > 0) {
      loadIcons()
    }
  }, [iconConfigs])

  return { icons, loading }
}

export default useLazyIcons
