import React from 'react';

interface ErrorHandlerProps {
  children: React.ReactNode;
}

export function ErrorHandler({ children }: ErrorHandlerProps) {
  return <>{children}</>;
}
