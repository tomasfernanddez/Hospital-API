
import * as yup from "yup";

const doctorFields = {
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

  specialtyId: yup
    .number()
    .integer()
    .positive()
    .required(),
};

export const createDoctorDto = yup
  .object(doctorFields)
  .strict()
  .noUnknown(true);

export const updateDoctorDto = yup
  .object(
    Object.fromEntries(
      Object.entries(doctorFields).map(([key, schema]) => [
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

export const toDoctorResponse = (doctor) => ({
  id: doctor.id,
  firstName: doctor.firstName,
  lastName: doctor.lastName,
  licenseNumber: doctor.licenseNumber,
  specialty: doctor.specialty
    ? {
        id: doctor.specialty.id,
        name: doctor.specialty.name,
      }
    : null,
});
