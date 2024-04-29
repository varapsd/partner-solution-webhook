const botflowDAO = require("../models/botflow");
const botflowStepDAO = require("../models/botflowstep");
const commonHelper = require("../helper/common");


var customFlow = {}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getStepByPattern = async (pattern, company) => {
    try {
        var filter = {
            companyId: company.id,
            isActive: true
        };
        var flow = await botflowDAO.getBotFlow(filter);
        flow = flow.toJSON();
        console.log(flow);
        var flowFilter = {
            flowId: flow.id,
            isActive : true
        }
        var steps = await botflowStepDAO.getAllbotflowSteps(flowFilter);
        steps = steps.map( stp => stp.toJSON());
        console.log("steps", steps);
        if (steps) {
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                if (step.pattern) {
                    var regexp = new RegExp(step.pattern);
                    if (regexp.exec(pattern)) {
                        return step.stepId;
                    }
                }

            }
        }

        return flow.rootStepId;
    }
    catch (error) {
        throw error;
    }
}

const replaceVariables = (message, req, company) => {
    try {
        var messageString = JSON.stringify(message);
        const senderName = req.entry?.[0]?.changes[0]?.value?.contacts?.[0].profile.name;
        const companyName = company.companyName;
        messageString = messageString.replaceAll("{{userName}}", senderName);
        messageString = messageString.replaceAll("{{companyName}}", companyName)
        return JSON.parse(messageString);

    } catch (error) {
        throw error;
    }
}

const parseMessageId = (message) => {
    try {
        var msgObj = {};
        var msgId = "";
        if(message.type == 'button'){
            msgId = message.button.payload
        }
        else if(message.type == 'interactive'){
            var subType = message.interactive.type;
            if(subType == 'list_reply'){
                msgId = message.interactive.list_reply.id
            }
            else if(subType == 'button_reply'){
                msgId = message.interactive.button_reply.id;
            }
        }
        var msgArr = msgId.split("&");
        msgArr.forEach(item => {
            var itemData = item.split("=");
            if (itemData[0] && itemData[1])
                msgObj[itemData[0]] = itemData[1];
        })
        return msgObj;
    }
    catch (error) {
        throw error;
    }
}

customFlow.Flow = async _req => {
    try {
        const req = _req.body;
        const company = _req.company;
        const timeTrack = _req.timeTrack;

        const business_phone_number_id = req.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
        const message = req.entry?.[0]?.changes[0]?.value?.messages?.[0];
        var stepId = "";
        switch (message.type) {
            case "text": {
                var pattern = message.text.body;
                stepId = await getStepByPattern(pattern, company);
                break;
            }
            default:{
                msgObj = parseMessageId(message);
                if(msgObj.stepId){
                    stepId = msgObj.stepId;
                }
                else if(msgObj.pattern){
                    stepId = await getStepByPattern(msgObj.pattern, company);
                }
            }
        }
        if(stepId){
            var filter = {
                stepId: stepId,
                isActive: true
            };
            var allSteps = await botflowStepDAO.getAllbotflowSteps(filter);
            allSteps = allSteps.map( stp => stp.toJSON())
            console.log("allSteps", allSteps);

            var res = [];
            if (allSteps.length > 0) {
                for (let i = 0; i < allSteps.length; i++) {
                    const step = allSteps[i];

                    // await performActions(step, req, company, msgObj, timeTrack);
                    const from_phone_number = message.from;

                    if (step.message) {
                        step.message = replaceVariables(step.message, req, company);
                        step.message.to = from_phone_number;
                        res.push(
                            await  commonHelper.sendResponseWCAPI(
                                business_phone_number_id,
                                step.message
                            )
                        );

                    }
                    sleep(1000);
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

module.exports = customFlow;