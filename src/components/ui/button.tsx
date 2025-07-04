import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:glow-primary active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        outline:
          "border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-card hover:glow-ethereal active:scale-95",
        secondary:
          "bg-gradient-secondary text-secondary-foreground hover:glow-green active:scale-95",
        ghost: "hover:bg-card/50 hover:text-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        cosmic: "bg-gradient-cosmic text-primary-foreground hover:glow-primary active:scale-95",
        scan: "bg-accent text-accent-foreground hover:bg-accent/90 hover:glow-ethereal active:scale-95 font-semibold text-lg h-14",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-lg px-8 text-lg",
        icon: "h-12 w-12",
        mobile: "h-14 px-6 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
