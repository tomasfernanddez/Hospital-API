
import * as yup from "yup";

const patientFields = {
  firstName: yup
    .string()
    .trim()
    .min(2)
    .max(120)
    .required(),

  lastName: yup
    .string()
    .trim()
    .min(2)
    .max(120)
    .required(),

  documentNumber: yup
    .string()
    .matches(
      /^[0-9]{7,10}$/,
      "Document number must contain 7 to 10 digits",
    )
    .required(),

  birthDate: yup
    .string()
    .required()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Birth date must use YYYY-MM-DD",
    )
    .test(
      "valid-birth-date",
      "Birth date must be a valid date in the past",
      (value) => {
        // En PATCH, birthDate puede omitirse.
        if (value === undefined) return true;

        // Si se envia, debe ser una fecha valida.
        if (!value) return false;

        const date = new Date(`${value}T00:00:00Z`);

        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value &&
          value < new Date().toISOString().slice(0, 10)
        );
      },
    ),
};

export const createPatientDto = yup
  .object(patientFields)
  .strict()
  .noUnknown(true);

export const updatePatientDto = yup
  .object(
    Object.fromEntries(
      Object.entries(patientFields).map(([key, schema]) => [
        key,
        schema.optional(),
      ]),
    ),
  )
  .strict()
  .noUnknown(true)
  .test(
    "at-least-one-field",
    "At least one field is required",
    (value) => Object.keys(value ?? {}).length > 0,
  );

export const toPatientResponse = (patient) => ({
  id: patient.id,
  firstName: patient.firstName,
  lastName: patient.lastName,
  documentNumber: patient.documentNumber,
  birthDate: patient.birthDate,
});
