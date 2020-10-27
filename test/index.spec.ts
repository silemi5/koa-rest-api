import chai from "chai";
import chaiHttp from "chai-http";
import { app } from "../src/server";
import dotenv from 'dotenv'
import { verify } from 'jsonwebtoken'
import mongoose from 'mongoose'

dotenv.config();

interface UserTest {
  id?: string;
  name: string;
  email: string;
  password: string;
  token?: string;
}

const server = app.listen()
const expect = chai.expect;
const JWT_SECRET: string = process.env.JWT_SECRET || ""

chai.use(chaiHttp);


describe("Routes: /api", () => {
  before(() => {
    mongoose.connection.collections.users.drop();
  });

  const user: UserTest = {
    id: "INVALID-ID",
    name: "username",
    email: "input@email.com",
    password: "password1"
  };

  after(() => {
    server.close();
  });

  it("should create the user", done => {
    chai
      .request(server)
      .post("/api/users")
      .send({ "email": user.email, "password": user.password })
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).to.have.all.keys('id', 'email', 'name');
        expect(res.body).to.include({ "email": user.email, "name": null });

        user.id = res.body.id;

        done();
      });
  });

  it("should authenticate the user", done => {
    chai
      .request(server)
      .post('/api/auth')
      .set('Authorization', `Basic {${user.email}:${user.password}}`)
      .send()
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).to.have.all.keys('token');
        expect(verify(res.body.token, JWT_SECRET)).have.all.keys('id', 'email', 'name', 'iat');

        user.token = res.body.token;

        done();
      })
  })

  it("should retrieve a single user", done => {
    chai
      .request(server)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer {${user.token}}`)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).to.have.all.keys('id', 'email', 'name');
        expect(res.body).to.include({
          id: user.id,
          email: user.email,
        })

        done();
      })
  })

  it("should retrieve all users", done => {
    chai
      .request(server)
      .get(`/api/users`)
      .set('Authorization', `Bearer {${user.token}}`)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).to.be.an('array')

        done();
      })
  })

  it("should update own information", done => {
    chai
      .request(server)
      .patch('/api/users')
      .set('Authorization', `Bearer {${user.token}}`)
      .send({ "name": "new name", "password": "newpassword" })
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).to.have.all.keys('id', 'email', 'name');
        expect(res.body).to.deep.equal({
          "id": user.id,
          "email": user.email,
          "name": "new name"
        })

        done()
      })

  })
});
