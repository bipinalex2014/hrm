var pdfCreate = require('pdf-creator-node');
const fs = require('fs');
const Promise = require('promise');


module.exports = {
    generateEmployeeProfile: (data) => {
        return new Promise((resolve, reject) => {
            data = [data];
            var html = fs.readFileSync("./employee-profile-pdf.hbs", "utf8");
            var options = {
                format: "A4",
                orientation: "Portrait",
                border: "1mm",
                header: {
                    height: "45mm",
                },
                
            };
            var document = {
                html: html,
                data: {
                    empData: data,
                    //   purchaseAmount:amount,

                },
                path: "./exports/purchase-report.pdf",
                type: "",
            };

            pdfCreate
                .create(document, options)
                .then((res) => {
                    console.log(res);
                    resolve(document.path);
                })
                .catch((error) => {
                    reject(error)
                    // console.error(error);
                });
        })
    }
}