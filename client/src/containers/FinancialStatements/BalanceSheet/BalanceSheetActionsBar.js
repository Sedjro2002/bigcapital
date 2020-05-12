import React from 'react';
import {
  NavbarGroup,
  Button,
  Classes,
  NavbarHeading,
  NavbarDivider,
  Intent,
  Popover,
  PopoverInteractionKind,
  Position,
} from '@blueprintjs/core';
import Icon from 'components/Icon';
import DashboardActionsBar from 'components/Dashboard/DashboardActionsBar'
import classNames from 'classnames';
import FilterDropdown from 'components/FilterDropdown';
import { FormattedMessage as T, useIntl } from 'react-intl';


export default function JournalActionsBar({

}) {
  const filterDropdown = FilterDropdown({
    fields: [],
    onFilterChange: (filterConditions) => {
          
    },
  });

  return (
    <DashboardActionsBar>
      <NavbarGroup>
        <Button
          className={classNames(Classes.MINIMAL, 'button--table-views')}
          icon={<Icon icon='cog' />}
          text={<T id={'customize_report'}/>}
        />
        <NavbarDivider />

        <Popover
          content={filterDropdown}
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.BOTTOM_LEFT}>

          <Button
            className={classNames(Classes.MINIMAL, 'button--filter')}
            text={<T id={'filter'}/>}
            icon={ <Icon icon="filter" /> } />
        </Popover>

        <Button
          className={Classes.MINIMAL}
          icon={<Icon icon='file-export' />}
          text={<T id={'print'}/>}
        />
        <Button
          className={Classes.MINIMAL}
          icon={<Icon icon='file-export' />}
          text={<T id={'export'}/>}
        />
      </NavbarGroup>
    </DashboardActionsBar>
  )
}