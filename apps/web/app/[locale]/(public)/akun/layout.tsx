import React from 'react';
import { AuthProvider } from '@/components/customer/AuthProvider';
import { AccountSidebar } from '@/components/customer/AccountSidebar';
import { SectionContainer } from '@/components/public/SectionContainer';

export default function AkunLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="bg-transparent py-8 md:py-12">
        <SectionContainer>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <AccountSidebar />
            <div className="flex-1 w-full min-w-0">{children}</div>
          </div>
        </SectionContainer>
      </div>
    </AuthProvider>
  );
}
