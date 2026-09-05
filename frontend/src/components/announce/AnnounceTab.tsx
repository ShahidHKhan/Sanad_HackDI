import { useState } from 'react';
import { buildAnnouncementText } from '../../lib/announceTemplate';
import type { SessionState } from '../../types/domain';

interface AnnounceTabProps {
  state: SessionState;
}

export function AnnounceTab({ state }: AnnounceTabProps) {
  const [copied, setCopied] = useState(false);
  const text = buildAnnouncementText(state);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable/blocked — nothing more we can do here
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    await copyToClipboard();
  }

  return (
    <div className="announce-tab">
      <h3 className="announce-heading">Community announcement</h3>
      <pre className="announce-text">{text}</pre>
      <div className="announce-actions">
        <button type="button" className="announce-share-button" onClick={handleShare}>
          Share
        </button>
        <button type="button" onClick={copyToClipboard}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
