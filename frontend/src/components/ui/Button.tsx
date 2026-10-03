import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'nav' | 'submit';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
}

const base =
  'font-bold border-2 border-black cursor-pointer transition-all ' +
  'disabled:cursor-not-allowed';

const lift =
  'hover:not-disabled:-translate-x-[2px] hover:not-disabled:-translate-y-[2px] ' +
  'hover:not-disabled:shadow-[2px_2px_0px_#000] ' +
  'active:not-disabled:translate-x-0 active:not-disabled:translate-y-0 ' +
  'active:not-disabled:shadow-none';

const variants: Record<ButtonVariant, string> = {
  submit:
    `px-6 py-3 text-base text-white bg-blue-600 ${lift} ` +
    'hover:not-disabled:bg-[#0f172a] ' +
    'disabled:bg-brand-disabled-bg disabled:text-brand-disabled disabled:border-brand-disabled',
  danger:
    `px-4 py-2 text-[0.9rem] text-white bg-brand-danger ${lift} ` +
    'hover:not-disabled:bg-brand-danger-hover',
  nav: 'px-5 py-2 text-base text-white bg-brand-nav',

  primary:
    `block mx-auto mt-[30px] px-10 py-3 text-[1.5rem] text-white ` +
    `bg-brand-primary border-[3px] ${lift}`,
};

export default function Button({
  variant = 'primary',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...rest}
    />
  );
}