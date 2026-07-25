"use client";

import { useCallback, useState } from "react";

/**
 * Speak Arabic text using the Web Speech API.
 * Falls back gracefully on unsupported browsers.
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string, lang = "ar-SA") => {
      if (!supported) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = 0.85;
        utter.pitch = 1;

        // Prefer an Arabic voice if available
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find((v) => v.lang.startsWith("ar"));
        if (arVoice) utter.voice = arVoice;

        utter.onstart = () => setSpeaking(true);
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utter);
      } catch {
        setSpeaking(false);
      }
    },
    [supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, speak, stop };
}
