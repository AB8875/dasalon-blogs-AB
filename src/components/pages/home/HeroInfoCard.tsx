// src/components/hero/HeroInfoCrd.tsx
import React, { FC } from "react";
import { Heading } from "@/components/common/Heading";

interface HeroInfoCradProps {
  type: string;
  date: string;
  heading: string;
  // canonical prop
  description?: string;
  // optional legacy props used across the old repo
  CardDivClass?: string;
  typeClass?: string;
  dateClass?: string;
  headingClass?: string;
  // legacy misspelled prop from old code — keep supported to avoid breaking usage
  Discription?: string;
}

const HeroInfoCard: FC<HeroInfoCradProps> = ({
  type,
  date,
  heading,
  description,
  CardDivClass,
  typeClass,
  dateClass,
  headingClass,
  Discription,
}) => {
  // prefer `description`, fallback to legacy `Discription`
  const desc = description ?? Discription ?? "";

  return (
    <div
      className={CardDivClass ?? "mx-auto bg-[#E5E3DB] p-6 z-10 max-w-[846px]"}
    >
      <div
        className={`flex items-center gap-2.5 mb-2 text-sm text-[#444] font-medium ${
          typeClass ?? ""
        }`}
      >
        <span className="text-[#111]">{type}</span>
        <span className="w-[5px] h-[5px] bg-[#babaab]" />
        <span className={dateClass ?? ""}>{date}</span>
      </div>

      <Heading
        as="h2"
        size="text-28px"
        className={`${headingClass ?? "text-[#111] mb-2 ff-jost line-clamp-2"}`}
      >
        {heading}
      </Heading>

      <p className="text-base text-[#444] line-clamp-2">{desc}</p>
    </div>
  );
};

export default HeroInfoCard;
