import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({ 
  subsets: ['arabic', 'latin'], 
  variable: '--font-tajawal',
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SIG Maps V2 - نظام معلومات جغرافي متعدد اللغات',
  description: 'Modern multilingual GIS platform for North Africa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/0u4168eP1ZwO2+0Rf4R/9b96M7P0"
          crossOrigin=""
        />
      </head>
      <body className={`${tajawal.className} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
