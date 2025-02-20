import { memo } from 'react';
import { Box, ChevronIcon, Text, color, Stack, BoxProps } from '@stacks/ui';

import { formatContractId } from '@app/common/utils';
import { AssetAvatar } from '@app/components/stx-avatar';
import { Caption } from '@app/components/typography';
import { useSelectedAsset } from '@app/pages/send-tokens/hooks/use-selected-asset';

interface SelectedAssetItemProps extends BoxProps {
  hideArrow?: boolean;
  onClearSearch(): void;
}
export const SelectedAssetItem = memo(
  ({ hideArrow, onClearSearch, ...rest }: SelectedAssetItemProps) => {
    const { name, selectedAsset, ticker } = useSelectedAsset();

    if (!selectedAsset) return null;
    const { contractAddress, contractName, name: _name } = selectedAsset;
    const isStx = name === 'Stacks Token';
    const gradientString = `${formatContractId(contractAddress, contractName)}::${_name}`;

    return (
      <Box
        width="100%"
        px="base"
        py="base-tight"
        borderRadius="8px"
        border="1px solid"
        borderColor={color('border')}
        userSelect="none"
        onClick={() => !hideArrow && onClearSearch()}
        {...rest}
      >
        <Stack spacing="base" alignItems="center" isInline>
          <AssetAvatar
            useStx={isStx}
            gradientString={gradientString}
            mr="tight"
            size="36px"
            color="white"
          >
            {name?.[0]}
          </AssetAvatar>
          <Stack flexGrow={1}>
            <Text
              display="block"
              fontWeight="400"
              fontSize={2}
              color="ink.1000"
              data-testid={'selected-asset-option'}
            >
              {name}
            </Text>
            <Caption>{ticker}</Caption>
          </Stack>
          {!hideArrow && (
            <Box ml="base" textAlign="right" height="24px">
              <ChevronIcon
                size="24px"
                direction="down"
                cursor="pointer"
                opacity={0.7}
                onClick={() => onClearSearch()}
              />
            </Box>
          )}
        </Stack>
      </Box>
    );
  }
);
