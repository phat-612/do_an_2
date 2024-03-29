[
  {
    email: "phat@gmail.com",
    name: "Phát",
    phone: "0382909902",
    address: "cần thơ",
    images: ["anh 1", "ảnh 2"],
    note: "bảo hành lẹ lẹ",
    status: "chờ xử lý",
    total: 900000,
    details: [
      {
        idProduct: { type: Schema.Types.ObjectId, ref: "Product" },
        reason: "hư",
        price: "120000",
      },
      {
        idProduct: { type: Schema.Types.ObjectId, ref: "Product" },
        reason: "hư",
        price: "120000",
      },
    ],
  },
];
