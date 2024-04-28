
var axios = require('axios');

var commonHelper = {};


commonHelper.sendResponseWCAPI = async (
    business_phone_number_id,
    payload
  ) => {
    try {
        var url = `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`
        var headers= {
          Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
        };
        
        var res = await axios.post(url, payload, { headers });
  
      return res;
    } catch (error) {
      console.log("Err in sending message is  ", error);
      throw error;
    }
  };

module.exports = commonHelper;
