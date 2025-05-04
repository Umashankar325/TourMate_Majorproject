const app = require("./src/app.js");
const connect = require("./src/db/db.js");

connect();
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
