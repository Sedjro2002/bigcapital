import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { FormGroup, Position, Classes, ControlGroup } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { FastField, ErrorMessage } from 'formik';
import {
  MoneyInputGroup,
  InputPrependText,
  CurrencySelectList,
  Row,
  Col,
} from 'components';
import { FormattedMessage as T } from 'react-intl';

import withCurrencies from 'containers/Currencies/withCurrencies';

import {
  compose,
  momentFormatter,
  tansformDateValue,
  inputIntent,
} from 'utils';

function CustomerFinancialPanel({
  // #withCurrencies
  currenciesList,

  customerId,
}) {

  return (
    <div className={'tab-panel--financial'}>
      <Row>
        <Col xs={6}>
          {/*------------ Opening balance at -----------*/}
          <FastField name={'opening_balance_at'}>
            {({ form, field: { value }, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'opening_balance_at'} />}
                className={classNames('form-group--select-list', Classes.FILL)}
                intent={inputIntent({ error, touched })}
                inline={true}
                helperText={<ErrorMessage name="opening_balance_at" />}
              >
                <DateInput
                  {...momentFormatter('YYYY/MM/DD')}
                  value={tansformDateValue(value)}
                  popoverProps={{ position: Position.BOTTOM, minimal: true }}
                  disabled={customerId}
                />
              </FormGroup>
            )}
          </FastField>

          {/*------------ Opening balance  -----------*/}
          <FastField name={'opening_balance'}>
            {({
              form: { values },
              field,
              field: { value },
              meta: { error, touched },
            }) => (
              <FormGroup
                label={<T id={'opening_balance'} />}
                className={classNames(
                  'form-group--opening-balance',
                  Classes.FILL,
                )}
                intent={inputIntent({ error, touched })}
                inline={true}
              >
                <ControlGroup>
                  <InputPrependText text={values.currency_code} />
                  <MoneyInputGroup
                    value={value}
                    inputGroupProps={{ fill: true }}
                    disabled={customerId}
                    {...field}
                  />
                </ControlGroup>
              </FormGroup>
            )}
          </FastField>

          {/*------------ Currency  -----------*/}
          <FastField name={'currency_code'}>
            {({ form, field: { value }, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'currency'} />}
                className={classNames(
                  'form-group--select-list',
                  'form-group--balance-currency',
                  Classes.FILL,
                )}
                inline={true}
              >
                <CurrencySelectList
                  currenciesList={currenciesList}
                  selectedCurrencyCode={value}
                  onCurrencySelected={(currency) => {
                    form.setFieldValue('currency_code', currency.currency_code);
                  }}
                  disabled={customerId}
                />
              </FormGroup>
            )}
          </FastField>
        </Col>
      </Row>
    </div>
  );
}

export default compose(
  withCurrencies(({ currenciesList }) => ({ currenciesList })),
)(CustomerFinancialPanel);
