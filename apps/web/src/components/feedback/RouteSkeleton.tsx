export function RouteSkeleton() {
  return (
    <section className="state-card">
      <div className="skeleton-shell" aria-hidden="true">
        <span className="skeleton-line skeleton-line--title" />
        <div className="skeleton-row">
          <span className="skeleton-card" />
          <span className="skeleton-card" />
          <span className="skeleton-card" />
        </div>
        <span className="skeleton-panel" />
      </div>
      <p>Loading page...</p>
    </section>
  )
}
