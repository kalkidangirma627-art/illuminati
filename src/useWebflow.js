import { useEffect } from 'react';

export default function useWebflow() {
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    const init = async () => {
      if (!window.jQuery) {
        await loadScript("https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js");
      }
      
      // Inject Webflow attributes
      document.documentElement.setAttribute('data-wf-domain', 'lumosine.webflow.io');
      document.documentElement.setAttribute('data-wf-page', '68c276a8cb47ae57b08b3413');
      document.documentElement.setAttribute('data-wf-site', '68c276a7cb47ae57b08b33d1');
      document.documentElement.classList.add('w-mod-js');
      if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
          document.documentElement.classList.add('w-mod-touch');
      }

      // Load Webflow JS so it parses the DOM
      if (!window.Webflow) {
        await loadScript("https://cdn.prod.website-files.com/68c276a7cb47ae57b08b33d1/js/webflow.3bb993f4.4475b2bc7fcb4dad.js");
      } else {
        window.Webflow.destroy();
        window.Webflow.ready();
        window.Webflow.require('ix2').init();
      }

      // Load lenis and GSAP
      if (!window.Lenis) {
        await loadScript("https://unpkg.com/lenis@1.1.14/dist/lenis.min.js");
      }
      if (!window.gsap) {
        await loadScript("https://cdn.prod.website-files.com/gsap/3.15.0/gsap.min.js");
        await loadScript("https://cdn.prod.website-files.com/gsap/3.15.0/ScrollTrigger.min.js");
      }

      // Initialize Lenis
      if (window.Lenis && !window.lenisInstance) {
          const lenis = new window.Lenis({
              duration: 1.2,
              wheelMultiplier: 1,
              touchMultiplier: 1,
          });
          window.lenisInstance = lenis;
          function raf(time) {
              lenis.raf(time);
              requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
      }

      // Initialize custom GSAP
      if (window.gsap && window.ScrollTrigger) {
        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        
        ScrollTrigger.matchMedia({
          "(max-width: 479px)": function() {
            gsap.to(".circle-mask", { clipPath: "circle(45em at 50% 50%)", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "80% bottom", scrub: true } });
            gsap.to(".circle-mask-dark", { clipPath: "circle(45em at 50% 50%)", scrollTrigger: { trigger: ".info-section", start: "top top", end: "80% bottom", scrub: true } });
          },
          "(min-width: 768px)": function() {
            gsap.to(".circle-mask", { clipPath: "circle(85em at 50% 50%)", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "80% bottom", scrub: true } });
            gsap.to(".circle-mask-dark", { clipPath: "circle(85em at 50% 50%)", scrollTrigger: { trigger: ".info-section", start: "top top", end: "50% bottom", scrub: true } });
          }
        });
      }
    };

    init();
  }, []);
}
