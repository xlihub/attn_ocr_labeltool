export const colorMapping = {
  red: '#B03060',
  orange: '#FE9A76',
  yellow: '#FFD700',
  olive: '#32CD32',
  green: '#016936',
  teal: '#008080',
  blue: '#0E6EB8',
  violet: '#EE82EE',
  purple: '#B413EC',
  pink: '#FF1493',
  brown: '#A52A2A',
  gray: '#A0A0A0',
  black: '#000000',
};

export function convertPoint(p) {
  return {
    lat: p.lat,
    lng: p.lng,
  };
}

export function lighten(col, amt) {
  let usePound = false;
  if (col[0] === '#') {
    col = col.slice(1);
    usePound = true;
  }
  const num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00ff) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000ff) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
}

export function genId() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

export function exportLabelData(labelData, formParts) {
  const shapes = [];
  const labels = [];

  formParts.forEach(({ id, type, name, prompt, options }) => {
    const things = labelData.labels[id];
    if (type === 'bbox' || type === 'polygon') {
      function transform(points) {
        if (type === 'polygon') {
          return points;
        }

        const [[x1, y1], [x2, y2]] = points;
        return [[x1, y1], [x1, y2], [x2, y2], [x2, y1]];
      }
      function sanitize([x, y]) {
        x = Math.floor(Math.max(x, 0));
        x = Math.min(x, labelData.width);
        y = Math.floor(Math.max(y, 0));
        y = Math.min(y, labelData.height);
        return [x, y];
      }
      if (things === null || things === undefined) {
        return;
      }
      things.forEach(({ points, tracingOptions }) => {
        const pts =
          tracingOptions && tracingOptions.enabled
            ? tracingOptions.trace
            : points;
        shapes.push({
          label: name,
          line_color: null,
          fill_color: null,
          points: transform(pts.map(({ lng, lat }) => [lng, lat])).map(
            sanitize
          ),
        });
      });
    } else if (type === 'text') {
      labels.push({
        label: name,
        type: type,
        values: things,
        prompt: prompt,
      });
    } else if (type === 'select-one') {
      labels.push({
        label: name,
        type: type,
        values: things,
        prompt: prompt,
        options: options,
      });
    }
  });

  const out = {
    flags: {},
    shapes,
    labels,
    lineColor: [0, 255, 0, 128],
    fillColor: [255, 0, 0, 128],
    imagePath: '',
    imageData: null,
  };

  return JSON.stringify(out);
}

export const shortcuts = '1234567890qwertasdfgzxcvb';
export const colors = [
  'black',
  'black',
  'black',
  'red',
  'blue',
  'green',
  'violet',
  'orange',
  'brown',
  'yellow',
  'olive',
  'teal',
  'purple',
  'pink',
  'red',
  'blue',
  'green',
  'violet',
  'orange',
  'brown',
  'yellow',
  'olive',
  'teal',
  'purple',
  'pink',
];
