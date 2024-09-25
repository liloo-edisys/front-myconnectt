import React from "react";

function MatchingCandidateLastJobsFormatter(cell, row) {
  return cell !== null ? (
    <div className="d-flex flex-column  align-items-start">
      {cell.map(job => {
        return (
          <div>
            <p>{job}</p>
          </div>
        );
      })}
    </div>
  ) : null;
}

export default MatchingCandidateLastJobsFormatter;
