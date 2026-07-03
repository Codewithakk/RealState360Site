"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Marzipano: any;
  }
}

export default function VirtualTour({
  room,
}: {
  room: string;
}) {
  const viewerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!viewerRef.current) return;

      const Marzipano =
        await import("marzipano");

      const viewer =
        new Marzipano.Viewer(
          viewerRef.current
        );

      const source =
        Marzipano.ImageUrlSource.fromString(
          `/panoramas/${room}.jpg`
        );

      const geometry =
        new Marzipano.EquirectGeometry([
          {
            width: 4000,
          },
        ]);

      const limiter =
        Marzipano.RectilinearView.limit.traditional(
          1024,
          120 * Math.PI / 180
        );

      const view =
        new Marzipano.RectilinearView(
          {
            yaw: 0,
            pitch: 0,
            fov: Math.PI / 2,
          },
          limiter
        );

      const scene = viewer.createScene({
        source,
        geometry,
        view,
      });

      scene.switchTo();
    };

    init();
  }, [room]);

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "black",
      }}
    />
  );
}