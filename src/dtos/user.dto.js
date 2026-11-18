import * as yup from "yup";

// Los campos se escriben una sola vez y se reusan en los dos contratos.
const name = yup.string().trim().min(2).max(120);
const email = yup.string().trim().lowercase().email().max(255);

// Crear: los dos campos son obligatorios.
export const createUserDto = yup
  .object({
    name: name.required(),
    email: email.required(),
  })
  .noUnknown(true, "Unknown fields are not allowed");

// Actualizar: los dos opcionales, pero al menos uno tiene que venir.
export const updateUserDto = yup
  .object({ name, email })
  .noUnknown(true, "Unknown fields are not allowed")
  .test(
    "at-least-one",
    "At least one field is required",
    (value) => Object.keys(value ?? {}).length > 0,
  );

// Salida: lo que la API expone de un usuario.
export function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}