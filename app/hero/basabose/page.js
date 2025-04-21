import { PlayIcon } from "@heroicons/react/24/solid";

import eco3 from "@/public/heroes/augustin-basabose-gorilla-and-baby.jpg";
import hero3 from "@/public/heroes/augustin-basabose-speaking.jpeg";
import Image from "next/image";

export default function page() {
  return (
    <main className="flex flex-col mx-20 my-12">
      <div className="flex flex-col lg:grid lg:grid-cols-6">
        <Image
          src={eco3}
          placeholder="blur"
          quality={80}
          className="col-span-4 w-full h-48 sm:h-96 object-cover object-[50%_12%] border-2 rounded-lg
         border-accent-100 hover:ring-1 hover:ring-primary-950"
          alt="Gorilla and baby"
        />
        <div className="col-span-2 flex flex-col gap-3 ml-3">
          <h1 className="font-orbitron font-bold text-center lg:text-left text-2xl sm:text3xl md:text-4xl lg:text-4xl text-accent-300 mx-3">
            Augustin Basabose
          </h1>
          <h2 className="font-orbitron font-bold text-center lg:text-left text-lg lg:text-xl text-accent-100 mx-3">
            The importance of involving local inhabitants in conservation work.
          </h2>
          <p className="font-orbitron font-light text-left text-sm text-accent-50 mx-3">
            Augustin Basabose’s passion for nature began before he was five
            years old. His grandmother’s stories about animals made him decide
            at an early age that he wanted to dedicate his life to protecting
            nature.
          </p>
          <div className="col-span-2 grid grid-cols-2">
            <div className="mx-3 col-span-2 flex flex-row flex-wrap lg:flex-col gap-4 align-middle justify-center font-orbitron">
              <button className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
                Gap Fill
              </button>
              <button className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
                Full Text
              </button>

              <button className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
                Translation
              </button>
              <button className="flex gap-2 bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
                <PlayIcon className="h-5 w-5 text-center text-accent-900" />
                <span>Play Audio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 border-solid border-1 border-accent-50 mt-4">
        <p className="col-span-6 lg:col-span-4 font-orbitron font-light text-md text-accent-50 bg-primary-900 p-4 border-solid rounded-lg border-accent-50">
          Augustin Basabose’s passion ______ nature began before he was five
          years ______. His grandmother’s stories about animals made him decide
          ______ an early age that he wanted to ______ his life to protecting
          nature. After obtaining a PhD in Zoology from Kyoto University, he
          returned to Africa. ______ he was introduced to a Grauer’s gorilla in
          Kahuzi-Biega National Park, he felt that he had found his life’s
          ______. This region, in the east of the Democratic Republic of the
          Congo, ______ of mountainous forests, and is one of Africa’s most
          ecologically diverse areas. However, deforestation had ______ to a
          decline of almost 60% ______ the population of Grauer’s gorillas. Dr
          Basabose understood the importance of ______ the local inhabitants in
          conservation work, providing a sustainable economy for them ______
          restoring and protecting the forest. ______ ten years, over 61,000
          seedlings from seven plant species have been ______ , and the number
          of gorillas has almost doubled. Meanwhile, ______ has been increased
          to protect the area ______ mining activities, poachers, and armed
          groups.
        </p>
        {/* <div className="mx-3 col-span-1 flex flex-col gap-4 align-middle justify-center font-orbitron">
          <button className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
            Gap Fill
          </button>
          <button className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
            Full Text
          </button>

          <button className="flex gap-2 bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
            <PlayIcon className="h-5 w-5 text-accent-900" />
            <span>Play Audio</span>
          </button>
          <button className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40">
            Translation
          </button>
        </div> */}
      </div>
    </main>
  );
}
