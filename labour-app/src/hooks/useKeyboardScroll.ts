import { useRef } from 'react';
import type { LayoutChangeEvent, ScrollView } from 'react-native';

// Focused input keyboard ke peeche chhup jaye to ScrollView ko us tak le jao.
// Android par KeyboardAvoidingView (height) ke saath milkar kaam karta hai.
export function useKeyboardScroll(topOffset = 110) {
  const scrollRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number>>({});

  const handleLayout = (key: string) => (e: LayoutChangeEvent) => {
    fieldY.current[key] = e.nativeEvent.layout.y;
  };

  const scrollToField = (key: string) => {
    const y = fieldY.current[key];
    if (y === undefined) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - topOffset), animated: true });
    });
  };

  return { scrollRef, handleLayout, scrollToField };
}
