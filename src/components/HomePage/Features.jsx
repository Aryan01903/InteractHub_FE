import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/free-mode"; // Import free-mode CSS
import { Autoplay, FreeMode } from "swiper/modules";

export default function Features() {
    return (
        <Swiper
            spaceBetween={20}
            slidesPerView={3}
            loop={true}
            speed={10000}
            freeMode={true}
            autoplay={{
                delay: 0,
                disableOnInteraction: false,
            }}
            modules={[Autoplay, FreeMode]}
            breakpoints={{
                // When screen width is <= 640px (mobile)
                320: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                },
                // When screen width is <= 768px (tablet)
                768: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                },
                // When screen width is <= 1024px (desktop)
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
            }}
            className="w-full"
        >
            <SwiperSlide className="border-2 border-black rounded-2xl">
                <img
                    src="/Home1.webp"
                    alt="Background"
                    className="object-cover w-full min-h-[200px] rounded-2xl"
                    loading="lazy"
                />
            </SwiperSlide>
            <SwiperSlide className="border-2 border-black rounded-2xl">
                <img
                    src="/Home2.webp"
                    alt="Background"
                    className="object-cover w-full min-h-[200px] rounded-2xl"
                    loading="lazy"
                />
            </SwiperSlide>
            <SwiperSlide className="border-2 border-black rounded-2xl">
                <img
                    src="/Home3.webp"
                    alt="Background"
                    className="object-cover w-full min-h-[200px] rounded-2xl"
                    loading="lazy"
                />
            </SwiperSlide>
            <SwiperSlide className="border-2 border-black rounded-2xl">
                <img
                    src="/Home4.webp"
                    alt="Background"
                    className="object-cover w-full min-h-[200px] rounded-2xl"
                    loading="lazy"
                />
            </SwiperSlide>
            <SwiperSlide className="border-2 border-black rounded-2xl">
                <img
                    src="/Home5.webp"
                    alt="Background"
                    className="object-cover w-full min-h-[200px] rounded-2xl"
                    loading="lazy"
                />
            </SwiperSlide>
        </Swiper>
    );
}