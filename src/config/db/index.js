const mongoose = require('mongoose');

async function connect(mongoURL){
    try{
        await mongoose.connect(mongoURL ,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("connect successfully");
    } catch(error){
        console.log("connect failure!");
    }

}

module.exports = connect