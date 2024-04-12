const data = [
  {
    price: 21990000,
    quantity: 20,
    attributes: { color: "Midnight", storage: "128GB" },
    slug: "midnight-128gb",
  },
  {
    price: 24990000,
    quantity: 15,
    attributes: { color: "Starlight", storage: "256GB" },
    slug: "starlight-256gb",
  },
];
const currentVariation = {
  color: "Midnight",
  rom: "128GB",
};

const outputData1 = Object.keys(currentVariation).map((key) => {
  console.log(key);
  return data.reduce((acc, cur) => {
    console.log(cur.attributes);
    if (cur.attributes[key] === currentVariation[key]) {
      Object.keys(cur.attributes).forEach((variationKey) => {
        if (variationKey !== key) {
          acc[cur.attributes[variationKey]] = cur.slug;
          const arrValueVariation = [
            ...new Set(data.map((item) => item.attributes[variationKey])),
          ];
          arrValueVariation.forEach((value) => {
            if (!acc.hasOwnProperty(value)) {
              acc[value] = "";
            }
          });
        } else {
        }
      });
    }
    return acc;
  }, {});
});
console.log(outputData1);
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

// const outputData1 = Object.keys(currentVariation).map((key) => {
//   return data.reduce((acc, cur) => {
//     if (cur.variations[key] === currentVariation[key]) {
//       Object.keys(cur.variations).forEach((variationKey) => {
//         if (variationKey !== key) {
//           acc[cur.variations[variationKey]] = cur.slug;
//         }
//       });
//     }
//     return acc;
//   }, {});
// });
// console.log(outputData1);
/*
128gb-red

128gb-red           256gb-red           512gb-red
128gb               256gb               512gb

128gb-red           128gb-blue          128gb-green 
Red                 Blue                Green

*/
