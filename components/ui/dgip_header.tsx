"use client";
import React from "react";

type Props = {
  logoSrc?: string;
};

export default function DGIPHeader({
  logoSrc = "/cmyk-dgip-logo.png",
}: Props) {
  return (
    <div className="max-w-4xl mx-auto relative z-10">
      <div className="flex items-center justify-center mb-4 select-none">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="DGIP Logo" className="w-20 h-20" />
          <div className="text-left">
            <p
              className="text-[#1E7B45] mb-1"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "1",
              }}
            >
              Government of Pakistan
            </p>
            <p
              className="text-[#1B254B] font-semibold mb-1"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "1",
                margin: "0",
              }}
            >
              Directorate General of
            </p>
            <p
              className="text-[#1B254B] font-semibold"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "1.15",
                margin: "0",
              }}
            >
              Immigration and Passport
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}