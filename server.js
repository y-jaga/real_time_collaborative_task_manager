const { httpServer } = require("./index");

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
