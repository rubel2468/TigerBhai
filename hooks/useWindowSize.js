const { useState, useLayoutEffect } = require("react")

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 }) // Start with 0 to match server

    useLayoutEffect(() => {
        const handleSize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        handleSize()

        window.addEventListener('resize', handleSize)

        return () => {
            window.removeEventListener('resize', handleSize)
        }

    }, [])

    return size
}

export default useWindowSize