import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NumericInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
  showButtons?: boolean
  label?: string
}

export const NumericInput = React.forwardRef<
  HTMLInputElement,
  NumericInputProps
>(({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  className,
  disabled = false,
  showButtons = true,
  label,
  ...props 
}, ref) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    const clampedValue = Math.min(max, Math.max(min, newValue))
    onChange(clampedValue)
  }

  if (!showButtons) {
    return (
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={className}
        {...props}
      />
    )
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-8 w-8 p-0 flex-shrink-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <div className="flex-1 min-w-0">
        <Input
          ref={ref}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="text-center h-8"
          {...props}
        />
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-8 w-8 p-0 flex-shrink-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
})

NumericInput.displayName = "NumericInput"