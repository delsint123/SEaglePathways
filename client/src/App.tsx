import React, {ReactElement} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom';
import Review from './components/Review.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import './App.css';
import Logo from './assets/SEaglePathways-04.png';

function App(): ReactElement {
  return (
    <>
        <BrowserRouter>
            <nav className='nav'>   
                <Link to={"/"} className="nav__logo"><img alt="SEaglePathways" src={Logo} className="logo"/></Link>
                <Link to={"/"} className='nav__reviews'>Reviews</Link>
                <Link to={"/login"} className='nav__login'>Login</Link>
                {/* <Link to={"/register"} className='nav__register'>Register</Link> */}
            </nav>
            <Routes>
                <Route path='/' element={<Review />}/>
                <Route path='/login' element={<Login />}/>
                {/* <Route path='/register' element={<Register />}/> */}
            </Routes>
            <footer>
                SEaglePathways
            </footer>
        </BrowserRouter>
    </>
  );
}

export default App;
