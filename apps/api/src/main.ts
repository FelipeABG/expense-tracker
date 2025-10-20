import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { contract } from 'contract';
import { generateOpenApi } from '@ts-rest/open-api';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');

  const document = generateOpenApi(
    contract,
    {
      info: {
        title: 'Base API',
        version: '1.0.0',
        description: `A comprehensive learning project demonstrating production-grade REST API fundamentals. This API showcases enterprise-level features and best practices including:

**Core Features:**
- **Authentication & Authorization**: [JWT](https://www.jwt.io/introduction#what-is-json-web-token)-based authentication with [role-based access control (RBAC)](https://www.ibm.com/think/topics/rbac).
- **Modern Architecture**: Modular design using [NestJS](https://nestjs.com) framework.
- **Type Safety**: Contract-first approach with [TS-REST](https://ts-rest.com) ensuring type-safe client-server communication.
- **Configuration Management**: Environment-based configuration for different deployment stages.
- **API Documentation**: Auto-generated interactive documentation with [Swagger](https://swagger.io)/[OpenAPI](https://www.openapis.org).
- **Data Validation**: Robust input validation and pagination support.

**Important to note:**
- All endpoints require authentication, except \`/auth/login\` and \`/auth/signup\`.

**Purpose:**
Built as an educational resource to understand the complete lifecycle of designing, implementing, and documenting a production-ready API.`,
      },
    },
    { setOperationId: 'concatenated-path' },
  );

  SwaggerModule.setup('docs', app, document);
  await app.listen(PORT);
}

bootstrap();
