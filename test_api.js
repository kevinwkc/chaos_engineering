import http from 'k6/http';
//const http = require("k6/http");
//https://k6.io/docs/using-k6/http-requests/


export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};


export default function () {
  function myget(){
    const response = http.get('https://test-api.k6.io/public/crocodiles');
    const crocs = JSON.parse(response.body);

    console.log(crocs)

    crocs.forEach((croc) => {
      if (croc.id % 2 === 0) {
        http.get(`https://test-api.k6.io/public/crocodiles/${croc['id']}`, {
          tags: { my_tag: 'even' },
        });
      } else {
        http.get(`https://test-api.k6.io/public/crocodiles/${croc['id']}`, {
          tags: {
            my_tag: 'odd',
          },
        });
      }
    });
  }
  myget()

  function mypost(){
    // define URL and payload
    const url = "https://test-api.k6.io/auth/basic/login/";
    const payload = JSON.stringify({
      username: "test_case",
      password: "1234",
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    
    //https://k6.io/docs/examples/http-authentication/
    const credentials = `${username}:${password}`;

    // Alternatively you can create the header yourself to authenticate
    // using HTTP Basic Auth
    const encodedCredentials = encoding.b64encode(credentials);
    const options = {
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    };

    // send a post request and save response as a variable
    const res = http.post(url, payload, params);

    //https://k6.io/docs/using-k6/checks/
    // check that response is 200
    check(res, {
      "response code was 200": (res) => res.status == 200,
    });

    check(res, {
      'verify homepage text': (r) =>
        r.body.includes('Collection of simple web-pages suitable for load testing'),
    });

    check(res, {
      'body size is 11,105 bytes': (r) => r.body.length == 11105,
    });
  }
  mypost()
}


/*
https://k6.io/docs/get-started/running-k6/
Running a 30-second, 10-VU load test
  k6 run --vus 10 --duration 30s script.js
  

k6 run --out json=tagged_crocs.json api/tags.js
jq 'select(.data.tags.my_tag=="even")' < tagged_crocs.json

const _ = require('lodash')

let b = [
  { 'id': 1, 'title': 'iPad 4 Mini', 'price': 500.01, 'inventory': 2 },
  { 'id': 2, 'title': 'H&M T-Shirt White', 'price': 10.99, 'inventory': 10 },
  { 'id': 3, 'title': 'Charli XCX - Sucker CD', 'price': 19.99, 'inventory': 5 }
]

_(_products).map(p => p.id).value()
_.map(_products,(p) => p.id)
_(_products).keyBy('title').value()


const fp = require("lodash/fp");
var c1= b
var c2= [
      { 'id': 1, 'title': 'kevin', 'wong':88, 'price': 500.01, 'inventory': 2 },
      { 'id': 2, 'title': 'H&M T-Shirt White', 'price': 10.99, 'inventory': 10 },
      { 'id': 3, 'title': 'Charli XCX - Sucker CD', 'price': 19.99, 'inventory': 5 }
    ]
var d = fp.merge(c1)(c2)  //c1 no change
> d   
{
  '0': { id: 1, title: 'kevin', price: 500.01, inventory: 2, wong: 88 },
  '1': { id: 2, title: 'H&M T-Shirt White', price: 10.99, inventory: 10 },
  '2': {
    id: 3,
    title: 'Charli XCX - Sucker CD',
    price: 19.99,
    inventory: 5
  }
}

export default {
  async getProducts () {
    await wait(100)
    return _products
  },

  async buyProducts (products) {
    await wait(100)
    if (
      // simulate random checkout failure.
      (Math.random() > 0.5 || navigator.webdriver)
    ) {
      return
    } else {
      throw new Error('Checkout error')
    }
  }
}

function wait (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
*/