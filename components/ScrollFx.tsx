'use client';

import { useEffect } from 'react';

/**
 * GSAP + ScrollTrigger entrance animations.
 * Runs once on mount after sections are in the DOM.
 *
 * NOTE: feature-grid cards are NOT animated here — the grid re-mounts on
 * every chip filter, which would leave stale ScrollTriggers behind.
 * Card reveals live in FeaturesSection, keyed by the active filter.
 */
export default function ScrollFx() {
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (cancelled || matchMedia('(prefers-reduced-motion: reduce)').matches)
          return;
        gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Hero section animations (clearProps so content can never get stuck hidden)
        gsap.from('.hv .ch s', {
          scaleY: 0,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.6,
          ease: 'elastic.out(1, 0.6)',
          clearProps: 'transform',
        });
        gsap.from('#hero .r', {
          autoAlpha: 0,
          y: 32,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform',
        });
        gsap.from('.hv .sb b, .hv .sb u', {
          autoAlpha: 0,
          scale: 0.5,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.3,
          ease: 'back.out(1.7)',
          clearProps: 'opacity,visibility,transform',
        });

        // Section reveal animations (.ck excluded — checkmarks have
        // dedicated scoped tweens below; double gsap.from would fight).
        document.querySelectorAll<HTMLElement>('.rv:not(.ck)').forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 24,
            duration: 0.8,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            ease: 'power2.out',
            clearProps: 'opacity,visibility,transform',
          });
        });

        // Ecosystem map animations (bezier edges)
        gsap.from('.map path.edge', {
          autoAlpha: 0,
          strokeWidth: 0,
          duration: 0.8,
          stagger: 0.05,
          clearProps: 'opacity,visibility,strokeWidth',
          scrollTrigger: { trigger: '#map', start: 'top 75%', once: true },
          ease: 'power2.out',
        });
        gsap.from('.nd:not(.c)', {
          autoAlpha: 0,
          scale: 0.6,
          stagger: 0.08,
          duration: 0.5,
          scrollTrigger: { trigger: '#map', start: 'top 75%', once: true },
          // Clear transform too: resting transform comes from CSS
          // translate(-50%, -50%), and keeping the inline one would
          // override the :hover lift forever.
          clearProps: 'opacity,visibility,transform',
          ease: 'back.out(1.5)',
        });

        // Results + CTA checkmarks — scoped per section so each plays
        // when its own section enters.
        gsap.from('#done .ck', {
          scale: 0.3,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: { trigger: '#done', start: 'top 60%', once: true },
          clearProps: 'opacity,visibility,transform',
        });
        gsap.from('#cta .ck', {
          scale: 0.3,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: { trigger: '#cta', start: 'top 70%', once: true },
          clearProps: 'opacity,visibility,transform',
        });

        // Stats animations
        gsap.from('.stat b', {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          stagger: 0.1,
          scrollTrigger: { trigger: '#stats', start: 'top 80%', once: true },
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        });
        gsap.from('.stat span', {
          autoAlpha: 0,
          y: 12,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.1,
          scrollTrigger: { trigger: '#stats', start: 'top 80%', once: true },
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        });

        // CTA cards
        gsap.from('.bene .card', {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.1,
          scrollTrigger: { trigger: '.bene', start: 'top 80%', once: true },
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        });
      });

      ScrollTrigger.refresh();
      // Webfont swap shifts layout after load — realign all triggers.
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        }).catch(() => {});
      }
      } catch (err) {
        // GSAP chunk failed (offline, blocked) — content stays visible.
        console.error('ScrollFx disabled:', err);
      }
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
