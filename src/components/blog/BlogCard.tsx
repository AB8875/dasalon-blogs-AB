import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Heading } from "../common/Heading";

interface BlogCardProps {
  cardpath: string;
  imgPath: string;
  type: string;
  time: string;
  heading: string;
  paraOne: string;
  auterName?: string;
}

const BlogCard: FC<BlogCardProps> = ({
  cardpath,
  imgPath,
  type,
  time,
  heading,
  paraOne,
  auterName,
}) => {
  return (
    <Link
      href={cardpath}
      className="group overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative w-full h-[303px] overflow-hidden rounded-t-2xl">
        <Image
          src={imgPath}
          alt={heading || "Blog thumbnail"}
          fill
          priority={false}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="pt-3 pb-4 px-4">
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <Heading as="p" size="xs" className="text-gray-600">
            {type}
          </Heading>
          <div className="flex gap-1 items-center">
            <span className="w-[5px] h-[5px] bg-[#babaab] shrink-0 rounded-full"></span>
            <Heading as="p" size="xs" className="text-gray-600">
              {time}
            </Heading>
          </div>
        </div>

        <Heading
          as="h2"
          size="lg"
          className="line-clamp-2 mb-2 group-hover:text-primary transition-colors"
        >
          {heading}
        </Heading>

        <Heading as="p" size="sm" className="line-clamp-2 mb-2 text-gray-700">
          {paraOne}
        </Heading>

        {auterName && (
          <Heading as="p" size="xs" className="text-gray-500">
            By {auterName}
          </Heading>
        )}
      </div>
    </Link>
  );
};

export default BlogCard;
