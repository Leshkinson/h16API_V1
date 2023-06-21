import { Injectable, Inject } from "@nestjs/common";
import { UserModel } from "../users/schema/user.schema";
import { BlogModel } from "../blogs/schema/blog.schema";
import { BlogsRepository } from "../blogs/blogs.repository";
import { UsersRepository } from "../users/users.repository";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

/**IsExistByParam*/
@ValidatorConstraint({ name: "IsExistByParam", async: true })
@Injectable()
export class _IsExistByParam implements ValidatorConstraintInterface {
    constructor(@Inject("userRepository") private readonly userRepository: UsersRepository) {
        this.userRepository = new UsersRepository(UserModel);
    }

    async validate(value: string) {
        try {
            const user = await this.userRepository.findUserByParam(value);
            if (user) {
                throw new Error();
            }
        } catch (error) {
            if (error instanceof Error) {
                return false;
            }
        }
        return true;
    }
}

export function IsExistByParam(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            name: "IsExistByParam",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: _IsExistByParam,
        });
    };
}
/**IsNotExistByParamAndConfirm*/
@ValidatorConstraint({ name: "IsNotExistByParamAndConfirm", async: true })
@Injectable()
export class _IsNotExistByParamAndConfirm implements ValidatorConstraintInterface {
    constructor(@Inject("userRepository") private readonly userRepository: UsersRepository) {
        this.userRepository = new UsersRepository(UserModel);
    }

    async validate(value: string) {
        try {
            const user = await this.userRepository.findUserByParam(value);
            if (!user) {
                throw new Error();
            }
        } catch (error) {
            if (error instanceof Error) {
                return false;
            }
        }
        return true;
    }
}

export function IsNotExistByParamAndConfirm(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            name: "IsNotExistByParamAndConfirm",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: _IsNotExistByParamAndConfirm,
        });
    };
}

/**IsConfirmedEmail*/
@ValidatorConstraint({ name: "IsConfirmedEmail", async: true })
@Injectable()
export class _IsConfirmedEmail implements ValidatorConstraintInterface {
    constructor(@Inject("userRepository") private readonly userRepository: UsersRepository) {
        this.userRepository = new UsersRepository(UserModel);
    }

    async validate(value: string) {
        try {
            const user = await this.userRepository.findUserByParam(value);
            if (user?.isConfirmed) {
                throw new Error();
            }
        } catch (error) {
            if (error instanceof Error) {
                return false;
            }
        }
        return true;
    }
}

export function IsConfirmedEmail(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            name: "IsConfirmedEmail",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: _IsConfirmedEmail,
        });
    };
}

/**IsLikeStatusCheck*/
@ValidatorConstraint({ name: "IsLikeStatusCheck", async: true })
@Injectable()
export class _IsLikeStatusCheck implements ValidatorConstraintInterface {
    async validate(value: string) {
        try {
            if (value === "Like" || value === "Dislike" || value === "None") {
                return true;
            }
            throw new Error();
        } catch (error) {
            if (error instanceof Error) {
                return false;
            }
        }
    }
}

export function IsLikeStatusCheck(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            name: "IsLikeStatusCheck",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: _IsLikeStatusCheck,
        });
    };
}

/**IsBlogIdCheck*/
@ValidatorConstraint({ name: "IsBlogIdCheck", async: true })
@Injectable()
export class _IsBlogIdCheck implements ValidatorConstraintInterface {
    constructor(@Inject("blogRepository") private readonly blogRepository: BlogsRepository) {
        this.blogRepository = new BlogsRepository(BlogModel);
    }

    async validate(value: string, args: ValidationArguments) {
        try {
            const blog = await this.blogRepository.find(value);
            if (!blog) {
                throw new Error();
            }
        } catch (error) {
            if (error instanceof Error) {
                return false;
            }
        }
        return true;
    }
}

export function IsBlogIdCheck(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            name: "IsBlogIdCheck",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: _IsBlogIdCheck,
        });
    };
}

@ValidatorConstraint({ name: "trimString", async: false })
export class TrimStringValidator implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        try {
            if (!args.object.hasOwnProperty(args.property)) {
                throw new Error();
            }
            if (typeof value !== "string") {
                return true;
            }
            return value.trim() === value;
        } catch (error) {
            if (error instanceof Error) {
                return false;
            }
        }
    }
}
