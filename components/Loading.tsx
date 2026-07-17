export function Loading({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
