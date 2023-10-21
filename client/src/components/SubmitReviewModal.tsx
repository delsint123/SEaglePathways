import React, {ReactElement} from 'react';
import {Modal, Form, Select, Input, DatePicker} from 'antd';
import '../styling/SubmitReviewModal.css';
import IReview from '../../../server/models/reviewModel'
import axios, { AxiosResponse } from 'axios';
import ISubmitReviewViewModel from '../models/submitReviewViewModel';

interface SubmitReviewModalProps {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SubmitReviewModal(props: SubmitReviewModalProps): ReactElement {
    const [form] = Form.useForm();

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const submitReview = async (request: ISubmitReviewViewModel) => {
        const review = {
            title: request.title,
            company: request.company,
            description: request.description,
            startDate: request.datesAttended[0].toDate(),
            endDate: request.datesAttended[1].toDate(),
            gradeLevel: request.gradeLevel
        } as IReview;

        const res = await instance.post<IReview, AxiosResponse>('/review/submit', {review});
        props.setIsModalOpen(false);
        form.resetFields();
        return res.data;
    }

    const handleCancel = () => {
        props.setIsModalOpen(false);
    };

    const gradeLevels = [
        {
            value: 'Freshman',
            label: 'Freshman'
        },
        {
            value: 'Sophomore',
            label: 'Sophomore'
        },
        {
            value: 'Junior',
            label: 'Junior'
        },
        {
            value: 'Senior',
            label: 'Senior'
        },
        {
            value: 'New Grad',
            label: 'New Grad'
        },
    ];

    return (
        <>
            <Modal title="Submit Review" open={props.isModalOpen} onOk={form.submit} onCancel={handleCancel}>
                <Form
                    className='login'
                    name="login"
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={submitReview}
                    //onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[
                            {
                            required: true,
                            message: 'Please input the title of your review!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Company"
                        name="company"
                        rules={[
                            {
                            required: true,
                            message: 'Please input the company!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item 
                        label="Dates Attended"
                        name="datesAttended"
                        rules={[
                            {
                            required: true,
                            message: 'Please input the title of your review!',
                            },
                        ]}
                    >
                        <DatePicker.RangePicker />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            {
                            required: true,
                            message: 'Please input the description!',
                            },
                        ]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        label="Grade Level"
                        name="gradeLevel"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your grade level!',
                            },
                        ]}
                    >
                        <Select defaultValue="Freshman" options={gradeLevels} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}