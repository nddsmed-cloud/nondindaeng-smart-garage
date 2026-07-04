"use client";

import React, { useState } from "react";
import { formatThaiDate } from "../../lib/date-formatter";

interface ThaiDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  defaultValue?: string | number | readonly string[];
  className?: string;
  required?: boolean;
}

export default function ThaiDateInput({ name, defaultValue, className, required, ...props }: ThaiDateInputProps) {
  const [val, setVal] = useState<string>(
    defaultValue ? String(defaultValue) : ""
  );

  const isDisabledOrReadOnly = props.disabled || props.readOnly;

  return (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={val ? formatThaiDate(val) : ""}
        className={`${className} ${isDisabledOrReadOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "pointer-events-none"}`}
        placeholder="วว ดดดดด พ.ศ. ปปปป"
        tabIndex={-1}
      />
      <input
        type="date"
        name={name}
        required={required}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          if (props.onChange) {
            props.onChange(e);
          }
        }}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        {...props}
      />
    </div>
  );
}
