import React, { memo } from 'react';
import { BoxProps, color } from '@stacks/ui';

import { Text } from '@components/typography';

function MenuItemBase(props: BoxProps) {
  const { onClick, children, ...rest } = props;
  return (
    <Text
      width="100%"
      px="base"
      py="base-tight"
      cursor="pointer"
      color={color('text-title')}
      _hover={{ backgroundColor: color('bg-4') }}
      onClick={e => {
        onClick?.(e);
      }}
      fontSize={1}
      {...rest}
    >
      {children}
    </Text>
  );
}

export const MenuItem = memo(MenuItemBase);
