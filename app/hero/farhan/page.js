import eco1 from "@/public/heroes/farwiza-farhan-with-elephant.jpeg";
import Image from "next/image";

export default function page() {
  return (
    <main className="flex flex-col m-12">
      <div className="flex flex-col lg:grid lg:grid-cols-3">
        <Image
          src={eco1}
          placeholder="blur"
          quality={80}
          className="col-span-2 w-full h-48 sm:h-96 object-cover object-[50%_10%] border-2 rounded-lg
         border-accent-100 hover:ring-1 hover:ring-primary-950"
          alt="Farwiza Farhan"
        />
        <div className="flex flex-col gap-3">
          <h1 className="font-orbitron font-bold text-center lg:text-left text-4xl text-accent-300 mx-3">
            Farwiza Farhan
          </h1>
          <h2 className="font-orbitron font-bold text-center lg:text-left text-xl text-accent-100 mx-3">
            Change is driven from the ground up
          </h2>
          <p className="font-orbitron font-light text-sm text-accent-50 mx-3">
            Since 2011 Farwiza Farhan has been working for a government agency
            that manages the Leuser Ecosystem in Sumatra. This is the last known
            place where tigers, orangutans, rhinoceros and elephants are still
            found in the wild. However, it is threatened by deforestation,
            because of large-scale projects for timber and palm oil.
          </p>
        </div>
      </div>
    </main>
  );
}
