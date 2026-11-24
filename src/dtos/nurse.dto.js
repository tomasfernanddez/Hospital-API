
import * as yup from "yup";

const nurseFields = {
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

  licenseNumber: yup
    .string()
    .trim()
    .min(4)
    .max(20)
    .required(),
};

export const createNurseDto = yup
  .object(nurseFields)
  .strict()
  .noUnknown(true);

export const updateNurseDto = yup
  .object(
    Object.fromEntries(
      Object.entries(nurseFields).map(([key, schema]) => [
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

export const toNurseResponse = (nurse) => ({
  id: nurse.id,
  firstName: nurse.firstName,
  lastName: nurse.lastName,
  licenseNumber: nurse.licenseNumber,
});
