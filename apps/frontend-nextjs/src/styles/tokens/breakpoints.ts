/**
 * Design System - Responsive Breakpoints
 * Mobile-first approach
 */

export const breakpoints = {
  xs: '480px',   // mobile
  sm: '768px',   // mobile landscape / small tablet
  md: '1024px',  // tablet
  lg: '1440px',  // desktop
  xl: '1920px',  // wide desktop
} as const;

export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  
  // Max-width queries (for mobile-first approach)
  maxXs: `@media (max-width: ${breakpoints.xs})`,
  maxSm: `@media (max-width: ${breakpoints.sm})`,
  maxMd: `@media (max-width: ${breakpoints.md})`,
  maxLg: `@media (max-width: ${breakpoints.lg})`,
  maxXl: `@media (max-width: ${breakpoints.xl})`,
  
  // Range queries
  onlyXs: `@media (max-width: ${breakpoints.xs})`,
  onlySm: `@media (min-width: ${breakpoints.xs}) and (max-width: ${breakpoints.sm})`,
  onlyMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  onlyLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  onlyXl: `@media (min-width: ${breakpoints.lg})`,
} as const;

export type BreakpointToken = typeof breakpoints;
export type MediaQuery = typeof mediaQueries;

