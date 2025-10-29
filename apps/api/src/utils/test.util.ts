import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

export enum UserFormat {
    PASSWORD = "password",
    HASH = "hash",
}

export function generateTestUser(format: UserFormat) {
    if (format == UserFormat.PASSWORD) {
        return {
            email: `test-user${Math.random()}@gmail.com`,
            password: "DKL4n98po343n!#",
        };
    } else {
        return {
            email: `test-user${Math.random()}@gmail.com`,
            hash: "DKL4n98po343n!#",
        };
    }
}

export async function generateTestModule() {
    return await Test.createTestingModule({
        imports: [AppModule],
    }).compile();
}

export function generateTestExpense() {
    return {
        title: `expense-title-${Math.random()}`,
        description: `expense-description-${Math.random()}`,
        date: new Date(Date.now()),
        recurrence: undefined,
    };
}
