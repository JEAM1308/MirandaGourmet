import HeroSection from "./sections/HeroSection";
import CategoriesSection from "./sections/CategoriesSection";

export default function HomePage() {
  return (
    <div className="py-2">
      <HeroSection />
      <CategoriesSection />
    </div>
  );
}
