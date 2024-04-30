const { text } = require('express');
const mongoose = require('mongoose');

var BotflowStpepSchema = mongoose.Schema({
    id : Number,
    stepId : String,
    sequence : Number,
    type : String,
    message : Object,
    flowId: Number,
    pattern: String,
    isActive : Boolean
});

const BotflowStep = mongoose.model('botflowStep',BotflowStpepSchema);

var botflowStepDAO = {};

botflowStepDAO.getAllbotflowSteps = async (filter)=>{
    try {
        const steps = await BotflowStep.find(filter);
        return steps;
    } catch (error) {
        throw error;
    }
}

botflowStepDAO.add = async (data) => {
    try {
        var newCompany = new BotflowStep({
            ...data,
            id : await BotflowStep.countDocuments({}) + 1,
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

// var step = {
//     stepId : "1",
//     sequence : 1,
//     type : "text",
//     message : {
//         type : "text"
//     },
//     isActive : true
// }
// botflowStepDAO.add(step);

module.exports = botflowStepDAO;