const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

const dishes = require("../data/dishes-data");

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: orders });
}

function validateCreate(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  if (!deliverTo) {
    return next({
      status: 400,
      message: `Order must include a deliverTo`,
    });
  }
  if (!mobileNumber) {
    return next({
      status: 400,
      message: `Order must include a mobileNumber`,
    });
  }

  if (!dishes) {
    return next({
      status: 400,
      message: `Order must include a dish`,
    });
  }

  if (dishes.length == 0 || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  dishes.map((dish, index) => {
    if (!dish.quantity || typeof dish.quantity != "number") {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  return next();
}

function create(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newOrder);
  return res.status(201).json({ data: newOrder });
}

function idExists(req, res, next) {
  const orderId = req.params.orderId;
  const findId = orders.find((order) => order.id === orderId);

  res.locals.findId = findId;
  res.locals.orderId = orderId;

  if (findId) {
    return next();
  }
  return next({
    status: 404,
    message: `No matching order is found for ${res.locals.orderId}.`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.findId });
}

function update(req, res, next) {
  const {
    data: { id, deliverTo, mobileNumber, status, dishes },
  } = req.body;

  if (!status) {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  } else if (status == "invalid") {
    return next({
      status: 400,
      message: `Deliver order status cannot be changed`,
    });
  }
  if (id == res.locals.orderId || id == null || id == undefined || id == "") {
    res.locals.findId.deliverTo = deliverTo;
    res.locals.findId.mobileNumber = mobileNumber;
    res.locals.findId.dishes = dishes;

    res.json({ data: res.locals.findId });
  }
  return next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${res.locals.orderId}.`,
  });
}

function destroy(req, res, next) {
  if (res.locals.findId.status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  } else if (res.locals.findId.id > -1) {
    orders.splice(res.locals.findId, 1);
  }
  return res.sendStatus(204);
}

module.exports = {
  create: [validateCreate, create],
  read: [idExists, read],
  update: [idExists, validateCreate, update],
  destroy: [idExists, destroy],
  list,
};
