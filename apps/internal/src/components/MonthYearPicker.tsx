"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface MonthYearPickerProps {
  value?: string; // Format: "01-31.12.25" or empty
  onChange: (value: string) => void;
  placeholder?: string;
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate years (current year and 5 years back)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = currentYear - i;
  return {
    value: year.toString().slice(-2), // Last 2 digits
    label: year.toString(),
  };
});

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select period",
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);

  // Parse existing value to get month and year
  const parseValue = (val?: string) => {
    if (!val) return { month: "", year: "" };

    // Format: "01-31.12.25" -> month: "12", year: "25"
    const match = val.match(/(\d{2})\.(\d{2})$/);
    if (match) {
      return { month: match[1], year: match[2] };
    }
    return { month: "", year: "" };
  };

  const { month: selectedMonth, year: selectedYear } = parseValue(value);

  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  const handleApply = () => {
    if (tempMonth && tempYear) {
      // Generate period format: "01-31.MM.YY"
      const daysInMonth = new Date(
        parseInt(`20${tempYear}`),
        parseInt(tempMonth),
        0
      ).getDate();

      const period = `01-${daysInMonth.toString().padStart(2, "0")}.${tempMonth}.${tempYear}`;
      onChange(period);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setTempMonth("");
    setTempYear("");
    onChange("");
    setOpen(false);
  };

  const displayValue = () => {
    if (!value) return placeholder;

    const { month, year } = parseValue(value);
    if (month && year) {
      const monthName = MONTHS.find((m) => m.value === month)?.label;
      const fullYear = `20${year}`;
      return `${monthName} ${fullYear}`;
    }
    return placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <Select value={tempMonth} onValueChange={setTempMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select value={tempYear} onValueChange={setTempYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              disabled={!tempMonth || !tempYear}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
