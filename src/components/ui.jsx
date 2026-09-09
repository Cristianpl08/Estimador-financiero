import React from "react";
import { ExternalLink } from "lucide-react";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-stone-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-400 mt-1">{hint}</span>}
    </label>
  );
}

export function NumberInput({ value, onChange, prefix }) {
  return (
    <div className="flex items-center rounded-md border border-stone-300 bg-white focus-within:ring-2 focus-within:ring-offset-0 px-3 py-2">
      {prefix && <span className="text-stone-400 text-sm mr-1">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-full outline-none text-stone-800 text-sm bg-transparent"
      />
    </div>
  );
}

export function Select({ value, onChange, options, renderLabel }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:ring-2"
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {renderLabel ? renderLabel(opt) : opt.label}
        </option>
      ))}
    </select>
  );
}

export function StatCard({ label, value, accent, big }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">{label}</div>
      <div className={`font-semibold ${big ? "text-2xl" : "text-lg"}`} style={{ color: accent || "#292524" }}>
        {value}
      </div>
    </div>
  );
}

export function SourceLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm underline decoration-dotted underline-offset-2 hover:opacity-70"
      style={{ color: "#166534" }}
    >
      {children}
      <ExternalLink size={13} />
    </a>
  );
}
