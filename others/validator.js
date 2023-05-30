const User = require('../models/users');
const jwt = require('jsonwebtoken');

async function validateSuperAdmin(token){
    const data = await jwt.verify(token, process.env.TOKEN_KEY,
        async function (err, decoded) {
            if (err) {
                let errordata = {
                    message: err.message,
                    expiredAt: err.expiredAt
                };
                console.log(errordata);
                throw err;
            }
            return decoded;
        });
        const user = await User.findOne({where: {id: data.user_id}});
        
        if(user.role !== "superAdmin")
            return "permission denied";
        if(!user.isConfirmed)
            return "Your account need to be confirmed";
        
}

module.exports = { validateSuperAdmin };