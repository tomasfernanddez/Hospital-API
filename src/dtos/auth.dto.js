import * as yup from "yup";

export const loginDto = yup
  .object({
    email: yup.string().trim().lowercase().email().required(),
    password: yup.string().trim().required(),
  })
  .noUnknown(true, "Unknown fields are not allowed");