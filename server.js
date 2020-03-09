const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const countRoutes = require('./routes/eventCountRoutes');
const dataRoutes = require('./routes/chartDataRoutes');

app.use('/api', countRoutes);
app.use('/api', dataRoutes);

app.listen(3000, () => {
    console.log("Server listening on 3000");
});