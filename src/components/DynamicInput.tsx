import { memo, useCallback } from 'react'

interface DynamicInputProps {
  id: string
  value: string
  onChange: (fieldId: string, value: string) => void
}

/**
 * Memoized controlled input that slots into document text flow.
 * Wrapped in React.memo so it only re-renders when its own slice of state changes.
 */
const DynamicInput = memo(function DynamicInput({
  id,
  value,
  onChange,
}: DynamicInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value)
    },
    [id, onChange]
  )

  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={handleChange}
      aria-label={`Field ${id}`}
      placeholder="..."
      autoComplete="off"
      spellCheck={false}
      className="
        inline-block w-[18ch] min-w-28 max-w-xs
        border-0 border-b-2 border-primary
        bg-primary/5 text-primary
        px-1 py-0 rounded-t-sm
        font-[inherit] leading-[inherit]
        outline-none
        transition-colors duration-100
        placeholder:text-primary/30
        focus:border-primary focus:bg-primary/10
      "
    />
  )
})

export default DynamicInput
