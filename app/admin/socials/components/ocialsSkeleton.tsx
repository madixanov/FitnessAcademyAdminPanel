export default function BranchSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </td>
          <td className="px-4 py-3 hidden lg:table-cell">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
