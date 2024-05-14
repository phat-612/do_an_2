var tbody = document.querySelector("tbody");
// // ====================================================

function createAttri1Row() {
  var nameAttr1 = document.getElementById("inpNameAttributePro1").value;
  var nameAttr2 = document.getElementById("inpNameAttributePro2").value;
  var attr1Values = Array.from(document.querySelectorAll(".thuocTinh1")).map(
    (input) => input.value
  );
  var attr2Values = Array.from(document.querySelectorAll(".thuocTinh2")).map(
    (input) => input.value
  );

  var numberRow1 = attr1Values.length;
  // console.log(attr1Values.reverse());
  var numberRow2 = attr2Values.length;
  // console.log(numberRow2);

  document.querySelector(".th1").textContent = nameAttr1;
  document.querySelector(".th2").textContent = nameAttr2;
  console.log(attr1Values, attr2Values);

  let tbody = document.querySelector("tbody");
  let tbodyHTML = "";

  let currentRow = 0;

  attr1Values.forEach((val1, ind1) => {
    attr2Values.forEach((val2, ind2) => {
      if (ind2 === 0) {
        tbodyHTML += `
          <tr>
            <td class="td1" rowspan="${numberRow2}">${val1}</td>
            <td>${val2}</td>
            <td><input type="number"  class="form-control w-50 variations" name="variations[${currentRow}][price]" required></td>
            <td><input type="number"  class="form-control w-50 variations" name="variations[${currentRow}][quantity]"></td>
            <input type="text" value="${val1}" name="variations[${currentRow}][attributes][${nameAttr1}]" hidden />
            <input type="text" value="${val2}" name="variations[${currentRow}][attributes][${nameAttr2}]" hidden />
          </tr>
        `;
        currentRow++;
      } else {
        if (val2) {
          tbodyHTML += `
          <tr>
            <td>${val2}</td>
            <td><input type="number" class="form-control w-50 variations" name="variations[${currentRow}][price]" required></td>
            <td><input type="number" class="form-control w-50 variations" name="variations[${currentRow}][quantity]" required></td>
            <input type="text" value="${val1}" name="variations[${currentRow}][attributes][${nameAttr1}]" hidden />
            <input type="text" value="${val2}" name="variations[${currentRow}][attributes][${nameAttr2}]" hidden />
          </tr>
        `;
          currentRow++;
        }
      }
    });
  });
  tbody.innerHTML = tbodyHTML;
}

window.addEventListener("load", createAttri1Row);

window.addEventListener("load", function () {
  const td1 = document.querySelectorAll(".td1");
  const td2 = document.querySelectorAll(".td2");

  console.log(td1.textContent);
  console.log(td2);
});

// window.addEventListener("load", function () {
//   $(".td1").each(function () {
//     const td1value = $(this).text();
//     $(".td2").each(function () {
//       const td2value = $(this).text();
//       if (td1value == td2value) {
//         $("td2").each(function () {
//           $(this).hide();
//         });
//       }
//     });
//   });
// });
