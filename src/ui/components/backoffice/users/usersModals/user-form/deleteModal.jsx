import React, {  } from "react";
import { toastr } from "react-redux-toastr";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

function DeleteModal({ onHide, getData }) {
  const intl = useIntl();
  const { id } = useParams();
  const { user } = useSelector(state => ({
    user: state.user.user
  }));

  const onDeleteUser = () => {
    const body = { id: parseInt(id) };
    axios
      .delete(`${process.env.REACT_APP_WEBAPI_URL}api/user/DeleteUser`, {
        params: {
          id
        }
      })
      .then(() => {
        toastr.success(
          "Succès",
          intl.formatMessage({ id: "TEXT.USER.ADMIN.DELETE.SUCCESS" })
        );
        onHide();
        getData();
      })
      .catch(() => {
        toastr.error(
          "Erreur",
          intl.formatMessage({ id: "TEXT.USER.ADMIN.DELETE.ERROR" })
        );
      });
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage id="TITLE.DELETE.USER.ADMIN" />
          </p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <FormattedMessage id="TEXT.DELETE.USER.ADMIN" />
        </p>
      </Modal.Body>
      <Modal.Footer>
        <div
          type="button"
          className="btn btn-light-primary btn-shadow font-weight-bold"
          onClick={onHide}
        >
          <span>
            <FormattedMessage id="BUTTON.CANCEL" />
          </span>
        </div>
        <button
          id="kt_login_signin_submit"
          className={`btn btn-light-danger font-weight-bold`}
          onClick={onDeleteUser}
        >
          <span>
            <FormattedMessage id="BUTTON.DELETE" />
          </span>
          {/*updateInterimaireIdentityLoading && (
                  <span className="ml-3 spinner spinner-white"></span>
                )*/}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteModal;
