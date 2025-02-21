'use client';

import { Quicksand } from 'next/font/google';

import { useAuth } from './AuthProvider';
import Image from 'next/image';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <nav className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Image
          src="/infinity-logo.png"
          alt="Infinity Logo"
          className="h-8 w-auto"
          quality={40}
          width={32}
          height={32}
        />
        <h1
          className={`${quicksand.className} text-2xl font-bold text-gray-900 dark:text-white tracking-wide`}
        >
          Infinity
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => signOut()}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;
