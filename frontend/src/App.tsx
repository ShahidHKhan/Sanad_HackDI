import { Route, Routes } from 'react-router-dom';
import { Landing } from './routes/Landing';
import { SessionPage } from './routes/SessionPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/s/:code" element={<SessionPage />} />
    </Routes>
  );
}

export default App;
