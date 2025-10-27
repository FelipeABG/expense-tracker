import { plainToInstance } from "class-transformer";
import {
    IsEnum,
    IsNumber,
    IsString,
    Max,
    Min,
    validateSync,
} from "class-validator";

enum Environment {
    Production = "prod",
    Development = "dev",
    // Jest automatically sets NODE_ENV to test, overriding .env configs
    Test = "test",
}

class EnviromentVariables {
    @IsNumber()
    @Min(0)
    @Max(65535)
    PORT: number;

    @IsString()
    DB_URL: string;

    @IsString()
    DEV_DB_URL: string;

    @IsString()
    JWT_SECRET_KEY: string;

    @IsEnum(Environment)
    NODE_ENV: string;
}

export default function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnviromentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig);

    if (errors.length > 0) {
        throw Error(errors.toString());
    }

    return validatedConfig;
}
