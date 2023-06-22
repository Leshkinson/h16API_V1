import { Body, Controller, Get, HttpStatus, Param, Put, Req, Res, UseGuards } from "@nestjs/common";
import { UsersService } from "../users.service";
import { QueryService } from "../../sup-services/query/query.service";
import { BanUserDtoForBlog } from "../dto/ban-user.dto";
import { Request, Response } from "express";
import { AccessGuard } from "../../auth/access.guard";
import { UsersRequest } from "../types/user.type";
import { IUser } from "../interface/user.interface";

@Controller("blogger/users")
export class BloggerUsersController {
    constructor(private readonly usersService: UsersService, private readonly queryService: QueryService) {}

    @UseGuards(AccessGuard)
    @Put(":id")
    public async banOrUnbanUserForBLog(
        @Param("id") id: string,
        @Body() banUserDtoForBlog: BanUserDtoForBlog,
        @Res() res: Response,
    ) {
        try {
            const userBan = await this.usersService.assigningBanToUser(id, banUserDtoForBlog);
            if (userBan) {
                res.sendStatus(HttpStatus.NO_CONTENT);
                return;
            }
            throw new Error();
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @UseGuards(AccessGuard)
    @Get("/blog/:id")
    public async getAllBannedUsersForTheBlog(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
        try {
            // eslint-disable-next-line prefer-const
            let { searchLoginTerm, sortBy, sortDirection, pageNumber, pageSize } = req.query as UsersRequest;
            pageNumber = Number(pageNumber ?? 1);
            pageSize = Number(pageSize ?? 10);
            const users: IUser[] = await this.usersService.findAllBannedUsersForTheBlog(
                searchLoginTerm,
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
                id,
            );

            const totalCount: number = await this.queryService.getTotalCountForBannedUsersForTheBlog(
                searchLoginTerm,
                id,
            );

            res.status(HttpStatus.OK).json({
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: users,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
}
