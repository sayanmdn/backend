"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODE = exports.ERROR_CODE = exports.SUCCESS_CODE = exports.STUDENT_USER_ROLE = exports.TEACHER_USER_ROLE = void 0;
exports.TEACHER_USER_ROLE = "TEACHER";
exports.STUDENT_USER_ROLE = "STUDENT";
exports.SUCCESS_CODE = "SUCCESS";
exports.ERROR_CODE = "ERROR";
var STATUS_CODE;
(function (STATUS_CODE) {
    STATUS_CODE[STATUS_CODE["SUCCESS"] = 200] = "SUCCESS";
    STATUS_CODE[STATUS_CODE["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    STATUS_CODE[STATUS_CODE["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    STATUS_CODE[STATUS_CODE["NOT_FOUND"] = 404] = "NOT_FOUND";
    STATUS_CODE[STATUS_CODE["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(STATUS_CODE = exports.STATUS_CODE || (exports.STATUS_CODE = {}));
//# sourceMappingURL=constant.js.map