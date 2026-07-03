"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/*
 * Slider — native <input type="range"> wrapper that matches the shadcn/ui
 * Slider API surface so the roadmap page works without @radix-ui/react-slider.
 *
 * Props accepted:
 *   value          number[]   controlled value (single-thumb only)
 *   defaultValue   number[]   uncontrolled default
 *   onValueChange  (value: number[]) => void
 *   min / max / step
 *   disabled
 *   className
 */

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      ...props
    },
    ref
  ) => {
    const controlled = value !== undefined
    const [internal, setInternal] = React.useState<number>(
      (defaultValue?.[0] ?? min)
    )

    const current = controlled ? (value![0] ?? min) : internal

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value)
      if (!controlled) setInternal(next)
      onValueChange?.([next])
    }

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center py-1", className)}>
        {/* Track */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          {/* Filled range */}
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${((current - min) / (max - min)) * 100}%` }}
          />
        </div>
        {/* Native range — positioned absolutely on top, transparent */}
        <input
          {...props}
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
        />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow transition-colors"
          style={{ left: `${((current - min) / (max - min)) * 100}%` }}
          aria-hidden="true"
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
