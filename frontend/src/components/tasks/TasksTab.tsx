import { GROUP_ORDER } from '../../data/defaultTasks';
import type { SessionState } from '../../types/domain';
import { AddTaskForm } from './AddTaskForm';
import { TaskGroup } from './TaskGroup';

interface TasksTabProps {
  code: string;
  state: SessionState;
  by: { pid: string; name: string };
  isAdmin: boolean;
}

export function TasksTab({ code, state, by, isAdmin }: TasksTabProps) {
  return (
    <div className="tasks-tab">
      {GROUP_ORDER.map((group) => (
        <TaskGroup
          key={group}
          code={code}
          group={group}
          tasks={state.tasks.filter((t) => t.group === group)}
          by={by}
          isAdmin={isAdmin}
        />
      ))}
      {isAdmin && <AddTaskForm code={code} />}
    </div>
  );
}
