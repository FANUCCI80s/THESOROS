"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

type IconProps = {
  className?: string;
};

function WealthIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M32 11V22M32 42V53M11 32H22M42 32H53"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M18 18L25 25M39 39L46 46M46 18L39 25M25 39L18 46"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  );
}

function HeritageIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 7L51 14V29C51 42 43 51 32 57C21 51 13 42 13 29V14L32 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="28" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 34V43" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 28H20M38 28H44" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GlobeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1.5" />
      <ellipse
        cx="32"
        cy="32"
        rx="11"
        ry="24"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 32H56M12 20H52M12 44H52"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SecurityIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="17"
        y="27"
        width="30"
        height="27"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M23 27V20C23 15.0294 27.0294 11 32 11C36.9706 11 41 15.0294 41 20V27"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="39" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 43V48" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GlobalIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M32 8C38 14 41 22 41 32C41 42 38 50 32 56C26 50 23 42 23 32C23 22 26 14 32 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 32H56M12 20H52M12 44H52"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const capabilities = [
  {
    number: "01",
    title: "AI WEALTH MANAGER",
    description:
      "Hyper-personalized portfolio automation designed to help you make informed decisions while keeping your long-term objectives in focus.",
    icon: WealthIcon,
    eyebrow: "INTELLIGENT WEALTH",
  },
  {
    number: "02",
    title: "SMART HERITAGE PLANNING",
    description:
      "Plan legacy transfers with confidence through thoughtful wealth structures built around continuity, preservation, and the generations ahead.",
    icon: HeritageIcon,
    eyebrow: "PRESERVE WHAT MATTERS",
  },
  {
    number: "03",
    title: "CULTURAL INVESTMENT ROUTES",
    description:
      "Discover sustainable investment opportunities aligned with your values, interests, and vision for the future.",
    icon: GlobeIcon,
    eyebrow: "INVEST WITH PURPOSE",
  },
  {
    number: "04",
    title: "TREASURY-GRADE SECURITY",
    description:
      "Blockchain vaulting, biometric protection, and intelligent real-time risk monitoring work together to protect your wealth.",
    icon: SecurityIcon,
    eyebrow: "PROTECTION BY DESIGN",
  },
  {
    number: "05",
    title: "GLOBAL ACCESS",
    description:
      "Multi-currency, multi-lingual, multi-platform access gives you the freedom to manage your wealth wherever your ambitions take you.",
    icon: GlobalIcon,
    eyebrow: "WEALTH WITHOUT BORDERS",
  },
];

