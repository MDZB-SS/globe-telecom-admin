import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
        outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:border-red-300 hover:shadow-md",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md",
        ghost: "hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm",
        link: "text-red-600 underline-offset-4 hover:underline hover:text-red-700",
        gradient: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-xl shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean
  loading?: boolean
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false)
    
    React.useEffect(() => {
      setMounted(true)
    }, [])

    const Comp = asChild ? Slot : "button"
    
    // Prevent hydration mismatch by using consistent initial state
    if (!mounted) {
      return (
        <Comp
          className={cn(
            animatedButtonVariants({ variant, size, className }),
            loading && "cursor-not-allowed opacity-70"
          )}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      )
    }
    
    return (
      <Comp
        className={cn(
          animatedButtonVariants({ variant, size, className }),
          loading && "cursor-not-allowed opacity-70"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement...</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton, animatedButtonVariants }

