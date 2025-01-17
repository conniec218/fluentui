import * as React from 'react';
import { getNativeElementProps, useEventCallback } from '@fluentui/react-utilities';
import type { BaseTreeItemProps, BaseTreeItemState } from './BaseTreeItem.types';
import { ArrowRight, ArrowLeft, Enter } from '@fluentui/keyboard-keys';
import { useTreeContext_unstable } from '../../contexts/treeContext';
/**
 * Create the state required to render BaseTreeItem.
 *
 * The returned state can be modified with hooks such as useBaseTreeItemStyles_unstable,
 * before being passed to renderBaseTreeItem_unstable.
 *
 * @param props - props from this instance of BaseTreeItem
 * @param ref - reference to root HTMLElement of BaseTreeItem
 */
export const useBaseTreeItem_unstable = (
  props: BaseTreeItemProps,
  ref: React.Ref<HTMLDivElement>,
): BaseTreeItemState => {
  const { 'aria-owns': ariaOwns, as = 'div', onKeyDown, ...rest } = props;

  const level = useTreeContext_unstable(ctx => ctx.level);
  const requestOpenChange = useTreeContext_unstable(ctx => ctx.requestOpenChange);
  const focusFirstSubtreeItem = useTreeContext_unstable(ctx => ctx.focusFirstSubtreeItem);
  const focusSubtreeOwnerItem = useTreeContext_unstable(ctx => ctx.focusSubtreeOwnerItem);

  const isBranch = typeof ariaOwns === 'string';
  const open = useTreeContext_unstable(ctx => isBranch && ctx.openSubtrees.includes(ariaOwns!));

  const handleClick = useEventCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isBranch) {
      requestOpenChange({ event, open: !open, type: 'click', id: ariaOwns! });
    }
  });
  const handleArrowRight = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (open && isBranch) {
      focusFirstSubtreeItem(event.currentTarget);
    }
    if (isBranch && !open) {
      requestOpenChange({ event, open: true, type: 'arrowRight', id: ariaOwns! });
    }
  };
  const handleArrowLeft = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isBranch || !open) {
      focusSubtreeOwnerItem(event.currentTarget);
    }
    if (isBranch && open) {
      requestOpenChange({ event, open: false, type: 'arrowLeft', id: ariaOwns! });
    }
  };
  const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isBranch) {
      requestOpenChange({ event, open: !open, type: 'enter', id: ariaOwns! });
    }
  };
  const handleKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.isDefaultPrevented()) {
      return;
    }
    switch (event.key) {
      case Enter: {
        return handleEnter(event);
      }
      case ArrowRight: {
        return handleArrowRight(event);
      }
      case ArrowLeft: {
        return handleArrowLeft(event);
      }
    }
  });
  return {
    components: {
      root: 'div',
    },
    isLeaf: !isBranch,
    open,
    root: getNativeElementProps(as, {
      ...rest,
      ref,
      tabIndex: 0,
      'aria-owns': ariaOwns,
      'aria-level': level,
      // FIXME: tabster fails to navigate when aria-expanded is true
      // 'aria-expanded': isBranch ? isOpen : undefined,
      role: 'treeitem',
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    }),
  };
};
