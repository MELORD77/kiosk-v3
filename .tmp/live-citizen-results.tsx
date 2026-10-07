import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';
import { AppProviders } from '../src/app/providers/app-providers';
import { KioskLayout } from '../src/app/ui/kiosk-layout';
import { CitizenServiceResultScreen } from '../src/pages/service-placeholder/ui/citizen-service-result-screen';
import { ServicePlaceholderPage } from '../src/pages/service-placeholder';
import { HomePage } from '../src/pages/home';
import { WelcomePage } from '../src/pages/welcome';
import { useKioskSessionStore } from '../src/features/kiosk-session';
import { Button } from '../src/shared/ui/button';
import { i18n } from '../src/shared/lib/i18n';
import '../src/app/styles/index.css';

const services = [
  { number: 8, name: 'Yashovchilar' },
  { number: 7, name: 'Yashash joyi' },
  { number: 12, name: 'Sudlanganlik' },
  { number: 22, name: 'Ozod etilganlik' },
];

export function LiveResults() {
  const navigate = useNavigate();
  const [uuid, setUuid] = useState('');
  const [input, setInput] = useState('');
  const serviceNumber = Number(
    new URLSearchParams(location.search).get('service') || 8,
  );
  const service = services.find((item) => item.number === serviceNumber);
  if (!service) return null;
  function clear() {
    setUuid('');
    setInput('');
    void navigate('/home');
  }
  return (
    <div className="identity-page py-kiosk-service-gap px-kiosk-page-gutter flex-1 min-w-0 flex flex-col gap-kiosk-4">
      {!uuid ? (
        <form
          className="flex flex-col gap-kiosk-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (/^[a-f\d]{64}$/i.test(input)) {
              if (!useKioskSessionStore.getState().isActive)
                useKioskSessionStore.getState().startSession();
              setUuid(input);
              setInput('');
            }
          }}
        >
          <label htmlFor="live-uuid">UUID</label>
          <input
            id="live-uuid"
            type="password"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit">Natijalarni ochish</Button>
        </form>
      ) : (
        <>
          <CitizenServiceResultScreen
            key={service.number}
            serviceNumber={service.number}
            serviceName={service.name}
            params={{ uid: uuid, language: 'uz' }}
            onBack={clear}
          />
        </>
      )}
    </div>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('The application root is missing.');
void i18n.changeLanguage('uz');
createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<KioskLayout />}>
            <Route index element={<WelcomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route
              path="services/:serviceId"
              element={<ServicePlaceholderPage />}
            />
            <Route path="*" element={<LiveResults />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
