require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const countRoutes = require('./routes/eventCountRoutes');
const dataRoutes = require('./routes/chartDataRoutes');
const healthRoute = require('./routes/healthDataRoute');
app.use(function(req, res, next){
    console.log("api calling from frontend");
    console.log(req.url)
    next();
})
app.use('/api', countRoutes);
app.use('/api', dataRoutes);
app.use('/api', healthRoute);

// app.use(countRoutes);
// app.use(dataRoutes);
// app.use(healthRoute);

app.listen(3000, () => {
    console.log("Server listening on 3000");
    console.log(process.env.dn_datasource);
    console.log(process.env.dn_initial_time_interval);
});