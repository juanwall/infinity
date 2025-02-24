'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Quicksand } from 'next/font/google';

import VoiceRecorder from '@/components/VoiceRecorder';
import SpreadsheetView from '@/components/SpreadsheetView';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

// Define an interface for the shopping items
interface ShoppingItem {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export default function Home() {
  const { user, isAuthLoading } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadItems();
    } else {
      setItems([]);
      setIsLoading(false);
    }
  }, [user?.id]); // Only run when user changes

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/shopping-items');

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: { name: string; price: number }) => {
    try {
      const response = await fetch('/api/shopping-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  // if loading auth, show loading screen
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2
          className={`${quicksand.className} text-xl md:text-2xl text-center font-semibold mb-10 mt-0 lg:mt-20`}
        >
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient">
            Love&apos;s Wishlist vs. Your Bank
          </div>
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient text-sm">
            Spoiler: the wishlist is winning.
          </div>
        </h2>

        <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <VoiceRecorder onItemConfirmed={addItem} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-300" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <SpreadsheetView items={items} loadItems={loadItems} />
        )}
      </div>
    </div>
  );
}
