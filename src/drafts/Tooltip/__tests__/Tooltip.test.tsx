import React from 'react'
import {Tooltip, TooltipProps} from '../Tooltip'
import {checkStoriesForAxeViolations} from '../../../utils/testing'
import {render as HTMLRender} from '@testing-library/react'
import theme from '../../../theme'
import {Button, ActionMenu, ActionList, ThemeProvider, SSRProvider, BaseStyles} from '../../../'

const TooltipComponent = (props: Omit<TooltipProps, 'text'> & {text?: string}) => (
  <Tooltip text="Tooltip text" {...props}>
    <Button>Button Text</Button>
  </Tooltip>
)

function ExampleWithActionMenu(actionMenuTrigger: React.ReactElement): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <SSRProvider>
        <BaseStyles>
          <ActionMenu>
            {actionMenuTrigger}
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item>New file</ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </BaseStyles>
      </SSRProvider>
    </ThemeProvider>
  )
}

describe('Tooltip', () => {
  checkStoriesForAxeViolations('Tooltip.features', '../drafts/Tooltip/')

  it('renders `data-direction="s"` by default', () => {
    const {getByText} = HTMLRender(<TooltipComponent />)
    expect(getByText('Tooltip text')).toHaveAttribute('data-direction', 's')
  })
  it('renders `data-direction` attribute with the correct value when the `direction` prop is specified', () => {
    const {getByText} = HTMLRender(<TooltipComponent direction="n" />)
    expect(getByText('Tooltip text')).toHaveAttribute('data-direction', 'n')
  })
  it('should label the trigger element by its tooltip when the tooltip type is label', () => {
    const {getByRole, getByText} = HTMLRender(<TooltipComponent type="label" />)
    const triggerEL = getByRole('button')
    const tooltipEl = getByText('Tooltip text')
    expect(triggerEL).toHaveAttribute('aria-labelledby', tooltipEl.id)
  })
  it('should render aria-hidden on the tooltip element when the tooltip is label type', () => {
    const {getByText} = HTMLRender(<TooltipComponent type="label" />)
    expect(getByText('Tooltip text')).toHaveAttribute('aria-hidden', 'true')
  })
  it('should describe the trigger element by its tooltip when the tooltip type is description (by default)', () => {
    const {getByRole, getByText} = HTMLRender(<TooltipComponent />)
    const triggerEL = getByRole('button')
    const tooltipEl = getByText('Tooltip text')
    expect(triggerEL).toHaveAttribute('aria-describedby', tooltipEl.id)
  })
  it('should render the tooltip element with role="tooltip" when the tooltip type is description (by default)', () => {
    const {getByText} = HTMLRender(<TooltipComponent />)
    expect(getByText('Tooltip text')).toHaveAttribute('role', 'tooltip')
  })

  it('should spread the accessibility attributes correctly on the trigger (ActionMenu.Button) when tooltip is used in an action menu', () => {
    const {getByRole, getByText} = HTMLRender(
      ExampleWithActionMenu(
        <Tooltip text="Additional context about the menu button">
          <ActionMenu.Button>Toggle Menu</ActionMenu.Button>
        </Tooltip>,
      ),
    )
    const menuButton = getByRole('button')
    const tooltip = getByText('Additional context about the menu button')
    expect(menuButton).toHaveAttribute('aria-describedby', tooltip.id)
    expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
  })

  it('should spread the accessibility attributes correctly on the trigger (Button) when tooltip is used in an action menu', () => {
    const {getByRole, getByText} = HTMLRender(
      ExampleWithActionMenu(
        <ActionMenu.Anchor>
          <Tooltip text="Additional context about the menu button">
            <Button>Toggle Menu</Button>
          </Tooltip>
        </ActionMenu.Anchor>,
      ),
    )
    const menuButton = getByRole('button')
    const tooltip = getByText('Additional context about the menu button')
    expect(menuButton).toHaveAttribute('aria-describedby', tooltip.id)
    expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
  })
})
