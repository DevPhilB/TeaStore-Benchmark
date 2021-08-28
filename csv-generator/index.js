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
const random = new Random(MersenneTwister19937.seed(seed));
faker.seed(seed);

// Fake
// UserId 0-99
// Category 2-6
// ProductId C2 (7-106), C3 (107-206), C4 (207-306), C5 (307-406), C6 (407-506)
/* Order JSON
{
    "id": null,
    "userId": null,
    "time": null,
    "totalPriceInCents": null,
    "addressName": "address.companyName",
    "address1": "address.streetName + address.streetAddress",
    "address2": "address.zipCode + address.city",
    "creditCardCompany": "",
    "creditCardNumber": "finance.creditCardNumber",
    "creditCardExpiryDate": "date.future"
}
*/

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

const request = "https://$WEB_SERVICE:$WEB_PORT/api/web/cartaction/confirm";
const json = JSON.stringify(orderJson);

// Generate csv file
stringify([[request, json]], function (err, output) {
    fs.writeFileSync('./fake.csv', output);
});
