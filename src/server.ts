import Koa from "koa";
import Router from "koa-router";

const app = new Koa();
const router = new Router();


export interface User {
  id?: string;
  name: string;
  email: string;
}

export const server = app.listen(3000);

// route definitions
router
  .get('/', (ctx) => {
    ctx.body = "Hello World"
  })
  .post('/api/users', createUser)
  .post('/api/auth', authenticateUser)

app.use(router.routes())

module.exports = {
  server
};


async function createUser(ctx) {
  // TODO: Create a user

}

async function authenticateUser(ctx) {
  // TODO: Authenticate a user

}
