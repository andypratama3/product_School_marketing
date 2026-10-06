'use client';

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export function showToast(message: string, duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;

  // Clear any existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  el.textContent = message;
  el.classList.add('on');

  toastTimeout = setTimeout(() => {
    el.classList.remove('on');
    toastTimeout = null;
  }, duration);
}

export default function Toast() {
  return <div id="toast" aria-live="polite" aria-atomic="true" />;
}
