import {
  BoxIcon,
  ClipboardIcon,
  CreditCardIcon,
  WrenchIcon,
} from '../components/Icons'

const CURRENT_YEAR = new Date().getFullYear()

const FEATURES = [
  {
    icon: ClipboardIcon,
    title: 'Order servis terpantau',
    description: 'Status kendaraan dan pengerjaan mekanik selalu rapi.',
  },
  {
    icon: CreditCardIcon,
    title: 'Pembayaran tercatat',
    description: 'Transaksi dan arus kas bengkel tidak lagi tercecer.',
  },
  {
    icon: BoxIcon,
    title: 'Stok sparepart terkontrol',
    description: 'Ketahui stok tersedia sebelum pelanggan menunggu.',
  },
]

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <div className="brand-lockup">
            <span className="brand-mark">
              <WrenchIcon size={22} />
            </span>
            <span className="brand-word">
              <strong>Bengkelyu</strong>
              <span>Workshop management</span>
            </span>
          </div>

          <div className="auth-brand-copy">
            <span className="auth-eyebrow">Manajemen bengkel</span>
            <h1>Urus bengkel tanpa ribet, semua tercatat rapi.</h1>
            <p>
              Dari order servis sampai kas harian, kelola semuanya dalam satu
              dashboard yang simpel dan siap dipakai.
            </p>

            <ul className="brand-features">
              {FEATURES.map(({ icon: FeatureIcon, title, description }) => (
                <li className="brand-feature" key={title}>
                  <span className="brand-feature-icon">
                    <FeatureIcon size={17} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="auth-brand-footer">
          <span>&copy; {CURRENT_YEAR} Bengkelyu</span>
          <span>Sistem manajemen bengkel</span>
        </footer>
      </aside>

      <main className="auth-main">
        <div className="auth-main-top">
          <div className="brand-lockup brand-lockup-compact auth-mobile-brand">
            <span className="brand-mark">
              <WrenchIcon size={20} />
            </span>
            <span className="brand-word">
              <strong>Bengkelyu</strong>
              <span>Workshop management</span>
            </span>
          </div>
        </div>

        <div className="auth-main-body">
          <div className="auth-card">{children}</div>
        </div>
      </main>
    </div>
  )
}
