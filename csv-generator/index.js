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
const writeFileSync = require('fs').writeFileSync;
const faker = require('faker');
const MersenneTwister19937 = require("random-js").MersenneTwister19937;
const Random = require("random-js").Random;
const stringify = require('csv-stringify');

// Sets locale to de
faker.locale = "de";
// Use command line arguments
const seed = parseInt(process.argv[2].split("=")[1], 10);
const threads = parseInt(process.argv[3].split("=")[1], 10);
const loops = parseInt(process.argv[4].split("=")[1], 10);
// Configure seed
const random = new Random(MersenneTwister19937.seed(seed));
faker.seed(seed);

// Disabled for wrk2
// const protocol = "http://";
// const url = "localhost:80";

// API paths
const INDEX = "/api/web/index";
const LOGIN = "/api/web/login";
const LOGIO = "/api/web/logioaction";
const CATEGORY = "/api/web/category";
const PRODUCT = "/api/web/product";
const ADDTOCART = "/api/web/cartaction/addtocart";
const PROCEEDTOCHECKOUT = "/api/web/proceedtocheckout";
const CONFIRM = "/api/web/confirm";

function generateUserId() {
  // UserId 0-99
  return random.integer(0, 99);
}

function generateCategoryId() {
  // Category 2-6
  return random.integer(2, 6);
}

function generateProductIdByCategory(categoryId) {
  // ProductId C2 (7-106), C3 (107-206), C4 (207-306), C5 (307-406), C6 (407-506)
  let min, max;
  switch (categoryId) {
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
  return random.integer(min, max);
}

function generateOrderJson() {
  // Order data
  const addressName = faker.company.companyName();
  const address1 = faker.address.streetName() + " " + faker.address.streetAddress();
  const address2 = faker.address.zipCode() + " " + faker.address.city();
  const creditCardCompany = random.integer(0, 1) == 0 ? "MasterCard" : "Visa";
  const creditCardNumber = faker.finance.creditCardNumber();
  const creditCardExpiryDate = faker.date.future();

  return JSON.stringify(
    {
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
  );
}

for (let t = 0; t < threads; t++) {
  const method = [];
  const requests = [];
  const bodies = [];
  const fileName = "../workload-" + t + ".csv";

  for (let l = 0; l < loops; l++) {
    let categoryId = generateCategoryId();
    let productId = generateProductIdByCategory(categoryId);

    // Add requests.push(...); for libcurl

    // http://$WEB_SERVICE:$WEB_PORT/api/web/index
    method.push("GET");
    requests.push(INDEX);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/login
    method.push("GET");
    requests.push(LOGIN);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/logioaction?username=user97&password=password
    method.push("POST");
    requests.push(LOGIO + "?username=user" + generateUserId() + "&password=password");
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/category?id=
    method.push("GET");
    requests.push(CATEGORY + "?id=" + categoryId);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/product?id=
    method.push("GET");
    requests.push(PRODUCT + "?id=" + productId);
    bodies.push("");
    // Choose between add two different products or select other category and add product directly
    if (random.bool()) {
      // 2x http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/addtocart?productid=
      method.push("GET");
      requests.push(ADDTOCART + "?productid=" + productId);
      bodies.push("");
      method.push("GET");
      requests.push(ADDTOCART + "?productid=" + generateProductIdByCategory(categoryId));
      bodies.push("");
    } else {
      categoryId = generateCategoryId();
      productId = generateProductIdByCategory(categoryId);
      // http://$WEB_SERVICE:$WEB_PORT/api/web/category?id=
      method.push("GET");
      requests.push(CATEGORY + "?id=" + categoryId);
      bodies.push("");
      // http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/addtocart?productid=
      method.push("GET");
      requests.push(ADDTOCART + "?productid=" + productId);
      bodies.push("");
    }
    // http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/proceedtocheckout
    method.push("GET");
    requests.push(PROCEEDTOCHECKOUT);
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/confirm with Order JSON
    method.push("POST");
    requests.push(CONFIRM);
    bodies.push(generateOrderJson());
    bodies.push("");
    // http://$WEB_SERVICE:$WEB_PORT/api/web/logioaction
    method.push("POST");
    requests.push(LOGIO);
    bodies.push("");
  }

  const result = method.map((value, index) => {
    return [value, requests[index], bodies[index]];
  })

  // Generate CSV file
  stringify(
    result,
    {
      delimiter: ';'
    },
    function (_, output) {
      writeFileSync(fileName, output);
    }
  );

}
