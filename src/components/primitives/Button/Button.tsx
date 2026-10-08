import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "md" | "sm";

type OwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Decorative icon after the label, usually a direction arrow. */
  endIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type AsButton = OwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof OwnProps> & { href?: undefined };

type AsLink = OwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof OwnProps> & { href: string };

export type ButtonProps = AsButton | AsLink;

/**
 * Action with a button look. Renders an <a> when `href` is given, so navigation
 * stays a real link, and a <button> otherwise.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", endIcon, children, className, ...rest } = props;

  const classes = cx(styles.button, styles[variant], styles[size], className);
  const content = (
    <>
      <span>{children}</span>
      {endIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </>
  );

  if (rest.href !== undefined) {
    const { target, rel, ...anchorProps } = rest as Omit<AsLink, keyof OwnProps>;
    const safeRel = target === "_blank" ? (rel ?? "noopener noreferrer") : rel;
    return (
      <a className={classes} target={target} rel={safeRel} {...anchorProps}>
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<AsButton, keyof OwnProps>;
  return (
    <button className={classes} type={type} {...buttonProps}>
      {content}
    </button>
  );
}
