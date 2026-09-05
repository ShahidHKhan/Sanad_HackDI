import { Route, Routes } from 'react-router-dom';
import { Landing } from './routes/Landing';
import { MasjidPage } from './routes/MasjidPage';
import { SessionPage } from './routes/SessionPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/s/:code" element={<SessionPage />} />
      <Route path="/s/:code/masjid" element={<MasjidPage />} />
    </Routes>
  );
}

export default App;
