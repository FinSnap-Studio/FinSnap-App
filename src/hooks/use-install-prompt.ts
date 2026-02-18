import { useState, useEffect } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Module-level singleton — survives component mount/unmount cycles
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listenerAdded = false;
const stateListeners = new Set<(v: boolean) => void>();

function setupGlobalListener() {
  if (listenerAdded || typeof window === "undefined") return;
  listenerAdded = true;

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    stateListeners.forEach((l) => l(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    stateListeners.forEach((l) => l(false));
  });
}

export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(() => deferredPrompt !== null);

  useEffect(() => {
    setupGlobalListener();
    stateListeners.add(setIsInstallable);
    return () => {
      stateListeners.delete(setIsInstallable);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      deferredPrompt = null;
      stateListeners.forEach((l) => l(false));
    }
  };

  return { isInstallable, promptInstall };
}
