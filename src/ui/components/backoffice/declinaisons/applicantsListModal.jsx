import React from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import BootstrapTable from "react-bootstrap-table-next";
import { Link } from "react-router-dom";

export default function ApplicantsListModal(props) {
  const { onHide, activeDataList, listType } = props;
  const columns = [
    {
      dataField: "lastname",
      text: "Nom"
    },
    {
      dataField: "firstname",
      text: "Prénom"
    },
    {
      text: "Actions",
      formatter: (value, row) => (
        <Link
          className="btn btn-light-primary btn-shadow font-weight-bold"
          to={`/interimaire/edit/${row.id}`}
        >
          Voir l'intérimaire
        </Link>
      )
    }
  ];

  const columnsClient = [
    {
      dataField: "name",
      text: "Nom"
    },
    {
      dataField: "city",
      text: "Ville"
    },
    {
      text: "Actions",
      formatter: (value, row) => (
        <Link
          className="btn btn-light-primary btn-shadow font-weight-bold"
          to={`/decline/applicant/edit/${row.id}`}
        >
          Voir le client
        </Link>
      )
    }
  ];
  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">Titre</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <BootstrapTable
          remote
          wrapperClasses="table-responsive"
          bordered={false}
          classes="table table-head-custom table-vertical-center overflow-hidden"
          bootstrap4
          keyField="id"
          data={activeDataList}
          columns={listType === "applicants" ? columns : columnsClient}
        />
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onHide}
          className="btn btn-light-primary btn-shadow font-weight-bold"
        >
          <FormattedMessage id="BUTTON.CANCEL" />
        </button>
      </Modal.Footer>
    </Modal>
  );
}