/** Scroll-triggered reveal: fade | slide | float */
function Reveal({
  children,
  variant = "fade",
  className = "",
  as: Tag = "div",
  delay = 0,
}: {
  children: ReactNode;
  variant?: "fade" | "slide-up" | "slide-left" | "slide-right" | "float";
  className?: string;
  as?: "div" | "section" | "article";
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal reveal-${variant} ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

function CapabilityCard({
  capability,
  index,
}: {
  capability: (typeof capabilities)[number];
  index: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.22,
        rootMargin: "-6% 0px -6% 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Icon = capability.icon;
  const slideClass =
    index % 2 === 0 ? "capability-from-left" : "capability-from-right";

  return (
    <article
      ref={ref}
      className={`capability-card ${slideClass} ${visible ? "capability-card-visible" : ""}`}
    >
      <div className="capability-card-inner">
        <div className="capability-number">
          <span>{capability.number}</span>
          <div className="capability-number-line" />
        </div>

        <div className="capability-content">
          <div className="capability-icon-wrap">
            <Icon className="capability-icon" />
          </div>

          <div className="capability-copy">
            <p className="capability-eyebrow">{capability.eyebrow}</p>
            <h3>{capability.title}</h3>

            <div className="gold-rule">
              <span />
              <i />
              <span />
            </div>

            <p className="capability-description">{capability.description}</p>

            <div className="capability-link">
              <span>DISCOVER MORE</span>
              <span className="capability-arrow">→</span>
            </div>
          </div>
        </div>

        <div className="capability-watermark">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="thesoros-page">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #050505;
        }

        .thesoros-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 15%,
              rgba(185, 139, 54, 0.08),
              transparent 30%
            ),
            #050505;
          color: #f4efe4;
          overflow-x: hidden;
        }

        /* Reduced motion: show content without animation */
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
          .reveal,
          .capability-card,
          .hero-copy {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }
        }

        /* ================================
           SCROLL REVEAL SYSTEM
        ================================= */
        .reveal {
          opacity: 0;
          will-change: transform, opacity;
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal-fade {
          transform: translateY(24px);
        }

        .reveal-slide-up {
          transform: translateY(72px);
        }

        .reveal-slide-left {
          transform: translateX(-64px);
        }

        .reveal-slide-right {
          transform: translateX(64px);
        }

        .reveal-float {
          transform: translateY(40px) scale(0.97);
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }

        /* Soft float after enter */
        .reveal-float.reveal-visible {
          animation: softFloat 6s ease-in-out infinite;
        }

        @keyframes softFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* ================================
           NAVIGATION
        ================================= */
        .site-header {
          position: absolute;
          z-index: 50;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          display: flex;
          align-items: center;
        }

        .nav-container {
          width: min(94%, 1440px);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          container-type: inline-size;
          container-name: nav;
        }

        .logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .site-logo {
          width: 220px;
          height: auto;
          object-fit: contain;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nav-link {
          position: relative;
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -7px;
          width: 0;
          height: 1px;
          background: #d7a94b;
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #e6bd67;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 5px;
        }

        .nav-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 19px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.04em;
          transition:
            transform 0.3s ease,
            background 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .nav-button:hover {
          transform: translateY(-2px);
        }

        .nav-login {
          border: 1px solid rgba(214, 171, 91, 0.5);
          color: #f4efe4;
          background: rgba(0, 0, 0, 0.2);
        }

        .nav-login:hover {
          border-color: #d7a94b;
          background: rgba(215, 169, 75, 0.08);
        }

        .nav-open {
          color: #17120a;
          background: linear-gradient(135deg, #e7bc64, #c89535);
          border: 1px solid #e9c36e;
        }

        .nav-open:hover {
          background: linear-gradient(135deg, #f0c875, #d7a94b);
        }

        .get-app {
          color: #e8c36d;
          border: 1px solid rgba(216, 171, 79, 0.55);
          background: rgba(216, 171, 79, 0.06);
        }

        .get-app:hover {
          color: #16110a;
          background: #d7a94b;
        }

        .mobile-menu-button {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(216, 171, 79, 0.45);
          background: rgba(0, 0, 0, 0.45);
          color: #e7bc64;
          cursor: pointer;
        }

        /* ================================
           HERO
        ================================= */
        .hero {
          position: relative;
          min-height: 820px;
          height: min(100vh, 920px);
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #080808;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(3, 3, 3, 0.98) 0%,
              rgba(3, 3, 3, 0.89) 22%,
              rgba(3, 3, 3, 0.57) 47%,
              rgba(3, 3, 3, 0.18) 75%,
              rgba(3, 3, 3, 0.24) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.48) 0%,
              transparent 30%,
              rgba(0, 0, 0, 0.62) 100%
            );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: min(94%, 1440px);
          margin: 0 auto;
          padding-top: 80px;
        }

        .hero-copy {
          max-width: 590px;
          animation: heroReveal 1.1s ease both;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #d7a94b;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .hero-eyebrow::before {
          content: "";
          width: 38px;
          height: 1px;
          background: #d7a94b;
        }

        .hero-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(58px, 6vw, 96px);
          line-height: 0.96;
          font-weight: 400;
          letter-spacing: -0.045em;
        }

        .hero-title-gold {
          color: #d9ae59;
          font-style: italic;
        }

        .hero-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 28px 0 22px;
        }

        .hero-divider span {
          width: 105px;
          height: 1px;
          background: rgba(221, 180, 96, 0.72);
        }

        .hero-divider i {
          width: 7px;
          height: 7px;
          border: 1px solid #d7a94b;
          transform: rotate(45deg);
        }

        .hero-description {
          max-width: 510px;
          color: rgba(246, 242, 233, 0.78);
          font-size: 16px;
          line-height: 1.85;
          margin: 0;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 32px;
        }

        .hero-button {
          min-height: 50px;
          padding: 0 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .hero-button-primary {
          color: #17120a;
          background: linear-gradient(135deg, #e9bf67, #c89535);
          border: 1px solid #e8bd62;
        }

        .hero-button-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(200, 149, 53, 0.2);
        }

        .hero-button-secondary {
          color: #f0e9db;
          border: 1px solid rgba(218, 179, 98, 0.55);
          background: rgba(0, 0, 0, 0.25);
        }

        .hero-button-secondary:hover {
          color: #e8bd62;
          border-color: #d7a94b;
          background: rgba(215, 169, 75, 0.07);
        }

        .hero-trust {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 28px;
          color: rgba(241, 235, 221, 0.63);
          font-size: 11px;
          letter-spacing: 0.02em;
        }

        .hero-trust-mark {
          width: 18px;
          height: 18px;
          border: 1px solid rgba(216, 171, 79, 0.7);
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #d7a94b;
          font-size: 9px;
          transform: rotate(45deg);
        }

        .hero-trust-mark span {
          transform: rotate(-45deg);
        }

        .hero-bottom-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 180px;
          background: linear-gradient(transparent, #050505);
          z-index: 1;
          pointer-events: none;
        }

        /* ================================
           INTRO
        ================================= */
        .intro-section {
          position: relative;
          padding: 140px 20px 110px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(188, 140, 48, 0.09),
              transparent 38%
            ),
            #050505;
          text-align: center;
        }

        .section-label {
          color: #d5a64c;
          font-size: 10px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .intro-title {
          max-width: 900px;
          margin: 0 auto;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(42px, 5vw, 72px);
          line-height: 1.05;
          font-weight: 400;
        }

        .intro-title span {
          color: #d9ae59;
        }

        .intro-text {
          max-width: 700px;
          margin: 28px auto 0;
          color: rgba(244, 238, 225, 0.64);
          line-height: 1.9;
          font-size: 15px;
        }

        .ornament {
          width: 150px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(214, 169, 76, 0.7),
            transparent
          );
          margin: 34px auto 0;
          position: relative;
        }

        .ornament::after {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
          border: 1px solid #d7a94b;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          background: #050505;
        }

        /* ================================
           CAPABILITIES
        ================================= */
        .capabilities-section {
          position: relative;
          padding: 40px 0 150px;
          background: linear-gradient(180deg, #050505 0%, #080705 50%, #050505 100%);
          container-type: inline-size;
          container-name: capabilities;
        }

        .capabilities-heading {
          width: min(90%, 1180px);
          margin: 0 auto 70px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 30px;
          container-type: inline-size;
          container-name: heading;
        }

        .capabilities-heading h2 {
          margin: 0;
          max-width: 700px;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 400;
          font-size: clamp(42px, 5vw, 68px);
          line-height: 1;
        }

        .capabilities-heading h2 span {
          color: #d8ad58;
          font-style: italic;
        }

        .capabilities-heading p {
          max-width: 350px;
          margin: 0;
          color: rgba(242, 236, 224, 0.55);
          line-height: 1.7;
          font-size: 13px;
        }

        .capability-card {
          width: min(90%, 1180px);
          min-height: 650px;
          margin: 0 auto 100px;
          position: relative;
          opacity: 0;
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1s cubic-bezier(0.22, 1, 0.36, 1);
          container-type: inline-size;
          container-name: card;
        }

        .capability-from-left {
          transform: translateX(-80px) translateY(40px) scale(0.96);
        }

        .capability-from-right {
          transform: translateX(80px) translateY(40px) scale(0.96);
        }

        .capability-card-visible {
          opacity: 1;
          transform: translateX(0) translateY(0) scale(1);
        }

        .capability-card-inner {
          min-height: 650px;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(210, 166, 81, 0.18);
          background:
            radial-gradient(
              circle at 70% 40%,
              rgba(195, 147, 56, 0.08),
              transparent 32%
            ),
            linear-gradient(135deg, rgba(19, 17, 13, 0.98), rgba(7, 7, 7, 0.98));
          display: flex;
          align-items: center;
          padding: 80px;
        }

        .capability-card-inner::before {
          content: "";
          position: absolute;
          inset: 14px;
          border-radius: 14px;
          border: 1px solid rgba(216, 171, 79, 0.08);
          pointer-events: none;
        }

        .capability-card-inner::after {
          content: "";
          position: absolute;
          width: 440px;
          height: 440px;
          right: -120px;
          top: 50%;
          transform: translateY(-50%);
          border: 1px solid rgba(215, 169, 75, 0.07);
          border-radius: 50%;
          box-shadow:
            0 0 0 45px rgba(215, 169, 75, 0.025),
            0 0 0 90px rgba(215, 169, 75, 0.015);
        }

        .capability-number {
          position: absolute;
          left: 42px;
          top: 40px;
          display: flex;
          align-items: center;
          gap: 15px;
          color: rgba(216, 171, 79, 0.7);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
        }

        .capability-number-line {
          width: 60px;
          height: 1px;
          background: rgba(216, 171, 79, 0.4);
        }

        .capability-content {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 180px 1fr;
          align-items: center;
          gap: 70px;
          width: 100%;
        }

        .capability-icon-wrap {
          width: 150px;
          height: 150px;
          border: 1px solid rgba(216, 171, 79, 0.35);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d7a94b;
          position: relative;
          background: rgba(215, 169, 75, 0.025);
          box-shadow:
            0 0 0 15px rgba(215, 169, 75, 0.025),
            0 0 70px rgba(215, 169, 75, 0.07);
        }

        .capability-icon-wrap::before,
        .capability-icon-wrap::after {
          content: "";
          position: absolute;
          border: 1px solid rgba(216, 171, 79, 0.2);
          border-radius: 50%;
        }

        .capability-icon-wrap::before {
          inset: 10px;
        }

        .capability-icon-wrap::after {
          inset: -25px;
          border-color: rgba(216, 171, 79, 0.06);
        }

        .capability-icon {
          width: 72px;
          height: 72px;
          position: relative;
          z-index: 2;
        }

        .capability-copy {
          max-width: 680px;
        }

        .capability-eyebrow {
          margin: 0 0 14px;
          color: #b99554;
          font-size: 10px;
          letter-spacing: 0.28em;
        }

        .capability-copy h3 {
          margin: 0;
          color: #f3eee4;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(36px, 4.4vw, 62px);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -0.025em;
        }

        .gold-rule {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 28px 0;
        }

        .gold-rule span {
          width: 55px;
          height: 1px;
          background: rgba(216, 171, 79, 0.6);
        }

        .gold-rule i {
          width: 6px;
          height: 6px;
          border: 1px solid #d7a94b;
          transform: rotate(45deg);
        }

        .capability-description {
          max-width: 610px;
          margin: 0;
          color: rgba(244, 238, 225, 0.62);
          font-size: 15px;
          line-height: 1.9;
        }

        .capability-link {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 32px;
          color: #d8ad58;
          font-size: 10px;
          letter-spacing: 0.22em;
        }

        .capability-arrow {
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .capability-card:hover .capability-arrow {
          transform: translateX(7px);
        }

        .capability-watermark {
          position: absolute;
          right: 45px;
          bottom: -55px;
          color: rgba(216, 171, 79, 0.035);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 300px;
          line-height: 1;
          pointer-events: none;
        }

        .capability-card:nth-of-type(odd) .capability-card-inner {
          background:
            radial-gradient(
              circle at 20% 50%,
              rgba(205, 157, 67, 0.07),
              transparent 35%
            ),
            linear-gradient(135deg, #0b0a08, #050505);
        }

        /* ================================
           PHILOSOPHY
        ================================= */
        .philosophy {
          position: relative;
          padding: 170px 20px;
          text-align: center;
          background:
            radial-gradient(
              circle at center,
              rgba(188, 140, 48, 0.12),
              transparent 42%
            ),
            #070707;
          border-top: 1px solid rgba(215, 169, 75, 0.1);
          border-bottom: 1px solid rgba(215, 169, 75, 0.1);
        }

        .philosophy-title {
          max-width: 1000px;
          margin: 0 auto;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 400;
          font-size: clamp(48px, 6vw, 88px);
          line-height: 1;
        }

        .philosophy-title em {
          color: #d9ae59;
        }

        .philosophy-description {
          max-width: 620px;
          margin: 30px auto 0;
          color: rgba(244, 238, 225, 0.6);
          line-height: 1.9;
        }

        /* ================================
           CTA
        ================================= */
        .cta-section {
          padding: 130px 20px;
          text-align: center;
          background: linear-gradient(180deg, #070707, #0b0906);
        }

        .cta-box {
          width: min(100%, 1000px);
          margin: 0 auto;
          padding: 80px 30px;
          border-radius: 20px;
          border: 1px solid rgba(216, 171, 79, 0.2);
          position: relative;
          background:
            radial-gradient(
              circle at center,
              rgba(216, 171, 79, 0.08),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.35);
          container-type: inline-size;
          container-name: cta;
        }

        .cta-box::before,
        .cta-box::after {
          content: "";
          position: absolute;
          width: 60px;
          height: 60px;
          border-color: rgba(216, 171, 79, 0.6);
          border-radius: 4px;
        }

        .cta-box::before {
          left: -1px;
          top: -1px;
          border-left: 1px solid;
          border-top: 1px solid;
        }

        .cta-box::after {
          right: -1px;
          bottom: -1px;
          border-right: 1px solid;
          border-bottom: 1px solid;
        }

        .cta-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(42px, 5vw, 68px);
          line-height: 1;
          font-weight: 400;
        }

        .cta-title span {
          color: #d8ad58;
          font-style: italic;
        }

        .cta-text {
          max-width: 570px;
          margin: 25px auto 0;
          color: rgba(244, 238, 225, 0.62);
          line-height: 1.8;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 34px;
        }

        /* ================================
           FOOTER
        ================================= */
        .footer {
          padding: 70px 20px 30px;
          background: #030303;
          border-top: 1px solid rgba(215, 169, 75, 0.1);
        }

        .footer-inner {
          width: min(94%, 1180px);
          margin: 0 auto;
          container-type: inline-size;
          container-name: footer;
        }

        .footer-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 50px;
          padding-bottom: 50px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .footer-logo {
          width: 210px;
          height: auto;
        }

        .footer-tagline {
          max-width: 280px;
          margin-top: 18px;
          color: rgba(244, 238, 225, 0.45);
          font-size: 12px;
          line-height: 1.7;
        }

        .footer-links {
          display: flex;
          gap: 70px;
        }

        .footer-column h4 {
          margin: 0 0 18px;
          color: #d6aa57;
          font-size: 10px;
          letter-spacing: 0.2em;
          font-weight: 500;
        }

        .footer-column a {
          display: block;
          color: rgba(244, 238, 225, 0.52);
          text-decoration: none;
          font-size: 12px;
          margin-bottom: 11px;
          transition: color 0.3s ease;
        }

        .footer-column a:hover {
          color: #d8ad58;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 25px;
          color: rgba(244, 238, 225, 0.3);
          font-size: 10px;
        }

        /* ================================
           ANIMATION
        ================================= */
        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(35px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ================================
           MOBILE NAV
        ================================= */
        .mobile-menu {
          display: none;
        }

        /* ============================================================
           CONTAINER QUERIES (component size, not viewport)
           ============================================================ */

        @container heading (max-width: 720px) {
          .capabilities-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .capabilities-heading p {
            max-width: none;
            margin-top: 20px;
          }
        }

        @container card (max-width: 640px) {
          .capability-content {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .capability-card-inner {
            padding: 48px 28px 36px;
            min-height: auto;
          }

          .capability-icon-wrap {
            width: 100px;
            height: 100px;
          }

          .capability-icon {
            width: 52px;
            height: 52px;
          }

          .capability-watermark {
            font-size: 160px;
            bottom: -20px;
          }

          .capability-copy h3 {
            font-size: clamp(28px, 8cqi, 44px);
          }
        }

        @container card (max-width: 420px) {
          .capability-card-inner {
            padding: 44px 20px 32px;
          }

          .capability-number {
            left: 16px;
            top: 16px;
          }
        }

        @container cta (max-width: 560px) {
          .cta-box {
            padding: 48px 20px;
          }

          .cta-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .cta-title {
            font-size: clamp(32px, 10cqi, 48px);
          }
        }

        @container footer (max-width: 640px) {
          .footer-top {
            flex-direction: column;
            gap: 32px;
          }

          .footer-links {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
        }

        @container footer (max-width: 400px) {
          .footer-links {
            grid-template-columns: 1fr;
          }
        }

        @container nav (max-width: 960px) {
          .desktop-nav {
            gap: 12px;
          }

          .nav-link {
            font-size: 11px;
          }
        }

        /* ============================================================
           RESPONSIVE BREAKPOINTS (mobile-first aligned)
           -- mobile:  default  (< 640px)
           -- sm:      ≥ 640px
           -- md:      ≥ 768px  (tablet)
           -- lg:      ≥ 1024px (desktop)
           -- xl:      ≥ 1280px
           Mobile overrides use max-width: 639px / 767px / 1023px
           ============================================================ */

        /* Large tablet / small desktop nav tightening */
        @media (max-width: 1023px) {
          .desktop-nav {
            gap: 14px;
          }

          .nav-link {
            font-size: 12px;
          }

          .site-logo {
            width: 190px;
          }

          .capability-card-inner {
            padding: 60px 50px;
          }

          .capability-content {
            grid-template-columns: 130px 1fr;
            gap: 48px;
          }

          .capability-icon-wrap {
            width: 120px;
            height: 120px;
          }
        }

        /* Tablet and below — collapse desktop nav */
        @media (max-width: 767px) {
          .site-header {
            height: 72px;
            padding-top: env(safe-area-inset-top, 0px);
          }

          .nav-container {
            width: min(100% - 24px, 1440px);
            padding-left: env(safe-area-inset-left, 0px);
            padding-right: env(safe-area-inset-right, 0px);
          }

          .site-logo {
            width: 160px;
          }

          .desktop-nav {
            display: none;
          }

          .mobile-menu-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 44px;
          }

          .mobile-menu {
            display: flex;
            position: fixed;
            z-index: 60;
            top: calc(72px + env(safe-area-inset-top, 0px));
            left: 12px;
            right: 12px;
            max-height: min(70vh, 480px);
            overflow-y: auto;
            padding: 16px;
            flex-direction: column;
            gap: 2px;
            border-radius: 16px;
            border: 1px solid rgba(216, 171, 79, 0.22);
            background: rgba(5, 5, 5, 0.97);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            transform: translateY(-12px);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
          }

          .mobile-menu-open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .mobile-menu a {
            padding: 14px 12px;
            color: rgba(244, 238, 225, 0.78);
            text-decoration: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            font-size: 14px;
            min-height: 44px;
            display: flex;
            align-items: center;
          }

          .mobile-menu a:hover {
            color: #d8ad58;
          }

          .mobile-menu-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
          }

          .nav-button {
            min-height: 44px;
            border-radius: 12px;
          }

          .hero {
            min-height: 100svh;
            height: 100svh;
            align-items: flex-end;
          }

          .hero-content {
            width: min(100% - 32px, 1440px);
            padding-top: 88px;
            padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
          }

          .hero-background img {
            object-position: 60% center;
          }

          .hero-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(2, 2, 2, 0.5) 0%,
                rgba(2, 2, 2, 0.72) 40%,
                rgba(2, 2, 2, 0.94) 100%
              );
          }

          .hero-title {
            font-size: clamp(42px, 11vw, 58px);
            line-height: 1.05;
          }

          .hero-description {
            font-size: 14px;
            line-height: 1.75;
          }

          .hero-actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .hero-button {
            width: 100%;
            min-height: 48px;
            border-radius: 14px;
          }

          .hero-trust {
            flex-wrap: wrap;
            font-size: 10px;
            line-height: 1.5;
          }

          .intro-section {
            padding: 80px 20px 64px;
          }

          .intro-title {
            font-size: clamp(32px, 8vw, 48px);
          }

          .capabilities-section {
            padding: 24px 0 64px;
          }

          .capabilities-heading {
            width: min(100% - 32px, 1180px);
            margin: 0 auto 40px;
            display: block;
          }

          .capabilities-heading h2 {
            font-size: clamp(32px, 8vw, 48px);
          }

          .capabilities-heading p {
            margin-top: 16px;
            max-width: none;
          }

          .capability-card {
            width: min(100% - 24px, 1180px);
            min-height: auto;
            margin: 0 auto 40px;
          }

          .capability-from-left,
          .capability-from-right {
            transform: translateY(56px) scale(0.98);
          }

          .capability-card-visible {
            transform: translateY(0) scale(1);
          }

          .capability-card-inner {
            min-height: auto;
            padding: 48px 24px 36px;
            border-radius: 16px;
            display: block;
          }

          .capability-content {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .capability-icon-wrap {
            width: 96px;
            height: 96px;
            margin-top: 12px;
          }

          .capability-icon {
            width: 48px;
            height: 48px;
          }

          .capability-number {
            left: 20px;
            top: 18px;
          }

          .capability-number-line {
            width: 32px;
          }

          .capability-copy h3 {
            font-size: clamp(28px, 7vw, 40px);
          }

          .capability-description {
            font-size: 14px;
            line-height: 1.75;
          }

          .capability-watermark {
            right: 4px;
            bottom: -12px;
            font-size: 120px;
          }

          .capability-card-inner::after {
            width: 220px;
            height: 220px;
            right: -80px;
          }

          .philosophy {
            padding: 88px 20px;
          }

          .philosophy-title {
            font-size: clamp(36px, 9vw, 52px);
          }

          .cta-section {
            padding: 72px 16px;
          }

          .cta-box {
            padding: 48px 20px;
            border-radius: 16px;
          }

          .cta-title {
            font-size: clamp(32px, 8vw, 48px);
          }

          .cta-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .footer {
            padding: 48px 20px calc(24px + env(safe-area-inset-bottom, 0px));
          }

          .footer-top {
            flex-direction: column;
            gap: 32px;
            padding-bottom: 32px;
          }

          .footer-links {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px 20px;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        /* Small phones */
        @media (max-width: 389px) {
          .hero-title {
            font-size: 36px;
          }

          .site-logo {
            width: 140px;
          }

          .capability-card {
            width: calc(100% - 16px);
          }
        }

        /* Landscape phones */
        @media (max-width: 900px) and (max-height: 480px) and (orientation: landscape) {
          .hero {
            min-height: 100svh;
            height: auto;
            padding-bottom: 24px;
          }

          .hero-content {
            padding-top: 72px;
            padding-bottom: 24px;
          }

          .hero-title {
            font-size: 36px;
          }

          .hero-actions {
            grid-template-columns: 1fr 1fr;
          }
        }

      `}</style>

      {/* HEADER */}
      <header className="site-header">
        <div className="nav-container">
          <Link href="/" className="logo-link">
            <Image
              src="/Logo.png"
              alt="THÉSOROS"
              width={220}
              height={70}
              className="site-logo"
              priority
            />
          </Link>

          <nav className="desktop-nav">
            <Link href="#about" className="nav-link">
              About Us
            </Link>
            <Link href="#invest" className="nav-link">
              Invest
            </Link>
            <Link href="#wealth" className="nav-link">
              Wealth Solutions
            </Link>
            <Link href="#legacy" className="nav-link">
              Legacy Planning
            </Link>
            <Link href="#insights" className="nav-link">
              Insights
            </Link>

            <div className="nav-actions">
              <Link href="/login" className="nav-button nav-login">
                Log In
              </Link>
              <Link href="/signup" className="nav-button nav-open">
                Open Account
              </Link>
              <Link href="#get-app" className="nav-button get-app">
                Get App
              </Link>
            </div>
          </nav>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>
        <Link href="#about" onClick={() => setMenuOpen(false)}>
          About Us
        </Link>
        <Link href="#invest" onClick={() => setMenuOpen(false)}>
          Invest
        </Link>
        <Link href="#wealth" onClick={() => setMenuOpen(false)}>
          Wealth Solutions
        </Link>
        <Link href="#legacy" onClick={() => setMenuOpen(false)}>
          Legacy Planning
        </Link>
        <Link href="#insights" onClick={() => setMenuOpen(false)}>
          Insights
        </Link>
        <div className="mobile-menu-buttons">
          <Link href="/login" className="nav-button nav-login">
            Log In
          </Link>
          <Link href="/signup" className="nav-button nav-open">
            Open Account
          </Link>
        </div>
        <Link href="#get-app" onClick={() => setMenuOpen(false)}>
          Get App
        </Link>
      </div>

      {/* HERO */}
      <section className="hero" id="about">
        <div className="hero-background">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/Background-Mobile.jpg"
            />
            <source
              media="(max-width: 1023px)"
              srcSet="/Background-Tablet.jpg"
            />
            <Image
              src="/Background.jpg"
              alt="THÉSOROS heritage landscape"
              fill
              priority
              sizes="100vw"
            />
          </picture>
        </div>

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-copy">
            <div className="hero-eyebrow">Wealth. Heritage. Legacy.</div>

            <h1 className="hero-title">
              Your <span className="hero-title-gold">Treasure.</span>
              <br />
              Your Terms.
            </h1>

            <div className="hero-divider">
              <span />
              <i />
              <span />
            </div>

            <p className="hero-description">
              THÉSOROS is where ancient wealth principles meet modern investing.
              Founded in Athens, grown globally, we help protect and grow what
              matters most — your legacy.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="hero-button hero-button-primary">
                Open Your Account
              </Link>
              <Link href="#invest" className="hero-button hero-button-secondary">
                Explore Portfolios
              </Link>
              <Link
                href="#get-app"
                className="hero-button hero-button-secondary"
              >
                Get the App
              </Link>
            </div>

            <div className="hero-trust">
              <span className="hero-trust-mark">
                <span>✓</span>
              </span>
              Bank-grade security · Global compliance · Total transparency
            </div>
          </div>
        </div>

        <div className="hero-bottom-fade" />
      </section>

      {/* INTRO — fade + slide up */}
      <Reveal as="section" variant="slide-up" className="intro-section" id="invest">
        <div className="section-label">THE THÉSOROS PHILOSOPHY</div>
        <h2 className="intro-title">
          Wealth should be built for
          <br />
          <span>more than today.</span>
        </h2>
        <p className="intro-text">
          We combine timeless principles of wealth preservation with modern
          investment technology to create a more intelligent way to manage,
          grow, and protect your wealth.
        </p>
        <div className="ornament" />
      </Reveal>

      {/* CAPABILITIES — alternate slide left / right */}
      <section className="capabilities-section" id="wealth">
        <Reveal variant="fade" className="capabilities-heading">
          <div>
            <div className="section-label">WHAT MAKES THÉSOROS DIFFERENT</div>
            <h2>
              Five pillars of
              <br />
              <span>modern wealth.</span>
            </h2>
          </div>
          <p>
            From intelligent portfolio management to global access, every
            element is designed around the preservation and growth of what
            matters most.
          </p>
        </Reveal>

        {capabilities.map((capability, index) => (
          <CapabilityCard
            key={capability.number}
            capability={capability}
            index={index}
          />
        ))}
      </section>

      {/* PHILOSOPHY — float */}
      <Reveal as="section" variant="float" className="philosophy" id="legacy">
        <div className="section-label">BUILT AROUND YOUR LEGACY</div>
        <h2 className="philosophy-title">
          The greatest wealth
          <br />
          is <em>what remains.</em>
        </h2>
        <p className="philosophy-description">
          Your financial journey should not end with a balance sheet. THÉSOROS
          is designed to help you create, preserve, and pass on a legacy that
          extends far beyond yourself.
        </p>
        <div className="ornament" />
      </Reveal>

      {/* CTA — slide up + fade */}
      <Reveal as="section" variant="slide-up" className="cta-section" id="get-app">
        <div className="cta-box">
          <div className="section-label">BEGIN YOUR JOURNEY</div>
          <h2 className="cta-title">
            Your wealth.
            <br />
            Your <span>legacy.</span>
          </h2>
          <p className="cta-text">
            Step into a more intelligent approach to wealth management. Create
            your THÉSOROS account and begin building toward what comes next.
          </p>
          <div className="cta-actions">
            <Link href="/signup" className="hero-button hero-button-primary">
              Open Your Account
            </Link>
            <Link href="/login" className="hero-button hero-button-secondary">
              Log In
            </Link>
            <Link href="#get-app" className="hero-button hero-button-secondary">
              Get the App
            </Link>
          </div>
        </div>
      </Reveal>

      {/* FOOTER — fade */}
      <Reveal as="div" variant="fade">
        <footer className="footer" id="insights">
          <div className="footer-inner">
            <div className="footer-top">
              <div>
                <Image
                  src="/Logo.png"
                  alt="THÉSOROS"
                  width={210}
                  height={70}
                  className="footer-logo"
                />
                <p className="footer-tagline">
                  Guiding wealth. Growing legacies.
                  <br />
                  A modern approach to timeless wealth principles.
                </p>
              </div>

              <div className="footer-links">
                <div className="footer-column">
                  <h4>EXPLORE</h4>
                  <Link href="#about">About Us</Link>
                  <Link href="#invest">Invest</Link>
                  <Link href="#wealth">Wealth Solutions</Link>
                  <Link href="#legacy">Legacy Planning</Link>
                </div>
                <div className="footer-column">
                  <h4>ACCOUNT</h4>
                  <Link href="/login">Log In</Link>
                  <Link href="/signup">Open Account</Link>
                  <Link href="#get-app">Get App</Link>
                </div>
                <div className="footer-column">
                  <h4>COMPANY</h4>
                  <Link href="#insights">Insights</Link>
                  <Link href="#about">Security</Link>
                  <Link href="#about">Privacy</Link>
                  <Link href="#about">Contact</Link>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <span>
                © {new Date().getFullYear()} THÉSOROS. All rights reserved.
              </span>
              <span>GUIDING WEALTH. GROWING LEGACIES.</span>
            </div>
          </div>
        </footer>
      </Reveal>
    </main>
  );
}