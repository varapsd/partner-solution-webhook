const mongoose = require('mongoose');

var CompanySchema = mongoose.Schema({
    id : Number,
    companyName : String,
    email : String,
    phone : Number,
    PhoneNumberId : String
});

const Company = mongoose.model('company',CompanySchema);

var companyDAO = {};

companyDAO.GetCompany = async (filter)=>{
    try {
        const company = await Company.findOne(filter);
        return company;
    } catch (error) {
        throw error;
    }
}

companyDAO.addCompany = async (data) => {
    try {
        var newCompany = new Company({
            ...data,
            id : await Company.countDocuments({}) + 1,
        });
        return newCompany.save()
            .then((cmp) => {
                return cmp;
            })
            .catch(err => {
                throw err;
            });
    } catch (error) {
        throw error;
    }
}

// var cmp = {
//     companyName : "test 1",
//     email : "test@gmail.com",
//     phone : 123123,
//     PhoneNumberId : "12323"
// }
// companyDAO.addCompany(cmp);
module.exports = companyDAO;