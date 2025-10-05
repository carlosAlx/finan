import React from 'react';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  block?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  block = false,
  className,
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], block ? styles.block : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;