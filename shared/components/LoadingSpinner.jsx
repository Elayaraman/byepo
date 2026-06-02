export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="p-8 font-sans">{message}</div>
  );
}
