import Link from "next/link";
import React, { FC } from "react";
import { herovideoData } from "../helper/Helper";

const HeroVideo: FC = () => {
  if (!herovideoData?.length) return null;

  return (
    <div className="pt-8 ml-8 w-[300px] h-[313.5px]">
      {herovideoData.map((item, index) => (
        <Link key={index} href={item.path} className="group block">
          <video
            className="w-[300px] h-[313.5px] object-cover relative z-[2] transition-transform duration-200 group-hover:scale-[1.02]"
            muted
            autoPlay
            loop
            playsInline
            src={item.videoURL}
          />
          {/* Overlay */}
          <div className="relative w-[300px] h-[350px] bg-black ml-4 -mt-[290px] flex justify-center items-end group-hover:scale-[1.02]">
            <h1 className="text-3xl text-white ff-jost font-bold tracking-widest m-3">
              {item.title}
            </h1>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HeroVideo;
