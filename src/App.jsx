import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Chat from './pages/Chat';
import Emergency from './pages/Emergency';
import HelpLines from './pages/HelpLines';
import About from './pages/About';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="helplines" element={<HelpLines />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
