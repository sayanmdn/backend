export const TEACHER_USER_ROLE = "TEACHER";
export const STUDENT_USER_ROLE = "STUDENT";
export const SUCCESS_CODE = "SUCCESS";
export const ERROR_CODE = "ERROR";
export const DEFAULT_SERVER_RESPONSE = (req: any): string =>
  `Cheers ${req?.headers?.host || ""}! You're now in the realm of Core Backend <b>v2.1.0</b>`;
