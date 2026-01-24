import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type JSX,
  type ReactNode,
} from 'react';

type Spacing = number | string;

const spacingScale: Record<string, number> = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

function resolveSpacing(value?: Spacing) {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  if (Object.prototype.hasOwnProperty.call(spacingScale, value)) {
    return `${spacingScale[value]}px`;
  }
  return value;
}

type ActionIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'light' | 'subtle' | 'filled';
  color?: 'blue' | string;
  size?: 'sm' | 'md' | number;
};

export const ActionIcon = forwardRef<HTMLButtonElement, ActionIconProps>(
  ({ variant = 'light', color, size = 'md', className, style, type = 'button', ...props }, ref) => {
    const classes = [
      'fc-action-icon',
      variant ? `fc-action-icon--${variant}` : null,
      color ? `fc-action-icon--${color}` : null,
      size === 'sm' ? 'fc-action-icon--sm' : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle: CSSProperties = {
      ...(typeof size === 'number' ? { width: size, height: size } : null),
      ...style,
    };

    return <button ref={ref} type={type} className={classes} style={mergedStyle} {...props} />;
  }
);

ActionIcon.displayName = 'ActionIcon';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'light';
  size?: 'sm' | 'md';
};

export function Badge({ variant = 'light', size = 'md', className, ...props }: BadgeProps) {
  const classes = [
    'fc-badge',
    variant ? `fc-badge--${variant}` : null,
    size === 'sm' ? 'fc-badge--sm' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <span className={classes} {...props} />;
}

type GroupProps = HTMLAttributes<HTMLDivElement> & {
  gap?: Spacing;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: CSSProperties['flexWrap'];
};

export function Group({ gap, align, justify, wrap, style, className, ...props }: GroupProps) {
  const mergedStyle: CSSProperties = {
    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
    gap: resolveSpacing(gap),
    ...style,
  };
  return <div className={className} style={mergedStyle} {...props} />;
}

type TextProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fw?: number;
  c?: 'dimmed' | string;
  px?: Spacing;
  py?: Spacing;
};

export function Text({ size = 'md', fw, c, px, py, style, className, ...props }: TextProps) {
  const fontSize =
    size === 'xs' ? 11 : size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  const color = c === 'dimmed' ? 'rgba(148, 163, 184, 0.9)' : c;
  const mergedStyle: CSSProperties = {
    fontSize,
    fontWeight: fw,
    color,
    paddingLeft: resolveSpacing(px),
    paddingRight: resolveSpacing(px),
    paddingTop: resolveSpacing(py),
    paddingBottom: resolveSpacing(py),
    ...style,
  };
  return <div className={className} style={mergedStyle} {...props} />;
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: 'sm' | 'md';
  leftSection?: ReactNode;
  mb?: Spacing;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', leftSection, mb, className, style, ...props }, ref) => {
    const classes = ['fc-input', size === 'sm' ? 'fc-input--sm' : null, className]
      .filter(Boolean)
      .join(' ');
    const mergedStyle: CSSProperties = {
      marginBottom: resolveSpacing(mb),
      ...style,
    };

    return (
      <div className={classes} style={mergedStyle}>
        {leftSection ? <span className="fc-input__icon">{leftSection}</span> : null}
        <input ref={ref} className="fc-input__field" {...props} />
      </div>
    );
  }
);

Input.displayName = 'Input';

type TextInputProps = Omit<InputProps, 'leftSection'>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  return <Input ref={ref} {...props} />;
});

TextInput.displayName = 'TextInput';

type TooltipProps = {
  label?: ReactNode;
  children: ReactNode;
  openDelay?: number;
};

export function Tooltip({ label, children }: TooltipProps) {
  const title =
    typeof label === 'string' || typeof label === 'number' ? String(label) : undefined;
  return (
    <span className="fc-tooltip" title={title}>
      {children}
    </span>
  );
}

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  h?: Spacing;
  scrollbars?: 'x' | 'y' | 'xy';
  type?: 'auto' | 'always';
  styles?: {
    viewport?: CSSProperties;
  };
};

export function ScrollArea({
  h,
  scrollbars,
  type,
  style,
  className,
  styles,
  ...props
}: ScrollAreaProps) {
  void type;
  const mergedStyle: CSSProperties = {
    height: resolveSpacing(h),
    overflowY: scrollbars === 'y' || scrollbars === 'xy' ? 'auto' : undefined,
    overflowX: scrollbars === 'x' || scrollbars === 'xy' ? 'auto' : undefined,
    ...styles?.viewport,
    ...style,
  };
  return <div className={['fc-scroll-area', className].filter(Boolean).join(' ')} style={mergedStyle} {...props} />;
}

type ModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  fullScreen?: boolean;
  overlayProps?: {
    opacity?: number;
    blur?: number;
  };
  transitionProps?: {
    duration?: number;
  };
  styles?: {
    header?: CSSProperties;
    body?: CSSProperties;
  };
};

export function Modal({
  opened,
  onClose,
  title,
  children,
  fullScreen,
  overlayProps,
  styles,
}: ModalProps) {
  useEffect(() => {
    if (!opened) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [opened, onClose]);

  if (!opened) return null;

  const overlayStyle: CSSProperties = {
    background: `rgba(0, 0, 0, ${overlayProps?.opacity ?? 0.6})`,
    backdropFilter: overlayProps?.blur ? `blur(${overlayProps.blur}px)` : undefined,
  };

  return (
    <div className="fc-modal" role="dialog" aria-modal="true">
      <div className="fc-modal__overlay" style={overlayStyle} onClick={onClose} />
      <div className={`fc-modal__content${fullScreen ? ' is-fullscreen' : ''}`}>
        <div className="fc-modal__header" style={styles?.header}>
          <div className="fc-modal__title">{title}</div>
          <button className="fc-modal__close" type="button" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>
        <div className="fc-modal__body" style={styles?.body}>
          {children}
        </div>
      </div>
    </div>
  );
}

type PopoverContextValue = {
  opened: boolean;
  offset: number;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

type PopoverProps = {
  opened?: boolean;
  onClose?: () => void;
  position?: string;
  withArrow?: boolean;
  offset?: number;
  className?: string;
  children: ReactNode;
};

type PopoverDropdownProps = HTMLAttributes<HTMLDivElement>;
type PopoverTargetProps = {
  children: ReactNode;
};

type PopoverComponent = ((props: PopoverProps) => JSX.Element) & {
  Target: (props: PopoverTargetProps) => JSX.Element;
  Dropdown: (props: PopoverDropdownProps) => JSX.Element | null;
};

export const Popover: PopoverComponent = ({
  opened = false,
  offset = 4,
  className,
  children,
}: PopoverProps) => {
  return (
    <PopoverContext.Provider value={{ opened, offset }}>
      <div className={['fc-popover', className].filter(Boolean).join(' ')}>{children}</div>
    </PopoverContext.Provider>
  );
};

Popover.Target = function PopoverTarget({ children }: PopoverTargetProps) {
  return <>{children}</>;
};

Popover.Dropdown = function PopoverDropdown({ className, style, ...props }: PopoverDropdownProps) {
  const ctx = useContext(PopoverContext);
  if (!ctx?.opened) return null;
  const mergedStyle: CSSProperties = {
    top: `calc(100% + ${ctx.offset}px)`,
    ...style,
  };
  return (
    <div
      className={['fc-popover__dropdown', className].filter(Boolean).join(' ')}
      style={mergedStyle}
      {...props}
    />
  );
};
