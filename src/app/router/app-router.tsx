import { Route, Routes } from 'react-router';
import { WelcomePage } from '@/pages/welcome';
import { HomePage } from '@/pages/home';
import { ServicePlaceholderPage } from '@/pages/service-placeholder';
import { NotFoundPage } from '@/pages/not-found';
import { KioskLayout } from '../ui/kiosk-layout';
import { SessionGate } from './session-gate';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<KioskLayout />}>
        <Route index element={<WelcomePage />} />
        <Route
          path="home"
          element={
            <SessionGate>
              <HomePage />
            </SessionGate>
          }
        />
        <Route
          path="services/:serviceId"
          element={
            <SessionGate>
              <ServicePlaceholderPage />
            </SessionGate>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
