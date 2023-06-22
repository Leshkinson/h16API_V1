import { Test, TestingModule } from "@nestjs/testing";
import { Sa_usersController } from "./super_admin_api/sa_users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
    let controller: Sa_usersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [Sa_usersController],
            providers: [UsersService],
        }).compile();

        controller = module.get<Sa_usersController>(Sa_usersController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
