import type { ReactNode } from 'react';

interface FormGroupProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export default function FormGroup({ label, htmlFor, children }: FormGroupProps) {
  return (
    <div className="flex items-center mb-5">
      <label htmlFor={htmlFor} className="w-[180px] shrink-0 text-[1.2rem] font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}
