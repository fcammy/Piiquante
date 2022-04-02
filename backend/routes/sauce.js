const express = require('express');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceController = require('../controllers/sauce');

const router = express.Router();



router.get('/', auth, sauceController.getAllSauces );
router.post('/', [auth, multer], sauceController.createSauce );
router.get('/:id', auth, sauceController.getOneSauce );
router.post('/:id/like', auth, sauceController.likeSauce );
router.put('/:id', [auth, multer], sauceController.updateSauce );
router.delete('/:id', auth, sauceController.deleteSauce );

module.exports = router;