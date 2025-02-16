import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ChromeRoute from '../ChromeRoute';
import NotFoundRoute from '../NotFoundRoute';
import LoadingFallback from '../../utils/loading-fallback';
import { useAtomValue } from 'jotai';
import { moduleRoutesAtom } from '../../state/atoms/chromeModuleAtom';
import LandingRoute from '../Landing';

const redirects = [
  {
    path: '/insights',
    to: '/insights/image-builder',
  },
  {
    path: '/docs',
    to: '/docs/api',
  },
  {
    path: '/quay',
    to: '/quay/organization',
  },
  {
    path: '/hac',
    to: '/hac/application-pipeline',
  },
  {
    path: '/subscriptions',
    to: '/subscriptions/overview',
  },
  {
    path: '/docs',
    to: '/docs/api',
  },
];

export type RoutesProps = {
  routesProps?: { scopeClass?: string };
};

const ChromeRoutes = ({ routesProps }: RoutesProps) => {
  const moduleRoutes = useAtomValue(moduleRoutesAtom);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={LoadingFallback}>
            <LandingRoute />
          </Suspense>
        }
      />

      {redirects.map(({ path, to }) => {
        return <Route key={path} path={path} element={<Navigate replace to={to} />} />;
      })}
      {moduleRoutes.map((app) => (
        <Route key={app.path} path={app.absolute ? app.path : `${app.path}/*`} element={<ChromeRoute {...routesProps} {...app} />} />
      ))}
      {/* Inventory POC route only available for certain accounts */}
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
};

export default ChromeRoutes;
