import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {Server} from 'socket.io';
import http from 'http';
import {StickyNote,routerNote} from "./models/StickyNoteSchema.js"
import {Text,routerText} from './models/TextSchema.js';
import {Votes,routerVote} from './models/VotesSchema.js';
import {User,router} from './models/UserScema.js';

const app = express();
const server = http.createServer(app);
let room = "";

const host = 'localhost';
const port = 3001;

const io = new Server(server,{
  cors: {
  }
});

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://mpangelephumelisa:ApFfCI7VCw7wLNNm@cluster0.nu9q616.mongodb.net/', {
  useNewUrlParser: true,
});

io.on('connection', (socket) => {
  console.log('A user connected');
  //allow user that belong to same team to join same group in socket.io
  socket.on("join-room", (data) =>{
    room=data;
    socket.join(data);
  });
  //socket.join(room)

  //emit note added to other users in real time
  socket.on('stickyNoteAdd', (data) => {
    const { _id,team,name,session, positionX,positionY,sizeWidth,sizeHeight,color,text,likes } = data;
    socket.to(team).emit('stickyNoteAdded', { _id,team,name, session, positionX,positionY,sizeWidth,sizeHeight,color,text,likes});
  });

  //emit text changes made to other users in real time
  socket.on('textAdd', (data) => {
    const { _id,team,name,session, positionX,positionY,text} = data;
    socket.to(team).emit('textAdded', { _id,team,name, session, positionX,positionY,text});
  });

  //emit new color changes when it is changed by other users in real time
  socket.on('updateColor', (data) => {
    const { _id, color } = data;
    socket.broadcast.emit('updatedColor', { _id, color });
  });

  //emit likes update when other user likes note in real time
  socket.on('updateLikes', (data) => {
    const { _id, likes } = data;
    socket.broadcast.emit('updatedLikes', { _id,likes });
  })

  //emit new position changes when it is dragged to other users in real time
  socket.on('updatePosition', (data) => {
    const { _id, positionX,positionY } = data;
    socket.broadcast.emit('updatedPosition', { _id, positionX,positionY });
  });


  socket.on('updateTextPosition', (data) => {
    const { _id, positionX,positionY } = data;
    socket.broadcast.emit('updatedTextPosition', { _id, positionX,positionY });
  });

  //emit text of sticky note changes made to other users in real time
  socket.on('updateText', (data) => {
    const { _id, text } = data;
    socket.broadcast.emit('updatedText', { _id, text });
  });

  //emit text  changes made to other users in real time
  socket.on('updateTextText', (data) => {
    const { _id, text } = data;
    socket.broadcast.emit('updatedTextText', { _id, text });
  });

  //emit changes when user deletes note to other users in real time
  socket.on('updateDelete', (data) => {
    const { _id } = data;
    socket.broadcast.emit('updatedDelete', { _id });
  });

  //emit changes when user deletes text to other users in real time
  socket.on('updateTextDelete', (data) => {
    const { _id } = data;
    socket.broadcast.emit('updatedTextDelete', { _id });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

//API routes
app.use('/api', router)
app.use('/api', routerVote)
app.use('/api', routerNote)
app.use('/api',routerText)

/*
*handles get request and fetch sticky notes for a particular team and session
*/
app.get('/api/stickynotes/:session/:team', async (req, res) => {
  try {
    const { session,team } = req.params;
    room=team;
    const notes = await StickyNote.find({session:session,team:team}); 
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

/*
*handles get request and fetch texts for a particular team and session
*/
app.get('/api/text/:session/:team', async (req, res) => {
  try {
    const { session,team } = req.params;
    room=team;
    const notes = await Text.find({session:session,team:team}); 
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

server.listen(port, host, '0.0.0.0', () => {
  console.log(`Server is running on port 3001`);
});
