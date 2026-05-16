export default function QrCodesSkeleton() {
  return (
    <tbody>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="border-t animate-pulse">
          {/* Title */}
          <td className="p-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </td>

          {/* QR Preview */}
          <td className="p-3">
            <div className="w-16 h-16 bg-gray-200 rounded border" />
          </td>

          {/* URL */}
          <td className="p-3">
            <div className="h-4 w-52 bg-gray-200 rounded" />
          </td>

          {/* Actions */}
          <td className="p-3">
            <div className="flex justify-center">
              <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}