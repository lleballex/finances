import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "./modules/users/user.entity";
import { CreateUser1730000000000 } from "./migrations/1730000000000-CreateUser";

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User],
  migrations: [CreateUser1730000000000],
  synchronize: false,
});
export default dataSource;
