"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SERVER_RESPONSE = exports.ERROR_CODE = exports.SUCCESS_CODE = exports.STUDENT_USER_ROLE = exports.TEACHER_USER_ROLE = void 0;
exports.TEACHER_USER_ROLE = "TEACHER";
exports.STUDENT_USER_ROLE = "STUDENT";
exports.SUCCESS_CODE = "SUCCESS";
exports.ERROR_CODE = "ERROR";
const DEFAULT_SERVER_RESPONSE = (req) => { var _a; return `Cheers ${((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.host) || ""}! You're now in the realm of Core Backend <b>v2.1.0</b>`; };
exports.DEFAULT_SERVER_RESPONSE = DEFAULT_SERVER_RESPONSE;
//# sourceMappingURL=constant.js.map