import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response, CookieOptions } from "express";
import { AuthService } from "./auth.service";

const cookie = (request: Request, name: string) =>
  request.headers.cookie
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1];
const options: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
};

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get("yandex")
  start(@Res() response: Response) {
    const state = randomBytes(32).toString("hex");
    response.cookie("oauth_state", state, {
      ...options,
      maxAge: 10 * 60 * 1000,
    });
    const query = new URLSearchParams({
      response_type: "code",
      client_id: process.env.YANDEX_CLIENT_ID!,
      redirect_uri: process.env.YANDEX_REDIRECT_URI!,
      state,
    });
    response.redirect(`https://oauth.yandex.ru/authorize?${query}`);
  }

  @Get("yandex/callback")
  async callback(@Req() request: Request, @Res() response: Response) {
    const state = request.query.state;
    const code = request.query.code;
    const saved = cookie(request, "oauth_state");
    response.clearCookie("oauth_state", options);
    if (
      typeof state !== "string" ||
      !/^[a-f0-9]{64}$/.test(state) ||
      typeof code !== "string" ||
      !saved ||
      state.length !== saved.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(saved))
    )
      throw new UnauthorizedException();
    const token = await this.auth.signIn(code);
    response.cookie("session", token, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    response.redirect(`${process.env.FRONTEND_ORIGIN}/dashboard`);
  }

  @Get("me")
  me(@Req() request: Request) {
    return this.auth.getUser(cookie(request, "session"));
  }

  @Post("logout")
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.headers.origin !== process.env.FRONTEND_ORIGIN)
      throw new ForbiddenException();
    response.clearCookie("session", options);
    return { ok: true };
  }
}
