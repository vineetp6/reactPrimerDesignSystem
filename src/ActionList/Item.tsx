import React from 'react'
import styled from 'styled-components'
import {AlertIcon} from '@primer/octicons-react'
import Box, {BoxProps} from '../Box'
import {Tooltip, TooltipProps} from '../drafts/Tooltip/Tooltip'
import {useId} from '../hooks/useId'
import {useSlots} from '../hooks/useSlots'
import sx, {BetterSystemStyleObject, merge, SxProp} from '../sx'
import {useTheme} from '../ThemeProvider'
import {defaultSxProp} from '../utils/defaultSxProp'
import {ForwardRefComponent as PolymorphicForwardRefComponent} from '../utils/polymorphic'
import {ActionListContainerContext} from './ActionListContainerContext'
import {Description} from './Description'
import {GroupContext} from './Group'
import {ActionListProps, ListContext} from './List'
import {Selection} from './Selection'
import {ActionListItemProps, getVariantStyles, ItemContext, TEXT_ROW_HEIGHT} from './shared'
import {LeadingVisual, TrailingVisual, VisualProps} from './Visuals'

const LiBox = styled.li<SxProp>(sx)

const InactiveIndicator: React.FC<{
  labelId: string
  text: TooltipProps['text']
  visualComponent: React.FC<React.PropsWithChildren<VisualProps>>
}> = ({labelId, text, visualComponent: VisualComponent}) => (
  <Tooltip text={text}>
    <Box
      as="button"
      sx={{
        background: 'none',
        color: 'inherit',
        border: 'none',
        padding: 0,
        font: 'inherit',
        cursor: 'pointer',
        display: 'flex',
      }}
      aria-labelledby={labelId}
    >
      <VisualComponent>
        <AlertIcon />
      </VisualComponent>
    </Box>
  </Tooltip>
)

