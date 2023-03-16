const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUsers);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updatedUser)
  .delete(userController.deleteUser);

module.exports = router;
