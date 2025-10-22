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
    Production = "production",
    Development = "development",
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
    SECRET_KEY: string;

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
