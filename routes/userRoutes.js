const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);

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
