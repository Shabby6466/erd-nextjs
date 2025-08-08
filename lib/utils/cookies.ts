export const cookieUtils = {
  set: (name: string, value: string, options: { persistent?: boolean } = {}) => {
    if (typeof window !== "undefined") {
      // Only set secure flag for HTTPS (not localhost)
      const isHttps = window.location.protocol === 'https:'
      const secureFlag = isHttps ? '; secure' : ''
      
      let cookieString = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax${secureFlag}`
      
      if (options.persistent !== false) {
        // Set cookie to expire in 30 days for persistent storage
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        cookieString += `; expires=${expiryDate.toUTCString()}`
        console.log('Setting persistent cookie:', name, 'expires:', expiryDate.toUTCString())
      } else {
        // Session cookie (expires when browser closes)
        console.log('Setting session cookie:', name)
      }
      
      document.cookie = cookieString
      
      // Verify the cookie was set
      const checkValue = cookieUtils.get(name)
      console.log('Cookie verification - set value exists:', !!checkValue)
    }
  },

  get: (name: string): string | null => {
    if (typeof window === "undefined") return null
    
    console.log('Getting cookie:', name, 'from:', document.cookie)
    
    const value = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1]
    
    const decodedValue = value ? decodeURIComponent(value) : null
    console.log('Cookie get result:', name, 'found:', !!decodedValue)
    return decodedValue
  },

  remove: (name: string) => {
    if (typeof window !== "undefined") {
      console.log('Removing cookie:', name)
      // Set cookie to expire in the past to remove it
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`
      
      // Also try with max-age=0 for better compatibility
      document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
      
      // Verify the cookie was removed
      const checkValue = cookieUtils.get(name)
      console.log('Cookie removal verification - value exists:', !!checkValue)
    }
  }
}
