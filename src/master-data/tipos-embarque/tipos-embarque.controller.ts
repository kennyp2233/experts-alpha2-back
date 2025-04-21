// src/master-data/tipos-embarque/tipos-embarque.controller.ts
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
import { TiposEmbarqueService } from './tipos-embarque.service';
import { CreateTipoEmbarqueDto, UpdateTipoEmbarqueDto } from './dto/tipo-embarque.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/tipos-embarque')
export class TiposEmbarqueController {
    constructor(private readonly tiposEmbarqueService: TiposEmbarqueService) { }

    @Get()
    async findAll() {
        return this.tiposEmbarqueService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tiposEmbarqueService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createTipoEmbarqueDto: CreateTipoEmbarqueDto) {
        return this.tiposEmbarqueService.create(createTipoEmbarqueDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTipoEmbarqueDto: UpdateTipoEmbarqueDto,
    ) {
        return this.tiposEmbarqueService.update(id, updateTipoEmbarqueDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.tiposEmbarqueService.remove(id);
    }
}