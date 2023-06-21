import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { useContainer } from "class-validator";
import { HttpExceptionFilter } from "./exception.filter";
import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new Logger(),
    });
    app.use(cookieParser());
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            //transform: true,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const errorsForResponse = [];

                errors.forEach((error) => {
                    const constraintsKeys = Object.keys(error.constraints);
                    constraintsKeys.forEach((cKey) => {
                        errorsForResponse.push({
                            message: error.constraints[cKey],
                            field: error.property,
                        });
                    });
                });
                throw new BadRequestException(errorsForResponse);
            },
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.listen(3000);
}
bootstrap().then(() => {
    Logger.log("Start App on http://localhost:3000");
});
