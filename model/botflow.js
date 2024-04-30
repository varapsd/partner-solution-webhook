const mongoose = require('mongoose');

var BotflowSchema = mongoose.Schema({
    id : Number,
    name : String,
    rootStepId : String,
    companyId : Number,
    isActive: Boolean
});

const Botflow = mongoose.model('botflow',BotflowSchema);

var botflowDAO = {};

botflowDAO.getBotFlow = async (filter)=>{
    try {
        const flow = await Botflow.findOne(filter);
        return flow;
    } catch (error) {
        throw error;
    }
}

botflowDAO.addFlow = async (data) => {
    try {
        var newFlow = new Botflow({
            ...data,
            id : await Botflow.countDocuments({}) + 1,
        });
        return newFlow.save()
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

// var flow = {
//     name : "custom-tech-provider",
//     rootStepId : "1",
//     companyId : 1,
//     isActive: true
// }
// botflowDAO.addFlow(flow);
module.exports = botflowDAO;