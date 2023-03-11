import React from 'react';
import { useNavigate } from "react-router-dom";
function LoginLayout() {
  
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    let path = 'ch'; 
    navigate(path);
  }
  
  return (
     <div >
      
                
          <button 
            onClick={routeChange}
              >
              Login
            </button>
      
       
    </div>
  );
}
export default LoginLayout;