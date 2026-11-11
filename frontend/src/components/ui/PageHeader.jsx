export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-head">
      <div className="page-head-copy">
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {actions && <div className="page-head-actions">{actions}</div>}
    </header>
  )
}
