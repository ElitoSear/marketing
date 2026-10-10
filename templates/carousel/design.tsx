import { defineCarousel } from "@elitosear/marketing/features/carousel/carousel-definition";
import {
  CarouselCanvas,
  CarouselSlide,
} from "@elitosear/marketing/features/carousel/carousel-frame";
import "../../styles.css";
import { copySchema, type Copy } from "./design/copy-schema.ts";

function Design(props: { copy: Copy }) {
  return (
    <CarouselCanvas slideCount={props.copy.slides.length} className="bg-white">
      {props.copy.slides.map((slide, slideIndex) => (
        <CarouselSlide
          key={slide.title}
          slideIndex={slideIndex}
          className="flex flex-col justify-end gap-8 p-20"
        >
          <h1 className="text-[110px] leading-none font-bold">{slide.title}</h1>
          <p className="text-[44px] leading-snug">{slide.body}</p>
        </CarouselSlide>
      ))}
    </CarouselCanvas>
  );
}

export default defineCarousel({ slideCount: 3, copySchema, Design });
