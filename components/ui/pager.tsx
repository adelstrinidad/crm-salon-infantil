import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PagerProps = {
  page: number;
  pageCount: number;
  total: number;
  basePath: string;
  // Extra query params to preserve across page links (e.g. filters).
  query?: Record<string, string | undefined>;
};

export function Pager({ page, pageCount, total, basePath, query = {} }: PagerProps) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) sp.set(key, value);
    }
    sp.set("page", String(target));
    return `${basePath}?${sp.toString()}`;
  };

  const disabledClass = "pointer-events-none opacity-50";

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        Página {page} de {pageCount} · {total} en total
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page <= 1 && disabledClass
          )}
        >
          Anterior
        </Link>
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={page >= pageCount}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= pageCount && disabledClass
          )}
        >
          Siguiente
        </Link>
      </div>
    </div>
  );
}
