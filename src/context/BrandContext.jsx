import { createContext, useContext, useState } from 'react'

const BrandContext = createContext()

export function BrandProvider({ children, brands }) {
  const [brand, setBrand] = useState(brands[0])
  return (
    <BrandContext.Provider value={{ brand, setBrand, brands }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() { return useContext(BrandContext) }
