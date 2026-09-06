import { useEffect } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { SessionState } from '../../types/domain';
import { LogisticsContextCard } from './LogisticsContextCard';
import { LogisticsSlotCard } from './LogisticsSlotCard';

interface LogisticsTabProps {
  code: string;
  state: SessionState;
  by: { pid: string; name: string };
}

export function LogisticsTab({ code, state, by }: LogisticsTabProps) {
  const ghuslTask = state.tasks.find((t) => t.id === 'ghusl-kafan-completed');
  const janazahTask = state.tasks.find((t) => t.id === 'janazah-prayer-held');
  const contextTask = state.tasks.find((t) => t.id === sessionStore.LOGISTICS_CONTEXT_TASK_ID);

  // Self-heals the context task onto sessions created before it existed —
  // brand-new sessions already have it from seedTasks().
  useEffect(() => {
    if (!contextTask) {
      sessionStore.ensureLogisticsContextTask(code);
    }
  }, [code, contextTask]);

  return (
    <div className="records-section">
      <p className="logistics-intro">
        Confirming a slot here updates the shared Overview timeline for everyone — the family
        doesn't need to call and log it separately.
      </p>

      <LogisticsSlotCard
        title="Ghusl & kafan"
        task={ghuslTask}
        locationLabel="Facility"
        locationPlaceholder="e.g. Masjid Al-Noor ghusl room, men's"
        onConfirm={(fields) => sessionStore.confirmGhuslSlot(code, fields, by)}
        onMarkTbd={() => ghuslTask && sessionStore.setTaskDone(code, ghuslTask.id, false, by)}
      />

      <LogisticsSlotCard
        title="Janazah prayer"
        task={janazahTask}
        locationLabel="Location"
        locationPlaceholder="e.g. Main musalla, after Dhuhr"
        onConfirm={(fields) => sessionStore.confirmJanazahSlot(code, fields, by)}
        onMarkTbd={() => janazahTask && sessionStore.setTaskDone(code, janazahTask.id, false, by)}
      />

      <LogisticsContextCard
        task={contextTask}
        onSave={(note) => sessionStore.setTaskDelegateNote(code, sessionStore.LOGISTICS_CONTEXT_TASK_ID, note)}
      />
    </div>
  );
}
