import { useState, type FormEvent } from 'react';
import { GROUP_ORDER } from '../../data/defaultTasks';
import * as sessionStore from '../../lib/sessionStore';
import type { TaskGroupName } from '../../types/domain';

interface AddTaskFormProps {
  code: string;
}

export function AddTaskForm({ code }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState<TaskGroupName>(GROUP_ORDER[0]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    sessionStore.addTask(code, { title: trimmed, group });
    setTitle('');
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Add a task</h3>
      <label htmlFor="add-task-title">Title</label>
      <input
        id="add-task-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Arrange childcare during visitation"
      />
      <label htmlFor="add-task-group">Group</label>
      <select
        id="add-task-group"
        value={group}
        onChange={(e) => setGroup(e.target.value as TaskGroupName)}
      >
        {GROUP_ORDER.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <button type="submit" disabled={!title.trim()}>
        Add task
      </button>
    </form>
  );
}
