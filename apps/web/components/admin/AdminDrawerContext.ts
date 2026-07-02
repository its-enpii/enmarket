'use client';

import { createContext, useContext } from 'react';

interface AdminDrawerContextValue {
  openDrawer: () => void;
}

export const AdminDrawerContext = createContext<AdminDrawerContextValue | null>(null);

export function useAdminDrawer() {
  const ctx = useContext(AdminDrawerContext);
  return ctx;
}