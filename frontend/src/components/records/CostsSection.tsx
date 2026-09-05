import { useState } from 'react';
import type { Cost, Participant } from '../../types/domain';
import { AddCostForm } from './AddCostForm';

interface CostsSectionProps {
  code: string;
  costs: Cost[];
  participants: Participant[];
  by: { pid: string; name: string };
}

function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function CostsSection({ code, costs, participants, by }: CostsSectionProps) {
  const [addingCost, setAddingCost] = useState(false);

  const totalSpent = costs.reduce((sum, c) => sum + c.amount, 0);
  const fairShare = participants.length > 0 ? totalSpent / participants.length : 0;

  return (
    <div className="records-section">
      <div className="records-summary panel">
        <div className="records-summary-total">
          <span>Total spent</span>
          <span>{formatMoney(totalSpent)}</span>
        </div>
        {participants.map((p) => {
          const paid = costs.filter((c) => c.paidByPid === p.pid).reduce((sum, c) => sum + c.amount, 0);
          const net = paid - fairShare;
          return (
            <div key={p.pid} className="records-summary-row">
              <span>
                {p.name} · paid {formatMoney(paid)}
              </span>
              <span>{net >= 0 ? `is owed ${formatMoney(net)}` : `owes ${formatMoney(-net)}`}</span>
            </div>
          );
        })}
      </div>

      {addingCost ? (
        <AddCostForm
          code={code}
          participants={participants}
          by={by}
          onDone={() => setAddingCost(false)}
        />
      ) : (
        <button type="button" className="records-log-button" onClick={() => setAddingCost(true)}>
          Log a cost
        </button>
      )}

      {costs.length === 0 ? (
        <p className="records-empty">No costs logged yet.</p>
      ) : (
        <div className="records-list">
          {costs
            .slice()
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .map((c) => (
              <div key={c.id} className="cost-row">
                <span className="cost-row-label">{c.label}</span>
                <span className="cost-row-amount">{formatMoney(c.amount)}</span>
                <span className="cost-row-meta">
                  Paid by {c.paidByName} · {new Date(c.at).toLocaleDateString()}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
