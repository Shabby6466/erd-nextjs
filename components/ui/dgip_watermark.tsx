"use client";
import React from "react";

type Props = {
  leftLogoSrc?: string;
  rightLogoSrc?: string;
  leftWidth?: number;
  rightWidth?: number;
  leftOpacity?: number;
  rightOpacity?: number;
  layerZ?: number; // z-index for watermark layer
};

export default function DGIPWatermarks({
  leftLogoSrc = "/govt-of-pakistan-logo.png",
  rightLogoSrc = "/cmyk-dgip-logo.png",
  leftWidth = 250,
  rightWidth = 320,
  leftOpacity = 1,
  rightOpacity = 0.1,
  layerZ = 0,
}: Props) {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: layerZ }}
    >
      {/* Left watermark */}
      <img
        src={leftLogoSrc}
        alt=""
        className="pointer-events-none select-none fixed top-2/3"
        style={{ left: -50, width: leftWidth, height: "auto", opacity: leftOpacity }}
      />

      {/* Right watermark */}
      <img
        src={rightLogoSrc}
        alt=""
        className="pointer-events-none select-none fixed top-2/3"
        style={{ right: -80, width: rightWidth, height: "auto", opacity: rightOpacity }}
      />
    </div>
  );
}