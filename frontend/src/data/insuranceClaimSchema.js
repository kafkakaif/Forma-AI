const insuranceClaimSchema = {
  formId: "insurance-claim",

  title: "Insurance Claim Form",

  description:
    "Provide the details required to submit an insurance claim.",

  fields: [
    // -------------------------
    // PERSONAL DETAILS
    // -------------------------

    {
      id: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      minLength: 3,
      placeholder: "Enter your full name",
    },

    {
      id: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter your email",
    },

    {
      id: "phone",
      label: "Phone Number",
      type: "text",
      required: true,
      pattern: "^[0-9]{10}$",
      placeholder: "Enter 10-digit phone number",
    },

    // -------------------------
    // CLAIM DETAILS
    // -------------------------

    {
      id: "claimType",
      label: "Claim Type",
      type: "select",
      required: true,

      options: [
        {
          label: "Vehicle Accident",
          value: "vehicle_accident",
        },
        {
          label: "Property Damage",
          value: "property_damage",
        },
        {
          label: "Medical",
          value: "medical",
        },
      ],
    },

    {
      id: "incidentDate",
      label: "Date of Incident",
      type: "date",
      required: true,
    },

    // -------------------------
    // VEHICLE DETAILS
    // -------------------------

    {
      id: "vehicleNumber",
      label: "Vehicle Registration Number",
      type: "text",
      required: true,
      placeholder: "Example: AP01AB1234",
    },

    // -------------------------
    // LEVEL 1
    // -------------------------

    {
      id: "accidentOccurred",
      label: "Did an accident occur?",
      type: "radio",
      required: true,

      options: [
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
    },

    // -------------------------
    // LEVEL 2
    // -------------------------

    {
      id: "accidentLocation",
      label: "Where did the accident occur?",
      type: "text",
      required: true,
      placeholder: "Enter accident location",

      showIf: {
        field: "accidentOccurred",
        operator: "equals",
        value: "yes",
      },
    },

    {
      id: "vehicleDamaged",
      label: "Was the vehicle damaged?",
      type: "radio",
      required: true,

      options: [
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],

      showIf: {
        field: "accidentOccurred",
        operator: "equals",
        value: "yes",
      },
    },

    // -------------------------
    // LEVEL 3
    // -------------------------

    {
      id: "damageType",
      label: "What type of damage occurred?",
      type: "select",
      required: true,

      options: [
        {
          label: "Minor Damage",
          value: "minor",
        },
        {
          label: "Major Damage",
          value: "major",
        },
      ],

      showIf: {
        field: "vehicleDamaged",
        operator: "equals",
        value: "yes",
      },
    },

    // -------------------------
    // LEVEL 4
    // -------------------------

    {
      id: "majorDamageDetails",
      label: "Describe the major damage",
      type: "textarea",
      required: true,
      placeholder: "Describe the major damage",

      showIf: {
        field: "damageType",
        operator: "equals",
        value: "major",
      },
    },

    // -------------------------
    // LEVEL 5
    // -------------------------

    {
      id: "policeReport",
      label: "Was a police report filed?",
      type: "radio",
      required: true,

      options: [
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],

      showIf: {
        field: "majorDamageDetails",
        operator: "notEmpty",
        value: true,
      },
    },

    // -------------------------
    // INJURY DETAILS
    // -------------------------

    {
      id: "injuries",
      label: "Was anyone injured?",
      type: "radio",
      required: true,

      options: [
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
    },

    {
      id: "injuryDetails",
      label: "Describe the injuries",
      type: "textarea",
      required: true,
      placeholder: "Describe the injuries...",

      showIf: {
        field: "injuries",
        operator: "equals",
        value: "yes",
      },
    },

    // -------------------------
    // INCIDENT DESCRIPTION
    // -------------------------

    {
      id: "description",
      label: "Describe the incident",
      type: "textarea",
      required: true,
      placeholder: "Describe what happened...",
    },
  ],
};

export default insuranceClaimSchema;