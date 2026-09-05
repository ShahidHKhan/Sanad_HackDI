import { useState } from 'react';
import { GROUP_ORDER } from '../../data/defaultTasks';
import * as sessionStore from '../../lib/sessionStore';
import type { Task, TaskGroupName } from '../../types/domain';

interface TaskRowProps {
  code: string;
  task: Task;
  by: { pid: string; name: string };
}

export function TaskRow({ code, task, by }: TaskRowProps) {
  const [noteDraft, setNoteDraft] = useState(task.delegateNote);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [groupDraft, setGroupDraft] = useState<TaskGroupName>(task.group);

  const claimedByMe = task.claimedByPid === by.pid;
  const claimedBySomeoneElse = !!task.claimedByPid && !claimedByMe;

  async function handleClaim() {
    setError(null);
    const ok = await sessionStore.claimTask(code, task.id, by.pid, by.name);
    if (!ok) setError(`Already claimed by ${task.claimedByName}`);
  }

  function startEditing() {
    setTitleDraft(task.title);
    setGroupDraft(task.group);
    setEditing(true);
  }

  function saveEdit() {
    if (!titleDraft.trim()) return;
    sessionStore.editTask(code, task.id, { title: titleDraft.trim(), group: groupDraft });
    setEditing(false);
  }

  function handleRemove() {
    if (window.confirm(`Remove "${task.title}"?`)) {
      sessionStore.removeTask(code, task.id);
    }
  }

  if (editing) {
    return (
      <div className="task-row task-edit-form">
        <label htmlFor={`task-title-${task.id}`}>Title</label>
        <input
          id={`task-title-${task.id}`}
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
        />
        <label htmlFor={`task-group-${task.id}`}>Group</label>
        <select
          id={`task-group-${task.id}`}
          value={groupDraft}
          onChange={(e) => setGroupDraft(e.target.value as TaskGroupName)}
        >
          {GROUP_ORDER.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button type="button" onClick={saveEdit}>
            Save
          </button>
        </div>
      </div>
    );
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
        <button type="button" onClick={startEditing}>
          Edit
        </button>
        <button type="button" className="btn-danger" onClick={handleRemove}>
          Remove
        </button>
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
