const data = [
  {
    slug: "128gb-red",
    variations: {
      color: "Red",
      rom: "128GB",
    },
  },
  {
    slug: "256gb-red",
    variations: {
      color: "Red",
      rom: "256GB",
    },
  },
  {
    slug: "512gb-red",
    variations: {
      color: "Red",
      rom: "512GB",
    },
  },
  {
    slug: "128gb-blue",
    variations: {
      color: "Blue",
      rom: "128GB",
    },
  },
  {
    slug: "256gb-blue",
    variations: {
      color: "Blue",
      rom: "256GB",
    },
  },
  {
    slug: "512gb-blue",
    variations: {
      color: "Blue",
      rom: "512GB",
    },
  },
  {
    slug: "128gb-green",
    variations: {
      color: "Green",
      rom: "128GB",
    },
  },
  {
    slug: "256gb-green",
    variations: {
      color: "Green",
      rom: "256GB",
    },
  },
  {
    slug: "512gb-green",
    variations: {
      color: "Green",
      rom: "512GB",
    },
  },
];
const currentVariation = {
  color: "Red",
  rom: "128GB",
};
const outputData = [
  {
    "128GB": "128gb-red",
    "256GB": "256gb-red",
    "512GB": "512gb-red",
  },
  {
    Red: "128gb-red",
    Blue: "128gb-blue",
    Green: "128gb-green",
  },
];

// const colorData = data.reduce((acc, cur) => {
//   if (cur.variations.color === currentVariation.color) {
//     acc[cur.variations.rom] = cur.slug;
//   }
//   return acc;
// }, {});

// const romData = data.reduce((acc, cur) => {
//   if (cur.variations.rom === currentVariation.rom) {
//     acc[cur.variations.color] = cur.slug;
//   }
//   return acc;
// }, {});

// const outputData1 = [colorData, romData];
// console.log(outputData1);

const outputData1 = Object.keys(currentVariation).map((key) => {
  return data.reduce((acc, cur) => {
    if (cur.variations[key] === currentVariation[key]) {
      Object.keys(cur.variations).forEach((variationKey) => {
        if (variationKey !== key) {
          acc[cur.variations[variationKey]] = cur.slug;
        }
      });
    }
    return acc;
  }, {});
});
console.log(outputData1);
/*
128gb-red

128gb-red           256gb-red           512gb-red
128gb               256gb               512gb

128gb-red           128gb-blue          128gb-green 
Red                 Blue                Green

*/
