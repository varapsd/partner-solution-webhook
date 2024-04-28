


let botFlow = {};

botFlow.flow = async _req => {
    try {
        const req = _req.body;
        const company = _req.company;
        const timeTrack = _req.timeTrack;
        var stepId = "";

        var msgObj = {};

        const senderMobile = req.payload.sender.phone;

        switch (req.payload.type) {
            case "text": {
                if (!isChatEnabled) {
                    var pattern = req.payload.payload.text;
                    stepId = await getStepByPattern(pattern, company);
                }
                break;
            }
            case "quick_reply": {
                var pattern = req.payload.payload.text;
                stepId = await getStepByPattern(pattern, company);
                break;
            }
            case "order": {
                stepId = await getStepByPattern("order", company);
                break;
            }
            case "nfm_reply": {
                stepId = await getStepByPattern("nfm_reply", company);
                break;
            }
            case "location": {
                stepId = await getStepByPattern("location", company);
                break;
            }
            default: {
                msgObj = parseMessageId(req.payload.payload.postbackText);
                if(msgObj.stepId){
                    stepId = msgObj.stepId;
                }
                else if(msgObj.pattern){
                    stepId = await getStepByPattern(msgObj.pattern, company);
                }
            }
        };
        if (stepId) {
            var filter = {
                stepId: stepId,
                isActive: true
            };
            var allSteps = await botflowStepDAO.getAllbotflowSteps(null, null, filter);
            console.log("allSteps", allSteps);
            var res = [];
            if (allSteps.rows.length > 0) {
                for (let i = 0; i < allSteps.rows.length; i++) {
                    const step = allSteps.rows[i];

                    await performActions(step, req, company, msgObj, timeTrack);
                    const from_phone_number = req.payload.sender.phone;
                    if (step.message) {
                        step.message = replaceVariables(step.message, req, company);
                        res.push(
                            await commonHelper.sendResponseGupshup(
                                company.phone,
                                from_phone_number,
                                step.message,
                                req.app,
                                timeTrack
                            )
                        );
                    }
                    sleep(1000);
                }
            }
            return res;
        }
    } catch (error) {
        throw error;
    }
};

module.exports = botFlow;