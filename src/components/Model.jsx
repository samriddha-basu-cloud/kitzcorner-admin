// import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Scene from "./Scene";

export default function Model() {
  useGSAP(() => {
    gsap.fromTo(
      "#welcome",
      {
        opacity: 0,
        scale: 0.8,
        y: 50,
      },
      {
        opacity: 0.5,
        scale: 1.3,
        y: 0,
        duration: 2,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <section className="mt-2 pt-2 bg-[#111827] h-screen overflow-hidden relative">
      <div className="screen-max-width">
        {/* Welcome text positioned behind model */}
        <div
          id="welcome"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 tracking-[50px]
                     text-center text-[150px] font-bold text-white "
          style={{
            textShadow:
              "0 0 6px #66ccff, 0 0 20px #66ccff, 0 0 30px #66ccff, 0 0 40px #0099ff, 0 0 70px #0099ff",
          }}
        >
          Amigos
        </div>

        {/* Model container with higher z-index */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-full h-[75vh] overflow-visible">
            <Scene />
          </div>
        </div>
      </div>
    </section>
  );
}