"use client";

import { useState, useEffect } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import SpreadsheetView from "@/components/SpreadsheetView";

// Define an interface for the shopping items
interface ShoppingItem {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/shopping-items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error loading items:", err);
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: { name: string; price: number }) => {
    try {
      setError(null);
      const response = await fetch("/api/shopping-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping List Voice Assistant</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <VoiceRecorder onItemConfirmed={addItem} />
      {loading ? <div>Loading...</div> : <SpreadsheetView items={items} />}
    </main>
  );
}
