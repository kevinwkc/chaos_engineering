const { faker } = require('@faker-js/faker');



// subscriber.js
/*
GOAL TESTING
https://dev.to/k6/performance-testing-with-generated-data-using-k6-and-faker-2e

All dependencies added tend to balloon the memory consumption to some extent, especially when they scale up to 300 concurrent instances. Because of this, it's crucial that we only import the locale(s) we are using in our test case.

While putting together the example repository for this article, I noticed that using faker adds about 2.3MB of memory per VU, which for 300 VUs resulted in a total memory footprint of around 1.5GB.
*/
import * as faker from 'faker/locale/en_US'; 

export const generateSubscriber = () => ({
    name: `SUBSCRIPTION_TEST - ${faker.name.firstName()} ${faker.name.lastName()}`,
    title: faker.name.jobTitle(),
    company: faker.company.companyName(),
    email: faker.internet.email(),
    country: faker.address.country()
});
// index.js

import { sleep } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

import { generateSubscriber } from './subscriber';

const baseUrl = 'https://httpbin.test.loadimpact.com/anything';
const urls = {
  form: `${baseUrl}/form`,
  submit: `${baseUrl}/form/subscribe`,
};


/*
TEST GOAL
measure the number of requests where we don't receive an HTTP OK (200) status code in the response, as well as the total duration of each request.

300 virtual users trying to fetch and submit the subscription form every second,

Less than 10% are allowed to fail in retrieving the form
Less than 10% are allowed to fail in submitting the form data
Only 5% or less are permitted to have a request duration longer than 400ms
*/

const formFailRate = new Rate('failed form fetches');
const submitFailRate = new Rate('failed form submits');

export const options = {
  vus: 300,
  duration: '10s',
  thresholds: {
    'failed form submits': ['rate<0.1'],
    'failed form fetches': ['rate<0.1'],
    'http_req_duration': ['p(95)<400']
  }
};

const getForm = () => {
    const formResult = http.get(urls.form);
    formFailRate.add(formResult.status !== 200);
}

const submitForm = () => {
    const person = generateSubscriber();    
    const payload = JSON.stringify(person);

    const submitResult = http.post(urls.submit, payload);
    submitFailRate.add(submitResult.status !== 200);
}

export default function() {
    getForm();
    submitForm();
    sleep(1);
}