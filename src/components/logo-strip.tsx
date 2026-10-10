const logos = [["GitHub", "github"], ["TypeScript", "typescript"], ["React", "react"], ["Next.js", "nextdotjs"], ["Prisma", "prisma"], ["PostgreSQL", "postgresql"], ["Supabase", "supabase"], ["Firebase", "firebase"], ["Clerk", "clerk"], ["Stripe", "stripe"]];
export function LogoStrip() {
  return <section className="stack-strip" aria-label="Stack examples">
    <div className="stack-window"><div className="stack-track">{[false, true].map(duplicate => <ul className="stack-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
      {logos.map(([name, slug]) => <li key={slug}><span role="img" aria-label={name} className="stack-logo" style={{ maskImage: `url(/logos/${slug}.svg)` }} /><span aria-hidden="true">{name}</span></li>)}
    </ul>)}</div></div></section>;
}
