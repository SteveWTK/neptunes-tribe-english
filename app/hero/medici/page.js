import eco4 from "@/public/heroes/Patricia-Medici-tapir-and-baby.webp";
import Image from "next/image";

export default function page() {
  return (
    <main className="flex flex-col m-12">
      <div className="flex flex-col lg:grid lg:grid-cols-3">
        <Image
          src={eco4}
          placeholder="blur"
          quality={80}
          className="col-span-2 w-full h-48 sm:h-96 object-cover object-[50%_50%] border-2 rounded-lg
         border-accent-100 hover:ring-1 hover:ring-primary-950"
          alt="Farwiza Farhan"
        />
        <div className="flex flex-col gap-3">
          <h1 className="font-orbitron font-bold text-center lg:text-left text-4xl text-accent-300 mx-3">
            Patricia Medici
          </h1>
          <h2 className="font-orbitron font-bold text-center lg:text-left text-xl text-accent-100 mx-3">
            Tapirs play a crucial ecological role
          </h2>
          <p className="font-orbitron font-light text-sm text-accent-50 mx-3">
            Patricia Medici had an unconventional childhood in the Atlantic
            coastal forest of southeast Brazil, a long way from the nearest
            town. After she graduated in Forestry, in 1996, she decided to
            dedicate herself to the study and protection of tapirs, the largest
            land mammals of South America.
          </p>
        </div>
      </div>
    </main>
  );
}
