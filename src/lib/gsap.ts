import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, DrawSVGPlugin, CustomEase, MorphSVGPlugin, useGSAP);

CustomEase.create('expo', '0.16, 1, 0.3, 1');
CustomEase.create('inOut', '0.76, 0, 0.24, 1');
CustomEase.create('soft', '0.33, 1, 0.68, 1');

gsap.defaults({ ease: 'expo', duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });

// Dev-only handle for automated visual checks.
if (import.meta.env.DEV) (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;

export { gsap, ScrollTrigger, SplitText, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin, useGSAP };
