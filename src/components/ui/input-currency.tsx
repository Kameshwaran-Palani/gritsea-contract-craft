
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputCurrencyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
}

export function InputCurrency({ value, onValueChange, className, ...props }: InputCurrencyProps) {
  const [displayValue, setDisplayValue] = React.useState(value.toString())

  React.useEffect(() => {
    setDisplayValue(value.toString())
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)
    
    // Parse the numeric value
    const numericValue = parseFloat(inputValue) || 0
    onValueChange(numericValue)
  }

  const handleBlur = () => {
    // Format the display value on blur
    const numericValue = parseFloat(displayValue) || 0
    setDisplayValue(numericValue.toString())
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
      <Input
        {...props}
        type="number"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn("pl-7", className)}
        placeholder="0.00"
      />
    </div>
  )
}
