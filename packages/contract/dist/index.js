"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contract = void 0;
var core_1 = require("@ts-rest/core");
var auth_contract_1 = require("./auth.contract");
var user_contract_1 = require("./user.contract");
var c = (0, core_1.initContract)();
exports.contract = c.router({
    Authentication: auth_contract_1.authContract,
    User: user_contract_1.userContract,
}, { strictStatusCodes: true });
