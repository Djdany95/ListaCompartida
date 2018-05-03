'use strict';

var express = require('express');
var ListaController = require('../controllers/lista');
var api = express.Router();

api.post('/getlist/', ListaController.getList);
api.post('/list/', ListaController.newList);
api.delete('/list/', ListaController.delList);
api.post('/item/', ListaController.addItem);
api.delete('/item/', ListaController.delItem);

module.exports = api;
