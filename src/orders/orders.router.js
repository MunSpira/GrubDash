const router = require("express").Router();

const controller = require("./orders.controller");
const notAllowed = require("../errors/methodNotAllowed");

router.route("/").get(controller.list).post(controller.create).all(notAllowed);

router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.destroy)
  .all(notAllowed);

// TODO: Implement the /orders routes needed to make the tests pass

module.exports = router;
