import app from "./app";
import RabbitListener from "./services/RabbitListener";
app.listen(3000, () => {
    console.log("users API started on port 3000!");
    new RabbitListener().listeners();
});
