// Performance measurement utilities
const timings = new Map<string, number>();

export const startTiming = (label: string) => {
  timings.set(label, performance.now());
};

export const endTiming = (label: string) => {
  const start = timings.get(label);
  if (start) {
    const duration = performance.now() - start;
    console.log(`⏱️ ${label}: ${duration.toFixed(3)} ms`);
    timings.delete(label);
  }
};

export const startRouteTransition = () => {
  startTiming('Route Transition');
};

export const endRouteTransition = () => {
  endTiming('Route Transition');
};
