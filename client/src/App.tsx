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
import axios, { AxiosResponse } from 'axios';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import ICompany from '../../server/models/companyModel.ts';
import ITag from '../../server/models/tagModel.ts';
import form from 'antd/es/form/index';

function Root(): ReactElement { 
    const [companies, setCompanies] = React.useState<ICompany[]>([]);
    const [tags, setTags] = React.useState<ITag[]>([]);

    const isUserLoggedOut = sessionStorage.getItem('user') == null;

    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //get all companies from the server
    const getCompaniesAsync = async (): Promise<void> => {
        await instance.get('/company/allCompanies')
            .then((res) => {
                //update state with data retrieved from server
                const companies = [...res.data] as ICompany[];
                setCompanies(companies);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }

    const getTagsAsync = async (): Promise<void> => {
        await instance.get('/tag/allTags')
            .then((res) => {
                //update state with data retrieved from server
                const tags = [...res.data] as ITag[];
                setTags(tags);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }

    //Add a company to the database
    const addCompany = async (company: string): Promise<void> => {

        const words = company.split(' ');

        for(let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
        }

        company = words.join(' ');

        await instance.post<string, AxiosResponse>('/company/add', {company})
            .then((res) => {
                //clear new company state and get companies from server
                getCompaniesAsync();

                notificationApi.success({
                    message: 'Company Added',
                    description: 'Your company has been added successfully!',
                    placement: 'bottomRight',
                });
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }

    const addTag = async (tag: ITag): Promise<void> => {
        await instance.post<string, AxiosResponse>('/tag/add', {tag})
            .then((res) => {
                //clear new company state and get companies from server
                getTagsAsync();

                notificationApi.success({
                    message: 'Tag Added',
                    description: 'Your tag has been added successfully!',
                    placement: 'bottomRight',
                });
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }

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
                <Route path='/' element={
                        <ReviewQueue 
                            companies={companies} 
                            tags={tags} 
                            getCompaniesAsync={getCompaniesAsync}
                            getTagsAsync={getTagsAsync}
                            addCompany={addCompany} 
                            addTag={addTag} 
                        />
                    }
                />
                <Route path='/login' element={<Login />}/>
                <Route path='/register' element={<Register />}/>
                <Route path='/review/:reviewId' element={<Review />}/>
                <Route path='/profile' element={
                        <Profile 
                            companies={companies} 
                            tags={tags} 
                            getCompaniesAsync={getCompaniesAsync}
                            getTagsAsync={getTagsAsync}
                            addCompany={addCompany} 
                            addTag={addTag} 
                        />
                    }
                />
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
