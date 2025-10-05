import React from 'react';
import styles from './FormField.module.css';

type FormFieldProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  helperText?: string;
  error?: string;
  className?: string;
};

export function FormField({ id, label, children, helperText, error, className }: FormFieldProps) {
  const classes = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {helperText && !error && <span className={styles.helper}>{helperText}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default FormField;