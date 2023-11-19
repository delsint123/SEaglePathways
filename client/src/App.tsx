import React, {ReactElement} from 'react';
import {BrowserRouter, Route, Routes, Link, useNavigate} from 'react-router-dom';
import {Button, Dropdown, Menu, MenuProps, notification} from 'antd';
import ReviewQueue from './components/ReviewQueue.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import Review from './components/Review.tsx';
import Profile from './components/Profile.tsx';
import EagleAvatar from './assets/eagleAvatar.png';

import './App.css';
import Logo from './assets/SEaglePathways-04.png';
import axios from 'axios';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';

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

    const avatarMenuItems = [
        {
            key: 'profile',
            onClick: () => navigate('/profile'),
            label: 'Profile'
        } as MenuItemType,
        {
            key: 'logout',
            onClick: () => logoutUser(),
            label: 'Logout'
        } as MenuItemType
    ];

    const avatar = {
        key: 'logout',
        items: avatarMenuItems, 
    } as MenuProps;

    return (
        <>
            {contextHolder}
            {/* Setup navigation bar */}
            <nav className='nav'>   
                <Link to={"/"} className="nav__logo"><img alt="SEaglePathways" src={Logo} className="logo"/></Link>

                {isUserLoggedOut ?
                    <Button onClick={() => navigate('/login')} className='nav__login'>Login</Button> 
                    : 
                    <Dropdown menu={avatar} overlayStyle={{ width: "150px"}}> 
                        <img alt="avatar" src={EagleAvatar} className="nav__avatar"/>
                    </Dropdown>
                }
            </nav>

            {/* Setup routes */}
            <Routes>
                <Route path='/' element={<ReviewQueue />}/>
                <Route path='/login' element={<Login />}/>
                <Route path='/register' element={<Register />}/>
                <Route path='/review/:reviewId' element={<Review />}/>
                <Route path='/profile' element={<Profile />}/>
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
