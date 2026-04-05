"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const SWAGGER_TAG_ORDER = ['auth', 'health', 'institutions'];
function sortOpenApiTags(document) {
    const existing = document.tags ?? [];
    const byName = new Map(existing.map((t) => [t.name, t]));
    const ordered = [];
    for (const name of SWAGGER_TAG_ORDER) {
        const t = byName.get(name);
        if (t)
            ordered.push(t);
    }
    for (const t of existing) {
        if (!SWAGGER_TAG_ORDER.includes(t.name))
            ordered.push(t);
    }
    document.tags = ordered;
}
let cachedApp;
async function createApp() {
    if (cachedApp)
        return cachedApp;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Presenly API')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({
        type: 'apiKey',
        name: 'x-institution-id',
        in: 'header',
        description: 'ID institusi untuk rute /institutions/me (sementara)',
    }, 'institution-id')
        .addTag('auth', 'Autentikasi publik (register, login, Google)')
        .addTag('health', 'Kesehatan layanan')
        .addTag('institutions', 'Institusi / tenant')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig, {
        operationIdFactory: (_controllerKey, methodKey) => methodKey,
    });
    sortOpenApiTags(document);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.init();
    cachedApp = app;
    return app;
}
if (process.env.NODE_ENV !== 'production') {
    async function bootstrap() {
        const app = await createApp();
        const port = process.env.PORT ?? 4000;
        await app.listen(port);
        console.log(`Application: http://localhost:${port}/api/v1/health`);
        console.log(`Swagger UI:  http://localhost:${port}/api/docs`);
    }
    bootstrap();
}
exports.default = async (req, res) => {
    const app = await createApp();
    const httpAdapter = app.getHttpAdapter().getInstance();
    httpAdapter(req, res);
};
//# sourceMappingURL=main.js.map