import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from 'react';

interface NativeButtonProps {
  buttonProps: ButtonHTMLAttributes<HTMLButtonElement>;
  style?: CSSProperties;
}

export const NativeButton = forwardRef<HTMLButtonElement, NativeButtonProps>(
  function NativeButton({ buttonProps, style }, ref) {
    return (
      <button
        {...buttonProps}
        style={{ ...buttonProps.style, ...style }}
        ref={ref}
      />
    );
  },
);
