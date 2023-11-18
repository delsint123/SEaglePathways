import React, {ReactElement} from 'react';
import {BrowserRouter, Route, Routes, Link, useNavigate} from 'react-router-dom';
import {Button, notification} from 'antd';
import ReviewQueue from './components/ReviewQueue.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import Review from './components/Review.tsx';

import './App.css';
import Logo from './assets/SEaglePathways-04.png';
import axios from 'axios';

function Root(): ReactElement { 
    const isUserLoggedOut = sessionStorage.getItem('user') == null;

    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const logoutUser = async (): Promise<void> => {
        await instance.get('/user/logout')
            .then((res) => {
                sessionStorage.removeItem('user');

                notificationApi.success({
                    message: 'Success',
                    description: res.data.message,
                    placement: 'bottomRight',
                });

                setTimeout(() => navigate('/'), 3000);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }

    return (
        <>
            {contextHolder}
            {/* Setup navigation bar */}
            <nav className='nav'>   
                <Link to={"/"} className="nav__logo"><img alt="SEaglePathways" src={Logo} className="logo"/></Link>
                <Link to={"/"} className='nav__reviews'>Reviews</Link>

                {isUserLoggedOut ?
                    <Link to={"/login"} className='nav__login'>Login</Link> 
                    : <Button onClick={logoutUser}>Logout</Button>
                }
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
        </>
    );
}

function App(): ReactElement {
    return (
        <>
            {/* Setup React Router */}
            <BrowserRouter>
                <Root />
            </BrowserRouter>
        </>
    );
}

export default App;
