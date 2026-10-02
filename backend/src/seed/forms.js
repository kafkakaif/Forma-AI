// Auto insurance claim: the deck's example flow (deer collision -> windshield damage).
export const autoClaim = {
  slug: 'insurance_claim',
  title: 'Auto Insurance Claim',
  description: 'Report an incident. Only the questions that apply to you will appear.',
  sections: [
    {
      id: 'incident',
      title: 'Incident details',
      fields: [
        {
          name: 'incidentType',
          label: 'What happened?',
          type: 'select',
          required: true,
          options: ['animal_collision', 'vehicle_collision', 'theft', 'weather_damage'],
        },
        {
          name: 'incidentDate',
          label: 'Date of incident (YYYY-MM-DD)',
          type: 'text',
          required: true,
          placeholder: '2026-09-24',
          validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$', message: 'Use the format YYYY-MM-DD' },
        },
        {
          name: 'location',
          label: 'Where did it happen?',
          type: 'text',
          required: true,
          placeholder: 'e.g. I-95 near exit 12',
          validation: { minLength: 3, maxLength: 120 },
        },
        {
          name: 'animalType',
          label: 'What kind of animal?',
          type: 'select',
          required: true,
          options: ['deer', 'dog', 'bird', 'other'],
          showIf: { field: 'incidentType', equals: 'animal_collision' },
        },
        {
          name: 'policeReportFiled',
          label: 'A police report was filed',
          type: 'checkbox',
          showIf: { any: [{ field: 'incidentType', in: ['vehicle_collision', 'theft'] }] },
        },
        {
          name: 'policeReportNumber',
          label: 'Police report number',
          type: 'text',
          required: true,
          validation: { pattern: '^[A-Z0-9-]{6,}$', message: 'At least 6 characters: capital letters, digits or dashes' },
          showIf: { field: 'policeReportFiled', equals: true },
        },
      ],
    },
    {
      id: 'vehicle',
      title: 'Vehicle',
      fields: [
        { name: 'vehicleMake', label: 'Vehicle make', type: 'text', required: true, placeholder: 'e.g. Honda' },
        {
          name: 'vehicleDamaged',
          label: 'Was the vehicle damaged?',
          type: 'select',
          required: true,
          options: ['yes', 'no'],
        },
        {
          name: 'damageType',
          label: 'Which part was damaged?',
          type: 'select',
          required: true,
          options: ['windshield', 'door', 'engine'],
          showIf: { field: 'vehicleDamaged', equals: 'yes' },
        },
        {
          name: 'drivable',
          label: 'The vehicle is still drivable',
          type: 'checkbox',
          showIf: { field: 'vehicleDamaged', equals: 'yes' },
        },
        {
          name: 'towingNeeded',
          label: 'I need a tow',
          type: 'checkbox',
          showIf: { all: [{ field: 'vehicleDamaged', equals: 'yes' }, { field: 'drivable', notEquals: true }] },
        },
      ],
    },
    {
      id: 'declaration',
      title: 'Declaration',
      fields: [
        {
          name: 'notes',
          label: 'Anything else we should know?',
          type: 'text',
          validation: { maxLength: 500 },
        },
        { name: 'declaration', label: 'I confirm the information above is accurate', type: 'checkbox', required: true },
      ],
    },
  ],
};

// A second, shorter form to show that new form types need no UI changes.
export const healthIntake = {
  slug: 'health-intake',
  title: 'Patient Intake',
  description: 'Basic intake questions with conditional follow-ups.',
  sections: [
    {
      id: 'patient',
      title: 'Patient',
      fields: [
        { name: 'fullName', label: 'Full name', type: 'text', required: true, validation: { minLength: 2 } },
        { name: 'hasAllergies', label: 'I have known allergies', type: 'checkbox' },
        {
          name: 'allergyDetails',
          label: 'Describe your allergies',
          type: 'text',
          required: true,
          showIf: { field: 'hasAllergies', equals: true },
        },
        {
          name: 'visitReason',
          label: 'Reason for visit',
          type: 'select',
          required: true,
          options: ['checkup', 'injury', 'illness', 'other'],
        },
      ],
    },
    {
      id: 'injury',
      title: 'Injury details',
      showIf: { field: 'visitReason', equals: 'injury' },
      fields: [
        { name: 'injuryLocation', label: 'Where on the body?', type: 'text', required: true },
        { name: 'painLevel', label: 'Pain level', type: 'select', required: true, options: ['mild', 'moderate', 'severe'] },
      ],
    },
  ],
};

export const insuranceClaim = {
  slug: "insurance-claim",

  title: "Insurance Claim Form",

  description:
    "Provide the details required to submit an insurance claim.",

  sections: [
    {
      id: "personal",
      title: "Personal Details",

      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
          validation: {
            minLength: 3,
          },
        },

        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
        },

        {
          name: "phone",
          label: "Phone Number",
          type: "text",
          required: true,
          validation: {
            pattern: "^[0-9]{10}$",
          },
        },
      ],
    },

    {
      id: "claim",
      title: "Claim Details",

      fields: [
        {
          name: "claimType",
          label: "Claim Type",
          type: "select",
          required: true,
          options: [
            "vehicle_accident",
            "property_damage",
            "medical",
          ],
        },

        {
          name: "incidentDate",
          label: "Date of Incident",
          type: "date",
          required: true,
        },

        {
          name: "vehicleNumber",
          label: "Vehicle Registration Number",
          type: "text",
          required: true,
        },
      ],
    },

    {
      id: "accident",
      title: "Accident Details",

      fields: [
        {
          name: "accidentOccurred",
          label: "Did an accident occur?",
          type: "radio",
          required: true,
          options: ["yes", "no"],
        },

        {
          name: "accidentLocation",
          label: "Where did the accident occur?",
          type: "text",
          required: true,
          showIf: {
            field: "accidentOccurred",
            equals: "yes",
          },
        },

        {
          name: "vehicleDamaged",
          label: "Was the vehicle damaged?",
          type: "radio",
          required: true,
          options: ["yes", "no"],
          showIf: {
            field: "accidentOccurred",
            equals: "yes",
          },
        },

        {
          name: "damageType",
          label: "What type of damage occurred?",
          type: "select",
          required: true,
          options: ["minor", "major"],
          showIf: {
            field: "vehicleDamaged",
            equals: "yes",
          },
        },

        {
          name: "majorDamageDetails",
          label: "Describe the major damage",
          type: "textarea",
          required: true,
          showIf: {
            field: "damageType",
            equals: "major",
          },
        },

        {
          name: "policeReport",
          label: "Was a police report filed?",
          type: "radio",
          required: true,
          options: ["yes", "no"],
          showIf: {
            field: "majorDamageDetails",
            exists: true,
          },
        },
      ],
    },

    {
      id: "injury",
      title: "Injury Details",

      fields: [
        {
          name: "injuries",
          label: "Was anyone injured?",
          type: "radio",
          required: true,
          options: ["yes", "no"],
        },

        {
          name: "injuryDetails",
          label: "Describe the injuries",
          type: "textarea",
          required: true,
          showIf: {
            field: "injuries",
            equals: "yes",
          },
        },

        {
          name: "description",
          label: "Describe the incident",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};