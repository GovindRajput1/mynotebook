import React, { useState} from 'react'
import {useNavigate} from 'react-router-dom'

const Signup = (props) => {
    const[credentials, setCredentials] = useState({name:"", email:"", password:"", cpassword:""})
    let navigate = useNavigate()

    const handleSubmit=async(e)=>{
        e.preventDefault();
        const {name, email, password} = credentials;
        const response = await fetch("http://localhost:5000/api/auth/createuser", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, email, password})
          });
          const json = await response.json()
          console.log(json);
        if(json.success){
          localStorage.setItem("token", json.token);
          navigate("/login");
          props.showAlert("Account created successfully", "success")
        }
          else{
            props.showAlert("Invalid Credentials", "danger")
          }
    }

    const onChange = (e)=>{
        setCredentials({...credentials,[e.target.name]: e.target.value})
    }
  return (
    <div className='container'>
      <h1 className='text-center'>Create a new account</h1>
      <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" name="name" className="form-control" id="name" value={credentials.name} onChange={onChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" name="email" className="form-control" id="email" value={credentials.email} onChange={onChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" name="password"  className="form-control" id="password" value={credentials.password} onChange={onChange} minLength={5} required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                    <input type="password" name="cpassword"  className="form-control" id="cpassword" value={credentials.cpassword} onChange={onChange} minLength={5} required/>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
    </div>
  )
}

export default Signup
