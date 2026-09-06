interface ComingSoonPlaceholderProps {
  message: string;
}

export function ComingSoonPlaceholder({ message }: ComingSoonPlaceholderProps) {
  return (
    <div className="coming-soon-placeholder">
      <p>{message}</p>
      <p className="coming-soon-placeholder-note">Coming soon.</p>
    </div>
  );
}
