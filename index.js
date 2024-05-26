const express = require('express');

const app = express();

app.use(express.static("public"));

let port = 3001;

app.get('/', (req, res)=> {
    res.sendFile(__dirname+"/public/Home.html");
})

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`);
});