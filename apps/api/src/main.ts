import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { contract } from "contract";
import { generateOpenApi } from "@ts-rest/open-api";
import { SwaggerModule } from "@nestjs/swagger";
import { description } from "./utils/description.util";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    const configService = app.get(ConfigService);
    const PORT = configService.get("PORT");

    const document = generateOpenApi(
        contract,
        {
            info: {
                title: "Expense Tracker API",
                version: "1.0.0",
                description,
            },
        },
        { setOperationId: "concatenated-path" },
    );

    SwaggerModule.setup("docs", app, document);
    await app.listen(PORT);
}

bootstrap();
