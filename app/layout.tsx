import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Infinity',
  description: "Track your significant other's spending requests",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const supabase = createClientComponentClient<Database>();

  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}
      >
        <AuthProvider>
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
