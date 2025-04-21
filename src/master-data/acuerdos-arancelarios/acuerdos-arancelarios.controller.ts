// src/master-data/acuerdos-arancelarios/acuerdos-arancelarios.controller.ts
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
import { AcuerdosArancelariosService } from './acuerdos-arancelarios.service';
import { CreateAcuerdoArancelarioDto, UpdateAcuerdoArancelarioDto } from './dto/acuerdo-arancelario.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/acuerdos-arancelarios')
export class AcuerdosArancelariosController {
    constructor(private readonly acuerdosArancelariosService: AcuerdosArancelariosService) { }

    @Get()
    async findAll() {
        return this.acuerdosArancelariosService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.acuerdosArancelariosService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createAcuerdoArancelarioDto: CreateAcuerdoArancelarioDto) {
        return this.acuerdosArancelariosService.create(createAcuerdoArancelarioDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAcuerdoArancelarioDto: UpdateAcuerdoArancelarioDto,
    ) {
        return this.acuerdosArancelariosService.update(id, updateAcuerdoArancelarioDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.acuerdosArancelariosService.remove(id);
    }
}

