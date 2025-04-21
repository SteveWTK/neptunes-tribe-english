import eco2 from "@/public/heroes/Pablo-Borboroglu-and-penguin.jpg";
import Image from "next/image";

export default function page() {
  return (
    <main className="flex flex-col m-12">
      <div className="flex flex-col lg:grid lg:grid-cols-3">
        <Image
          src={eco2}
          placeholder="blur"
          quality={80}
          className="col-span-2 w-full h-48 sm:h-96 object-cover object-[50%_18%] border-2 rounded-lg
         border-accent-100 hover:ring-1 hover:ring-primary-950"
          alt="Pablo Borboroglu and penguin"
        />
        <div className="flex flex-col gap-3">
          <h1 className="font-orbitron font-bold text-center lg:text-left text-4xl text-accent-300 mx-3">
            Pablo Borboroglu
          </h1>
          <h2 className="font-orbitron font-bold text-center lg:text-left text-xl text-accent-100 mx-3">
            There is still hope for the planet, but only if we all change.
          </h2>
          <p className="font-orbitron font-light text-sm text-accent-50 mx-3">
            When Pablo Borboroglu saw the damage caused to penguins by human
            activities, he refocused his career. At that time, 40,000 penguins a
            year were being killed in Argentinian Patagonia by oil spills.
          </p>
        </div>
      </div>
    </main>
  );
}
