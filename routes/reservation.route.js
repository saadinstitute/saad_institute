const router = require('express').Router();
const reservationController = require('../controllers/reservation.controller');

router.post('/reservation', reservationController.reserve);
router.get('/reservation/list', reservationController.getAllReservations);
router.put('/reservation', reservationController.approve);

module.exports = router;
