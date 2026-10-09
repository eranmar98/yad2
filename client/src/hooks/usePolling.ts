import { useEffect, useRef } from 'react';

/**
 * Runs `task` right away and then every `intervalMs`, waiting for each run to
 * finish before scheduling the next. Skips runs while the tab is hidden and
 * runs again as soon as it becomes visible.
 */
export default function usePolling(
  task: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    let cancelled = false;

    const run = async () => {
      try {
        await taskRef.current();
      } catch {
        // The next tick retries.
      }
    };

    const tick = async () => {
      if (document.visibilityState === 'visible') await run();
      if (!cancelled) timer = window.setTimeout(tick, intervalMs);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') run();
    };

    tick();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}
