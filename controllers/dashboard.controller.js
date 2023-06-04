const BaseResponse = require('../models/base_response');
const Category = require('../models/category');
const Resturant = require('../models/resturant');
const User = require('../models/users');

const getHome = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const resturantsCount = await Resturant.count();
        const usersCount = await User.count();
        const categoriesCount = await Category.count();
        let data = {resturantsCount, usersCount, categoriesCount, charityCount: 0};
        res.send(new BaseResponse({data, success: true, msg: "success",lang}));
    } catch (error) {
        res.send(new BaseResponse({success: false, msg: error, lang}));
    }
};


module.exports = { getHome };
