import { useEffect, useState } from 'react';
import type { Task } from '../../types/domain';

interface LogisticsContextCardProps {
  task: Task | undefined;
  onSave: (note: string) => void;
}

export function LogisticsContextCard({ task, onSave }: LogisticsContextCardProps) {
  const [draft, setDraft] = useState(task?.delegateNote ?? '');

  // Task arrives async (created lazily on older sessions) — pick up its
  // note once it loads, and pick up edits made by someone else meanwhile.
  useEffect(() => {
    setDraft(task?.delegateNote ?? '');
  }, [task?.delegateNote]);

  return (
    <section className="section">
      <h3 className="display-3">Extra context</h3>
      <p className="logistics-context-hint">
        Anything else worth sharing — parking, entrances, livestream link, reception details,
        whatever doesn't fit in the slots above. Visible to the family too.
      </p>
      <textarea
        className="logistics-context-textarea"
        rows={4}
        value={draft}
        disabled={!task}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (task && draft !== (task.delegateNote ?? '')) onSave(draft);
        }}
        placeholder="e.g. Use the side entrance on Elm St. Overflow parking behind the community center."
      />
    </section>
  );
}
