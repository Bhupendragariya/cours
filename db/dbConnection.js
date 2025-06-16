
import mongoose from "mongoose";

 export const dbConnection = () =>{
    mongoose.connect(process.env.MONGODB_URI).then(() =>{
        console.log("connected to database!")
    }).catch((err)=>{
        console.log(`sommthing is worn to connection : ${err}`)
    })
 }
