import React from 'react'
import clsx from 'clsx'

export function Card({ className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-card text-card-foreground rounded-lg border border-border shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }) {
  return (
    <div className={clsx('p-4 border-b border-border/60', className)} {...props} />
  )
}

export function CardTitle({ className = '', ...props }) {
  return (
    <h3 className={clsx('text-base font-semibold tracking-tight', className)} {...props} />
  )
}

export function CardDescription({ className = '', ...props }) {
  return (
    <p className={clsx('text-sm text-muted-foreground', className)} {...props} />
  )}

export function CardContent({ className = '', ...props }) {
  return (
    <div className={clsx('p-4', className)} {...props} />
  )
}

export function CardFooter({ className = '', ...props }) {
  return (
    <div className={clsx('p-4 border-t border-border/60', className)} {...props} />
  )
}
