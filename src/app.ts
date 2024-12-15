import initApp from "./server";
const port = process.env.PORT;

initApp().then((app) => {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
});