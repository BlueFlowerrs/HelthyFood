import { cn } from '@/lib/cn'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1.5">
            {label}
            {props.required && <span className="text-wine ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-lg text-text-dark placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-all duration-200',
            error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-gray-400">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1.5">
            {label}
            {props.required && <span className="text-wine ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-lg text-text-dark placeholder:text-gray-400 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-all duration-200',
            error ? 'border-red-400' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-gray-400">{helper}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-lg text-text-dark',
            'focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-all duration-200 cursor-pointer',
            error ? 'border-red-400' : 'border-gray-200',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
