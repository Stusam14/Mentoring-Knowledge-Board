import mongoose from 'mongoose';
import express from 'express';
import { ObjectId } from 'mongodb';
const routerNote = express.Router();


//Creates schema to store sticky notes and also decribe the parameters to be stored
const StickyNote = mongoose.model('StickyNote', {
    _id: mongoose.Schema.Types.ObjectId,   
    team: Number,
    name: String,
    session: Number,
    positionX: Number,
    positionY: Number,
    sizeWidth: Number,
    sizeHeight: Number,
    text: String,
    color: String,
    likes: Number
});

/*
*respond to user when they want to see details of sticky notes for a particular team
*it is used for analytics to draw graphs
*/
routerNote.get('/numbernotes/:team', async (req, res) => {
    try {
      const {team} = req.params;
      const notes = await StickyNote.find({team:team}, 'session name -_id'); 
      res.json(notes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
/*
*respond to user when they want to see attendance register for a particular team
*it is used for analytics to return attendance register
*/
routerNote.get('/attendance/:team/:sessionNumber', async (req, res) => {
    try {
      const {team, sessionNumber} = req.params;
      const notes = await StickyNote.find({team:team, session:sessionNumber}, 'name -_id'); 
      res.json(notes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

/*
*post sticky note details when user add new note, this is stored in the database
*as new note
*/
routerNote.post('/stickynotes', async (req, res) => {
    try {
      const _Id = new ObjectId().toString() 
      const _name = req.body.name;
      const _team = req.body.team;
      const _session = req.body.session;             
      const position_x = req.body.positionX;
      const position_y = req.body.positionY;
      const size_width = req.body.sizeWidth;
      const size_height = req.body.sizeHeight;
      const Text = req.body.text;
      const Color  = req.body.color;
      const _likes = req.body.likes;
      const note = new StickyNote({
      _id: _Id,
      name: _name,
      team: _team,  
      session: _session,
      positionX: position_x,
      positionY: position_y,
      sizeWidth: size_width,
      sizeHeight: size_height,
      text: Text,
      color: Color,
      likes: _likes });
      await note.save();
      res.json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

/*
*updates the note details in the database, responds to user when a text/color/positio/
*likes is changed
*/
routerNote.put('/stickynotes/:_id', async (req, res) => {
    try {
      const { _id } = req.params;
      const updatedNote = await StickyNote.findByIdAndUpdate(_id, {
          positionX: req.body.positionX,
          positionY: req.body.positionY,
          sizeWidth: req.body.sizeWidth,
          sizeHeight: req.body.sizeHeight,
          text: req.body.text,
          color: req.body.color,
          likes: req.body.likes});
      res.json(updatedNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

/*
*receives delete request and delete note in the database
*/
routerNote.delete('/stickynotes/:_id', async (req, res) => {
    try {
      const { _id } = req.params;
      await StickyNote.findByIdAndDelete(_id);
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
export {StickyNote, routerNote};