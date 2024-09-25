import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { CompanyDeleteDialog } from "./companiesModals/companyDeleteDialog.jsx";
import CompanyEditModal from "./companiesModals/companyEditModal.jsx";
import WorksiteCreateModal from "./companiesModals/WorksiteCreateModal";
import WorksiteEditModal from "./companiesModals/WorksiteEditModal";
import WorksitePreviewModal from "./companiesModals/WorkSitePreviewModal";
import { CustomersUIProvider } from "./CustomersUIContext";
import CustomerCard from "./CustomerCard";
import axios from "axios";

const CUSTOMERS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Account/SearchAccounts";

class CustomerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      totalCount: 0,
      pageSize: 10,
      pageNumber: 1,
      groupId: 0,
      name: "",
      selectedStatus: null,
      selectedCreationDate: "",
      loading: false
    };
  }
  componentDidMount() {
    this.props.getCustomers();
    this.props.getInvoiceTypes();
    this.props.getAccountGroups();
  }
  setPageNumber = pageNumber => {
    this.setState({ pageNumber });
  };
  setPageSize = pageSize => {
    this.setState({ pageSize });
  };
  setName = name => {
    this.setState({ name });
  };
  setSelectedStatus = selectedStatus => {
    this.setState({ selectedStatus });
  };
  setGroupId = groupId => {
    this.setState({ groupId });
  };
  setSelectedCreationDate = selectedCreationDate => {
    this.setState({ selectedCreationDate });
  };
  setCustomers = customers => {
    this.setState({ customers });
  };
  setTotalCount = totalCount => {
    this.setState({ totalCount });
  };
  getData = () => {
    this.setState({ loading: true });
    let body = {
      tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
      name: this.state.name,
      groupID: parseInt(this.state.groupId),
      pageSize: this.state.pageSize,
      pageNumber: this.state.pageNumber,
      status: this.state.selectedStatus
        ? parseInt(this.state.selectedStatus)
        : null
    };

    if (this.state.selectedCreationDate) {
      body = {
        ...body,
        creationDate: this.state.selectedCreationDate
      };
    }
    axios
      .post(CUSTOMERS_URL, body)
      .then(res => {
        const customers = res.data.list;
        let filteredCustomers = customers.length
          ? customers.filter(customer => customer.parentID === null)
          : [];
        let worksites = customers.length
          ? customers.filter(customer => customer.parentID !== null)
          : [];
        for (let i = 0; i < filteredCustomers.length; i++) {
          for (let j = 0; j < worksites.length; j++) {
            if (filteredCustomers[i].id === worksites[j].parentID) {
              let childs = filteredCustomers[i].childs
                ? filteredCustomers[i].childs
                : [];
              childs.push(worksites[j]);
              filteredCustomers[i] = {
                ...filteredCustomers[i],
                childs
              };
            }
          }
        }
        this.setCustomers(filteredCustomers);
        //setWorksites(worksites);
        this.setTotalCount(res.data.totalcount);
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
        console.log(err);
      });
  };
  render() {
    const { history, invoiceTypes, accountGroups, paymentChoices } = this.props;
    const customersUIEvents = {
      newWorksiteButtonClick: data => {
        history.push("/customers/create-worksite", data);
      },
      openEditCompanyDialog: (id, data) => {
        history.push(`/customers/${id}/edit`, data);
      },
      openEditWorksiteDialog: (id, data) => {
        history.push(`/customers/${id}/edit-worksite`, data);
      },
      openPreviewWorksiteDialog: (id, data) => {
        history.push(`/customers/${id}/preview`, data);
      },
      openDeleteCompanyDialog: data => {
        history.push(`/customers/deletecompany`, { data });
      }
    };

    const { createCompany, updateCompany } = this.props;

    return (
      <CustomersUIProvider customersUIEvents={customersUIEvents}>
        <Route path="/customers/create-worksite">
          {({ history, match }) => (
            <WorksiteCreateModal
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/customers");
              }}
              getData={this.getData}
            />
          )}
        </Route>
        <Route path="/customers/:id/edit">
          {({ history, match }) => (
            <CompanyEditModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              getData={this.getData}
              updateCompany={updateCompany}
              onHide={() => {
                history.push("/customers");
              }}
            />
          )}
        </Route>
        <Route path="/customers/:id/edit-worksite">
          {({ history, match }) => (
            <WorksiteEditModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              getData={this.getData}
              updateCompany={updateCompany}
              onHide={() => {
                history.push("/customers");
              }}
            />
          )}
        </Route>
        <Route path="/customers/:id/preview">
          {({ history, match }) => (
            <WorksitePreviewModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              onHide={() => {
                history.push("/customers");
              }}
            />
          )}
        </Route>
        <Route path="/customers/deletecompany">
          {({ history, match }) => (
            <CompanyDeleteDialog
              show={match != null}
              history={history}
              getData={this.getData}
              onHide={() => {
                history.push("/customers");
              }}
            />
          )}
        </Route>
        <CustomerCard
          createCompany={createCompany}
          //customers={this.props.customers}
          customers={this.state.customers}
          invoiceTypes={invoiceTypes}
          accountGroups={accountGroups}
          paymentChoices={paymentChoices}
          getData={this.getData}
          setPageNumber={this.setPageNumber}
          setPageSize={this.setPageSize}
          setName={this.setName}
          setSelectedStatus={this.setSelectedStatus}
          setGroupId={this.setGroupId}
          setSelectedCreationDate={this.setSelectedCreationDate}
          setCustomers={this.setCustomers}
          setTotalCount={this.setTotalCount}
          state={this.state}
        />
      </CustomersUIProvider>
    );
  }
}

export default connect()(CustomerPage);
