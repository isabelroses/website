import satori from "satori";
import React from 'react';
import { readFile } from "node:fs/promises";

export const generateOpenGraph = async (title: string, description: string) =>
  await satori(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        fontWeight: 600,
      }}
    >
      <div style={{ marginTop: -20, fontSize: 32, color: '#d1d5db' }}>{title}</div>
      <div style={{ marginTop: 20, fontSize: 24, color: '#9ca3af' }}>
        {description.length <= 60 ? description : description.substring(0, 57) + "..."}
      </div>
    </div>,
    {
      width: 800,
      height: 400,
      fonts: [
        {
          name: "IBM Plex Mono",
          weight: 400,
          style: "normal",
          data: await readFile("./src/lib/ibm-plex-mono.regular.ttf"),
        },
      ],
    }
  );

