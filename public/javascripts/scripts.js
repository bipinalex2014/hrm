
$(document).ready(function () {
  $('#tableDepartments').DataTable();
});


function uploadProfileImage(emplId) {
  var dpImage = document.getElementById('fileAvatar');



  const name = dpImage.name;
  const lastDot = name.lastIndexOf('.');
  var errObj = document.getElementById('errMsg');
  const fileName = name.substring(0, lastDot);
  const ext = name.substring(lastDot + 1);
  // if(ext!='jpg'){
  //     errObj.innerHTML='Invalid file type, only accepts JPG files'
  //     errObj.classList.add('text-danger')
  // }
  // else{
  errObj.innerHTML = null;
  $.ajax({
    url: '/employee/employee-data/' + emplId + "/upload-avatar",
    method: 'post',
    data: {

    },
    success: (response) => {
      console.log(response);
    }
  })
  // }
  console.log(ext);
}
