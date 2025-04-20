// src/roles/dto/assign-role.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}