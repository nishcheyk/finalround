import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

interface DateSelectorProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

export function DateSelector({ selectedDate, onChange }: DateSelectorProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar value={selectedDate} onChange={onChange} disablePast />
    </LocalizationProvider>
  );
}
