const Lista = require('../models/lista');
const mongoose = require('mongoose');

function getList(req, res) {
  var pass = req.body.pass;

  Lista.findOne({ pass: pass }, { lista: 1, items: 1, _id: 0 })
    .sort('+items.nombre')
    .exec((err, list) => {
      if (err) {
        res.status(500).send({ accion: 'get list', error: 'Server Error 500' });
      } else if (!list) {
        res.status(404).send({ accion: 'get list', error: 'Lista 404' });
      } else {
        res.status(200).send({ accion: 'get list', data: list });
      }
    });
}

function newList(req, res) {
  var lista = req.body.lista;
  var pass = req.body.pass;

  var list = new Lista();
  list.lista = lista;
  list.pass = pass;

  list.save((err, listCreated) => {
    if (err) {
      res
        .status(500)
        .send({ accion: 'new list', error: 'Contraseña ya existe' });
    } else {
      res.status(200).send({ accion: 'new list', data: listCreated });
    }
  });
}

function delList(req, res) {
  var pass = req.body.pass;

  Lista.findOneAndRemove({ pass: pass }, (err, listDeleted) => {
    if (err) {
      res
        .status(500)
        .send({ accion: 'delete list', error: 'Server Error 500' });
    } else {
      res.status(200).send({ accion: 'delete list', data: listDeleted });
    }
  });
}

function addItem(req, res) {
  var params = req.body;

  Lista.update(
    { pass: params.pass },
    {
      $push: {
        items: {
          _id: new mongoose.Types.ObjectId(),
          tachado: params.tachado,
          nombre: params.nombre,
          precio: params.precio
        }
      }
    }
  ).exec((err, newItem) => {
    if (err) {
      res.status(500).send({ accion: 'add item', error: err });
    } else {
      res.status(200).send({ accion: 'add item', data: newItem });
    }
  });
}

function delItem(req, res) {
  var params = req.body;
  const itemId = new mongoose.Types.ObjectId(params.itemId);

  Lista.update(
    { pass: params.pass },
    { $pull: { items: { _id: itemId } } }
  ).exec((err, delItem) => {
    if (err) {
      res
        .status(500)
        .send({ accion: 'delete item', error: 'Server Error 500' });
    } else {
      res.status(200).send({ accion: 'delete item', data: delItem });
    }
  });
}

module.exports = { getList, newList, delList, addItem, delItem };
