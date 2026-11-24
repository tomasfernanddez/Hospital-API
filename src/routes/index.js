
import { Router } from "express";

import { userRouter } from "./user.routes.js";
import { specialtyRouter } from "./specialty.routes.js";
import { patientRouter } from "./patient.routes.js";
import { doctorRouter } from "./doctor.routes.js";
import { nurseRouter } from "./nurse.routes.js";
import { appointmentRouter } from "./appointment.routes.js";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/specialties", specialtyRouter);
apiRouter.use("/patients", patientRouter);
apiRouter.use("/doctors", doctorRouter);
apiRouter.use("/nurses", nurseRouter);
apiRouter.use("/appointments", appointmentRouter);
