const BaseResponse = require('../models/base_response');
const Meal = require('../models/meal');
const Resturant = require('../models/resturant');
const Category = require('../models/category');
const MealUserFav = require('../models/meal_user_fav');
const cloudinary = require('../others/cloudinary.config');
const add_popularity = require('../others/add_popularity');
const formidable = require('formidable');
const { validateAdmin, validateUser } = require("../others/validator");
const { Op } = require("sequelize");

const addStudent = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const { arName, enName, enDescription, arDescription, categoryId, resturantId, price, discount } = data;
        const user = await validateAdmin(req);
        if (!resturantId || !categoryId) {
            return res.send(new BaseResponse({ success: false, msg: `${!resturantId ? "resturantId" : "categoryId"} is required`, status: 400, lang }));
        }
        const resturant = await Resturant.findOne({ where: { id: resturantId } });
        if (!resturant) return res.send(new BaseResponse({ success: false, msg: "resturant not fount", status: 400, lang }));
        const category = await Category.findOne({ where: { id: categoryId } });
        if (!category) return res.send(new BaseResponse({ success: false, msg: "category not fount", status: 400, lang }));
        if (user.role !== "superAdmin" && resturant.userId !== user.id) {
            return res.send(new BaseResponse({ success: false, msg: "you don't have permission to add a meal to this restuarnt", status: 403, lang }));
        }
        let imageUrl;
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            imageUrl = resCloudinary.url;
        }
        const meal = await Meal.create({ imageUrl, arName, enName, enDescription, arDescription, price: Number(price), discount: Number(discount), resturantId, categoryId });
        res.send(new BaseResponse({ data: meal, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getMeals = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search, resturantId, categoryId, isFav = 'false', justOffers = 'false' } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if (search) {
            query[Op.or] = [
                {
                    arName: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    enName: {
                        [Op.like]: `%${search}%`
                    }
                }
            ];

        }
        if (resturantId) query.resturantId = resturantId;
        if (categoryId) query.categoryId = categoryId;
        if (justOffers === 'true') {
            query.discount = {
                [Op.gt]: 0
            };
        }
        let userFavWhere = {
            userId: user.id
        };
        if (isFav === 'true') {
            userFavWhere.isFav = true;
        }
        if (resturantId && user.id) {
            add_popularity(resturantId, 1, user.id)

        }
        const data = await Meal.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
            include: [{
                model: Resturant,
                as: "resturant"
            }, {
                model: Category,
                as: "category",
            }
                , {
                model: MealUserFav,
                where: userFavWhere,
                required: isFav === 'true',
                attributes: ["isFav"],
                as: "meal_user_favs",
            }
            ],
            attributes: { exclude: ["categoryId"] },
        });

        const meals = data.rows;
        const mealsCount = data.count;
        if (search != null && search !== "") {
            if (mealsCount >= 1) add_popularity(meals[0].resturantId, 3, user.id)
            if (mealsCount >= 2) add_popularity(meals[1].resturantId, 2, user.id)
            if (mealsCount >= 3) add_popularity(meals[2].resturantId, 1, user.id)
        }
        let editedMeals = [];
        for (let index = 0; index < meals.length; index++) {
            editedMeals[index] = JSON.parse(JSON.stringify(meals[index].dataValues));
            editedMeals[index].isFavourite = false;
            // const row = MealUserFav.findOne({ where: {} });
            if (editedMeals[index].meal_user_favs.length > 0) {
                editedMeals[index].isFavourite = editedMeals[index].meal_user_favs[0].isFav;
            }
            editedMeals[index].meal_user_favs = undefined;

        }
        res.send(new BaseResponse({ data: editedMeals, success: true, msg: "success", lang, pagination: { total: mealsCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const { arName, enName, enDescription, arDescription, categoryId, resturantId, price, discount, id } = data;
        const user = await validateAdmin(req);
        if (resturantId) {
            const resturant = await Resturant.findByPk(resturantId);
            if (!resturant) return res.send(new BaseResponse({ success: false, msg: "resturant not fount", status: 400, lang }));
        }
        if (categoryId) {
            const category = await Category.findOne({ where: { id: categoryId } });
            if (!category) return res.send(new BaseResponse({ success: false, msg: "category not fount", status: 400, lang }));
        }
        if (resturantId) {
            //      const resturant = await Resturant.findOne({ where: { id: resturantId } });
            const resturant = await Resturant.findByPk(resturantId);
            if (user.role !== "superAdmin" && resturant.userId !== user.id) {
                return res.send(new BaseResponse({ success: false, msg: "you don't have permission to edit this meal", status: 403, lang }));
            }
        }
        const meal = await Meal.findByPk(id);
        if (!meal) {
            return res.send(new BaseResponse({ success: false, msg: "meal not fount", status: 400, lang }));
        }
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            meal.imageUrl = resCloudinary.url;
        }
        if (arName && arName !== "") meal.arName = arName;
        if (enName && enName !== "") meal.enName = enName;
        if (enDescription && enDescription !== "") meal.enDescription = enDescription;
        if (arDescription && arDescription !== "") meal.arDescription = arDescription;
        if (categoryId && categoryId !== "") meal.categoryId = categoryId;
        if (resturantId && resturantId !== "") meal.resturantId = resturantId;
        if (price && price !== "") meal.price = price;
        if (discount && discount !== "") meal.discount = discount;
        await meal.save();
        res.send(new BaseResponse({ data: meal, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const meal = await Meal.findByPk(id);
        if (!meal) return res.send(new BaseResponse({ success: false, status: 404, msg: "meal not found", lang }));
        const resturnat = await Resturant.findByPk(meal.resturantId);
        if (user.role !== "superAdmin" && resturnat.userId !== user.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't delete this meal", lang }));
        const isSuccess = !(!(await meal.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


function getFormFromReq(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ ...fields, ...files });
        });
    });
}


module.exports = { addMeal, getMeals, updateMeal, deleteMeal, editFavMeal };
