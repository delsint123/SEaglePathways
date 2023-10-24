import React, {ReactElement} from 'react';
import {Button, Form, Input} from 'antd';
import IUserRequestModel from '../../../server/models/userRequestModel';
import '../styling/Register.css';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register(): ReactElement {
    const navigate = useNavigate();

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const submitUser = async (user: IUserRequestModel) => {

        const res = await instance.post<IUserRequestModel, AxiosResponse>('/user/register', {user});

        //TODO:redirect to account page if successful
        if (res.status === 200) {
            navigate('/');
        }
        
        return res.data;
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            <Form
                name="register"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={submitUser}
                //onFinishFailed={onFinishFailed}
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
        </>
    );
}