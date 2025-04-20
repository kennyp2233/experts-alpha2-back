import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Request
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @Roles('ADMIN')
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateRoleDto
    ) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.remove(id);
    }

    @Post('assign')
    @Roles('ADMIN')
    assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
        return this.rolesService.assignRoleToUser(
            assignRoleDto.userId,
            assignRoleDto.roleId,
            assignRoleDto.metadata
        );
    }

    @Get('user/:userId')
    getUserRoles(@Param('userId') userId: string, @Request() req) {
        // Si no es admin, solo puede ver sus propios roles
        if (!req.user.roles.some(r => r.nombre === 'ADMIN') && req.user.id !== userId) {
            return this.rolesService.getUserRoles(req.user.id);
        }
        return this.rolesService.getUserRoles(userId);
    }

    @Get(':id/users')
    @Roles('ADMIN')
    getRoleUsers(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.getRoleUsers(id);
    }
}