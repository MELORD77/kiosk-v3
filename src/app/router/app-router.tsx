import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { WelcomePage } from '@/pages/welcome';
import { HomePage } from '@/pages/home';
import { ServicePlaceholderPage } from '@/pages/service-placeholder';
import { NotFoundPage } from '@/pages/not-found';
import { RouteSkeleton } from '../ui/route-skeleton';
import { KioskLayout } from '../ui/kiosk-layout';
import { SessionGate } from './session-gate';

const CoreDemoPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/core-demo').then((module) => ({
        default: module.CoreDemoPage,
      })),
    )
  : null;

const FacePreviewPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/face-preview').then((module) => ({
        default: module.FacePreviewPage,
      })),
    )
  : null;

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
        {CoreDemoPage && (
          <Route
            path="core-demo"
            element={
              <SessionGate>
                <Suspense fallback={<RouteSkeleton />}>
                  <CoreDemoPage />
                </Suspense>
              </SessionGate>
            }
          />
        )}
        {FacePreviewPage && (
          <Route
            path="face-preview"
            element={
              <SessionGate>
                <Suspense fallback={<RouteSkeleton />}>
                  <FacePreviewPage />
                </Suspense>
              </SessionGate>
            }
          />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
