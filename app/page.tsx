/* SPEC 01 — Landing: las secciones se añaden en los pasos 3–8. */

import Hero from "./components/Hero";
import About from "./components/About";
import Stack from "./components/Stack";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Services from "./components/Services";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import ScrollAnimations from "./components/ScrollAnimations";

export default function Home() {
  return (
    <div className="flex flex-col w-full selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Hero />
      <About />
      <Stack />
      <Experience />
      <Projects />
      <Services />
      <Blog />
      <Contact />
      <ScrollAnimations />
    </div>
  );
}
