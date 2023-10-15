import React, {ReactElement} from 'react';
import {Modal, Form, Button, Input, DatePicker} from 'antd';
import '../styling/SubmitReviewModal.css';
import IReview from '../../../server/models/reviewModel'
import axios from 'axios';

interface SubmitReviewModalProps {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SubmitReviewModal(props: SubmitReviewModalProps): ReactElement {
    const [reviewForm, setReviewForm] = React.useState<IReview>({} as IReview);

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const submitReview = async (request: IReview) => {
        const res = await instance.post('/review/submit', {request});
        return res.data;
    }

    const handleOk = () => {
        submitReview(reviewForm);
        props.setIsModalOpen(false);
    };
    const handleCancel = () => {
        props.setIsModalOpen(false);
    };

    return (
        <>
            <Modal title="Submit Review" open={props.isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Form
                    className='login'
                    name="login"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={submitReview}
                    // onFinishFailed={onFinishFailed}
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

                    <Form.Item label="Dates Attended">
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
                        <Input />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}