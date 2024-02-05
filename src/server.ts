import app from "./app";
import RabbitMqListener from "./services/RabbitMqListener";
app.listen(3000, () => {
    console.log("users API started on port 3000!");
    new RabbitMqListener().listeners();
});
