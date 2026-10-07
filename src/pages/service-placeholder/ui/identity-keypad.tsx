import { useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/classnames';

interface IdentityKeypadProps {
  alphabet: boolean;
  onKey: (key: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onNext: () => void;
}

const layout = {
  default: [
    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    'Q W E R T Y U I O P [ ] \\',
    "A S D F G H J K L ; ' {enter}",
    '{shift} Z X C V B N M , . /',
    '{clear} {space}',
  ],
  shift: [
    '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
    'Q W E R T Y U I O P { } |',
    'A S D F G H J K L : " {enter}',
    '{shift} Z X C V B N M < > ?',
    '{clear} {space}',
  ],
  numeric: ['1 2 3', '4 5 6', '7 8 9', '{clear} 0 {bksp}'],
};

export function IdentityKeypad({
  alphabet,
  onKey,
  onClear,
  onDelete,
  onNext,
}: IdentityKeypadProps) {
  const { t } = useTranslation();
  const [shifted, setShifted] = useState(false);
  const layoutName = alphabet ? (shifted ? 'shift' : 'default') : 'numeric';

  function pressKey(key: string) {
    switch (key) {
      case '{shift}':
        setShifted((value) => !value);
        break;
      case '{clear}':
        onClear();
        break;
      case '{bksp}':
        onDelete();
        break;
      case '{enter}':
        onNext();
        break;
      case '{space}':
        onKey(' ');
        break;
      default:
        onKey(key);
    }
  }

  return (
    <div
      className={cn(
        'identity-keyboard w-full [&_.hg-rows]:flex [&_.hg-rows]:flex-col [&_.hg-rows]:gap-kiosk-2 short-wide:[&_.hg-rows]:gap-kiosk-1 [&_.hg-row]:flex [&_.hg-row]:gap-kiosk-2 [&_.hg-button]:min-w-kiosk-12 [&_.hg-button]:flex-1 [&_.hg-button]:h-kiosk-service-key [&_.hg-button]:rounded-kiosk-sm [&_.hg-button]:border-2 [&_.hg-button]:border-kiosk-control-border [&_.hg-button]:bg-kiosk-surface-muted [&_.hg-button]:text-kiosk-text [&_.hg-button]:text-kiosk-2xl [&_.hg-button]:font-bold [&_.hg-button]:cursor-pointer [&_.hg-button]:leading-none [&_.hg-button:hover]:border-kiosk-primary [&_.hg-button:focus-visible]:outline-2 [&_.hg-button:focus-visible]:outline-offset-2 [&_.hg-button:focus-visible]:outline-kiosk-primary motion-safe:[&_.hg-button.hg-activeButton]:opacity-75 [&_.hg-button>span]:pointer-events-none [&_.identity-key-action]:text-kiosk-md [&_.hg-button-bksp]:text-kiosk-xl [&_.hg-button-space]:grow-[5] compact:[&_.hg-button]:text-kiosk-xl compact:[&_.identity-key-action]:text-kiosk-sm',
        alphabet ? 'overflow-x-auto' : 'overflow-visible',
      )}
      role="group"
      aria-label={t(
        alphabet ? 'identity.alphabetKeyboard' : 'identity.numberKeyboard',
      )}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (!(event.target instanceof HTMLButtonElement)) return;
        const key = event.target.dataset.skbtn;
        if (!key) return;
        event.preventDefault();
        if (event.repeat) return;
        event.target.classList.add('hg-activeButton');
        pressKey(key);
      }}
      onKeyUp={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (!(event.target instanceof HTMLButtonElement)) return;
        event.preventDefault();
        event.target.classList.remove('hg-activeButton');
      }}
      onBlur={(event) => {
        if (event.target instanceof HTMLButtonElement) {
          event.target.classList.remove('hg-activeButton');
        }
      }}
    >
      <Keyboard
        layout={layout}
        layoutName={layoutName}
        theme="identity-keyboard-layout"
        useButtonTag
        preventMouseDownDefault
        preventMouseUpDefault
        disableButtonHold
        disableCaretPositioning
        inputPattern={/^$/}
        onKeyPress={pressKey}
        display={{
          '{clear}': t('identity.clear'),
          '{bksp}': '⌫',
          '{shift}': '⇧',
          '{enter}': '↵',
          '{space}': t('identity.space'),
        }}
        buttonTheme={[
          { class: 'identity-key-action', buttons: '{clear} {space}' },
        ]}
        buttonAttributes={[
          { attribute: 'type', value: 'button' },
          {
            attribute: 'aria-label',
            value: t('identity.delete'),
            buttons: '{bksp}',
          },
          {
            attribute: 'aria-label',
            value: t('identity.shift'),
            buttons: '{shift}',
          },
          {
            attribute: 'aria-pressed',
            value: String(shifted),
            buttons: '{shift}',
          },
          {
            attribute: 'aria-label',
            value: t('identity.nextField'),
            buttons: '{enter}',
          },
        ]}
      />
    </div>
  );
}
