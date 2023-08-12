const router = require('express').Router();
const reservationController = require('../controllers/reservation.controller');

router.post('/reservation', reservationController.reserve);
router.get('/reservation/list', reservationController.getAllReservations);
router.put('/reservation/:id', reservationController.updateStatus);

module.exports = router;