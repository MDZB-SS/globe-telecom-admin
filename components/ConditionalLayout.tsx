'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface ConditionalLayoutProps {
  readonly children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Pages qui ne doivent pas avoir la sidebar
  const pagesWithoutSidebar = ['/login'];
  
  const shouldShowSidebar = !pagesWithoutSidebar.includes(pathname);
  
  if (shouldShowSidebar) {
    return (
      <Sidebar>
        {children}
      </Sidebar>
    );
  }
  
  // Pour les pages sans sidebar (comme /login)
  return <>{children}</>;
}








