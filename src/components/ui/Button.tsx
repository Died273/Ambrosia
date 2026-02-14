"use client";

import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#800022] focus:ring-offset-2 focus:ring-offset-[#3F1414] disabled:opacity-60";
  const variants = {
    primary:
      "bg-[#940128] text-[#F5F0E8] hover:bg-[#800022] shadow-soft active:scale-[0.98]",
    secondary:
      "bg-[#550015] text-[#F5F0E8] border border-[#800022]/50 hover:bg-[#800022]/30",
    ghost:
      "text-[#F5F0E8] hover:bg-[#550015]",
  };

  const combined = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={combined}>
      {children}
    </button>
  );
}
