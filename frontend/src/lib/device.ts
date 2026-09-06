import { generateUuid } from './uuid';

const PID_KEY = 'sanad_pid';

// One pid per device/browser profile, reused across every session it ever joins.
export function getDevicePid(): string {
  let pid = localStorage.getItem(PID_KEY);
  if (!pid) {
    pid = generateUuid();
    localStorage.setItem(PID_KEY, pid);
  }
  return pid;
}
