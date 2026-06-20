import app from "./app"
import config from "./config/config"

const main = () => {
    app.listen(config.port, () => {
        console.log(`The Server is running on: ${config.port}`);
    });
};
main();