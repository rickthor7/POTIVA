export default function PageHeader({ eyebrow, title, subtitle, actions, children }) {
  return (
    <header className="page-head">
      <div className="page-head__copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </header>
  )
}
