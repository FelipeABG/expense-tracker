import { initContract } from "@ts-rest/core";
import { authContract } from "./auth.contract";
import { userContract } from "./user.contract";

const c = initContract();

export const contract = c.router(
    {
        Authentication: authContract,
        User: userContract,
    },
    { strictStatusCodes: true },
);

export { INTERNAL_SERVER_ERROR } from "./error";
