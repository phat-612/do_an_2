const data = [
  {
    name: "iPhone 13 Pro Max",
    description:
      "Đỉnh cao của công nghệ với màn ProMotion và hệ thống camera siêu việt.",
    images: ["iphone13promax-img1.jpg", "iphone13promax-img2.jpg"],
    idCategory: "660b8dbf99baa8b459c768c7",
    variations: [
      {
        price: 33990000,
        quantity: 15,
        attributes: {
          color: "Graphite",
          storage: "512GB",
        },
      },
    ],
  },
  {
    name: "iPhone 12 Mini",
    description: "Thiết kế nhỏ gọn, hiệu năng mạnh mẽ với chip A14 Bionic.",
    images: ["iphone12mini-img1.jpg", "iphone12mini-img2.jpg"],
    idCategory: "660b8dbf99baa8b459c768c7",
    variations: [
      {
        price: 16990000,
        quantity: 25,
        attributes: {
          color: "White",
          storage: "128GB",
        },
      },
    ],
  },
  {
    name: "OPPO Find X2",
    description: "Thiết kế đẳng cấp, trải nghiệm hình ảnh sắc nét.",
    images: ["oppofindx2-img1.jpg", "oppofindx2-img2.jpg"],
    idCategory: "660b8dc999baa8b459c768cf",
    variations: [
      {
        price: 19990000,
        quantity: 20,
        attributes: {
          color: "Ocean",
          storage: "256GB",
        },
      },
    ],
  },
  {
    name: "OPPO A94",
    description: "Thời trang, mạnh mẽ với chế độ game đặc biệt.",
    images: ["oppoa94-img1.jpg", "oppoa94-img2.jpg"],
    idCategory: "660b8dc999baa8b459c768cf",
    variations: [
      {
        price: 7490000,
        quantity: 40,
        attributes: {
          color: "Fluid Black",
          storage: "128GB",
        },
      },
    ],
  },
  {
    name: "Samsung Galaxy S21",
    description: "Camera chuyên nghiệp, hiệu năng đột phá.",
    images: ["galaxys21-img1.jpg", "galaxys21-img2.jpg"],
    idCategory: "660b8dd099baa8b459c768d3",
    variations: [
      {
        price: 20990000,
        quantity: 30,
        attributes: {
          color: "Phantom Violet",
          storage: "256GB",
        },
      },
    ],
  },
  {
    name: "Samsung Galaxy A52",
    description: "Mọi thứ bạn muốn, với giá trị không ngờ.",
    images: ["galaxya52-img1.jpg", "galaxya52-img2.jpg"],
    idCategory: "660b8dd099baa8b459c768d3",
    variations: [
      {
        price: 8990000,
        quantity: 50,
        attributes: {
          color: "Awesome Black",
          storage: "128GB",
        },
      },
    ],
  },
  {
    name: "iPhone 11",
    description: "Công nghệ hiện đại, màu sắc đa dạng.",
    images: ["iphone11-img1.jpg", "iphone11-img2.jpg"],
    idCategory: "660b8dbf99baa8b459c768c7",
    variations: [
      {
        price: 15990000,
        quantity: 35,
        attributes: {
          color: "Purple",
          storage: "128GB",
        },
      },
    ],
  },
  {
    name: "Samsung Galaxy Note 20",
    description:
      "Trải nghiệm viết và làm việc cấp cao với S-Pen và hiệu năng mạnh mẽ.",
    images: ["galaxynote20-img1.jpg", "galaxynote20-img2.jpg"],
    idCategory: "660b8dd099baa8b459c768d3",
    variations: [
      {
        price: 22990000,
        quantity: 15,
        attributes: {
          color: "Mystic Bronze",
          storage: "256GB",
        },
      },
    ],
  },
  {
    name: "OPPO A9 2020",
    description: "Pin trâu bò cùng hiệu năng ổn định phù hợp nhu cầu giải trí.",
    images: ["oppoa92020-img1.jpg", "oppoa92020-img2.jpg"],
    idCategory: "660b8dc999baa8b459c768cf",
    variations: [
      {
        price: 6490000,
        quantity: 40,
        attributes: {
          color: "Marine Green",
          storage: "128GB",
        },
      },
    ],
  },
  {
    name: "iPhone 11 Pro",
    description: "Hiệu suất ấn tượng, hệ thống ba camera chuyên nghiệp.",
    images: ["iphone11pro-img1.jpg", "iphone11pro-img2.jpg"],
    idCategory: "660b8dbf99baa8b459c768c7",
    variations: [
      {
        price: 25690000,
        quantity: 10,
        attributes: {
          color: "Midnight Green",
          storage: "256GB",
        },
      },
    ],
  },
];

function sendData() {
  for (let item of data) {
    console.log("gửi thêm sản phẩm: ", item.name);
    const response = fetch("http://localhost:3000/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
  }
}

const Student = {
  name: "Nguyen Van A",
  age: 20,
  address: "Hanoi",
  getInfo: function () {
    console.log("name: ", this.name);
    console.log("age: ", this.age);
    console.log("address: ", this.address);
  },
  diHoc: () => {
    console.log("đi hoc");
  },
};
Student.getInfo();
