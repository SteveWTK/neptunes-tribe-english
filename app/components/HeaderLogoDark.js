import Image from "next/image";
import Link from "next/link";
// import logo from "@/public/neptunes-tribe-logo-nbg.png";
import logoL from "@/public/logos/neptunes-tribe-logo-nbg-l.png";
import logoC from "@/public/logos/neptunes-tribe-logo-wbc.png";

export default function HeaderLogoDark() {
  return (
    <div className="relative">
      <Link href="/" className="flex items-center gap-4 z-10">
        {/* <Image
          src={logoC}
          height="auto"
          width="140"
          quality={100}
          alt="Neptune's Tribe logo"
          className="lg:hidden"
        /> */}
        <Image
          src={logoL}
          height="auto"
          width="140"
          quality={100}
          alt="Neptune's Tribe logo"
          // className="hidden lg:block"
        />
      </Link>
    </div>
  );
}
