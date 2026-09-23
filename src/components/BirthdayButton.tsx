import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

type BirthdayButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "soft" | "icon";
};

export function BirthdayButton({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: BirthdayButtonProps) {
  return (
    <button
      type={type}
      className={cn("birthday-button", `birthday-button--${variant}`, className)}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}
