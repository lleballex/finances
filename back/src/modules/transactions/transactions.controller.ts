import {
  BadRequestException,
  ForbiddenException,
  Body,
  Post,
  Controller,
  Get,
  Query,
  Req,
} from "@nestjs/common";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsBoolean,
  IsUUID,
  Matches,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import type { Request } from "express";
import { DataSource } from "typeorm";
import { AuthService } from "../auth/auth.service";

class TransactionQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @IsOptional() @IsString() @MaxLength(200) search?: string;
  @IsOptional() @IsDateString({ strict: true }) from?: string;
  @IsOptional() @IsDateString({ strict: true }) to?: string;
  @IsOptional() @IsIn(["day", "month"]) grouping: "day" | "month" = "day";
}

class CreateTransactionDto {
  @IsUUID() categoryId!: string;
  @IsString()
  @Matches(/^(?!0+(?:\.0{1,2})?$)\d{1,10}(?:\.\d{1,2})?$/)
  amount!: string;
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  operationDate!: string;
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-01$/)
  accountingPeriod!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isRegular?: boolean;
}

@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly auth: AuthService,
    private readonly db: DataSource,
  ) {}

  @Post()
  async create(@Req() request: Request, @Body() input: CreateTransactionDto) {
    if (request.headers.origin !== process.env.FRONTEND_ORIGIN)
      throw new ForbiddenException();
    const token = request.headers.cookie
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("session="))
      ?.slice(8);
    const user = await this.auth.getUser(token);
    const rows = await this.db.query(
      `INSERT INTO "transaction" (category_id, amount, operation_date, accounting_period, description, is_regular)
      SELECT c.id, CASE WHEN c.type = 'expense' THEN -$3::numeric ELSE $3::numeric END, $4::date, $5::date, $6, COALESCE($7::boolean, c.is_regular)
      FROM category c WHERE c.id = $1 AND c.user_id = $2 RETURNING id`,
      [
        input.categoryId,
        user.id,
        input.amount,
        input.operationDate,
        input.accountingPeriod,
        input.description?.trim() || null,
        input.isRegular ?? null,
      ],
    );
    if (!rows.length) throw new BadRequestException("Категория недоступна");
    return { id: rows[0].id };
  }

  @Get()
  async list(@Req() request: Request, @Query() query: TransactionQuery) {
    const token = request.headers.cookie
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("session="))
      ?.slice(8);
    const user = await this.auth.getUser(token);
    if (query.from && query.to && query.from > query.to)
      throw new BadRequestException("Некорректный период");
    const params: unknown[] = [user.id];
    const where = ["c.user_id = $1"];
    if (query.from) {
      params.push(query.from);
      where.push(`t.operation_date >= $${params.length}::date`);
    }
    if (query.to) {
      params.push(query.to);
      where.push(`t.operation_date <= $${params.length}::date`);
    }
    if (query.search?.trim()) {
      params.push(`%${query.search.trim().replace(/[\\%_]/g, "\\$&")}%`);
      where.push(
        `(c.name ILIKE $${params.length} OR t.description ILIKE $${params.length})`,
      );
    }
    const conditions = where.join(" AND ");
    const groupExpr =
      query.grouping === "month"
        ? "to_char(t.operation_date, 'YYYY-MM')"
        : "to_char(t.operation_date, 'YYYY-MM-DD')";
    const [data, counts, totals] = await Promise.all([
      this.db.query(
        `SELECT t.id, to_char(t.operation_date, 'YYYY-MM-DD') AS date, c.name AS category, c.emoji, c.color, t.amount::text AS amount, t.is_regular AS regular, to_char(t.accounting_period, 'YYYY-MM') AS period FROM "transaction" t JOIN category c ON c.id = t.category_id WHERE ${conditions} ORDER BY t.operation_date DESC, t.created_at DESC, t.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, query.limit, (query.page - 1) * query.limit],
      ),
      this.db.query(
        `SELECT count(*)::int AS total FROM "transaction" t JOIN category c ON c.id = t.category_id WHERE ${conditions}`,
        params,
      ),
      this.db.query(
        `SELECT ${groupExpr} AS key, sum(t.amount)::text AS total FROM "transaction" t JOIN category c ON c.id = t.category_id WHERE ${conditions} GROUP BY 1`,
        params,
      ),
    ]);
    return {
      data,
      meta: { page: query.page, limit: query.limit, total: counts[0].total },
      groupTotals: Object.fromEntries(
        totals.map((row: { key: string; total: string }) => [
          row.key,
          row.total,
        ]),
      ),
    };
  }
}
