type PlaceholderCardProps = {
  title: string;
  body: string;
};

export function PlaceholderCard({ title, body }: PlaceholderCardProps) {
  return (
    <section className="rounded-2xl border bg-slate-50/70 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </section>
  );
}
