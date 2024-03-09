function eventFired(type) {
  let n = document.querySelector("#demo_info");
  n.innerHTML += "<div>" + type + " event - " + new Date().getTime() + "</div>";
  n.scrollTop = n.scrollHeight;
}

new DataTable("#example")
  .on("order.dt", () => eventFired("Order"))
  .on("search.dt", () => eventFired("Search"))
  .on("page.dt", () => eventFired("Page"));
