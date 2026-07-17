import { Brand } from "./Brand";

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="app-header">
      <Brand />
      {(title || subtitle) && (
        <div className="app-header-copy">
          {title && <strong>{title}</strong>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </header>
  );
}
