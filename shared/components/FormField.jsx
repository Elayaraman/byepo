/**
 * Labeled form field: a <label> paired with an <input>.
 * All extra props are forwarded directly to the <input> element.
 *
 * @param {{ label: string, id?: string, inputClassName?: string }} props
 */
export default function FormField({ label, id, inputClassName, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block font-bold mb-1">
        {label}
      </label>
      <input
        id={id}
        className={inputClassName ?? 'w-full p-2 border border-gray-300'}
        {...inputProps}
      />
    </div>
  );
}
