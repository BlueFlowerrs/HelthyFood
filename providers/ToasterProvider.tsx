'use client'

import { Toaster } from 'sonner'

export function ToasterProvider({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
      {children}
    </>
  )
}
