function search(e) {
  e.preventDefault();
  var key = document.getElementById("searchInput").value;
}

document.getElementById("searchForm").addEventListener("submit", search);
