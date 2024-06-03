$(".owl-carousel").owlCarousel({
  loop: false,
  margin: 10,
  lazyLoad: true,
  nav: false,
  stageClass: "owl-stage d-flex my-3",
  responsive: {
    0: {
      items: 2,
    },
    600: {
      items: 3,
    },
    800: {
      items: 4,
    },
    1000: {
      items: 5,
    },
  },
});
