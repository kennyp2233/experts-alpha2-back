// src/master-data/bodegueros/bodegueros.controller.ts
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
import { BodeguerosService } from './bodegueros.service';
import { CreateBodegueroDto, UpdateBodegueroDto } from './dto/bodeguero.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/bodegueros')
export class BodeguerosController {
    constructor(private readonly bodeguerosService: BodeguerosService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.bodeguerosService.findAll(includeInactive === true);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bodeguerosService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createBodegueroDto: CreateBodegueroDto) {
        return this.bodeguerosService.create(createBodegueroDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBodegueroDto: UpdateBodegueroDto,
    ) {
        return this.bodeguerosService.update(id, updateBodegueroDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.bodeguerosService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.bodeguerosService.restore(id);
    }
}