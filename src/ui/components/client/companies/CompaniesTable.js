import React, { useMemo } from "react";

import { headerSortingClasses, sortCaret } from "metronic/_helpers";
import BootstrapTable from "react-bootstrap-table-next";
import { useIntl } from "react-intl";

import {
  NoRecordsFoundMessage,
  PleaseWaitMessage
} from "../../../../_metronic/_helpers";

import CompanyCreateModal from "./companiesModals/CompanyCreateModal";
import { useCompaniesUIContext } from "./CompaniesUIContext";
import ActionsColumnFormatter from "./customers-table/column-formatters/ActionsColumnFormatter";
import { shallowEqual, useSelector } from "react-redux";

function CompaniesTable({
  companies,
  createCompany,
  handleClose,
  show,
  worksites
}) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const formatWorksite = id => {
    if (worksites.length) {
      return worksites.filter(worksite => worksite.parentID === id);
    }
    return [];
  };
  const { user } = useSelector(
    state => ({
      user: state.contacts.user
    }),
    shallowEqual
  );
  const expandRow = {
    renderer: row => (
      <div className="subtable">
        <BootstrapTable
          wrapperClasses=""
          bordered={false}
          classes="table table-head-custom table-vertical-center overflow-hidden"
          bootstrap4
          remote
          keyField="id"
          data={formatWorksite(row.id)}
          columns={worksiteColumns}
        ></BootstrapTable>
      </div>
    ),
    showExpandColumn: true,
    expandHeaderColumnRenderer: () => null,
    expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
      if (formatWorksite(rowKey).length) {
        return expanded ? (
          <i className="fas fa-angle-double-down text-primary"></i>
        ) : (
          <i className="fas fa-angle-double-right text-primary"></i>
        );
      }
      return null;
    }
  };

  const companiesUIContext = useCompaniesUIContext();
  const companiesUIProps = useMemo(() => {
    return {
      ids: companiesUIContext.ids,
      setIds: companiesUIContext.setIds,
      queryParams: companiesUIContext.queryParams,
      setQueryParams: companiesUIContext.setQueryParams,
      newWorksiteButtonClick: companiesUIContext.newWorksiteButtonClick,
      openEditCompanyDialog: companiesUIContext.openEditCompanyDialog,
      openDeleteCompanyDialog: companiesUIContext.openDeleteCompanyDialog,
      openEditWorksiteDialog: companiesUIContext.openEditWorksiteDialog,
      openPreviewWorksiteDialog: companiesUIContext.openPreviewWorksiteDialog
    };
  }, [companiesUIContext]);

  let columns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.NAME" }),
      sort: true
    },
    {
      dataField: "siret",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.SIRET" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "postalCode",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.POSTALCODE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "city",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.CITY" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
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
        newWorksiteButtonClick: companiesUIProps.newWorksiteButtonClick,
        openEditCompanyDialog: companiesUIProps.openEditCompanyDialog,
        openDeleteCompanyDialog: companiesUIProps.openDeleteCompanyDialog,
        openPreviewWorksiteDialog: companiesUIProps.openPreviewWorksiteDialog,
        user: user
      }
    }
  ];

  let worksiteColumns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.SITE.NAME" }),
      sort: true
    },
    {
      dataField: "postalCode",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.POSTALCODE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "city",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.CITY" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
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
        openEditWorksiteDialog: companiesUIProps.openEditWorksiteDialog,
        openDeleteCompanyDialog: companiesUIProps.openDeleteCompanyDialog,
        openPreviewWorksiteDialog: companiesUIProps.openPreviewWorksiteDialog,
        user: user
      }
    }
  ];

  return (
    <div>
      <CompanyCreateModal
        createCompany={createCompany}
        onHide={handleClose}
        show={show}
      />
      <BootstrapTable
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        remote
        keyField="id"
        data={!companies.length ? [] : companies}
        columns={columns}
        expandRow={expandRow}
      >
        <PleaseWaitMessage entities={companies.companies} />
        <NoRecordsFoundMessage entities={companies.companies} />
      </BootstrapTable>
    </div>
  );
}

export default CompaniesTable;
