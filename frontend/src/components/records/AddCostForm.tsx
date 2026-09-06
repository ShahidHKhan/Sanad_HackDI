import { useState, type FormEvent } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { Participant } from '../../types/domain';

interface AddCostFormProps {
  code: string;
  participants: Participant[];
  by: { pid: string; name: string };
  onDone: () => void;
}

export function AddCostForm({ code, participants, by, onDone }: AddCostFormProps) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [paidByPid, setPaidByPid] = useState(participants[0]?.pid ?? by.pid);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!label.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    const paidBy = participants.find((p) => p.pid === paidByPid);
    if (!paidBy) return;

    sessionStore.addCost(
      code,
      { label: label.trim(), amount: parsedAmount, paidByPid: paidBy.pid, paidByName: paidBy.name },
      by,
    );
    onDone();
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Log a cost</h3>
      <label htmlFor="cost-label">Label</label>
      <input
        id="cost-label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Funeral home deposit"
      />
      <label htmlFor="cost-amount">Amount</label>
      <input
        id="cost-amount"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
      />
      <label htmlFor="cost-paid-by">Paid by</label>
      <select id="cost-paid-by" value={paidByPid} onChange={(e) => setPaidByPid(e.target.value)}>
        {participants.map((p) => (
          <option key={p.pid} value={p.pid}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="modal-actions">
        <button type="button" className="btn-quiet" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
