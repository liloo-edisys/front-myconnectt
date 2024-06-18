import React from "react";
import { CSVLink, CSVDownload } from "react-csv";

function exportCSV(props) {
  const csvData = [
    ["firstname", "lastname", "email"],
    ["Ahmed", "Tomi", "ah@smthing.co.com"],
    ["Raed", "Labes", "rl@smthing.co.com"],
    ["Yezzi", "Min l3b", "ymin@cocococo.com"]
  ];
  return (
    <div>
      <div>OKOK</div>
      <CSVLink
        style={{ backgroundColor: "red", height: 50, width: 200 }}
        data={csvData}
      >
        Download me
      </CSVLink>
      <CSVDownload data={csvData} target="_blank" />
    </div>
  );
}

export default exportCSV;
