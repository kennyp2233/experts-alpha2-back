import { Controller, Post, Body, Get, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterFarmDto } from './dto/register-farm.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { AllowPending } from './decorators/allow-pending.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register/client')
    async registerClient(@Body(ValidationPipe) registerDto: RegisterClientDto) {
        return this.authService.registerClient(registerDto);
    }

    @Public()
    @Post('register/farm')
    async registerFarm(@Body(ValidationPipe) registerDto: RegisterFarmDto) {
        return this.authService.registerFarm(registerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @AllowPending()  // Permitimos que usuarios con roles pendientes vean su perfil
    getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }
}