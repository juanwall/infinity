interface Item {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export default function SpreadsheetView({ items }: { items: Item[] }) {
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalPriceWithTax = totalPrice * 1.0925; // Adding 9.25% tax

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <p>Total Items: {totalItems}</p>
        <p>
          Total Price:{' '}
          {totalPrice.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
        <p>
          Total Price (inc. 9.25% tax):{' '}
          {totalPriceWithTax.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">${item.price.toFixed(2)}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
