import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, Max, Min, validateSync } from 'class-validator';

class EnviromentVariables {
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DB_URL: string;

  @IsString()
  SECRET_KEY: string;
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
