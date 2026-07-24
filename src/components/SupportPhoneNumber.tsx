import React from 'react';
import { Phone } from 'lucide-react';

interface SupportPhoneNumberProps {
  prefix?: string;
  className?: string;
  phone?: string;
  rawPhone?: string;
  showIcon?: boolean;
}

export default function SupportPhoneNumber({
  prefix = "Support :",
  className = "",
  phone = "690 00 00 00",
  rawPhone = "690000000",
  showIcon = false,
}: SupportPhoneNumberProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 font-medium ${className}`}>
      {showIcon && <Phone className="w-3 h-3 shrink-0 opacity-75" />}
      {prefix && <span className="opacity-80">{prefix}</span>}
      <a
        href={`tel:${rawPhone}`}
        className="text-inherit hover:text-indigo-400 dark:hover:text-indigo-300 font-normal transition-colors underline decoration-slate-400/50 hover:decoration-indigo-400 underline-offset-2"
        title={`Appeler le support (${phone})`}
      >
        {phone}
      </a>
    </span>
  );
}
