// src/master-data/cae-aduanas/cae-aduanas.controller.ts
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
import { CaeAduanasService } from './cae-aduanas.service';
import { CreateCaeAduanaDto, UpdateCaeAduanaDto } from './dto/cae-aduana.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/cae-aduanas')
export class CaeAduanasController {
    constructor(private readonly caeAduanasService: CaeAduanasService) { }

    @Get()
    async findAll() {
        return this.caeAduanasService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.caeAduanasService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createCaeAduanaDto: CreateCaeAduanaDto) {
        return this.caeAduanasService.create(createCaeAduanaDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCaeAduanaDto: UpdateCaeAduanaDto,
    ) {
        return this.caeAduanasService.update(id, updateCaeAduanaDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.caeAduanasService.remove(id);
    }
}