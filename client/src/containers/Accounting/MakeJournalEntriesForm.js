import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import moment from 'moment';
import { Intent } from '@blueprintjs/core';
import { useIntl } from 'react-intl';
import { pick, setWith } from 'lodash';
import { useHistory } from 'react-router-dom';

import MakeJournalEntriesHeader from './MakeJournalEntriesHeader';
import MakeJournalEntriesFooter from './MakeJournalEntriesFooter';
import MakeJournalEntriesTable from './MakeJournalEntriesTable';

import {
  CreateMakeJournalFormSchema,
  EditMakeJournalFormSchema,
} from './MakeJournalEntriesForm.schema';

import withJournalsActions from 'containers/Accounting/withJournalsActions';
import withManualJournalDetail from 'containers/Accounting/withManualJournalDetail';
import withAccountsActions from 'containers/Accounts/withAccountsActions';
import withDashboardActions from 'containers/Dashboard/withDashboardActions';
import withSettings from 'containers/Settings/withSettings';

import AppToaster from 'components/AppToaster';
import Dragzone from 'components/Dragzone';
import withMediaActions from 'containers/Media/withMediaActions';

import useMedia from 'hooks/useMedia';
import {
  compose,
  repeatValue,
  orderingLinesIndexes,
  defaultToTransform,
} from 'utils';
import withManualJournalsActions from './withManualJournalsActions';
import withManualJournals from './withManualJournals';

const ERROR = {
  JOURNAL_NUMBER_ALREADY_EXISTS: 'JOURNAL.NUMBER.ALREADY.EXISTS',
  CUSTOMERS_NOT_WITH_RECEVIABLE_ACC: 'CUSTOMERS.NOT.WITH.RECEIVABLE.ACCOUNT',
  VENDORS_NOT_WITH_PAYABLE_ACCOUNT: 'VENDORS.NOT.WITH.PAYABLE.ACCOUNT',
  PAYABLE_ENTRIES_HAS_NO_VENDORS: 'PAYABLE.ENTRIES.HAS.NO.VENDORS',
  RECEIVABLE_ENTRIES_HAS_NO_CUSTOMERS: 'RECEIVABLE.ENTRIES.HAS.NO.CUSTOMERS',
  CREDIT_DEBIT_SUMATION_SHOULD_NOT_EQUAL_ZERO:
    'CREDIT.DEBIT.SUMATION.SHOULD.NOT.EQUAL.ZERO',
};

/**
 * Journal entries form.
 */
