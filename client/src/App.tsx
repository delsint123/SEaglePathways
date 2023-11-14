import React, {ReactElement} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom';
import ReviewQueue from './components/ReviewQueue.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import Review from './components/Review.tsx';

import './App.css';
import Logo from './assets/SEaglePathways-04.png';
import IReview from '../../server/models/reviewModel.ts';

function App(): ReactElement {
  return (
    <>
        {/* Setup React Router */}
        <BrowserRouter>
            {/* Setup navigation bar */}
            <nav className='nav'>   
                <Link to={"/"} className="nav__logo"><img alt="SEaglePathways" src={Logo} className="logo"/></Link>
                <Link to={"/"} className='nav__reviews'>Reviews</Link>
                <Link to={"/login"} className='nav__login'>Login</Link>
            </nav>

            {/* Setup routes */}
            <Routes>
                <Route path='/' element={<ReviewQueue />}/>
                <Route path='/login' element={<Login />}/>
                <Route path='/register' element={<Register />}/>
                <Route path='/review/:reviewId' element={<Review />}/>
            </Routes>
                
            {/* Setup footer */}
            <footer className='footer'>
                <Link to={"/"}><img alt="SEaglePathways" src={Logo} className="footer__logo"/></Link>
            </footer>
        </BrowserRouter>
    </>
  );
}

export default App;
