export function RequiredMark() {
  return <span className="text-destructive"> *</span>;
}

export function FormSection({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? undefined : "border-t pt-4"}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}
