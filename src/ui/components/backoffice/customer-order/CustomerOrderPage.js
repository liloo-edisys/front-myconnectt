import React from "react";
import { useParams, Route, useHistory } from "react-router-dom";
import { DisplayDialog } from "./applicant-modal/DisplayDialog";
import CustomerOrder from "./CustomerOrder";

function CustomerOrderPage(props) {
  const { missionId } = useParams();
  const history = useHistory();
  const onHide = () => {
    history.push(`/customer-order/${missionId}`);
  };
  return (
    <div>
      <Route exact path={`/customer-order/${missionId}/:profileId`}>
        <DisplayDialog show={true} onHide={onHide} />
      </Route>
      <CustomerOrder />
    </div>
  );
}

export default CustomerOrderPage;
