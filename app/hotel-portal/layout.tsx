import React from 'react';

export default function HotelPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include a shared header or sidebar for the hotel portal here */}
      <nav>
        {/* Navigation links can go here */}
      </nav>
      {children}
    </section>
  );
}
