import React from "react";
import DynamicForm from "../components/DynamicForm";
import insuranceClaimSchema from "../data/insuranceClaimSchema";

function InsuranceClaim() {
  return (
    <div>
      <DynamicForm schema={insuranceClaimSchema} />
    </div>
  );
}

export default InsuranceClaim;