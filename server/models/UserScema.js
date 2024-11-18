import mongoose from 'mongoose';
import express from 'express';
const router = express.Router();

//Creates schema to store users and also decribe the parameters to be stored
const User = mongoose.model('User', {
  name: {type: String, required:true},
  email: {type: String, required:true},
  team: {type: Number, required:true},
  password: {type: String, required:true}
})

/*
*request that checks if email already exist and the password is correct
*by accessing database
*/
router.post('/login', async(req,res)=>{
    try{
      const {email,password} = req.body;
      const ifExist = await User.findOne({email:email});
      if (ifExist){
        if(ifExist.password===password){
           res.json("exist")
        }
        else if(ifExist.password!==password){
          res.json("wrongPassword")
       }
      }
      else{
        res.json("notexist")
      }
    }catch (error){
      res.json("notexist")
    }
  })

/*
*request that checks if email already exist
*/
router.get('/users/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const currentUser = await User.find({email:email}); 
      const details = {name:currentUser[0].name, team:currentUser[0].team}
      //console.log(details)
      res.json(details);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
/*
*request that records user details who does not exist and add it to database
*/
router.post('/signup', async(req,res)=>{
    try{
      const {name,email,team,password} = req.body;
      const ifExist = await User.findOne({email:email});
      if (ifExist){
        res.json("exist")
      }
      else{
        const newUser = new User({
          name:name,
          email: email,
          team:team,
          password: password
        })
        await newUser.save()
        res.json("notexist")
      }
    }catch (error){
      res.json("notexist")
    }
  })

export {User, router};