export default function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400/70 disabled:opacity-50 disabled:cursor-not-allowed'
  const styles =
    variant === 'ghost'
      ? 'bg-white/0 text-slate-100 hover:bg-white/10'
      : variant === 'danger'
        ? 'bg-rose-500 text-white hover:bg-rose-400'
        : 'bg-indigo-500 text-white hover:bg-indigo-400'

  return <button className={`${base} ${styles} ${className}`} {...props} />
}

