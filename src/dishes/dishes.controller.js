const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: dishes });
}

function create(req, res, next) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  return res.status(201).json({ data: newDish });
}

function validateCreate(req, res, next) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (!name) {
    return next({
      status: 400,
      message: `Dish must include name.`,
    });
  }
  if (!description) {
    return next({
      status: 400,
      message: `Dish must include description.`,
    });
  }

  if (!image_url) {
    return next({
      status: 400,
      message: `Dish must include image_url.`,
    });
  }
  if (!price || typeof price != "number") {
    return next({
      status: 400,
      message: `Dish must include price.`,
    });
  }

  if (price <= 0) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }

  return next();
}

function idExists(req, res, next) {
  const dishId = Number(req.params.dishId);
  const findId = dishes.find((dish) => dishId == dish.id);

  res.locals.findId = findId;
  res.locals.dishId = dishId;

  if (res.locals.findId) {
    return next();
  }

  return next({
    status: 404,
    message: `Dish does not exist ${dishId}`,
  });
}
function read(req, res, next) {
  return res.json({ data: res.locals.findId });
}

function update(req, res, next) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (id == res.locals.dishId || id == null || id == undefined || id == "") {
    res.locals.findId.name = name;
    res.locals.findId.description = description;
    res.json({ data: res.locals.findId });
  }
  next({
    status: 400,
    message: `id does not equal ${id}`,
  });
}

module.exports = {
  create: [validateCreate, create],
  read: [idExists, read],
  update: [idExists, validateCreate, update],
  list,
};
