import { creatuser, varifyuser } from "../models/usermodel.js";

export async function postuser(user) {
   const result = await creatuser(user);
   return result;
}
export async function checkuser(user){
   const result = await varifyuser(user);
   return result;
}