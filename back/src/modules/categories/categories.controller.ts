import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  ConflictException,
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
    return this.db.transaction(async (db) => {
      await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
        user.id,
      ]);
      const rows = await db.query(
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
    });
  }
  @Put(":id")
  async update(
    @Req() request: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: CreateCategoryDto,
  ) {
    if (request.headers.origin !== process.env.FRONTEND_ORIGIN)
      throw new ForbiddenException();
    const user = await this.user(request);
    const name = input.name.trim();
    if (!name || !input.emoji.trim()) throw new BadRequestException();
    return this.db.transaction(async (db) => {
      await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
        user.id,
      ]);
      const rows = await db.query(
        "SELECT id, type FROM category WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [id, user.id],
      );
      if (!rows.length) throw new NotFoundException();
      const children = await db.query(
        "SELECT id FROM category WHERE parent_id = $1 AND user_id = $2",
        [id, user.id],
      );
      if (input.parentId) {
        const parents = await db.query(
          "SELECT id FROM category WHERE id = $1 AND user_id = $2 AND type = $3 AND parent_id IS NULL AND id <> $4",
          [input.parentId, user.id, input.type, id],
        );
        if (!parents.length || children.length)
          throw new BadRequestException("Родительская категория недоступна");
      }
      if (rows[0].type !== input.type) {
        const used = await db.query(
          'SELECT 1 FROM "transaction" WHERE category_id = ANY($1::uuid[]) LIMIT 1',
          [[id, ...children.map((child: { id: string }) => child.id)]],
        );
        if (used.length)
          throw new ConflictException(
            "Нельзя изменить тип категории, используемой в транзакциях",
          );
        await db.query(
          "UPDATE category SET type = $1, updated_at = now() WHERE parent_id = $2",
          [input.type, id],
        );
      }
      await db.query(
        "UPDATE category SET name = $1, type = $2, is_regular = $3, parent_id = $4, emoji = $5, color = $6, updated_at = now() WHERE id = $7 AND user_id = $8",
        [
          name,
          input.type,
          input.isRegular,
          input.parentId ?? null,
          input.emoji,
          input.color,
          id,
          user.id,
        ],
      );
      return { id };
    });
  }

  @Delete(":id")
  async remove(
    @Req() request: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    if (request.headers.origin !== process.env.FRONTEND_ORIGIN)
      throw new ForbiddenException();
    const user = await this.user(request);
    return this.db.transaction(async (db) => {
      await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
        user.id,
      ]);
      const rows = await db.query(
        "SELECT id FROM category WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [id, user.id],
      );
      if (!rows.length) throw new NotFoundException();
      const children = await db.query(
        "SELECT 1 FROM category WHERE parent_id = $1 LIMIT 1",
        [id],
      );
      if (children.length)
        throw new ConflictException("Сначала удалите подкатегории");
      const used = await db.query(
        'SELECT 1 FROM "transaction" WHERE category_id = $1 LIMIT 1',
        [id],
      );
      if (used.length)
        throw new ConflictException("Категорию с транзакциями нельзя удалить");
      await db.query("DELETE FROM category WHERE id = $1 AND user_id = $2", [
        id,
        user.id,
      ]);
      return { id };
    });
  }
}
