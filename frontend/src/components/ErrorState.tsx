import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title: string;
  message: string;
  onStartOver?: () => void;
}

export function ErrorState({ title, message, onStartOver }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <button
        type="button"
        onClick={() => {
          onStartOver?.();
          navigate('/');
        }}
      >
        Start over
      </button>
    </div>
  );
}
