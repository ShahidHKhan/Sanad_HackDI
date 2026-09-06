import { useState } from 'react';
import { copyText } from '../lib/clipboard';

interface CodeBadgeProps {
  code: string;
}

export function CodeBadge({ code }: CodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    const url = `${window.location.origin}/s/${code}`;
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
