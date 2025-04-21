// src/master-data/tipos-embarque/tipos-carga/tipos-carga.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TiposCargaService } from './tipos-carga.service';
import { CreateTipoCargaDto, UpdateTipoCargaDto } from './dto/tipo-carga.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('datos-maestros/tipos-carga')
export class TiposCargaController {
    constructor(private readonly tiposCargaService: TiposCargaService) { }

    @Get()
    async findAll() {
        return this.tiposCargaService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tiposCargaService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createTipoCargaDto: CreateTipoCargaDto) {
        return this.tiposCargaService.create(createTipoCargaDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTipoCargaDto: UpdateTipoCargaDto,
    ) {
        return this.tiposCargaService.update(id, updateTipoCargaDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.tiposCargaService.remove(id);
    }
}
