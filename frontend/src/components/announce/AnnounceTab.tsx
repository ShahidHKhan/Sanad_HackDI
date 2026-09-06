import { useState } from 'react';
import { copyText } from '../../lib/clipboard';
import { OPENING_LINE, buildAnnouncementText, getAnnouncementFacts } from '../../lib/announceTemplate';
import * as sessionStore from '../../lib/sessionStore';
import type { SessionState } from '../../types/domain';

interface AnnounceTabProps {
  state: SessionState;
}

export function AnnounceTab({ state }: AnnounceTabProps) {
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | null>(null);
  const [aiBody, setAiBody] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateText = buildAnnouncementText(state);
  const text = aiBody ? `${OPENING_LINE}\n\n${aiBody}` : templateText;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const facts = getAnnouncementFacts(state);
      const body = await sessionStore.generateAnnouncementText(facts);
      setAiBody(body);
    } catch {
      setError('Could not generate the announcement. Please try again or use the template.');
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard() {
    const ok = await copyText(text);
    setCopyStatus(ok ? 'copied' : 'failed');
    setTimeout(() => setCopyStatus(null), 2500);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // user cancelled the share sheet — don't also copy
        }
        // real failure (e.g. no share target available) — fall through
      }
    }
    await copyToClipboard();
  }

  return (
    <div className="announce-tab">
      <h3 className="announce-heading">Community announcement</h3>
      <pre className="announce-text">{text}</pre>

      {error && <p className="form-error">{error}</p>}

      <div className="announce-ai-actions">
        {aiBody ? (
          <>
            <button type="button" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Regenerating…' : 'Regenerate'}
            </button>
            <button type="button" onClick={() => setAiBody(null)}>
              Use template instead
            </button>
          </>
        ) : (
          <button type="button" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Writing…' : '✨ Write with AI'}
          </button>
        )}
      </div>

      <div className="announce-actions">
        <button type="button" className="announce-share-button" onClick={handleShare}>
          Share
        </button>
        <button type="button" onClick={copyToClipboard}>
          Copy
        </button>
      </div>

      {copyStatus === 'copied' && (
        <p className="announce-copy-status">Copied to clipboard.</p>
      )}
      {copyStatus === 'failed' && (
        <p className="form-error">Couldn't copy — press and hold the text above to copy it manually.</p>
      )}
    </div>
  );
}
