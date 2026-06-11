import { Card as HeroCard } from "@heroui/react"

// Re-export Hero UI Card components so existing imports from `@/components/ui/card`
// automatically use Hero UI's styling.
export const Card = HeroCard
export const CardHeader = HeroCard.Header
export const CardTitle = HeroCard.Title
export const CardDescription = HeroCard.Description
export const CardContent = HeroCard.Content
export const CardFooter = HeroCard.Footer
