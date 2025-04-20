import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
    Post,
    ParseIntPipe
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('ADMIN')
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles('ADMIN')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        return this.usersService.update(id, updateUserDto, req.user.id);
    }

    @Post(':userId/roles/:roleId/approve')
    @Roles('ADMIN')
    approveUserRole(
        @Param('userId') userId: string,
        @Param('roleId', ParseIntPipe) roleId: number,
        @Request() req,
    ) {
        return this.usersService.approveUserRole(userId, roleId, req.user.id);
    }

    @Post(':userId/roles/:roleId/reject')
    @Roles('ADMIN')
    rejectUserRole(
        @Param('userId') userId: string,
        @Param('roleId', ParseIntPipe) roleId: number,
        @Request() req,
    ) {
        return this.usersService.rejectUserRole(userId, roleId, req.user.id);
    }

    @Get('pending/approvals')
    @Roles('ADMIN')
    getPendingApprovals() {
        return this.usersService.getPendingApprovals();
    }
}