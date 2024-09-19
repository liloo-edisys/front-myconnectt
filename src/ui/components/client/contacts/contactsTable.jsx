import React, { useMemo } from "react";

import { headerSortingClasses, sortCaret } from "metronic/_helpers";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";

import {
  NoRecordsFoundMessage,
  PleaseWaitMessage
} from "../../../../_metronic/_helpers";

// import CompanyCreateModal from "./companiesModals/CompanyCreateModal";
import ActionsColumnFormatter from "./columnFormatters/actionsColumnFormatter.jsx";
import { useContactsUIContext } from "./contactsUIContext.jsx";
import InviteContactModal from "./Modals/inviteContactModal.jsx";
function ContactsTable({
  contacts,
  createCompany,
  handleClose,
  show,
  worksites
}) {
  const intl = useIntl();

  const contactsUIContext = useContactsUIContext();
  const contactsUIProps = useMemo(() => {
    return {
      newContactButtonClick: contactsUIContext.newContactButtonClick,
      openEditContactModal: contactsUIContext.openEditContactModal,
      openDeleteContactDialog: contactsUIContext.openDeleteContactDialog
    };
  }, [contactsUIContext]);

  function isAdminFormatter(cell) {
    return cell !== null && cell ? (
      <span className="label label-lg label-light-success label-inline">
        <FormattedMessage id="TEXT.ADMINISTRATEUR" />
      </span>
    ) : (
      <span className="label label-lg label-light-primary label-inline">
        <FormattedMessage id="TEXT.UTILISATEUR" />
      </span>
    );
  }

  function isApprovedFormatter(cell) {
    return cell !== null && cell ? (
      <span className="label label-lg label-light-success label-inline">
        <FormattedMessage id="TEXT.VALEDATED" />
      </span>
    ) : (
      <span className="label label-lg label-light-warning label-inline">
        <FormattedMessage id="TEXT.WAITINGFOR" />
      </span>
    );
  }

  let columns = [
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "MODEL.LASTNAME" }),
      sort: true
    },
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "poste",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "isAdmin",
      text: intl.formatMessage({ id: "TEXT.DROITS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: isAdminFormatter
    },
    {
      dataField: "isApproved",
      text: intl.formatMessage({ id: "TEXT.STATUS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: isApprovedFormatter
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatExtraData: {
        newContactButtonClick: contactsUIProps.newContactButtonClick,
        openEditContactModal: contactsUIProps.openEditContactModal,
        openDeleteContactDialog: contactsUIContext.openDeleteContactDialog
      }
    }
  ];

  return (
    <div>
      <InviteContactModal onHide={handleClose} show={show} />
      <BootstrapTable
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        remote
        keyField="id"
        data={!contacts.length ? [] : contacts}
        columns={columns}
      >
        <PleaseWaitMessage entities={contacts.contacts} />
        <NoRecordsFoundMessage entities={contacts.contacts} />
      </BootstrapTable>
    </div>
  );
}

export default ContactsTable;
