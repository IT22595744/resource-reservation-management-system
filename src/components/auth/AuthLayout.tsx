"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  mode: "login" | "register";
};

export default function AuthLayout({
  children,
  mode,
}: AuthLayoutProps) {
  const isLogin = mode === "login";

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#0878E8] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:px-12">
        {/* Left illustration section */}
        <section className="hidden flex-col justify-center lg:flex">
          <Link
            href="/"
            className="mb-10 inline-flex w-fit items-center gap-3 text-2xl font-extrabold"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-blue-600 shadow-lg">
              R
            </span>
            ReserveHub
          </Link>

          <div className="relative mx-auto flex h-[390px] w-full max-w-md items-center justify-center">
            {/* Floating shapes */}
            <div className="absolute left-4 top-12 h-16 w-16 animate-bounce rounded-2xl bg-cyan-300/40 blur-sm" />
            <div className="absolute right-10 top-16 h-10 w-10 animate-pulse rounded-full bg-lime-300" />
            <div className="absolute bottom-14 right-2 h-20 w-20 rounded-3xl border-4 border-white/30" />

            {/* Character illustration */}
            <div
                key={mode}
                className={`relative origin-bottom ${
                    isLogin
                    ? "animate-[characterEnterLeft_0.85s_cubic-bezier(0.22,1,0.36,1)_both]"
                    : "animate-[characterEnterRight_0.85s_cubic-bezier(0.22,1,0.36,1)_both]"
                }`}
                >
              <svg
                viewBox="0 0 360 400"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[380px] w-[350px] drop-shadow-2xl"
                role="img"
                aria-label="Friendly illustrated character welcoming you to ReserveHub"
              >
                {/* Shadow */}
                <ellipse
                  cx="180"
                  cy="382"
                  rx="105"
                  ry="13"
                  fill="#0059B8"
                  opacity=".35"
                />

                {/* Legs */}
                <path
                  d="M128 270 L117 354 Q118 368 135 367 L158 283Z"
                  fill="#172554"
                />
                <path
                  d="M196 280 L211 354 Q213 367 232 361 L225 269Z"
                  fill="#1E3A8A"
                />

                {/* Shoes */}
                <path
                  d="M112 350 Q101 354 96 365 Q95 375 112 375 H151 Q160 371 151 358 L137 351Z"
                  fill="white"
                />
                <path
                  d="M205 350 Q198 355 195 365 Q193 375 210 375 H248 Q256 370 245 358 L229 350Z"
                  fill="white"
                />

                {/* Body */}
                <path
                  d="M123 163 Q104 169 96 205 L105 291 Q176 312 246 287 L247 206 Q242 174 214 163Z"
                  fill="#F8FAFC"
                />

                {/* Jacket */}
                <path
                  d="M125 163 Q104 166 95 204 L103 286 L148 292 L158 192Z"
                  fill="#93C5FD"
                />
                <path
                  d="M211 163 Q243 170 248 207 L245 286 L202 296 L194 191Z"
                  fill="#60A5FA"
                />

                {/* Neck */}
                <rect
                  x="159"
                  y="137"
                  width="41"
                  height="40"
                  rx="15"
                  fill="#F2B58F"
                />

                {/* Head */}
                <ellipse
                  cx="180"
                  cy="104"
                  rx="62"
                  ry="72"
                  fill="#F6C39E"
                />

                {/* Hair */}
                <path
                  d="M118 96 Q103 32 154 21 Q195 -2 231 36 Q254 55 241 108 L228 81 Q214 62 195 57 Q158 87 121 79Z"
                  fill="#59371F"
                />
                <path
                  d="M122 77 Q138 24 197 30 Q173 58 122 77Z"
                  fill="#754726"
                />

                {/* Ears */}
                <ellipse cx="120" cy="110" rx="10" ry="16" fill="#ECAF8A" />
                <ellipse cx="240" cy="110" rx="10" ry="16" fill="#ECAF8A" />

                {/* Face */}
                <circle cx="157" cy="106" r="4" fill="#1F2937" />
                <circle cx="202" cy="106" r="4" fill="#1F2937" />
                <path
                  d="M166 136 Q181 148 197 135"
                  stroke="#9A4E40"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Left arm */}
                <path
                  d="M105 189 Q72 220 62 267"
                  stroke="#93C5FD"
                  strokeWidth="31"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="61" cy="270" r="17" fill="#F6C39E" />

                {/* Right arm waving */}
                {/* Animated waving arm */}
                <g className="character-wave">
                <path
                    d="M239 187 Q278 172 296 120"
                    stroke="#60A5FA"
                    strokeWidth="31"
                    fill="none"
                    strokeLinecap="round"
                />

                <ellipse
                    cx="302"
                    cy="109"
                    rx="17"
                    ry="24"
                    fill="#F6C39E"
                    transform="rotate(-20 302 109)"
                />
                </g>

                {/* Shirt detail */}
                <path
                  d="M160 173 L181 195 L203 173"
                  stroke="#CBD5E1"
                  strokeWidth="5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight">
              {isLogin ? "Welcome back!" : "Join ReserveHub!"}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-blue-100">
              {isLogin
                ? "Your workspace, your schedule. Manage every reservation with ease."
                : "Discover resources, reserve your space, and manage everything in one place."}
            </p>
          </div>
        </section>

        {/* Right form section */}
        <section className="flex w-full items-center justify-center">
          <div
            key={mode}
            className={`w-full max-w-[470px] rounded-[32px] border border-white/30 bg-white p-7 text-slate-900 shadow-[0_25px_80px_rgba(0,32,100,0.25)] sm:p-10 ${
                isLogin
                ? "animate-[formSlideLeft_0.65s_ease-out_both]"
                : "animate-[formSlideRight_0.65s_ease-out_both]"
            }`}
            >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-200 lg:hidden">
                R
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {isLogin
                  ? "Enter your details to access ReserveHub."
                  : "Fill in your details to get started."}
              </p>
            </div>

            {children}
          </div>
        </section>
      </div>

<style jsx global>{`
  @keyframes characterEnterLeft {
    0% {
      opacity: 0;
      transform: translateX(-90px) translateY(25px) scale(0.9);
    }
    70% {
      opacity: 1;
      transform: translateX(8px) translateY(-8px) scale(1.03);
    }
    100% {
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1);
    }
  }

  @keyframes characterEnterRight {
    0% {
      opacity: 0;
      transform: translateX(90px) translateY(25px) scale(0.9);
    }
    70% {
      opacity: 1;
      transform: translateX(-8px) translateY(-8px) scale(1.03);
    }
    100% {
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1);
    }
  }

  @keyframes formSlideLeft {
    from {
      opacity: 0;
      transform: translateX(55px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes formSlideRight {
    from {
      opacity: 0;
      transform: translateX(-55px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes waveHand {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-8deg);
    }
    50% {
      transform: rotate(8deg);
    }
    75% {
      transform: rotate(-5deg);
    }
  }

  .character-wave {
    transform-box: fill-box;
    transform-origin: 0% 100%;
    animation: waveHand 2.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .character-wave {
      animation: none !important;
    }

    [class*="animate-[characterEnter"],
    [class*="animate-[formSlide"] {
      animation: none !important;
    }
  }
`}</style>
    </main>
  );
}