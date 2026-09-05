import { useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { Task } from '../../types/domain';

interface TaskRowProps {
  code: string;
  task: Task;
  by: { pid: string; name: string };
}

export function TaskRow({ code, task, by }: TaskRowProps) {
  const [noteDraft, setNoteDraft] = useState(task.delegateNote);
  const [error, setError] = useState<string | null>(null);

  const claimedByMe = task.claimedByPid === by.pid;
  const claimedBySomeoneElse = !!task.claimedByPid && !claimedByMe;

  async function handleClaim() {
    setError(null);
    const ok = await sessionStore.claimTask(code, task.id, by.pid, by.name);
    if (!ok) setError(`Already claimed by ${task.claimedByName}`);
  }

  return (
    <div className={`task-row ${task.done ? 'task-done' : ''}`}>
      <label className="task-row-main">
        <input
          type="checkbox"
          checked={task.done}
          onChange={(e) =>
            sessionStore.setTaskDone(code, task.id, e.target.checked, by)
          }
        />
        <span className="task-title">{task.title}</span>
      </label>

      <div className="task-claim">
        {task.claimedByPid ? (
          <>
            <span className="task-claimed-by">
              Claimed by {claimedByMe ? 'you' : task.claimedByName}
            </span>
            {claimedByMe && (
              <button type="button" onClick={() => sessionStore.releaseTask(code, task.id)}>
                Release
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={handleClaim} disabled={claimedBySomeoneElse}>
            Claim
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <input
        className="task-delegate-note"
        placeholder="Delegated outside the family? Add a note…"
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        onBlur={() => {
          if (noteDraft !== task.delegateNote) {
            sessionStore.setTaskDelegateNote(code, task.id, noteDraft);
          }
        }}
      />
    </div>
  );
}
