import Koa from "koa";
import Router from "koa-router";
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from './model'
import bodyParser from 'koa-bodyparser'
import { sign, verify } from 'jsonwebtoken'


dotenv.config();

export const app = new Koa();
const router = new Router();
const uri: string = process.env.CONNECTION_URI || ""
const JWT_SECRET: string = process.env.JWT_SECRET || ""


// route definitions
router
  .get('/', (ctx) => {
    ctx.body = "Hello World"
  })
  .post('/api/users', createUser)
  .post('/api/auth', authenticateUser)
  .get('/api/users/:id', getUser)
  .get('/api/users', getAllUsers)

app.use(bodyParser())
app.use(router.routes())

// mongoose
mongoose.connect(uri)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', () => {
  app.listen(3000)
});



async function createUser(ctx) {

  const request = ctx.request.body
  await User.create({ email: request.email, password: request.password, name: request.name || null })
    .then((res) => {
      ctx.body = {
        id: res._id,
        email: res.email,
        name: res.name
      }
    })
    .catch((err) => {
      console.log(err)
    })

}

async function authenticateUser(ctx) {

  const auth = ctx.headers.authorization.replace("Basic {", "").replace("}", "").split(":")

  // TODO: unique emails and password hashing
  await User.findOne({ email: auth[0], password: auth[1] })
    .then((res) => {
      if (res === null) { // Invalid credentials
        ctx.throw(401, 'Invalid credentials')
        return;
      } else { // Valid credentials, giving out token
        ctx.body = {
          token: sign({
            id: res._id,
            name: res.name,
            email: res.email
          }, JWT_SECRET)
        }
        ctx.status = 200;
      }
    })
    .catch((err) => {
      console.log(err)
    })

}

async function getUser(ctx) {
  const token = ctx.headers.authorization.replace("Bearer {", "").replace("}", "")

  const decodedPayload = verify(token, JWT_SECRET)

  if (decodedPayload == undefined) { ctx.throw(403); return; }

  const user = await User.findOne({ _id: ctx.params.id })
    .then((res) => {
      if (res === null) { // Invalid credentials
        ctx.throw(401, 'User not found')
      }
      else {
        ctx.body = {
          "id": res._id,
          "email": res.email,
          "name": res.name || null
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })

}

async function getAllUsers(ctx) {
  const token = ctx.headers.authorization.replace("Bearer {", "").replace("}", "")

  const decodedPayload = verify(token, JWT_SECRET)

  if (decodedPayload == undefined) { ctx.throw(403); return; }

  await User.find({})
    .then((res) => {
      if (res === null) { // Invalid credentials
        ctx.throw(401, 'User not found')
      }
      else {
        ctx.body = res
      }
    })
    .catch((err) => {
      console.log(err)
    })

}
