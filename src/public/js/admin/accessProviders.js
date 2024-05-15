// function search(e) {
//   e.preventDefault();
//   var key = document.getElementById("searchInput").value;
// }

// document.getElementById("searchForm").addEventListener("submit", search);

// phanquyen
$(document).ready(function () {
  $(document).on("change", ".changeHierarchy", function () {
    const formId = $(this).data("formid");
    $("#" + formId).submit();
  });
});
