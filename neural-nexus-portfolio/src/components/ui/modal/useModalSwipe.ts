import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject, TouchEvent } from "react";

interface ModalSwipeOptions {
  nodeId: string;
  enabled: boolean;
  tabsRef: RefObject<HTMLDivElement | null>;
  onNavigate: (direction: -1 | 1) => void;
}

interface Gesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const minimumDistance = 80;
const resistanceDistance = 150;

/** Touch input and its delayed transition belong to the current node only. */
export function useModalSwipe({ nodeId, enabled, tabsRef, onNavigate }: ModalSwipeOptions) {
  const gesture = useRef<Gesture | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const frame = useRef<number | null>(null);
  const [motion, setMotion] = useState({ offset: 0, animating: false });

  const cancelTasks = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.clear();
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    gesture.current = null;
  }, []);

  const schedule = (task: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      task();
    }, delay);
    timers.current.add(timer);
  };

  useEffect(() => {
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setMotion({ offset: 0, animating: true });
    });
    return cancelTasks;
  }, [nodeId, enabled, cancelTasks]);

  const onTouchStart = (event: TouchEvent) => {
    // Cancel any older gesture even when this touch starts on the tab scroller.
    cancelTasks();
    setMotion({ offset: 0, animating: false });
    if (!enabled || tabsRef.current?.contains(event.target as Node)) return;
    const touch = event.targetTouches[0];
    if (!touch) return;
    gesture.current = { startX: touch.clientX, startY: touch.clientY, endX: touch.clientX, endY: touch.clientY };
  };

  const onTouchMove = (event: TouchEvent) => {
    const current = gesture.current;
    const touch = event.targetTouches[0];
    if (!current || !touch || !enabled) return;
    current.endX = touch.clientX;
    current.endY = touch.clientY;
    const deltaX = current.endX - current.startX;
    const deltaY = current.endY - current.startY;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setMotion({ offset: 0, animating: false });
      return;
    }
    const resistance = 1 - Math.min(Math.abs(deltaX) / (resistanceDistance * 2), 0.6);
    setMotion({ offset: deltaX * resistance, animating: false });
  };

  const onTouchEnd = () => {
    const current = gesture.current;
    gesture.current = null;
    if (!current || !enabled) return;
    const distance = current.startX - current.endX;
    const verticalDistance = Math.abs(current.startY - current.endY);
    if (Math.abs(distance) <= minimumDistance || verticalDistance > Math.abs(distance)) {
      setMotion({ offset: 0, animating: true });
      return;
    }
    const direction = distance > 0 ? 1 : -1;
    setMotion({ offset: -direction * 400, animating: true });
    schedule(() => {
      onNavigate(direction);
      setMotion({ offset: direction * 300, animating: false });
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setMotion({ offset: 0, animating: true });
      });
    }, 150);
  };

  const onTouchCancel = () => {
    cancelTasks();
    setMotion({ offset: 0, animating: true });
  };

  return { swipeOffset: motion.offset, isAnimating: motion.animating, onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
