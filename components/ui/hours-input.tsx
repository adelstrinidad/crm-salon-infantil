"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// hh:mm time entry with minutes restricted to 00 or 30 (half-hour granularity,
// no partial times). Works on total minutes; emits total minutes on change.
export function HoursInput({
  minutes,
  onChange,
  disabled,
}: {
  minutes: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60 >= 30 ? 30 : 0;

  return (
    <div className="flex items-end gap-1">
      <Input
        type="number"
        min={0}
        step={1}
        value={hours}
        disabled={disabled}
        aria-label="Horas"
        className="w-16"
        onChange={(e) => {
          const h = Math.max(0, parseInt(e.target.value) || 0);
          onChange(h * 60 + mins);
        }}
      />
      <span className="pb-2 text-muted-foreground">:</span>
      <div className="w-20">
        <Select
          items={{ "0": "00", "30": "30" }}
          value={String(mins)}
          onValueChange={(v) => {
            const m = v === "30" ? 30 : 0;
            onChange(hours * 60 + m);
          }}
        >
          <SelectTrigger className="w-full" aria-label="Minutos" disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">00</SelectItem>
            <SelectItem value="30">30</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
