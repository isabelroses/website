import satori from "satori";
import React from "react";
import { readFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

export const generateOpenGraph = async (
  title: string,
  description: string,
  date?: Date,
) => {
  const nixLogoSvg = await readFile("./public/svg/nix.svg", "utf-8");
  const nixLogoDataUrl = `data:image/svg+xml;base64,${Buffer.from(nixLogoSvg).toString("base64")}`;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const svg = await satori(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        color: "#d1d5db",
        padding: "60px",
        fontFamily: "IBM Plex Mono",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
          width: "100%",
        }}
      >
        <img
          src={nixLogoDataUrl}
          alt="Nix Logo"
          width={56}
          height={56}
          style={{
            objectFit: "contain",
          }}
        />
        <div
          style={{
            fontSize: "22px",
            color: "#74c7ec",
            fontWeight: "500",
            letterSpacing: "0.5px",
          }}
        >
          isabelroses.com
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          flex: 1,
          textAlign: "left",
          gap: "32px",
        }}
      >
        <h1
          style={{
            fontSize: title.length > 30 ? "42px" : "52px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0",
            lineHeight: 1.1,
            maxWidth: "90%",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            margin: "0",
            lineHeight: 1.3,
            maxWidth: "85%",
            letterSpacing: "0.01em",
          }}
        >
          {description.length <= 100
            ? description
            : description.substring(0, 97) + "..."}
        </p>
        {formattedDate && (
          <div
            style={{
              fontSize: "20px",
              color: "#74c7ec",
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            {formattedDate}
          </div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "IBM Plex Mono",
          weight: 400,
          style: "normal",
          data: await readFile("./src/lib/ibm-plex-mono.regular.ttf"),
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    background: "#000000",
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return pngBuffer;
};
