
$('#formCreateEmployee').validate({
    rules: {
        firstname: {
            required: true,
        },
        lastname: {
            required: true,
        },
        email: {
            required: true,
            validEmailid: true,
        },
        gender: {
            required: true,
        },
        dateofbirth: {
            required: true,
        },
        dateofjoin: {
            required: true,
        },
        department: {
            required: true,
        },
        designation: {
            required: true,
        },
        role: {
            // required: true,
        },
        headdesignation: {
            required: true,
        },
        basicsalary: {
            required: true,
            number: true,
        },
        otrate: {
            required: true,
            number: true,
        },
        address: {
            required: true,
        },
        place: {
            required: true,
        },
        city: {
            required: true,
        },
        phone: {
            required: true,
            number: true,
        },
        employeeid: {
            required: true,
        },
        bloodgroup: {
            required: true,
        },
        username: {
            required: true,
        },
        password: {
            required: true,
            strongPassword: true,
        },
        confirmpassword: {
            required: true,
            equalTo: '#textPassword'
        },
        headdesignation: {
            required: true,
        },
        maritialstatus: {
            required: true,
        }
    },
    messages: {
        firstname: {
            required: "Please enter first name",
        },
    },
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
})

$('#formCreateDepartment').validate({
    rules: {
        department: {
            required: true,
        }
    },
    messages: {
        designation: {
            required: "Enter a valid name for department"
        }
    },
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
})
$('#formCreateDesignation').validate({
    rules: {
        designation: {
            required: true,
        }
    },
    messages: {
        designation: {
            required: "Enter a valid name for designation"
        }
    }
    ,
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
})
$('#qualificationsForm').validate({
    rules: {
        educationlevel: {
            required: true,
        },
        institution: {
            required: true,
        },
        educationfrom: {
            required: true,
        },
        educationto: {
            required: true
        },
        educationdescription: {
            required: true,
        },
        educationdocument: {
            required: true,
        }

    },
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
})
$('#experienceForm').validate({
    rules: {
        exppost: {
            required: true
        },
        expcompany: {
            required: true
        },
        expfrom: {
            required: true,
        },
        expto: {
            required: true,
        },
        expdescription: {
            required: true,
        },
        expdocument: {
            required: true,
        }
    },
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
})
$('#bankDetailsForm').validate({
    rules: {
        acctype: {
            required: true,
        },
        accbank: {
            required: true,
        },
        accnumber: {
            required: true,
            indianAccountNumber: true,
        },
        accbankcode: {
            required: true,
        },
        accbranch: {
            required: true,
        }
    },
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
    messages: {
        accnumber: {
            indianAccountNumber: "Please enter a valid account number"
        }
    }
})

$('#emergencyContactForm').validate({
    rules: {
        relation: {
            required: true,
        },
        name: {
            required: true,
        },
        address: {
            required: true,
        },
        phone: {
            required: true,
            number: true,
        },
        city: {
            required: true,
        },
        state: {
            required: true,
        },
        zipcode: {
            required: true,
            number: true,
        },
        email:{
            validEmailid:true,
        }
    },
    messages: {

    },
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
})
$('#contractForm').validate({
    errorPlacement: (error, element) => {
        error.addClass('text-danger')
        error.appendTo(element.parent('div'))
    },
    rules:{
        contrtype:{
            required:true,
        },
        contrname:{
            required:true,
        },
        contrfrom:{
            required:true,
        },
        contrto:{
            required:true,
        },
        contrdesi:{
            required:true,
        },
        contrdesc:{
            required:true,
        }
    }
})
$('#imigrationForm').validate(
    {
        errorPlacement: (error, element) => {
            error.addClass('text-danger')
            error.appendTo(element.parent('div'))
        },
        rules:{
            doctype:{
                required:true,
            },
            docnumber:{
                required:true,
            },
            docissued:{
                required:true,
            },
            docexpeiry:{
                required:true,
            },
            document:{
                required:true,
            },
            doccountry:{
                required:true,
            },
        }
    }
)

//Custom validator for strong password
$.validator.addMethod("strongPassword", function (value, element) {
    return this.optional(element) || /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(value)
}, "Password contains\n1. At least one digit, At least one lowercase character, At least one uppercase character , At least one special character, At least 8 characters in length, but no more than 16.")
//Custom validator for input is an email address
$.validator.addMethod("validEmailid", function (value, element) {
    return this.optional(element) || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
}, "Enter email address like yourname@example.com");
$.validator.addMethod("indianAccountNumber", function (value, element) {
    return this.optional(element) || /^\d{9,18}$/.test(value)
}, "Enter a valid account number")


