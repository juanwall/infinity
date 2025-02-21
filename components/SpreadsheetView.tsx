interface Item {
  name: string;
  price: number;
  created_at: string;
}

export default function SpreadsheetView({ items }: { items: Item[] }) {
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <div className="mb-4">
        <p>Total Items: {totalItems}</p>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">${item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
