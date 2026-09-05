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
    <div className="code-badge">
      <span className="code-badge-code">{code}</span>
      <button type="button" onClick={copyInviteLink}>
        {copied ? 'Copied!' : 'Copy invite link'}
      </button>
    </div>
  );
}
