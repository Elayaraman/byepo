export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 text-sm">
      {message}
    </div>
  );
}
