import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

export function generateTestUser() {
    return {
        email: `test-user${Math.random()}@gmail.com`,
        password: "DKL4n98po343n!#",
    };
}

export async function generateTestModule() {
    return await Test.createTestingModule({
        imports: [AppModule],
    }).compile();
}
