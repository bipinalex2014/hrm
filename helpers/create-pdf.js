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
                border: "10mm",
                header: {
                    height: "45mm",
                },
                footer: {
                    height: "28mm",
                    contents: {
                        first: 'Cover page',
                        2: 'Second page', // Any page number is working. 1-based index
                        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                        last: 'Last Page'
                    }
                }
            };
            var document = {
                html: html,
                data: {
                    empData: data,
                    //   purchaseAmount:amount,

                },
                path: "./purchase-report.pdf",
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