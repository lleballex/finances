import Image from "next/image";
import { WelcomeAuth } from "@/features/auth/welcome-auth";
import "./welcome.css";

export default function Home() {
  return (
    <main className="welcome">
      <div className="welcome-brand">
        <h1>Могну</h1>
        <p>Финансы</p>
      </div>
      <Image
        className="welcome-sculpture"
        src="/finance-sculpture-v2.png"
        alt=""
        width={1000}
        height={800}
        sizes="(max-width: 1470px) 68vw, 1000px"
        priority
      />
      <p className="welcome-intro">
        Ваши финансы.
        <br />
        Понятная картина.
      </p>
      <WelcomeAuth />
    </main>
  );
}
