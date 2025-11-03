import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

export enum UserFormat {
    PASSWORD = "password",
    HASH = "hash",
}

function randomNumber() {
    // Generates a 5 digit random number
    return Math.random().toFixed(5).slice(2);
}

export function generateTestUser(format: UserFormat) {
    if (format == UserFormat.PASSWORD) {
        return {
            email: `test-user${randomNumber()}@gmail.com`,
            password: "DKL4n98po343n!#",
        };
    } else {
        return {
            email: `test-user${randomNumber()}@gmail.com`,
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
        title: `expense-title-${randomNumber()}`,
        description: `expense-description-${randomNumber()}`,
        date: new Date(Date.now()),
        value: 420.0,
        recurrence: undefined,
    };
}
