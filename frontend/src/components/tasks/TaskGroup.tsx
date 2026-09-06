import type { Task, TaskGroupName } from '../../types/domain';
import { TaskRow } from './TaskRow';

interface TaskGroupProps {
  code: string;
  group: TaskGroupName;
  tasks: Task[];
  by: { pid: string; name: string };
  isAdmin: boolean;
}

export function TaskGroup({ code, group, tasks, by, isAdmin }: TaskGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <section className="task-group">
      <h3>{group}</h3>
      {tasks
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((task) => (
          <TaskRow key={task.id} code={code} task={task} by={by} isAdmin={isAdmin} />
        ))}
    </section>
  );
}
