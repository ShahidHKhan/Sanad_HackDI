import { useState } from 'react';

interface CodeBadgeProps {
  code: string;
}

export function CodeBadge({ code }: CodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    const url = `${window.location.origin}/s/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable/blocked — nothing more we can do here
    }
  }

  return (
    <button
      type="button"
      className="code-badge"
      onClick={copyInviteLink}
      aria-label="Copy invite link"
      title="Copy invite link"
    >
      {copied ? 'Copied!' : code}
    </button>
  );
}
