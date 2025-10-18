/**
 * Design System - All Tokens Export
 * Central export for all design tokens
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './radii';
export * from './shadows';
export * from './breakpoints';

// Animation & Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  slower: '500ms ease-in-out',
} as const;

export const durations = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

export const easings = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
} as const;

// Z-Index Scale
export const zIndices = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const;

export type TransitionToken = typeof transitions;
export type DurationToken = typeof durations;
export type EasingToken = typeof easings;
export type ZIndexToken = typeof zIndices;

