'use client';

import { useState, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import SpreadsheetView from '@/components/SpreadsheetView';

// Define an interface for the shopping items
interface ShoppingItem {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch('/api/shopping-items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Error loading items:', err);
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

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Project Infinity
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          A grotesque display of consumerism
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <VoiceRecorder onItemConfirmed={addItem} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <SpreadsheetView items={items} />
      </div>
    </div>
  );
}
