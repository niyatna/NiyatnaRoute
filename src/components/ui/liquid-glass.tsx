"use client";

import React from "react";
import Link from "next/link";

// Types
export interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  onClick?: () => void;
}

export interface DockIcon {
  src?: string;
  icon?: React.ReactNode;
  alt: string;
  title?: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

// Glass Effect Wrapper Component
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target,
  onClick,
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    ...style,
  };

  const content = (
    <div
      onClick={onClick}
      className={`relative flex font-normal overflow-hidden cursor-pointer transition-all duration-500 backdrop-blur-xl ${className}`}
      style={glassStyle}
    >
      {/* Glass Distortion & Backdrop */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[inherit]"
        style={{
          backdropFilter: "blur(12px)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />
      
      {/* Subtle Tint */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] bg-white/[0.04] dark:bg-white/[0.03]"
      />
      
      {/* Inset Highlights */}
      <div
        className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] overflow-hidden"
        style={{
          boxShadow:
            "inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Content */}
      <div className="relative z-30 w-full">{children}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target={target} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
};

// Dock Component
export const GlassDock: React.FC<{
  icons: DockIcon[];
  className?: string;
}> = ({ icons, className = "" }) => (
  <div
    className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto ${className}`}
    style={{
      position: "fixed",
      bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 50,
    }}
  >
    <GlassEffect className="rounded-full px-2.5 py-1.5 border border-white/20 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {icons.map((icon, index) => {
          const itemContent = (
            <div
              key={index}
              title={icon.title || icon.alt}
              className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 active:scale-95 cursor-pointer group ${
                icon.active ? "bg-white/25 text-white shadow-md" : "hover:bg-white/10 text-white/80"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}
              onClick={icon.onClick}
            >
              {icon.src ? (
                <img
                  src={icon.src}
                  alt={icon.alt}
                  className="w-5 h-5 object-contain drop-shadow"
                />
              ) : (
                icon.icon
              )}
              {icon.title && (
                <span className="absolute -top-7 px-2 py-0.5 text-[11px] text-white bg-black/85 backdrop-blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {icon.title}
                </span>
              )}
            </div>
          );

          if (icon.href) {
            return (
              <Link key={index} href={icon.href} className="no-underline">
                {itemContent}
              </Link>
            );
          }
          return itemContent;
        })}
      </div>
    </GlassEffect>
  </div>
);

// Glass Button Component
export const GlassButton: React.FC<{
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}> = ({ children, href, onClick, className = "" }) => (
  <GlassEffect
    href={href}
    onClick={onClick}
    className={`rounded-2xl px-6 py-3 hover:scale-105 active:scale-95 text-white/90 font-medium ${className}`}
  >
    <div
      className="flex items-center justify-center gap-2"
      style={{
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      {children}
    </div>
  </GlassEffect>
);

// Glass Card Component
export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = "", style = {} }) => (
  <GlassEffect className={`rounded-3xl p-6 ${className}`} style={style}>
    {children}
  </GlassEffect>
);

// SVG Filter Component (Mount once in root layout)
export const GlassFilter: React.FC = () => (
  <svg className="fixed top-0 left-0 pointer-events-none opacity-0 w-0 h-0" aria-hidden="true">
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="20"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
