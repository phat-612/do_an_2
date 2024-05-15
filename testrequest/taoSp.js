const data = [
  {
    name: "Test Product",
    description: "Sample Description",
    images: ["1715698215526-xiaomi-redmi-note-13-pro-4g_10__1.webp"],
    idCategory: "6644c86174acb596d4499ea0",
    variations: [
      {
        price: 10000000,
        quantity: 1000,
        attributes: {
          ram: "4GB",
          color: "Red",
        },
      },
      {
        price: 12000000,
        quantity: 1000,
        attributes: {
          ram: "8GB",
          color: "Black",
        },
      },
      {
        price: 15000000,
        quantity: 1000,
        attributes: {
          ram: "8GB",
          color: "White",
        },
      },
    ],
    discount: {
      percent: 0,
      startDay: "2022-01-01T00:00:00.000Z",
      endDay: "2022-12-31T00:00:00.000Z",
    },
  },
];

function sendData() {
  for (let i = 0; i < 300; i++) {
    let tempData = data[0];
    tempData.name = "Test Product " + i;
    console.log(tempData);
    const response = fetch("http://localhost:3000/api/testAddProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tempData),
    });
  }
}
sendData();
