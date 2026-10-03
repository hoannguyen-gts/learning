import type { ReactNode } from 'react';
import Button from '../ui/Button';

interface AuthLayoutProps {
  switchLabel: string;
  onSwitch: () => void;
  children: ReactNode;
}

export default function AuthLayout({
  switchLabel,
  onSwitch,
  children,
}: AuthLayoutProps) {
  return (
    <main className="w-full max-w-[700px] mx-auto my-10 bg-white border-[3px] border-black px-10 pt-5 pb-[50px]">
      <div className="flex justify-end mb-5">
        <Button variant="nav" onClick={onSwitch}>
          {switchLabel}
        </Button>
      </div>
      <h1 className="text-center text-[2.2rem] font-bold mb-[30px]">
        ToDoList App
      </h1>

      {children}
    </main>
  );
}
