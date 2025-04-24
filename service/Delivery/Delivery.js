import axios from "axios";

export const createOrder=async(data)=>{
    try{
      console.log(data);
      const response= await axios.post(`https://twinnship.com/api/order-create`,{
        ApiKey:"BlwBClB5OM4wwosBipt1NJyGPAZOpAWE8GPCDNUU",
        OrderDetails:[
          data
        ]
      })
      console.log(response);
      return true;
    }catch(err){
      console.log(err);
        return false;
    }
}

