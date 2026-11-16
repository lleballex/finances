import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";

type YandexProfile = {
  id: string;
  default_email?: string;
  first_name?: string;
  last_name?: string;
  default_avatar_id?: string;
  is_avatar_empty?: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async signIn(code: string): Promise<string> {
    const response = await fetch("https://oauth.yandex.ru/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.YANDEX_CLIENT_ID!,
        client_secret: process.env.YANDEX_CLIENT_SECRET!,
        redirect_uri: process.env.YANDEX_REDIRECT_URI!,
      }),
    });
    if (!response.ok)
      throw new UnauthorizedException(
        "Не удалось подтвердить вход через Яндекс",
      );
    const token = (await response.json()) as { access_token?: string };
    if (!token.access_token) throw new UnauthorizedException();
    const profileResponse = await fetch(
      "https://login.yandex.ru/info?format=json",
      { headers: { Authorization: `OAuth ${token.access_token}` } },
    );
    if (!profileResponse.ok) throw new UnauthorizedException();
    const profile = (await profileResponse.json()) as YandexProfile;
    if (typeof profile.id !== "string" || !profile.id)
      throw new UnauthorizedException();
    const avatarUrl =
      profile.default_avatar_id && !profile.is_avatar_empty
        ? `https://avatars.yandex.net/get-yapic/${encodeURIComponent(profile.default_avatar_id)}/islands-200`
        : null;
    await this.users.upsert(
      {
        yandexId: profile.id,
        email: profile.default_email ?? null,
        firstName: profile.first_name ?? null,
        lastName: profile.last_name ?? null,
        avatarUrl,
      },
      ["yandexId"],
    );
    const user = await this.users.findOneByOrFail({ yandexId: profile.id });
    return this.jwt.signAsync({ sub: user.id });
  }

  async getUser(token: string | undefined) {
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.users.findOneBy({ id: payload.sub });
      if (!user) throw new UnauthorizedException();
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
