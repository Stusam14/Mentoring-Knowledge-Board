import mongoose from 'mongoose';
import express from 'express';
const routerVote = express.Router();

//describe parameters of votes, i.e students who have voted for a particular sticky note
const Votes = mongoose.model('Votes', {
    _idNote: mongoose.Schema.Types.ObjectId,   
    userEmail: String,
  });

/*
*request that checks if user has already liked the note to prevent
*multiple likes from same user for same note, checks if they already exist on database
*then return this info to front end
*/
routerVote.get('/votes/:_idNote/:email', async (req, res) => {
    try {
      const { _idNote,email } = req.params;
      const alreadyLiked = await Votes.find({userEmail:email, _idNote:_idNote}); 
      if (alreadyLiked.length>0){
        res.json("alreadyLiked")
      }
      else{
        res.json("notLiked")
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
 
/*
*record a user who has voted for a particular note and save on the database
*/
routerVote.post('/votes', async(req,res) =>{
    const {userEmail,_idNote} = req.body;
    console.log(req.body)
    try{
    const newVote = new Votes({
      userEmail:userEmail,
      _idNote:_idNote
    })
    await newVote.save();
    res.json("voted")
    }catch (error){
    }
  })

export {Votes,routerVote};