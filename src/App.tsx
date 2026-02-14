import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MobileLayout from './components/mobile/MobileLayout';
import SchoolBackground from './components/SchoolBackground';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import MobileAttendance from './pages/MobileAttendance';
import Records from './pages/Records';
import Analytics from './pages/Analytics';

import { smsService } from './services/sms';
import { isMobile } from './utils/mobile';

function App() {
  useEffect(() => {
    // Background SMS Process
    const process = async () => {
      await smsService.processPendingSMS();
    };

    // Initial check
    process();

    const interval = setInterval(process, 10000); // Every 10s (reduced from 30s)

    const handleOnline = () => process();
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <BrowserRouter>
      <SchoolBackground />
      {isMobile() ? (
        <MobileLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="attendance" element={<MobileAttendance />} />
            <Route path="records" element={<Records />} />
            <Route path="analytics" element={<Analytics />} />
          </Routes>
        </MobileLayout>
      ) : (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="records" element={<Records />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
