"use strict";
import {
  geoIdentity,
  geoPath,
  contours,
  blur2,
} from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Set up a canvas & context
const canvas = document.getElementById("topography");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Contour generation w/D3
const x = window.innerWidth / 8;
const y = window.innerHeight / 8;
const _contours = contours().size([x, y]);

// Generates a new set of perlin noise and contours.
// Inspiration from https://observablehq.com/@d3/cloud-contours
function generate(timestamp) {
  // Don't render if the tab/browser isn't focused
  if (document.hasFocus()) {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up an array to hold the noise data, then populate it
    let values = new Float64Array(x * y);

    for (let j = 0, k = 0; j < y; ++j) {
      for (let i = 0; i < x; ++i, ++k) {
        // This is largely just playing with values until it looks good
        // noise.perlin3 is from the IIFE in perlin.js
        values[k] = Math.abs(
          noise.perlin3(j / 3.05, i / 3.05, timestamp / 10000) * -3
        );
      }
    }

    // Smooths the data out
    values = blur2({ data: values, width: x }, 3).data;

    // Set up rendering
    const context = ctx;
    const projection = geoIdentity().scale(8);
    const path = geoPath(projection, context);
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.strokeStyle = "rgb(138, 71, 206)";

    const tmax = 96; // Performance is directly tied to this value. Adjust with care.

    for (let tmin = 0; tmin < tmax; tmin = tmin + 8) {
      context.beginPath();
      path(_contours.contour(values, tmin / tmax));
      context.stroke();
    }
  }
  // Do it all over again.
  // TODO: Frame skipping, maybe.
  window.requestAnimationFrame(generate);
}

window.requestAnimationFrame(generate);
