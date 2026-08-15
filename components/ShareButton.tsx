"use client";

import { useState } from "react";

// Shares the current page URL via the native Web Share sheet (mobile
// browsers) or falls back to copying the link to the clipboard (desktop).
export default function ShareButton({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? document.title, url });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — silently give up, nothing else to fall back to.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ink/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink transition-colors hover:border-ink"
    >
      {copied ? "Link copiado ✓" : "Compartilhar ↗"}
    </button>
  );
}