function MakeJournalEntriesForm({
  // #withMedia
  requestSubmitMedia,
  requestDeleteMedia,

  // #withJournalsActions
  requestMakeJournalEntries,
  requestEditManualJournal,
  setJournalNumberChanged,

  // #withManualJournals
  journalNumberChanged,

  // #withDashboard
  changePageTitle,
  changePageSubtitle,

  // #withSettings
  journalNextNumber,
  journalNumberPrefix,

  // #ownProps
  manualJournalId,
  manualJournal,
  onFormSubmit,
  onCancelForm,
}) {
  const isNewMode = !manualJournalId;
  const { formatMessage } = useIntl();
  const history = useHistory();
  const [submitPayload, setSubmitPayload] = useState({});

  const {
    setFiles,
    saveMedia,
    deletedFiles,
    setDeletedFiles,
    deleteMedia,
  } = useMedia({
    saveCallback: requestSubmitMedia,
    deleteCallback: requestDeleteMedia,
  });

  const handleDropFiles = useCallback((_files) => {
    setFiles(_files.filter((file) => file.uploaded === false));
  }, []);

  const savedMediaIds = useRef([]);
  const clearSavedMediaIds = () => {
    savedMediaIds.current = [];
  };

  const journalNumber = journalNumberPrefix
    ? `${journalNumberPrefix}-${journalNextNumber}`
    : journalNextNumber;

  useEffect(() => {
    const transactionNumber = manualJournal
      ? manualJournal.journal_number
      : journalNumber;

    if (manualJournal && manualJournal.id) {
      changePageTitle(formatMessage({ id: 'edit_journal' }));
    } else {
      changePageTitle(formatMessage({ id: 'new_journal' }));
    }
    changePageSubtitle(
      defaultToTransform(transactionNumber, `No. ${transactionNumber}`, ''),
    );
  }, [
    changePageTitle,
    changePageSubtitle,
    journalNumber,
    manualJournal,
    formatMessage,
  ]);

  const validationSchema = isNewMode
    ? CreateMakeJournalFormSchema
    : EditMakeJournalFormSchema;

  const saveInvokeSubmit = useCallback(
    (payload) => {
      onFormSubmit && onFormSubmit(payload);
    },
    [onFormSubmit],
  );

  const defaultEntry = useMemo(
    () => ({
      index: 0,
      account_id: null,
      credit: 0,
      debit: 0,
      contact_id: null,
      note: '',
    }),
    [],
  );
  const defaultInitialValues = useMemo(
    () => ({
      journal_number: journalNumber,
      journal_type: 'Journal',
      date: moment(new Date()).format('YYYY-MM-DD'),
      description: '',
      reference: '',
      status: '',
      currency_code: '',
      entries: [...repeatValue(defaultEntry, 4)],
    }),
    [defaultEntry, journalNumber],
  );

  const initialValues = useMemo(
    () => ({
      ...(manualJournal
        ? {
            ...pick(manualJournal, Object.keys(defaultInitialValues)),
            entries: manualJournal.entries.map((entry) => ({
              ...pick(entry, Object.keys(defaultEntry)),
            })),
          }
        : {
            ...defaultInitialValues,
            entries: orderingLinesIndexes(defaultInitialValues.entries),
          }),
    }),
    [manualJournal, defaultInitialValues, defaultEntry],
  );

  const initialAttachmentFiles = useMemo(() => {
    return manualJournal && manualJournal.media
      ? manualJournal.media.map((attach) => ({
          preview: attach.attachment_file,
          uploaded: true,
          metadata: { ...attach },
        }))
      : [];
  }, [manualJournal]);

  // Transform API errors in toasts messages.
  const transformErrors = (resErrors, { setErrors, errors }) => {
    const getError = (errorType) => resErrors.find((e) => e.type === errorType);
    const toastMessages = [];
    let error;
    let newErrors = { ...errors, entries: [] };

    const setEntriesErrors = (indexes, prop, message) =>
      indexes.forEach((i) => {
        const index = Math.max(i - 1, 0);
        newErrors = setWith(newErrors, `entries.[${index}].${prop}`, message);
      });

    if ((error = getError(ERROR.PAYABLE_ENTRIES_HAS_NO_VENDORS))) {
      toastMessages.push(
        formatMessage({
          id: 'vendors_should_selected_with_payable_account_only',
        }),
      );
      setEntriesErrors(error.indexes, 'contact_id', 'error');
    }
    if ((error = getError(ERROR.RECEIVABLE_ENTRIES_HAS_NO_CUSTOMERS))) {
      toastMessages.push(
        formatMessage({
          id: 'should_select_customers_with_entries_have_receivable_account',
        }),
      );
      setEntriesErrors(error.indexes, 'contact_id', 'error');
    }
    if ((error = getError(ERROR.CUSTOMERS_NOT_WITH_RECEVIABLE_ACC))) {
      toastMessages.push(
        formatMessage({
          id: 'customers_should_selected_with_receivable_account_only',
        }),
      );
      setEntriesErrors(error.indexes, 'account_id', 'error');
    }
    if ((error = getError(ERROR.VENDORS_NOT_WITH_PAYABLE_ACCOUNT))) {
      toastMessages.push(
        formatMessage({
          id: 'vendors_should_selected_with_payable_account_only',
        }),
      );
      setEntriesErrors(error.indexes, 'account_id', 'error');
    }
    if ((error = getError(ERROR.JOURNAL_NUMBER_ALREADY_EXISTS))) {
      newErrors = setWith(
        newErrors,
        'journal_number',
        formatMessage({
          id: 'journal_number_is_already_used',
        }),
      );
    }
    setErrors({ ...newErrors });

    if (toastMessages.length > 0) {
      AppToaster.show({
        message: toastMessages.map((message) => {
          return <div>- {message}</div>;
        }),
        intent: Intent.DANGER,
      });
    }
  };

  const {
    values,
    errors,
    setFieldError,
    setFieldValue,
    handleSubmit,
    getFieldProps,
    submitForm,
    resetForm,
    touched,
    isSubmitting,
  } = useFormik({
    validationSchema,
    initialValues,
    onSubmit: (values, { setErrors, setSubmitting, resetForm }) => {
      setSubmitting(true);
      const entries = values.entries.filter(
        (entry) => entry.debit || entry.credit,
      );
      const getTotal = (type = 'credit') => {
        return entries.reduce((total, item) => {
          return item[type] ? item[type] + total : total;
        }, 0);
      };
      const totalCredit = getTotal('credit');
      const totalDebit = getTotal('debit');

      // Validate the total credit should be eqials total debit.
      if (totalCredit !== totalDebit) {
        AppToaster.show({
          message: formatMessage({
            id: 'should_total_of_credit_and_debit_be_equal',
          }),
          intent: Intent.DANGER,
        });
        setSubmitting(false);
        return;
      } else if (totalCredit === 0 || totalDebit === 0) {
        AppToaster.show({
          message: formatMessage({
            id: 'amount_cannot_be_zero_or_empty',
          }),
          intent: Intent.DANGER,
        });
        setSubmitting(false);
        return;
      }
      const form = { ...values, status: submitPayload.publish, entries };

      const saveJournal = (mediaIds) =>
        new Promise((resolve, reject) => {
          const requestForm = { ...form, media_ids: mediaIds };

          if (manualJournal && manualJournal.id) {
            requestEditManualJournal(manualJournal.id, requestForm)
              .then((response) => {
                AppToaster.show({
                  message: formatMessage(
                    { id: 'the_journal_has_been_successfully_edited' },
                    { number: values.journal_number },
                  ),
                  intent: Intent.SUCCESS,
                });
                setSubmitting(false);
                saveInvokeSubmit({ action: 'update', ...submitPayload });
                clearSavedMediaIds([]);
                resetForm();
                resolve(response);
              })
              .catch((errors) => {
                transformErrors(errors, { setErrors });
                setSubmitting(false);
              });
          } else {
            requestMakeJournalEntries(requestForm)
              .then((response) => {
                AppToaster.show({
                  message: formatMessage(
                    { id: 'the_journal_has_been_successfully_created' },
                    { number: values.journal_number },
                  ),
                  intent: Intent.SUCCESS,
                });
                setSubmitting(false);
                saveInvokeSubmit({ action: 'new', ...submitPayload });
                clearSavedMediaIds();
                if (submitPayload.resetForm) {
                  resetForm();
                }
                resolve(response);
              })
              .catch((errors) => {
                transformErrors(errors, { setErrors });
                setSubmitting(false);
              });
          }
        });

      Promise.all([saveMedia(), deleteMedia()])
        .then(([savedMediaResponses]) => {
          const mediaIds = savedMediaResponses.map((res) => res.data.media.id);
          savedMediaIds.current = mediaIds;

          return savedMediaResponses;
        })
        .then(() => {
          return saveJournal(savedMediaIds.current);
        });
    },
  });

  // Observes journal number settings changes.
  useEffect(() => {
    if (journalNumberChanged) {
      setFieldValue('journal_number', journalNumber);
      changePageSubtitle(
        defaultToTransform(journalNumber, `No. ${journalNumber}`, ''),
      );
      setJournalNumberChanged(false);
    }
  }, [
    journalNumber,
    journalNumberChanged,
    setJournalNumberChanged,
    setFieldValue,
    changePageSubtitle,
  ]);

  const handleSubmitClick = useCallback(
    (event, payload) => {
      setSubmitPayload({ ...payload });
    },
    [setSubmitPayload],
  );

  const handleCancelClick = useCallback(() => {
    history.goBack();
  }, [history]);

  const handleDeleteFile = useCallback(
    (_deletedFiles) => {
      _deletedFiles.forEach((deletedFile) => {
        if (deletedFile.uploaded && deletedFile.metadata.id) {
          setDeletedFiles([...deletedFiles, deletedFile.metadata.id]);
        }
      });
    },
    [setDeletedFiles, deletedFiles],
  );

  // Handle click on add a new line/row.
  const handleClickAddNewRow = useCallback(() => {
    setFieldValue(
      'entries',
      orderingLinesIndexes([...values.entries, defaultEntry]),
    );
  }, [values.entries, defaultEntry, setFieldValue]);

  // Handle click `Clear all lines` button.
  const handleClickClearLines = useCallback(() => {
    setFieldValue(
      'entries',
      orderingLinesIndexes([...repeatValue(defaultEntry, 4)]),
    );
  }, [defaultEntry, setFieldValue]);

  // Handle journal number field change.
  const handleJournalNumberChanged = useCallback(
    (journalNumber) => {
      changePageSubtitle(
        defaultToTransform(journalNumber, `No. ${journalNumber}`, ''),
      );
    },
    [changePageSubtitle],
  );

  return (
    <div class="make-journal-entries">
      <form onSubmit={handleSubmit}>
        <MakeJournalEntriesHeader
          manualJournal={manualJournalId}
          errors={errors}
          touched={touched}
          values={values}
          setFieldValue={setFieldValue}
          getFieldProps={getFieldProps}
          onJournalNumberChanged={handleJournalNumberChanged}
        />
        <MakeJournalEntriesTable
          values={values.entries}
          errors={errors}
          setFieldValue={setFieldValue}
          defaultRow={defaultEntry}
          onClickClearAllLines={handleClickClearLines}
          onClickAddNewRow={handleClickAddNewRow}
        />
        <MakeJournalEntriesFooter
          isSubmitting={isSubmitting}
          onSubmitClick={handleSubmitClick}
          onCancelClick={handleCancelClick}
          manualJournalId={manualJournalId}
          manualJournalPublished={values.status}
          onSubmitForm={submitForm}
          onResetForm={resetForm}
        />
      </form>

      <Dragzone
        initialFiles={initialAttachmentFiles}
        onDrop={handleDropFiles}
        onDeleteFile={handleDeleteFile}
        hint={'Attachments: Maxiumum size: 20MB'}
      />
    </div>
  );
}

export default compose(
  withJournalsActions,
  withManualJournalDetail,
  withAccountsActions,
  withDashboardActions,
  withMediaActions,
  withSettings(({ manualJournalsSettings }) => ({
    journalNextNumber: manualJournalsSettings.nextNumber,
    journalNumberPrefix: manualJournalsSettings.numberPrefix,
  })),
  withManualJournalsActions,
  withManualJournals(({ journalNumberChanged }) => ({
    journalNumberChanged,
  })),
)(MakeJournalEntriesForm);
