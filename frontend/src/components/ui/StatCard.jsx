import { ArrowDownRightIcon, ArrowUpRightIcon } from '../Icons'

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  tone = 'brand',
}) {
  const TrendIcon = trend?.direction === 'down' ? ArrowDownRightIcon : ArrowUpRightIcon

  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon stat-icon-${tone}`}>
          {Icon && <Icon size={19} />}
        </span>

        {trend && (
          <span
            className={`stat-trend stat-trend-${trend.direction ?? 'up'}`}
            title={trend.label}
          >
            <TrendIcon size={13} />
            {trend.value}
          </span>
        )}
      </div>

      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      {hint && <p className="stat-hint">{hint}</p>}
    </article>
  )
}
