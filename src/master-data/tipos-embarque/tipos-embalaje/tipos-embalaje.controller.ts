// src/master-data/tipos-embarque/tipos-embalaje/tipos-embalaje.controller.ts
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
import { TiposEmbalajeService } from './tipos-embalaje.service';
import { CreateTipoEmbalajeDto, UpdateTipoEmbalajeDto } from './dto/tipo-embalaje.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('datos-maestros/tipos-embalaje')
export class TiposEmbalajeController {
    constructor(private readonly tiposEmbalajeService: TiposEmbalajeService) { }

    @Get()
    async findAll() {
        return this.tiposEmbalajeService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tiposEmbalajeService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createTipoEmbalajeDto: CreateTipoEmbalajeDto) {
        return this.tiposEmbalajeService.create(createTipoEmbalajeDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTipoEmbalajeDto: UpdateTipoEmbalajeDto,
    ) {
        return this.tiposEmbalajeService.update(id, updateTipoEmbalajeDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.tiposEmbalajeService.remove(id);
    }
}