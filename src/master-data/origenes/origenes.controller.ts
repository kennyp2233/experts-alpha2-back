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
import { OrigenesService } from './origenes.service';
import { CreateOrigenDto, UpdateOrigenDto } from './dto/origen.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/origenes')
export class OrigenesController {
    constructor(private readonly origenesService: OrigenesService) { }

    @Get()
    async findAll() {
        return this.origenesService.findAll();
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.origenesService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.origenesService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createOrigenDto: CreateOrigenDto) {
        return this.origenesService.create(createOrigenDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrigenDto: UpdateOrigenDto,
    ) {
        return this.origenesService.update(id, updateOrigenDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.origenesService.remove(id);
    }
}