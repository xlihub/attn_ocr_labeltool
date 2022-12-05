import { computePath } from '../image-processing/LiveWire';
import { computeVectorized } from '../image-processing/Segmentation';
import { LineUtil } from 'leaflet';

export function computeTrace(
  points,
  { height, width, imageData },
  { smoothing, precision }
) {
  points = points.slice();
  points.push(points[0]);
  const path = computePath({
    points: points.map(({ lng, lat }) => ({
      x: lng,
      y: lat,
    })),
    height,
    width,
    imageData,
    markRadius: precision,
  });
  const simplePath = LineUtil.simplify(path, smoothing || 0.6);
  return simplePath.map(({ x, y }) => ({ lng: x, lat: y }));
}

export function vectorizeSegmentation(imageData, { scaling, smoothing }) {
  scaling = scaling || 1.0;
  smoothing = smoothing || 2.0;
  // reduce from nxmx1 to nxm
  imageData = imageData.map(row => row.map(channels => channels[0]));
  const paths = computeVectorized(imageData);
  return paths.map(path => {
    const simplePath = LineUtil.simplify(
      path.map(([y, x]) => ({ x, y: imageData.length - y })),
      smoothing
    );
    return simplePath.map(({ x, y }) => ({
      lng: x / scaling,
      lat: y / scaling,
    }));
  });
}
