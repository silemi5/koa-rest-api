db.createUser({
  user: "silemi5",
  pwd: "ocisly",
  roles: [
    {
      role: "readWrite",
      db: "rest-api-db"
    }
  ]
})

db.createCollection("users");
