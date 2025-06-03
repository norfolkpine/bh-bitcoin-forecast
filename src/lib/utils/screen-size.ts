export const SCREEN_SIZES = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  }
  
  export function isSmallScreen(width: number): boolean {
    return width < SCREEN_SIZES.sm
  }

  export function isMediumScreen(width: number): boolean {
    return width >= SCREEN_SIZES.md && width < SCREEN_SIZES.lg
  }

  export function isLargeScreen(width: number): boolean {
    return width >= SCREEN_SIZES.lg
  }

  export function isXLargeScreen(width: number): boolean {
    return width >= SCREEN_SIZES.xl
  }
  