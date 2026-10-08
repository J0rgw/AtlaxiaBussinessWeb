"use client";

import { useId, useState, type ChangeEvent } from "react";
import { cx } from "@/lib/cx";
import { StableLabel } from "../StableLabel";
import styles from "./SegmentedControl.module.css";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** Other texts the label can take (translations): the option keeps the widest size. */
  alternatives?: readonly string[];
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  /** Accessible name of the group, e.g. "Rango temporal". */
  label: string;
  /** Controlled value. Omit it and use `defaultValue` for an uncontrolled control. */
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** Form field name. Generated when omitted. */
  name?: string;
  className?: string;
};

/**
 * Single choice among a few options, styled like the product time-range filter:
 * inset track, active option raised on a white pill.
 * Built on native radio inputs: arrow keys, form submission and screen reader
 * semantics come from the platform.
 */
export function SegmentedControl<T extends string>({
  options,
  label,
  value,
  defaultValue,
  onChange,
  name,
  className,
}: SegmentedControlProps<T>) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue ?? options[0]?.value,
  );
  const selected = value ?? internalValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value as T;
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <div role="radiogroup" aria-label={label} className={cx(styles.track, className)}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <label key={option.value} className={cx(styles.option, isSelected && styles.selected)}>
            <input
              type="radio"
              className={styles.input}
              name={name ?? generatedName}
              value={option.value}
              checked={isSelected}
              onChange={handleChange}
            />
            {/* Reserves the semibold width: selecting an option does not shift the others. */}
            <StableLabel reserveBold alternatives={option.alternatives}>
              {option.label}
            </StableLabel>
          </label>
        );
      })}
    </div>
  );
}
