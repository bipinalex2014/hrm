
// Simple Datatable
let table1 = document.querySelector('#tableEmployees');
let dataTable = new simpleDatatables.DataTable(table1);



function getModify(hId) {
        // console.log(hId);
        //  $('#modalModifyHoliday').on('shown.bs.modal', function () {
        //         $('#myInput').trigger('focus')
        //       })

        $.ajax({
                url: '/attendance/get-holiday-data/' + hId,
                method: 'GET',
                success: (response) => {
                        $('#textModifyName').val(response.data.holidayname);
                        $('#holiday').val(response.data._id);
                        // $('#textModifyDate').val(new Date(response.data.holidaydate));
                        document.getElementById('textModifyDate').value = response.data.holidaydate
                        $('#modalModifyHoliday').modal('toggle');
                }

        })


}
function modifyHoliday() {
        $('#formModifyHoliday').validate()
        if ($('#formModifyHoliday').valid()) {
                $.ajax({
                        url: '/attendance/modify-holiday',
                        method: 'post',
                        data: $('#formModifyHoliday').serialize(),
                        success: (response) => {
                                if (response.status) {
                                        window.location.replace('/attendance/holidays');
                                }
                                else {
                                        // console.log(response);
                                        $('#textErrMsg').html(response.msg);
                                }
                        }
                })
        }
}
function removeHoliday(id) {
        $.ajax({
                url: '/attendance/remove-holiday/' + id,
                method: 'post',
                success: (response) => {
                        if (response.status) {
                                window.location.replace('/attendance/holidays');
                        }
                }
        })
}
function modifyDepartment() {
        $('#formModifyHoliday').validate();
        if ($('#formModifyDepartment').valid()) {
                $.ajax({
                        url: '/misc/modify-department',
                        method: 'post',
                        data: $('#formModifyDepartment').serialize(),
                        success: (response) => {
                                if (response.status) {
                                        window.location.replace('/misc/departments');
                                }
                                else {
                                        // console.log(response);
                                        $('#textErrMsg').html(response.msg);
                                }
                        }
                })
        }
}
// function removeDepartment(id) {
//         $.ajax({
//                 url: '/misc/remove-department/' + id,
//                 method: 'post',
//                 success: (response) => {
//                         if (response.status) {
//                                 window.location.replace('/attendance/holidays');
//                         }
//                 }
//         })
// }
function getDepartmentValues(id) {
        $.ajax({
                url: '/misc/get-department-data/' + id,
                method: 'GET',
                success: (response) => {
                        $('#textModifyName').val(response.department);
                        $('#dept').val(response._id);
                        // $('#textModifyDate').val(new Date(response.data.holidaydate));
                        // document.getElementById('textModifyDate').value = response.data.holidaydate
                        $('#modalModifyDepartment').modal('toggle');
                }

        })
}
