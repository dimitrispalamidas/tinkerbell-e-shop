"use client"

import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative z-50 w-full max-w-lg rounded-lg border bg-white p-6 shadow-lg ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, children }: DialogHeaderProps) => (
  <div className={`mb-4 ${className || ''}`}>
    {children}
  </div>
)

const DialogFooter = ({ className, children }: DialogFooterProps) => (
  <div className={`mt-6 flex justify-end gap-3 ${className || ''}`}>
    {children}
  </div>
)

const DialogTitle = ({ className, children }: DialogTitleProps) => (
  <h2 className={`text-xl font-semibold ${className || ''}`}>
    {children}
  </h2>
)

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle }

