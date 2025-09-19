// src/components/hero/HeroInfoCrd.tsx
import { FC } from "react";
import { Heading } from "@/components/common/Heading";

interface HeroInfoCradProps {
  type: string;
  date: string;
  heading: string;
  description: string;
}

const HeroInfoCard: FC<HeroInfoCradProps> = ({
  type,
  date,
  heading,
  description,
}) => {
  return (
    <div className="mx-auto bg-[#E5E3DB] p-6 z-10 max-w-[846px]">
      <div className="flex items-center gap-2.5 mb-2 text-sm text-[#444] font-medium">
        <span className="text-[#111]">{type}</span>
        <span className="w-[5px] h-[5px] bg-[#babaab]" />
        <span>{date}</span>
      </div>

      <Heading
        as="h2"
        size="text-28px"
        className="text-[#111] mb-2 ff-jost line-clamp-2"
      >
        {heading}
      </Heading>

      <p className="text-base text-[#444] line-clamp-2">{description}</p>
    </div>
  );
};

export default HeroInfoCard;