export const Item = React.forwardRef<HTMLLIElement, ActionListItemProps>(
  (
    {
      variant = 'default',
      disabled = false,
      inactiveText,
      selected = undefined,
      active = false,
      onSelect: onSelectUser,
      sx: sxProp = defaultSxProp,
      id,
      role,
      _PrivateItemWrapper,
      ...props
    },
    forwardedRef,
  ): JSX.Element => {
    const [slots, childrenWithoutSlots] = useSlots(props.children, {
      leadingVisual: LeadingVisual,
      trailingVisual: TrailingVisual,
      blockDescription: [Description, props => props.variant === 'block'],
      inlineDescription: [Description, props => props.variant !== 'block'],
    })

    const {
      variant: listVariant,
      role: listRole,
      showDividers,
      selectionVariant: listSelectionVariant,
    } = React.useContext(ListContext)
    const {selectionVariant: groupSelectionVariant} = React.useContext(GroupContext)
    const {container, afterSelect, selectionAttribute} = React.useContext(ActionListContainerContext)
    const inactive = Boolean(inactiveText)
    const showInactiveIndicator = inactive && container === undefined

    const onSelect = React.useCallback(
      (
        event: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>,
        // eslint-disable-next-line @typescript-eslint/ban-types
        afterSelect?: Function,
      ) => {
        if (typeof onSelectUser === 'function') onSelectUser(event)
        if (event.defaultPrevented) return
        if (typeof afterSelect === 'function') afterSelect()
      },
      [onSelectUser],
    )

    const selectionVariant: ActionListProps['selectionVariant'] = groupSelectionVariant
      ? groupSelectionVariant
      : listSelectionVariant

    /** Infer item role based on the container */
    let itemRole: ActionListItemProps['role']
    if (container === 'ActionMenu') {
      if (selectionVariant === 'single') itemRole = 'menuitemradio'
      else if (selectionVariant === 'multiple') itemRole = 'menuitemcheckbox'
      else itemRole = 'menuitem'
    } else if (container === 'SelectPanel' && listRole === 'listbox') {
      if (selectionVariant !== undefined) itemRole = 'option'
    }

    const {theme} = useTheme()

    const activeStyles = {
      fontWeight: 'bold',
      bg: 'actionListItem.default.selectedBg',
      '&::after': {
        position: 'absolute',
        top: 'calc(50% - 12px)',
        left: -2,
        width: '4px',
        height: '24px',
        content: '""',
        bg: 'accent.fg',
        borderRadius: 2,
      },
    }

    const styles = {
      position: 'relative',
      display: 'flex',
      paddingX: 2,
      fontSize: 1,
      paddingY: '6px', // custom value off the scale
      lineHeight: TEXT_ROW_HEIGHT,
      minHeight: 5,
      marginX: listVariant === 'inset' ? 2 : 0,
      borderRadius: 2,
      transition: 'background 33.333ms linear',
      color: getVariantStyles(variant, disabled, inactive).color,
      cursor: 'pointer',
      '&[aria-disabled], &[data-inactive]': {
        cursor: 'not-allowed',
        '[data-component="ActionList.Checkbox"]': {
          cursor: 'not-allowed',
          bg: selected ? 'fg.muted' : 'var(--color-input-disabled-bg, rgba(175, 184, 193, 0.2))',
          borderColor: selected ? 'fg.muted' : 'var(--color-input-disabled-bg, rgba(175, 184, 193, 0.2))',
        },
      },

      // Button reset styles (to support as="button")
      appearance: 'none',
      background: 'unset',
      border: 'unset',
      width: listVariant === 'inset' ? 'calc(100% - 16px)' : '100%',
      fontFamily: 'unset',
      textAlign: 'unset',
      marginY: 'unset',

      '@media (hover: hover) and (pointer: fine)': {
        ':hover:not([aria-disabled]):not([data-inactive])': {
          backgroundColor: `actionListItem.${variant}.hoverBg`,
          color: getVariantStyles(variant, disabled, inactive).hoverColor,
          boxShadow: `inset 0 0 0 max(1px, 0.0625rem) ${theme?.colors.actionListItem.default.activeBorder}`,
        },
        '&:focus-visible, > a:focus-visible': {
          outline: 'none',
          border: `2 solid`,
          boxShadow: `0 0 0 2px ${theme?.colors.accent.emphasis}`,
        },
        ':active:not([aria-disabled]):not([data-inactive])': {
          backgroundColor: `actionListItem.${variant}.activeBg`,
          color: getVariantStyles(variant, disabled, inactive).hoverColor,
        },
      },

      '@media (forced-colors: active)': {
        ':focus': {
          // Support for Windows high contrast https://sarahmhigley.com/writing/whcm-quick-tips
          outline: 'solid 1px transparent !important',
        },
      },

      /** Divider styles */
      '[data-component="ActionList.Item--DividerContainer"]': {
        position: 'relative',
      },
      '[data-component="ActionList.Item--DividerContainer"]::before': {
        content: '" "',
        display: 'block',
        position: 'absolute',
        width: '100%',
        top: '-7px',
        border: '0 solid',
        borderTopWidth: showDividers ? `1px` : '0',
        borderColor: 'var(--divider-color, transparent)',
      },
      // show between 2 items
      ':not(:first-of-type)': {'--divider-color': theme?.colors.actionListItem.inlineDivider},
      // hide divider after dividers & group header, with higher importance!
      '[data-component="ActionList.Divider"] + &': {'--divider-color': 'transparent !important'},
      // hide border on current and previous item
      '&:hover:not([aria-disabled]):not([data-inactive]), &:focus:not([aria-disabled]):not([data-inactive]), &[data-focus-visible-added]:not([aria-disabled]):not([data-inactive])':
        {
          '--divider-color': 'transparent',
        },
      '&:hover:not([aria-disabled]):not([data-inactive]) + &, &[data-focus-visible-added] + li': {
        '--divider-color': 'transparent',
      },
      ...(active ? activeStyles : {}),
    }

    const clickHandler = React.useCallback(
      (event: React.MouseEvent<HTMLLIElement>) => {
        if (disabled || inactive) return
        onSelect(event, afterSelect)
      },
      [onSelect, disabled, inactive, afterSelect],
    )

    const keyPressHandler = React.useCallback(
      (event: React.KeyboardEvent<HTMLLIElement>) => {
        if (disabled || inactive) return
        if ([' ', 'Enter'].includes(event.key)) {
          onSelect(event, afterSelect)
        }
      },
      [onSelect, disabled, inactive, afterSelect],
    )

    const itemId = useId(id)
    const labelId = `${itemId}--label`
    const inlineDescriptionId = `${itemId}--inline-description`
    const blockDescriptionId = `${itemId}--block-description`
    const inactiveWarningId = inactive && !showInactiveIndicator ? `${itemId}--warning-message` : undefined

    const ItemWrapper = _PrivateItemWrapper || React.Fragment

    const menuItemProps = {
      onClick: clickHandler,
      onKeyPress: keyPressHandler,
      'aria-disabled': disabled ? true : undefined,
      'data-inactive': inactive ? true : undefined,
      tabIndex: disabled || showInactiveIndicator ? undefined : 0,
      'aria-labelledby': `${labelId} ${slots.inlineDescription ? inlineDescriptionId : ''}`,
      'aria-describedby': slots.blockDescription
        ? [blockDescriptionId, inactiveWarningId].join(' ')
        : inactiveWarningId,
      ...(selectionAttribute && {[selectionAttribute]: selected}),
      role: role || itemRole,
      id: itemId,
    }

    const containerProps = _PrivateItemWrapper ? {role: role || itemRole ? 'none' : undefined} : menuItemProps

    const wrapperProps = _PrivateItemWrapper ? menuItemProps : {}

    return (
      <ItemContext.Provider
        value={{variant, disabled, inactive: Boolean(inactiveText), inlineDescriptionId, blockDescriptionId}}
      >
        <LiBox
          ref={forwardedRef}
          sx={merge<BetterSystemStyleObject>(styles, sxProp)}
          data-variant={variant === 'danger' ? variant : undefined}
          {...containerProps}
          {...props}
        >
          <ItemWrapper {...wrapperProps}>
            <Selection selected={selected} />
            {
              // If we're showing an inactive indicator and a leading visual has been passed,
              // replace the leading visual with the inactive indicator.
              //
              // Inactive items without a leading visual place the inactive indicator in the
              // trailing visual slot. This preserves the left alignment of item text.
              showInactiveIndicator && slots.leadingVisual ? (
                // using a non-null assertion for `inactiveText` since we check for it in `showInactiveIndicator`
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                <InactiveIndicator labelId={labelId} text={inactiveText!} visualComponent={LeadingVisual} />
              ) : (
                // If it's not inactive, just render the leading visual slot
                slots.leadingVisual
              )
            }
            <Box
              data-component="ActionList.Item--DividerContainer"
              sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0}}
            >
              <ConditionalBox
                if={Boolean(slots.trailingVisual) || (showInactiveIndicator && !slots.leadingVisual)}
                sx={{display: 'flex', flexGrow: 1}}
              >
                <ConditionalBox
                  if={!!slots.inlineDescription}
                  sx={{display: 'flex', flexGrow: 1, alignItems: 'baseline', minWidth: 0}}
                >
                  <Box
                    as="span"
                    id={labelId}
                    sx={{
                      flexGrow: slots.inlineDescription ? 0 : 1,
                      fontWeight: slots.inlineDescription || slots.blockDescription ? 'bold' : 'normal',
                      marginBlockEnd: slots.blockDescription ? '4px' : undefined,
                    }}
                  >
                    {childrenWithoutSlots}
                  </Box>
                  {slots.inlineDescription}
                </ConditionalBox>
                {
                  // If we're showing an inactive indicator and a leading visual has NOT been passed,
                  // replace the trailing visual with the inactive indicator.
                  //
                  // This preserves the left alignment of item text.
                  showInactiveIndicator && !slots.leadingVisual ? (
                    // using a non-null assertion for `inactiveText` since we check for it in `showInactiveIndicator`
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    <InactiveIndicator labelId={labelId} text={inactiveText!} visualComponent={TrailingVisual} />
                  ) : (
                    // If it's not inactive, or it has a leading visual that can be replaced,
                    // just render the trailing visual slot.
                    slots.trailingVisual
                  )
                }
              </ConditionalBox>
              {
                // If the item is inactive, but it's not in an overlay (e.g. ActionMenu, SelectPanel),
                // render the inactive warning message directly in the item.
                inactive && container ? (
                  <Box
                    as="span"
                    sx={{
                      fontSize: 0,
                      lineHeight: '16px',
                      color: 'attention.fg',
                    }}
                    id={inactiveWarningId}
                  >
                    {inactiveText}
                  </Box>
                ) : null
              }
              {slots.blockDescription}
            </Box>
          </ItemWrapper>
        </LiBox>
      </ItemContext.Provider>
    )
  },
) as PolymorphicForwardRefComponent<'li', ActionListItemProps>

Item.displayName = 'ActionList.Item'

const ConditionalBox: React.FC<React.PropsWithChildren<{if: boolean} & BoxProps>> = props => {
  const {if: condition, ...rest} = props

  if (condition) return <Box {...rest}>{props.children}</Box>
  else return <>{props.children}</>
}
