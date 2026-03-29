"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center overflow-hidden rounded-full transition-colors duration-300 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400 dark:data-[state=unchecked]:bg-gray-600",
        className
      )}
      {...props}
    >
      {/* ON text - visible when checked */}
      <span className="absolute left-2 text-[9px] font-bold text-white opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100">
        ON
      </span>

      {/* OFF text - visible when unchecked */}
      <span className="absolute right-2 text-[9px] font-bold text-white opacity-100 transition-opacity duration-200 group-data-[state=checked]:opacity-0">
        OFF
      </span>

      {/* Sliding thumb */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute left-1 top-1 block h-5 w-5 rounded-full bg-white shadow-md",
          "transition-transform duration-300 ease-in-out",
          "data-[state=checked]:translate-x-8 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
