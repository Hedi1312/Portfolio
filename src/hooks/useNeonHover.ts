import { useIsDark } from './useIsDark';

export interface NeonHoverConfig {
  whileHover: {
    y?: number;
    borderColor: string;
    boxShadow: string;
  };
  transition: {
    duration: number;
    ease: readonly [number, number, number, number];
  };
}

/**
 * Builds neon hover config for a given y-offset and dark mode state.
 */
export function buildNeonHover(yOffset: number, isDark: boolean): NeonHoverConfig {
  const c = isDark ? '0, 213, 190' : '0, 125, 112';

  return {
    whileHover: {
      ...(yOffset !== 0 && { y: yOffset }),
      borderColor: `rgba(${c}, 0.6)`,
      boxShadow: `0 0 15px rgba(${c}, 0.2), 0 0 30px rgba(${c}, 0.12), 0 0 60px rgba(${c}, 0.06)`,
    },
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
  };
}

/**
 * Hook wrapper for buildNeonHover.
 */
export function useNeonHover(yOffset: number = -8): NeonHoverConfig {
  const isDark = useIsDark();
  return buildNeonHover(yOffset, isDark);
}
