export default function UsersSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b">
          {/* Avatar */}
          <td className="px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          </td>

          {/* Name */}
          <td className="px-4 py-3">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </td>

          {/* Email */}
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </td>

          {/* Phone */}
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
          </td>

          {/* Role */}
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </td>

          {/* Status */}
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </td>

          {/* CreatedAt */}
          <td className="px-4 py-3 hidden lg:table-cell">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </td>

          {/* Actions */}
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
