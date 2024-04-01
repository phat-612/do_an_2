const addressModal = document.getElementById("addressModal");
addressModal.addEventListener("show.bs.modal", function (event) {
  let button = event.relatedTarget;
  //   set link
  let linkAction = button.getAttribute("data-bs-linkAction");
  addressModal.querySelector("form").action = linkAction;
  // có idAddress ==> chỉnh sửa
  let idAddress = button.getAttribute("data-bs-idAddress");
  if (idAddress) {
    let alias = button.getAttribute("data-bs-alias");
    let name = button.getAttribute("data-bs-name");
    let phone = button.getAttribute("data-bs-phone");
    let address = button.getAttribute("data-bs-address");
    let defaultAddress = button.getAttribute("data-bs-defaultAddress");
    addressModal.querySelector("#idAddress").value = idAddress;
    addressModal.querySelector("#alias").value = alias;
    addressModal.querySelector("#name").value = name;
    addressModal.querySelector("#phone").value = phone;
    addressModal.querySelector("#address").value = address;
    if (defaultAddress == "true") {
      addressModal
        .querySelector("#defaultAddress")
        .closest("div").hidden = true;
    } else {
      addressModal
        .querySelector("#defaultAddress")
        .closest("div").hidden = false;
    }
  } else {
    addressModal.querySelector("#idAddress").value = "";
    addressModal.querySelector("#alias").value = "";
    addressModal.querySelector("#name").value = "";
    addressModal.querySelector("#phone").value = "";
    addressModal.querySelector("#address").value = "";
    addressModal.querySelector("#defaultAddress").closest("div").hidden = false;
  }
});
