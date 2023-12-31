import React, {ReactElement} from 'react';
import {Button, Card, Form, Input, notification} from 'antd';
import IUserRequestModel from '../../../server/models/userRequestModel';
import '../styling/Register.css';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register(): ReactElement {
    //used to navigate to another route
    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();

    //create an axios instance
    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //submits/registers a user to the server asynchronously
    const submitUserAsync = async (user: IUserRequestModel) => {
        await instance.post<IUserRequestModel, AxiosResponse>('/user/register', {user})
            .then((res) => {
                notificationApi.success({
                    message: 'Account Created',
                    description: 'Your account has been registered successfully, Please log in!',
                    placement: 'bottomRight',
                });
                
                //TODO:redirect to account page if successful
                //checks if the response is successful and redirects to the home page
                setTimeout(() => navigate('/login'), 3000);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    };

    return (
        <div className='content registerContainer'>
            {contextHolder}
            <Card 
                title='Register'
                className='register'
            >
                <Form
                    name="register"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={submitUserAsync}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your name!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Graduation Year"
                        name="graduationYear"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your graduation year!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
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
            </Card>
            
        </div>
    );
}