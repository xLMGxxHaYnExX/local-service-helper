import { useState, useRef, useEffect } from "react"
import "../styles/SearchBar.css"
import RecentSearches from "./RecentSearches"

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search commands..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        ref={inputRef}
        className="search-bar-input"
      />

      {value !== "" && (
        <button
          className="search-bar-clear"
          aria-label="Clear search"
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
        >
          ×
        </button>
      )}

      {focused && (
        <div className="recent-dropdown">
          <RecentSearches onSelect={(v) => { onChange(v); setFocused(false); }} />
        </div>
      )}
    </div>
  )
}