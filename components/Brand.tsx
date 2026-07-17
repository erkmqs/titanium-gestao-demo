import Link from "next/link";

export function Brand({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <span>T</span>
      </span>
      <span>
        <strong>TITANIUM</strong>
        {!compact && <small>BARBEARIA • GESTÃO</small>}
      </span>
    </Link>
  );
}
