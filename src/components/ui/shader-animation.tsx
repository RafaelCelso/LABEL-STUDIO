"use client";

import { useEffect, useRef } from "react";

export function ShaderAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Port of the GLSL fragment shader to Canvas 2D
    const render = () => {
      const time = (performance.now() - startTime) / 1000;
      const W = canvas.width;
      const H = canvas.height;
      const minDim = Math.min(W, H);
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;

      // Downsample for performance — render at half res, scale up
      const scale = 2;
      const rW = Math.ceil(W / scale);
      const rH = Math.ceil(H / scale);
      const buf = new Float32Array(rW * rH * 3);

      const t = time * 0.05;
      const lineWidth = 0.002;

      for (let py = 0; py < rH; py++) {
        for (let px = 0; px < rW; px++) {
          // map to gl_FragCoord equivalent
          const fx = px * scale + scale / 2;
          const fy = H - (py * scale + scale / 2); // flip Y

          const uvx = (fx * 2.0 - W) / minDim;
          const uvy = (fy * 2.0 - H) / minDim;

          const lenUV = Math.sqrt(uvx * uvx + uvy * uvy);
          const modVal = (((uvx + uvy) % 0.2) + 0.2) % 0.2;

          let r = 0,
            g = 0,
            b = 0;

          for (let j = 0; j < 3; j++) {
            let cj = 0;
            for (let i = 0; i < 5; i++) {
              const inner = t - 0.01 * j + i * 0.01;
              // fract
              const fr = inner - Math.floor(inner);
              const denom = Math.abs(fr * 5.0 - lenUV + modVal);
              cj += (lineWidth * i * i) / (denom < 1e-6 ? 1e-6 : denom);
            }
            if (j === 0) r = cj;
            else if (j === 1) g = cj;
            else b = cj;
          }

          const idx = (py * rW + px) * 3;
          buf[idx] = r;
          buf[idx + 1] = g;
          buf[idx + 2] = b;
        }
      }

      // Write to imageData with upscaling
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const sx = Math.floor(x / scale);
          const sy = Math.floor(y / scale);
          const src = (sy * rW + sx) * 3;
          const dst = (y * W + x) * 4;
          data[dst] = Math.min(255, buf[src] * 255);
          data[dst + 1] = Math.min(255, buf[src + 1] * 255);
          data[dst + 2] = Math.min(255, buf[src + 2] * 255);
          data[dst + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block", background: "#000" }}
    />
  );
}
