import React from "react";
import Avatar from "react-avatar";
import { FormattedMessage } from "react-intl";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";

function MatchingCandidateColumnFormatter(
  cell,
  row,
  rowIndex,
  { onOpenResume }
) {
  const renderNote = () => {
    if (row.accountNumberOfMissions < 1) {
      return null;
    }
    if (row.accountNumberOfMissions === 1) {
      return (
        <img
          className="connectScore"
          alt="connect score"
          src={toAbsoluteUrl("/media/logos/connectRateOne.png")}
        ></img>
      );
    }
    if (row.accountNumberOfMissions > 1 && row.tenantNumberOfMissions < 1) {
      return (
        <img
          className="connectScore"
          alt="connect score"
          src={toAbsoluteUrl("/media/logos/connectRateTwo.png")}
        ></img>
      );
    }
    if (row.accountNumberOfMissions >= 1 && row.tenantNumberOfMissions >= 1) {
      return (
        <img
          className="connectScore"
          alt="connect score"
          src={toAbsoluteUrl("/media/logos/connectRateThree.png")}
        ></img>
      );
    }
  };
  return cell !== null ? (
    <div className="d-flex mr-2 flex-row">
      <div className="d-flex flex-column justify-content-center align-items-center">
        {!isNullOrEmpty(row) && !isNullOrEmpty(row.applicantPicture) ? (
          <Avatar
            className="symbol-label"
            color="#3699FF"
            src={
              "data:image/" +
              row.applicantPicture.filename.split(".")[1] +
              ";base64," +
              row.applicantPicture.base64
            }
          />
        ) : (
          <Avatar
            className="symbol-label"
            color="#3699FF"
            maxInitials={2}
            name={row && row.firstname && row.firstname}
          />
        )}
        <button
          onClick={() => onOpenResume(cell, row)}
          className="btn btn-icon btn-light-primary pulse pulse-primary mr-5 btn-cv-pulse"
        >
          <i className="fas fa-file-alt" />
          <span className="text-cv-pulse">CV</span>
          <span className="pulse-ring"></span>
        </button>
      </div>
      <div className="ml-5 d-flex flex-column align-items-start">
        <span className="matching-firstname mb-5 ">
          {row.firstname} {renderNote()}
        </span>
        <span className="matching-passed-missions mb-5">
          {row.accountNumberOfMissions}{" "}
          <FormattedMessage id="TEXT.MISSIONS.COUNT" />
        </span>
        <span className="matching-passed-missions mb-1">
          <FormattedMessage id="TEXT.LIVES.IN" />{" "}
          <span className="matching-city">{row.city}</span>
        </span>
        <span className="matching-passed-missions">
          {row.experience && (
            <span className="matching-city">{row.experience}</span>
          )}
        </span>
      </div>
      <span>{row.name}</span>
    </div>
  ) : null;
}

export default MatchingCandidateColumnFormatter;
