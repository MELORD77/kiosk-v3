import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './dialog';

function prepareDialog() {
  const onCancel = vi.fn();
  const view = render(
    <Dialog
      open={false}
      titleId="title"
      descriptionId="description"
      onCancel={onCancel}
    >
      <h2 id="title">Session warning</h2>
      <p id="description">Session ends soon</p>
    </Dialog>,
  );
  const element = screen.getByRole<HTMLDialogElement>('dialog', {
    hidden: true,
  });
  const showModal = vi.fn(() => {
    element.open = true;
  });
  const close = vi.fn(() => {
    element.open = false;
  });
  element.showModal = showModal;
  element.close = close;
  return { view, element, onCancel, showModal, close };
}

describe('Dialog', () => {
  it('keeps an open dialog stable when content changes and closes when controlled open becomes false', () => {
    const { view, element, onCancel, showModal, close } = prepareDialog();
    view.rerender(
      <Dialog
        open
        titleId="title"
        descriptionId="description"
        onCancel={onCancel}
      >
        <h2 id="title">Session warning</h2>
        <p id="description">Ten seconds remain</p>
      </Dialog>,
    );
    expect(element).toHaveAccessibleName('Session warning');
    expect(element).toHaveAccessibleDescription('Ten seconds remain');
    view.rerender(
      <Dialog open titleId="title" onCancel={onCancel}>
        <h2 id="title">Session warning</h2>
      </Dialog>,
    );
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
    view.rerender(
      <Dialog open={false} titleId="title" onCancel={onCancel}>
        <h2 id="title">Session warning</h2>
      </Dialog>,
    );
    expect(element.open).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('requests cancellation without closing outside controlled state and closes on unmount', () => {
    const { view, element, onCancel, close } = prepareDialog();
    view.rerender(
      <Dialog open titleId="title" onCancel={onCancel}>
        <h2 id="title">Session warning</h2>
      </Dialog>,
    );
    const cancellation = new Event('cancel', { cancelable: true });
    fireEvent(element, cancellation);
    expect(cancellation.defaultPrevented).toBe(true);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(element.open).toBe(true);
    view.unmount();
    expect(close).toHaveBeenCalledTimes(1);
    expect(element.open).toBe(false);
  });
});
