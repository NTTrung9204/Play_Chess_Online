class getRecord {
    getOneRecord(record){
        return record.toJSON();
    }

    getListOfRecords(records){
        return records.map(record => record.toJSON());
    }
}

module.exports = new getRecord();