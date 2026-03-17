'use client';

type BaseButtonProps = {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'danger' | 'secondary' | 'glass';
  fullWidth?: boolean;
};

export type ButtonProps = BaseButtonProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

export function Button({
  children,
  isLoading = false,
  loadingText = 'Chargement...',
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex justify-center items-center gap-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/20',
    danger: 'bg-danger-500 hover:bg-danger-400 text-white shadow-lg shadow-danger-500/20',
    secondary:
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700',
    glass:
      'bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-neutral-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/20 shadow-xl',
  };

  const widthStyle = fullWidth ? 'w-full px-5 py-3.5' : 'px-6 py-3';
  const combinedClasses = `${baseStyle} ${variants[variant]} ${widthStyle} ${className}`;

  const content = isLoading ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {loadingText}
    </>
  ) : (
    children
  );

  if ('href' in props && props.href) {
    return (
      <a className={combinedClasses} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  const btnProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button disabled={isLoading || btnProps.disabled} className={combinedClasses} {...btnProps}>
      {content}
    </button>
  );
}
