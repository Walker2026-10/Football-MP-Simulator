import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Football MP Simulator',
  description: 'Simulação de carreira de futebol com gestão e vida pessoal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-dark-bg text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
