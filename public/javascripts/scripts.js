import Cropper from 'cropperjs';

const image = document.getElementById('fileAvatar');
const cropper = new Cropper(image, {
  aspectRatio: 16 / 9,
  crop(event) {
    console.log(event.detail.x);
    console.log(event.detail.y);
    console.log(event.detail.width);
    console.log(event.detail.height);
    console.log(event.detail.rotate);
    console.log(event.detail.scaleX);
    console.log(event.detail.scaleY);
  },
});
$(document).ready(function () {
    $('#tableDepartments').DataTable();
});


function uploadProfileImage() {
    var dpImage = document.getElementById('fileAvatar');
    


    // const name = dpImage.name;
    // const lastDot = name.lastIndexOf('.');
    // var errObj = document.getElementById('errMsg');
    // const fileName = name.substring(0, lastDot);
    // const ext = name.substring(lastDot + 1);
    // if(ext!='jpg'){
    //     errObj.innerHTML='Invalid file type, only accepts JPG files'
    //     errObj.classList.add('text-danger')
    // }
    // else{
    //     errObj.innerHTML=null;
    // }
    // console.log(ext);
}
