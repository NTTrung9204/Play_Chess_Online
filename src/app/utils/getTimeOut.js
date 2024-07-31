class getTimeOut {
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new getTimeOut();