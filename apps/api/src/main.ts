import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { contract } from "contract";
import { generateOpenApi } from "@ts-rest/open-api";
import { SwaggerModule } from "@nestjs/swagger";
import { description } from "./utils/description.util";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const PORT = configService.get("PORT");

    // Configurar CORS para permitir credentials
    app.enableCors({
        origin: "http://localhost:5173", // Frontend URL
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

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
