import { initDB } from "./connection";
import Menu from "./models/menu";



(async () => {
  await initDB();

  Menu.run();
})()
