import Link from "next/link";
import Image from "next/image";

import eco1 from "@/public/heroes/farwiza-farhan-elephant.jpeg";
import hero1 from "@/public/heroes/farwiza-farhan.jpg";
import hero2 from "@/public/heroes/Pablo-Garcia-Borboroglu.jpg";
import eco2 from "@/public/heroes/Pablo-Borboroglu-and-penguin.jpg";
import hero3 from "@/public/heroes/augustin-basabose-speaking.jpeg";
import eco3 from "@/public/heroes/augustin-basabose-gorilla.jpg";
import eco4 from "@/public/heroes/Patricia-Medici-tapir-and-baby.webp";
import hero4 from "@/public/heroes/Patricia-Medici.jpg";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center pt-8 pb-12 px-12 sm:px-24  xl:px-36 py-4">
      <h1 className="font-josefin text-3xl text-accent-500 hover:text-accent-500 tracking-tight font-normal text-center">
        English with a Mission
      </h1>
      <h3 className="font-josefin text-xl text-accent-50 hover:text-accent-500 tracking-tight font-normal text-center">
        Choose an environmental hero
      </h3>
      <div className="grid grid-cols-3 auto-rows-[180px] md:grid-cols-6 gap-2 mt-3 mb-8 px-12 py-4">
        <figure className="relative col-span-1">
          <Image
            src={hero1}
            placeholder="blur"
            quality={80}
            className="col-start-1 col-end-2 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Farwiza Farhan"
          />
          <Link href="/hero/farhan">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin text-center h-[24px] pt-[2px] bg-accent-500 hover:bg-accent-600 hover:translate-px hover:-translate-y-[2px] hover:h-[28px] rounded-sm">
              Farwiza Farhan
            </figcaption>
          </Link>
        </figure>
        <figure className="relative col-span-2">
          <Image
            src={eco1}
            placeholder="blur"
            quality={80}
            className="col-span-2 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Elephants"
          />
          <Link href="/hero/farhan">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin font-light h-6 text-center pt-[2px] bg-accent-100 hover:bg-accent-200 hover:translate-px rounded-sm">
              Change is driven from the ground up.
            </figcaption>
          </Link>
        </figure>

        <figure className="relative col-span-2">
          <Image
            src={eco2}
            width="30rem"
            height="30rem"
            // objectFit="cover"
            placeholder="blur"
            quality={80}
            className="col-span-2 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Mountains and forests with two cabins"
          />
          <Link href="/hero/borboroglu">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin font-light h-6 text-center pt-[2px] bg-accent-100 hover:bg-accent-200 hover:translate-px rounded-sm">
              There is still hope for the planet.
            </figcaption>
          </Link>
        </figure>
        <figure className="relative col-span-1">
          <Image
            src={hero2}
            width="100%"
            height="100%"
            // objectFit="cover"
            placeholder="blur"
            quality={80}
            className="col-span-1 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Mountains and forests with two cabins"
          />
          <Link href="/hero/borboroglu">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin text-center pt-[2px] bg-accent-500 hover:bg-accent-600 hover:translate-px rounded-sm">
              Pablo Borboroglu
            </figcaption>
          </Link>
        </figure>

        <figure className="relative col-span-1">
          <Image
            src={hero3}
            placeholder="blur"
            quality={80}
            className="col-span-1 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Mountains and forests with two cabins"
          />
          <Link href="/hero/basabose">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin text-center h-[24px] pt-[2px] bg-accent-500 hover:bg-accent-600 hover:translate-px hover:-translate-y-[2px] hover:h-[28px] rounded-sm">
              Augustin Basabose
            </figcaption>
          </Link>
        </figure>

        <figure className="relative col-span-2">
          <Image
            src={eco3}
            placeholder="blur"
            quality={80}
            className="col-span-2 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Mountains and forests with two cabins"
          />
          <Link href="/hero/basabose">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin font-light h-6 text-center pt-[2px] bg-accent-100 hover:bg-accent-200 hover:translate-px rounded-sm">
              Involving local inhabitants in conservation work.
            </figcaption>
          </Link>
        </figure>
        <figure className="relative col-span-2">
          <Image
            src={eco4}
            width="30rem"
            height="30rem"
            // objectFit="cover"
            placeholder="blur"
            quality={80}
            className="col-span-2 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Mountains and forests with two cabins"
          />
          <Link href="/hero/medici">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin font-light h-6 text-center pt-[2px] bg-accent-100 hover:bg-accent-200 hover:translate-px rounded-sm">
              Tapirs play a crucial ecological role.
            </figcaption>
          </Link>
        </figure>
        <figure className="relative col-span-1">
          <Image
            src={hero4}
            width="100%"
            height="100%"
            // objectFit="cover"
            placeholder="blur"
            quality={80}
            className="col-span-1 w-full h-full object-cover grayscale-0 hover:grayscale-0 hover:ring-1 hover:ring-primary-950"
            alt="Mountains and forests with two cabins"
          />
          <Link href="/hero/medici">
            <figcaption className="relative bottom-6 left-0 text-accent-900  font-josefin text-center h-[24px] pt-[2px] bg-accent-500 hover:bg-accent-600 hover:translate-px hover:-translate-y-[2px] hover:h-[28px] rounded-sm">
              Patricia Medici
            </figcaption>
          </Link>
        </figure>
      </div>

      <div className="relative z-10 text-center"></div>
    </main>
  );
}
