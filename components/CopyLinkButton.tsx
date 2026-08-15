"use client";

import { useState } from "react";

// Always copies to clipboard — unlike ShareButton, which tries the
// native share sheet first. This gives users an explicit, predictable
// "just copy the link" option alongside the share sheet.
export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing else to fall back to.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ink/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink transition-colors hover:border-ink"
    >
      {copied ? "Link copiado ✓" : "Copiar link dessa página"}
    </button>
  );
}
