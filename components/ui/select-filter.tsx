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

const ALL = "__all__";

type Option = { value: string; label: string };

/**
 * Styled (Radix) Select usable inside a plain `method="GET"` filter form.
 * A hidden input mirrors the chosen value so the browser still submits it.
 * The "all / no filter" choice maps to an empty submitted value (Radix forbids
 * an empty SelectItem value, so we use an internal sentinel).
 */
export function SelectFilter({
  name,
  defaultValue = "",
  allLabel,
  options,
  className,
}: {
  name: string;
  defaultValue?: string;
  allLabel: string;
  options: Option[];
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue || ALL);

  // base-ui needs an items map so the trigger shows the label, not the raw value.
  const items: Record<string, string> = {
    [ALL]: allLabel,
    ...Object.fromEntries(options.map((o) => [o.value, o.label])),
  };

  return (
    // Single wrapper so a hidden input doesn't add a phantom `space-y` gap in
    // the parent field, which would misalign the trigger against sibling fields.
    <div className="w-full">
      <input type="hidden" name={name} value={value === ALL ? "" : value} />
      <Select items={items} value={value} onValueChange={(v) => setValue((v as string) ?? ALL)}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
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
