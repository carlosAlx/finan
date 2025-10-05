import React from 'react';
import styles from './Input.module.css';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid = false, ...props }: InputProps) {
  const classes = [styles.input, invalid ? styles.invalid : '', className]
    .filter(Boolean)
    .join(' ');

  return <input className={classes} {...props} />;
}

export default Input;