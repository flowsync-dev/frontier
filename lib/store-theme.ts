export interface StoreTheme {
  themePreset: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  logoPosition: "left" | "center" | "right"
  showBanner: boolean
  layoutStyle: string
  cardStyle: "elevated" | "bordered" | "flat"
  buttonStyle: "rounded" | "sharp" | "pill"
}

export function getLayoutColumns(layoutStyle: string): string {
  switch (layoutStyle) {
    case "grid-2":
      return "grid-cols-1 md:grid-cols-2"
    case "grid-3":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    case "grid-4":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    case "list":
      return "grid-cols-1"
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }
}

export function getCardClassName(cardStyle: string): string {
  switch (cardStyle) {
    case "elevated":
      return "shadow-md hover:shadow-lg"
    case "bordered":
      return "border-2 border-border hover:border-primary/50"
    case "flat":
      return "border border-border"
    default:
      return "shadow-md hover:shadow-lg"
  }
}

export function getButtonClassName(buttonStyle: string): string {
  switch (buttonStyle) {
    case "rounded":
      return "rounded-md"
    case "sharp":
      return "rounded-none"
    case "pill":
      return "rounded-full"
    default:
      return "rounded-md"
  }
}
