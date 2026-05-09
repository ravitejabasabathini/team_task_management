export default function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-300">{label}</div>
      <input
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20"
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-300">{error}</div> : null}
    </label>
  )
}

