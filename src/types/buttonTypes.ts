
import { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"

// Export the button variant types for reuse across the application
export type ButtonVariantProps = VariantProps<typeof buttonVariants>
export type ButtonVariant = ButtonVariantProps["variant"]
