const data = [
  {
    price: 359350000,
    quantity: 20,
    attributes: { ram: "512GB", color: "titan Tự Nhiên" },
    sold: 0,
    _id: "66437b6ca10bcc0ff8ed4f4f",
    slug: "512gb-titan-tu-nhien",
  },
  {
    price: 359000000,
    quantity: 20,
    attributes: { ram: "256GB", color: "titan Trắng" },
    sold: 0,
    _id: "66437b6ca10bcc0ff8ed4f50",
    slug: "512gb-titan-trang",
  },
];
let dataVariation = {
  dataTable: [],
};
let arrKey = Object.keys(data[0].attributes);
arrKey.forEach((key) => {
  let arrValue = [...new Set(data.map((item) => item.attributes[key]))];
  dataVariation[key] = arrValue;
});
if (arrKey.length === 1) {
  return;
}

dataVariation[arrKey[0]].forEach((value1) => {
  dataVariation[arrKey[1]].forEach((value2) => {
    let temp = data.find(
      (item) =>
        JSON.stringify(item.attributes) ==
        JSON.stringify({
          [arrKey[0]]: value1,
          [arrKey[1]]: value2,
        })
    );
    if (!temp) {
      dataVariation.dataTable.push({
        price: 0,
        quantity: 0,
        attributes: { [arrKey[0]]: value1, [arrKey[1]]: value2 },
        sold: 0,
        _id: "",
        slug: "",
      });
    } else {
      dataVariation.dataTable.push(temp);
    }
  });
});
console.log(dataVariation);
