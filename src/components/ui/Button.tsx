import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  icon?: string;
  variant?: ButtonVariant;
  className?: string;
}

export default function Button({
  children,
  icon,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "h-[40px] px-lg rounded-lg font-label-md text-sm transition-all flex items-center justify-center gap-sm cursor-pointer shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-on-primary hover:brightness-110",
    secondary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90",
    outline: "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
    ghost: "text-on-surface-variant hover:bg-surface-container-low shadow-none",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {children}
    </button>
  );
}
