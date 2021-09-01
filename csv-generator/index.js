/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fs = require('fs');
const faker = require('faker');
const MersenneTwister19937 = require("random-js").MersenneTwister19937;
const Random = require("random-js").Random;
const stringify = require('csv-stringify');

// Sets locale to de
faker.locale = "de";
const seed = process.argv[0] | 42;
const loops = process.argv[1] | 1000;
const random = new Random(MersenneTwister19937.seed(seed));
faker.seed(seed);

// Set request number
const protocol = "http://"
const url = "localhost:80"

const INDEX = "/api/web/index";
const LOGIN = "/api/web/login";
const LOGIO = "/api/web/logioaction";
const CATEGORY = "/api/web/category";
const PRODUCT = "/api/web/product";
const ADDTOCART = "/api/web/cartaction/addtocart";
const PROCEEDTOCHECKOUT = "/api/web/proceedtocheckout";
const CONFIRM = "/api/web/confirm";

const method = [];
const requests = [];
const bodies = [];

for (let index = 0; index < loops; index++) {
    
    // UserId 0-99
    const userId = random.integer(0, 99);
    // Category 2-6
    const category = random.integer(2, 6);
    // ProductId C2 (7-106), C3 (107-206), C4 (207-306), C5 (307-406), C6 (407-506)
    let min, max;
    switch (category) {
        case 2:
            min = 7, max = 106;
            break;
        case 3:
            min = 107, max = 206;
            break;
        case 4:
            min = 207, max = 306;
            break;
        case 5:
            min = 307, max = 406;
            break;
        case 6:
            min = 407, max = 506;
            break;
        default: break;
    }
    const productId = random.integer(min, max);
    // Order JSON
    const addressName = faker.company.companyName();
    const address1 = faker.address.streetName() + faker.address.streetAddress();
    const address2 = faker.address.zipCode() + faker.address.city();
    const creditCardCompany = random.integer(0, 1) == 0 ? "MasterCard" : "Visa";
    const creditCardNumber = faker.finance.creditCardNumber();
    const creditCardExpiryDate = faker.date.future();

    const orderJson = {
        "id": null,
        "userId": null,
        "time": null,
        "totalPriceInCents": null,
        "addressName": addressName,
        "address1": address1,
        "address2": address2,
        "creditCardCompany": creditCardCompany,
        "creditCardNumber": creditCardNumber,
        "creditCardExpiryDate": creditCardExpiryDate
    }

    // http://$WEB_SERVICE:$WEB_PORT/api/web/index
    method.push("GET");
    requests.push(protocol + url + INDEX);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/login
    method.push("GET");
    requests.push(protocol + url + LOGIN);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/logioaction?username=user97&password=password
    method.push("POST");
    requests.push(protocol + url + LOGIO + "?username=user" + userId + "&password=password");
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/category?id=
    method.push("GET");
    requests.push(protocol + url + CATEGORY + "?id=" + category);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/product?id=
    method.push("GET");
    requests.push(protocol + url + PRODUCT + "?id=" + productId);
    bodies.push("");
    // 2x http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/addtocart?productid=
    method.push("GET");
    requests.push(protocol + url + ADDTOCART + "?productid=" + productId);
    bodies.push("");
    method.push("GET");
    requests.push(protocol + url + ADDTOCART + "?productid=" + random.integer(min, max)); // TODO
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/proceedtocheckout
    method.push("GET");
    requests.push(protocol + url + PROCEEDTOCHECKOUT);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/confirm with Order JSON
    method.push("POST");
    requests.push(protocol + url + CONFIRM);
    bodies.push(JSON.stringify(orderJson));
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/logioaction
    method.push("POST");
    requests.push(protocol + url + LOGIO);
    bodies.push("");
}

const result = method.map((value, index) => {
    return [value, requests[index], bodies[index]];
})

// Generate csv file
stringify(
    result,
    {
        delimiter: ';'
    },
    function (err, output) {
    fs.writeFileSync('../fake.csv', output);
    }
);
