import mongoose from 'mongoose';
import express from 'express';
import { ObjectId } from 'mongodb';
const routerText = express.Router();

//Creates schema to store text and also decribe the parameters to be stored
const Text = mongoose.model('Text', {
    _id: mongoose.Schema.Types.ObjectId,    
    team: Number,
    name: String,
    session: Number,
    positionX: Number,
    positionY: Number,
    text: String,
  });

/*
*post sticky note details when user add new text, this is stored in the database
*as new note
*/
routerText.post('/text', async (req, res) => {
    try {
      const _Id = new ObjectId().toString() 
      const _name = req.body.name;
      const _team = req.body.team;
      const _session = req.body.session;             
      const position_x = req.body.positionX;
      const position_y = req.body.positionY;
      const _text = req.body.text;
      const note = new Text({
      _id: _Id, // Generate a new ObjectId 
      name: _name,
      team: _team,  
      session: _session,
      positionX: position_x,
      positionY: position_y,
      text: _text,
       });
      await note.save();
      res.json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

/*
*updates the text details in the database, responds to user when a text/color/positio/
*likes is changed
*/
routerText.put('/text/:_id', async (req, res) => {
    try {
      const { _id } = req.params;
      const updatedNote = await Text.findByIdAndUpdate(_id, {
          positionX: req.body.positionX,
          positionY: req.body.positionY,
          text: req.body.text,
          });
      res.json(updatedNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

/*
*receives delete request and delete text in the database
*/
routerText.delete('/text/:_id', async (req, res) => {
    try {
      const { _id } = req.params;
      await Text.findByIdAndDelete(_id);
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
export {Text,routerText};