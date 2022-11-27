const login = require('../../../routes/middleware/login.js');
const { Request, Response , NextFunction } = require('express');

const req = {
  body: {
    username: 'username',
    password: 'password'
  },
  method: 'GET'
}

// function Res() {

//   return {
//     statusCalled: false,
//     jsonCalled: false,
//     status: function () {
//       this.statusCalled = true;
//       return {
//         called: false,
//         json: function () {
//           called = true;
//           console.log('json called');
//         }
//       }
//     }
//   }
// }

class ResponseMockDawg {

  json = new JsonMock();

  constructor() {
    this.statusCalled = false;
  }

  status() {
    this.statusCalled = true;
    return this.json;
  }

  statusCalled() {
    return this.statusCalled;
  }

  jsonCalled() {
    return this.json.jsonCalled;
  }
}

class JsonMock {
  constructor() {
    this.jsonCalled = false;
  }

  json() {
    this.jsonCalled = true;
  }
}

describe('login middlewear', () => {
  describe('login success', () => {
    test('login success', () => {
      const res = new ResponseMockDawg();
      login(req, res, () => { console.log('next() called'); });
      console.dir(Object.keys(res));
      expect(res.statusCalled).toBe(true);
      expect(res.jsonCalled()).toBe(true);
      // console.dir(res);
      // const abc = res.status();
      // console.log(res.statusCalled);
      // const xyz = abc.json();
      // console.log(res.j.jsonCalled);
    });
  });
});