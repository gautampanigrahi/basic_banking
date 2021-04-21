var express = require('express');  
var app = express();   
app.set("view engine","ejs");
app.use(express.static('public'));
var sql = require("mysql");
var sqlConnection = sql.createConnection({
    host: "database-1.co944fbkvs6a.us-east-1.rds.amazonaws.com",
    user: "root",
    port: "3306",
    password: "Gautam10",
    database: "banking",
    multipleStatements: true
});
var error=""
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
sqlConnection.connect(function(err) {
    if (!err) {
        console.log("Connected to SQL");
    } else {
        console.log("Connection Failed" + err);
    }
});
app.get('/', function (req, res) {  
res.render('index') ;
});  
app.get('/customer',async function(req,res)
{   await sqlConnection.query('select * from customers',function(err,results){
    if(err){
        console.log(err)
    }
    else{
        res.render('customer',{customers:results});
    }
})
});
app.get('/viewall',async function(req,res)
{   await sqlConnection.query('select * from transaction',function(err,results){
    if(err){
        console.log(err)
    }
    else{
        res.render('viewall',{customers:results});
    }
})
});
app.post('/transaction', async function(req,res)
{   
    await sqlConnection.query(`select * from customers where account=${req.body.account}`,async function(err,results)
    {
        if(err)
        {
            console.log(err)
        }
        else
        {
            if((results[0].balance-Number(req.body.amount))>0)
            {
                var balance=results[0].balance-Number(req.body.amount)
                await sqlConnection.query(`update customers set ? where account=${req.body.account}`,{balance},async function(err1,results1)
                {
                    if(err1)
                    {
                    console.log(err1)
                    }
                    else
                    {   
                        await sqlConnection.query(`select * from customers where account=${req.body.transact}`,async function(err2,results2)
                        {
                            if(err2)
                            {
                                console.log(err2)
                            }
                            else
                            {
                                var balance=results2[0].balance+Number(req.body.amount)
                                await sqlConnection.query(`update customers set ? where account=${req.body.transact}`,{balance},async function(err3,results3)
                                {
                                    if(err3)
                                    {
                                    console.log(err3)
                                    }
                                    else
                                    {
                                        var name1=results[0].name
                                        var name2=results2[0].name
                                        var account1=req.body.account
                                        var account2=req.body.transact
                                        var amount=req.body.amount
                                        await sqlConnection.query(`insert into transaction set ? `,{account1,name1,account2,name2,amount},async function(err5,results5)
                                        {
                                            if(err5)
                                            {
                                            console.log(err5)
                                            }
                                            else
                                            {
                                                await sqlConnection.query(`select * from customers`,async function(err4,results4)
                                                {
                                                    if(err4)
                                                    {
                                                    console.log(err4)
                                                    }
                                                    else
                                                    {
                                                    res.render('customer',{customers:results4});
                                                    }
                                                })
                                            }   
                                        })    
                                    }
                                })    
                            }
                        })    
                    }
                })      
            } 
            else
            {
                error="BALANCE INSUFFICIENT!!"
                res.redirect('/transaction/'+req.body.account)
            }
        }
    })
});

app.get('/transaction',function(req,res)
{
    res.render('transaction');
});

app.get('/transaction/:id', async function(req,res)
{
    var errmsg=error
    error=""
    var acc=req.params.id
    await sqlConnection.query(`select * from customers where account=${acc}`,function(err,results){
        if(err){
            console.log(err)
        }
        else{
            res.render('transaction',{customers:results[0],errmsg:errmsg});
        }
    })
});
app.get('/viewall',function(req,res)
{
    res.render('viewall');
});
var server = app.listen(5000, function () {  
    console.log('Node server is running..');  
});  