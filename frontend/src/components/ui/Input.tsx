import type { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {}

export default function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={
        'flex-1 min-w-0 px-4 py-3 text-base ' + // dùng px-4 py-3 thay vì legacy padding: 10px 14px - đẹp hơn =))
        'border-2 border-black outline-none transition-all ' +
        `${className ?? ''}`
      }
      {...rest}
    />
  );
}
