// Local AI service for Forma AI
// No external API key required.
// This is a development/demo AI layer that can later be replaced
// with OpenAI, Gemini, Claude, etc.

function createVehicleForm() {
  return {
    id: `vehicle-insurance-${Date.now().toString(36)}`,
    title: "Vehicle Insurance Claim Form",
    description:
      "Submit details regarding a vehicle accident or insurance claim.",
    category: "Insurance",

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
      },

      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },

      {
        id: "incidentDate",
        label: "Date of Incident",
        type: "date",
        required: true,
      },

      {
        id: "accidentOccurred",
        label: "Did an accident occur?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },

      {
        id: "vehicleDamaged",
        label: "Was the vehicle damaged?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        showIf: {
          field: "accidentOccurred",
          operator: "equals",
          value: "yes",
        },
      },

      {
        id: "damageType",
        label: "Type of Damage",
        type: "select",
        required: true,
        options: [
          { label: "Minor", value: "minor" },
          { label: "Moderate", value: "moderate" },
          { label: "Major", value: "major" },
        ],
        showIf: {
          field: "vehicleDamaged",
          operator: "equals",
          value: "yes",
        },
      },

      {
        id: "incidentDescription",
        label: "Describe the Incident",
        type: "textarea",
        required: true,
        placeholder: "Explain what happened...",
      },
    ],
  };
}

function createMedicalForm() {
  return {
    id: `medical-claim-${Date.now().toString(36)}`,
    title: "Medical Claim Form",
    description:
      "Collect patient and medical treatment information.",
    category: "Healthcare",

    fields: [
      {
        id: "patientName",
        label: "Patient Full Name",
        type: "text",
        required: true,
        placeholder: "Enter patient name",
      },

      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "patient@example.com",
      },

      {
        id: "treatmentDate",
        label: "Treatment Date",
        type: "date",
        required: true,
      },

      {
        id: "treatmentType",
        label: "Treatment Type",
        type: "select",
        required: true,
        options: [
          { label: "Consultation", value: "consultation" },
          { label: "Emergency", value: "emergency" },
          { label: "Hospitalization", value: "hospitalization" },
        ],
      },

      {
        id: "hospitalDays",
        label: "Number of Hospital Days",
        type: "number",
        required: true,
        showIf: {
          field: "treatmentType",
          operator: "equals",
          value: "hospitalization",
        },
      },

      {
        id: "description",
        label: "Medical Description",
        type: "textarea",
        required: true,
        placeholder: "Describe the treatment...",
      },

      {
        id: "consent",
        label: "I confirm that the information is accurate.",
        type: "checkbox",
        required: true,
      },
    ],
  };
}

function createEventForm() {
  return {
    id: `event-registration-${Date.now().toString(36)}`,
    title: "Event Registration Form",
    description:
      "Register attendees for an event.",
    category: "Events",

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
      },

      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
      },

      {
        id: "ticketType",
        label: "Ticket Type",
        type: "select",
        required: true,
        options: [
          { label: "General", value: "general" },
          { label: "VIP", value: "vip" },
        ],
      },

      {
        id: "vipDinner",
        label: "Will you attend the VIP dinner?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        showIf: {
          field: "ticketType",
          operator: "equals",
          value: "vip",
        },
      },

      {
        id: "specialRequests",
        label: "Special Requests",
        type: "textarea",
        required: false,
      },
    ],
  };
}

function createGenericForm(prompt) {
  const words = prompt
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");

  const title =
    words.charAt(0).toUpperCase() +
    words.slice(1) +
    (words.toLowerCase().includes("form")
      ? ""
      : " Form");

  return {
    id: `custom-form-${Date.now().toString(36)}`,
    title,
    description:
      "A dynamically generated form based on the user's request.",
    category: "Custom",

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
      },

      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },

      {
        id: "details",
        label: "Additional Details",
        type: "textarea",
        required: true,
        placeholder: "Enter the required details...",
      },
    ],
  };
}

export function generateFormFromPrompt(prompt) {
  const text = prompt.toLowerCase();

  if (
    text.includes("vehicle") ||
    text.includes("insurance") ||
    text.includes("car") ||
    text.includes("auto")
  ) {
    return createVehicleForm();
  }

  if (
    text.includes("medical") ||
    text.includes("health") ||
    text.includes("patient") ||
    text.includes("hospital")
  ) {
    return createMedicalForm();
  }

  if (
    text.includes("event") ||
    text.includes("registration") ||
    text.includes("conference") ||
    text.includes("ticket")
  ) {
    return createEventForm();
  }

  return createGenericForm(prompt);
}