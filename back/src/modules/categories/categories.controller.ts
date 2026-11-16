import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
} from "@nestjs/common";
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import type { Request } from "express";
import { DataSource } from "typeorm";
import { AuthService } from "../auth/auth.service";

class CreateCategoryDto {
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsIn(["income", "expense"]) type!: "income" | "expense";
  @IsBoolean() isRegular!: boolean;
  @IsOptional() @IsUUID() parentId?: string;
  @IsString() @MinLength(1) @MaxLength(32) emoji!: string;
  @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) color!: string;
}

@Controller("categories")
export class CategoriesController {
  constructor(
    private readonly auth: AuthService,
    private readonly db: DataSource,
  ) {}
  private async user(request: Request) {
    const token = request.headers.cookie
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("session="))
      ?.slice(8);
    return this.auth.getUser(token);
  }
  @Get()
  async list(@Req() request: Request) {
    const user = await this.user(request);
    return this.db.query(
      'SELECT id, name, type, emoji, color, is_regular AS "isRegular", parent_id AS "parentId" FROM category WHERE user_id = $1 ORDER BY type, name, id',
      [user.id],
    );
  }
  @Post()
  async create(@Req() request: Request, @Body() input: CreateCategoryDto) {
    if (request.headers.origin !== process.env.FRONTEND_ORIGIN)
      throw new ForbiddenException();
    const user = await this.user(request);
    const name = input.name.trim();
    if (!name || !input.emoji.trim()) throw new BadRequestException();
    const rows = await this.db.query(
      `INSERT INTO category (user_id, name, type, is_regular, parent_id, emoji, color)
      SELECT $1, $2, $3, $4, $5, $6, $7 WHERE $5::uuid IS NULL OR EXISTS (SELECT 1 FROM category p WHERE p.id = $5 AND p.user_id = $1 AND p.type = $3 AND p.parent_id IS NULL) RETURNING id`,
      [
        user.id,
        name,
        input.type,
        input.isRegular,
        input.parentId ?? null,
        input.emoji,
        input.color,
      ],
    );
    if (!rows.length)
      throw new BadRequestException("Родительская категория недоступна");
    return { id: rows[0].id };
  }
}
