/**
 * Labeled form field: a <label> paired with an <input>.
 * All extra props are forwarded directly to the <input> element.
 *
 * @param {{ label: string, id?: string, error?: string, inputClassName?: string }} props
 */
export default function FormField({ label, id, error, inputClassName, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block font-bold mb-1">
        {label}
      </label>
      <input
        id={id}
        className={inputClassName ?? `w-full p-2 border rounded-sm ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
        {...inputProps}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
    </div>
  );
}
