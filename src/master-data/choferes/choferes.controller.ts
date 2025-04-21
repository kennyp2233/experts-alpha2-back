
// src/master-data/choferes/choferes.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ChoferesService } from './choferes.service';
import { CreateChoferDto, UpdateChoferDto } from './dto/chofer.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/choferes')
export class ChoferesController {
    constructor(private readonly choferesService: ChoferesService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.choferesService.findAll(includeInactive === true);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.choferesService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createChoferDto: CreateChoferDto) {
        return this.choferesService.create(createChoferDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateChoferDto: UpdateChoferDto,
    ) {
        return this.choferesService.update(id, updateChoferDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.choferesService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.choferesService.restore(id);
    }
}