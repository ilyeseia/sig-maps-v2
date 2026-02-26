import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({ subsets: ['arabic', 'latin'], variable: '--font-tajawal' });

export const metadata: Metadata = {
  title: 'SIG Maps V2 - نظام معلومات جغرافي متعدد اللغات',
  description: 'Modern multilingual GIS platform for North Africa',
};

export default function RootLayout({
  children,
}: {
  children:React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body className={`${tajawal.className} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
