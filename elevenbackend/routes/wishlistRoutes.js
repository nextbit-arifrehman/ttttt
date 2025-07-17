const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyRole = require('../middlewares/verifyRole');

// All wishlist routes are protected and require user role
router.use(verifyJWT);
router.use(verifyRole('user'));

// Add property to wishlist
router.post('/', wishlistController.addToWishlist);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Remove property from wishlist
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;