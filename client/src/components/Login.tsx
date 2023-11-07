import React, {ReactElement} from 'react';
import {Button, Form, Input, notification} from 'antd';
import {Link, useNavigate} from 'react-router-dom';
import '../styling/Login.css';
import axios, { AxiosResponse } from 'axios';
import IUserLoginModel from '../../../server/models/userLoginModel';

export default function Login(): ReactElement {
    //used to navigate to another route
    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();


    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //sends a request to the server to login a user
    const loginUser = async (user: IUserLoginModel) => {

        await instance.post<IUserLoginModel, AxiosResponse>('/user/login', {user})
            .then((res) => {
                notificationApi.success({
                    message: 'Login Successful',
                    description: 'You have been logged in successfully! Navigating home...',
                    placement: 'bottomRight',
                });
                
                //TODO:redirect to account page if successful
                //checks if the response is successful and redirects to the home page
                sessionStorage.setItem('user', res.data.userId);
                setTimeout(() => navigate('/'), 3000);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    };
    
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className='login__container'>
            {contextHolder}

            <h1>Log In</h1>
            
            {/*Uses form, button, and input components retrieved from AntDesign*/}
            <Form
                className='login'
                name="login"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={loginUser}
                //onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                        required: true,
                        message: 'Please input your email!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                        required: true,
                        message: 'Please input your password!',
                        },
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <Link to={"/register"}>Register</Link>
        </div>
    );
}

