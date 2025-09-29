'use client'
import dynamic from 'next/dynamic'

// Dynamic icon loading component to reduce bundle size
// This component loads icons only when needed and caches them

const createDynamicIcon = (iconPath, iconName, fallbackSize = "w-6 h-6") => {
    return dynamic(
        () => import(iconPath).then(mod => ({ default: mod[iconName] })),
        {
            loading: () => <div className={`${fallbackSize} bg-gray-200 rounded animate-pulse`} />,
            ssr: false // Icons don't need SSR
        }
    )
}

// Pre-configured dynamic icons for common usage
export const DynamicIcons = {
    // Search icons
    IoIosSearch: createDynamicIcon("react-icons/io", "IoIosSearch"),
    IoMdClose: createDynamicIcon("react-icons/io", "IoMdClose"),
    
    // Account icons
    VscAccount: createDynamicIcon("react-icons/vsc", "VscAccount"),
    
    // Menu icons
    HiMiniBars3: createDynamicIcon("react-icons/hi2", "HiMiniBars3"),
    
    // Feature icons for homepage
    GiReturnArrow: createDynamicIcon("react-icons/gi", "GiReturnArrow", "w-8 h-8"),
    FaShippingFast: createDynamicIcon("react-icons/fa", "FaShippingFast", "w-8 h-8"),
    BiSupport: createDynamicIcon("react-icons/bi", "BiSupport", "w-8 h-8"),
    TbRosetteDiscountFilled: createDynamicIcon("react-icons/tb", "TbRosetteDiscountFilled", "w-8 h-8"),
    
    // Admin icons (lazy loaded)
    LucideIcons: {
        Settings: createDynamicIcon("lucide-react", "Settings"),
        Users: createDynamicIcon("lucide-react", "Users"),
        Package: createDynamicIcon("lucide-react", "Package"),
        BarChart: createDynamicIcon("lucide-react", "BarChart"),
        ShoppingCart: createDynamicIcon("lucide-react", "ShoppingCart"),
        FileText: createDynamicIcon("lucide-react", "FileText"),
        Image: createDynamicIcon("lucide-react", "Image"),
        Star: createDynamicIcon("lucide-react", "Star"),
        Trash2: createDynamicIcon("lucide-react", "Trash2"),
        MessageSquare: createDynamicIcon("lucide-react", "MessageSquare"),
    }
}

// Hook for using dynamic icons with loading states
export const useDynamicIcon = (iconPath, iconName, size = "w-6 h-6") => {
    return createDynamicIcon(iconPath, iconName, size)
}

export default DynamicIcons
