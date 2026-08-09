/** DikaRoute logo — hexagonal route-core mark with outbound arrow.
 * Distinct DikaRoute identity — route-core mark.
 * currentColor-based so it inherits theme color. */
type DikaRouteLogoProps = { size?: number; className?: string };
export default function DikaRouteLogo({ size = 20, className = "" }: DikaRouteLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 4.6 26.6 10v12L16 27.4 5.4 22V10L16 4.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3.4" fill="currentColor" />
      <path d="M16 12.6V8.4M14.7 11 16 8.4l1.3 2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}