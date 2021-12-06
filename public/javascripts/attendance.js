// let dutyStatus = document.querySelector('#dutyStatus')
// // console.log(dutyStatus)
// dutyStatus.addEventlistener('change',function(){
//     let id = document.getElementById('data').value
//     console.log("ffffff",id)

//     alert("yeah");
// //     let datas = document.querySelector('#data').value
// //     // let data = event.target.value
// //     console.log('data',data)
// })

function change(){
    let dutyStatus = document.querySelector('#dutyStatus').value
    console.log(dutyStatus)
    if(dutyStatus=="duty"){
        document.getElementById('time').style.display = 'block'
        document.getElementById('time').style.backgroundColor = '#D3D3D3'
        document.getElementById('inTime').value = '9:00 am'
        document.getElementById('outTime').value = '5:00 pm'

    }
    else{
        document.getElementById('time').style.display = 'none'
        document.getElementById('inTime').value = ''
        document.getElementById('outTime').value = ''
    }
}

// let date = new Date()
// document.getElementById('date').valueAsDate = new Date()



// function changeShift(){
//     let shift = document.querySelector('')
// }

function changeshift(){
    let id = document.getElementById('duty').value
    console.log("ffffff",id)

    $.ajax({
        url: '/employee/get-shift-time/' + id,
        method: 'POST',
        // data: {
        //     id: id,
            
        // },
        success: function (data) {
            document.getElementById('startTime').value = data.startTime
            document.getElementById('endTime').value = data.endTime
        }
    })
}


function attendance(event){
    let data = document.querySelector('#attendanceStatus').value
    let card = document.querySelector('#cardBox')
    console.log("data",data)
    for(let i=0;i<=data.length;i++){
        if(data == "leave"){
            document.getElementById('start').style.display = "none"
            document.getElementById('end').style.display = "none"
            // document.getElementById(divId).style.display = element.value == 1
        }
        else{
            document.getElementById('start').style.display = 'block'
            document.getElementById('end').style.display = 'block'
        }
    }
    
}





// function saveButton(){
//     console.log("success")
//     $.ajax({
//         url: '/attendance/mark-employees-attendance',
//         method: 'post',
//         data: $('#attendanceData').serialize(),
//         // console.log();,
//         success: (response) => {

//         }
//     })
// }


// var addButton = document.getElementById('savebtn');
// addButton.addEventListener('click', function (evt) {
//     evt.preventDefault();
//     console.log("success")
//     let id = document.getElementById('employeeid').value
//     console.log("id>>>>",id)
//     $.ajax({
//         url: '/attendance/mark-employees-attendance',
//         method: 'post',
//         data: $('#attendanceData').serialize(),
        
//         success: (response) => {
           
//         }
//     })


// })
