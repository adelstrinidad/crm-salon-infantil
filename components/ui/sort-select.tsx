"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/**
 * Styled (Radix) Select for a sort control inside a `method="GET"` filter form.
 * Like `SelectFilter` but every option carries a real value (no "all" sentinel),
 * since a sort always resolves to a concrete `field:dir`. A hidden input mirrors
 * the choice so the browser submits it.
 */
export function SortSelect({
  name,
  defaultValue,
  options,
  className,
}: {
  name: string;
  defaultValue: string;
  options: Option[];
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  const items: Record<string, string> = Object.fromEntries(
    options.map((o) => [o.value, o.label]),
  );

  return (
    // Single wrapper so the hidden input doesn't add a phantom `space-y` gap.
    <div className="w-full">
      <input type="hidden" name={name} value={value} />
      <Select items={items} value={value} onValueChange={(v) => setValue(v as string)}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
