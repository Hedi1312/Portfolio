/**
 * Smoothly scrolls to a target element or position with a custom easing function.
 */
export const smoothScrollTo = (target: string | number, duration = 2000, offset = -80) => {
  const start = window.scrollY;
  let targetPosition = 0;

  if (typeof target === 'string') {
    const element = document.getElementById(target.replace('#', ''));
    if (!element) return;
    targetPosition = element.getBoundingClientRect().top + window.scrollY;
  } else {
    targetPosition = target;
  }

  const startTime = performance.now();
  const distance = targetPosition + offset - start;

  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    window.scrollTo(0, start + distance * easeOutExpo(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};
