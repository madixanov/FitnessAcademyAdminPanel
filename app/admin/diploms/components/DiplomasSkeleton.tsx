export default function Skeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <tbody>
      {rows.map((_, idx) => (
        <tr key={idx} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3 hidden lg:table-cell">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3 flex gap-2">
            <div className="w-10 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-10 h-6 bg-gray-200 rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
