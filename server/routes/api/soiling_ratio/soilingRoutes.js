var express = require('express');
var router = express.Router();
const mysql = require("mysql2");

 const conn = mysql.createConnection({
     host: 'srv1121.hstgr.io', 
     user: 'u922812831_dustUser', 
     password: 'DustDetect@01', 
     database: 'u922812831_DustData_CDTI',
}); //connect with database

//GET
router.get('/', (req, res, next) => {

//FILTER DATA /SET DATA ACS(LESS) TO DESC(MORE)
    let { page = 1, limit = 20, sort = "Number_ID", order = "desc", ...filter } = req.query; 
    filter = Object.keys(filter).length === 0 ? "1" : filter;
    page = parseInt(page);  //convert String to Int(page&limit)
    limit = parseInt(limit);
    let offset = (page-1) * limit; //calculate data 20 data (limit data = 20)

    let sql =limit > 0 ? `SELECT * FROM SensorData WHERE ?  ORDER BY ${sort} ${order} LIMIT ?, ?`:`SELECT * FROM SensorData WHERE ?  ORDER BY ${sort} ${order}`;
    console.log(filter);

    conn.query(sql,[filter, offset, limit], (err, datas, fields) => { //query data in table soiling
        if(err) {
            const { code, sqlMessage } = err;
            res.status(400).send({error : {name : code, message : sqlMessage }});
        } else {
            res.send(datas);
        }
        
    });
});

//GET BY ID
router.get('/:id', (req, res, next) => {
    conn.query('SELECT * FROM SensorData WHERE id = ?', [req.params.id], (err, datas, fields) => { //query data in table soiling
        if(datas.length > 0) {
            res.send(datas[0]); //send data to user(call)
        } else {
         res.status(400).send({ error : {name : "DataNotFound", message : "DataNotFound"}});  // not found data
        }
    });
});

//CREATE
router.post("/", (req, res, next) => {
    conn.query(" INSERT INTO SensorData SET ?",req.body, (err, datas, feilds) => {
        if(err) {
            const { code, sqlMessage } = err;
            res.status(400).send({error : {name : code, message : sqlMessage }});
        } else {
            res.send({ success : { message : "Inserted Successfully.", result : datas}});
        }
    });
});

module.exports = router;
