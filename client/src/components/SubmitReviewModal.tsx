import React, {ReactElement, useEffect} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Modal, Form, Select, Input, DatePicker, Divider, Space, Button} from 'antd';
import '../styling/SubmitReviewModal.css';
import IReview from '../../../server/models/reviewModel';
import axios, { AxiosResponse } from 'axios';
import ISubmitReviewViewModel from '../models/submitReviewViewModel';
import ICompany from '../../../server/models/companyModel';

interface SubmitReviewModalProps {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SubmitReviewModal(props: SubmitReviewModalProps): ReactElement {
    const [companies, setCompanies] = React.useState<ICompany[]>([]);
    const [newCompany, setNewCompany] = React.useState<string>("");
    const [form] = Form.useForm();

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const submitReviewAsync = async (request: ISubmitReviewViewModel) => {
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

    const getCompaniesAsync = async (): Promise<void> => {
        const res = await instance.get('/company/allCompanies');

        const companies = [...res.data] as ICompany[];
        setCompanies(companies);
    }

    const addCompany = async (company: string): Promise<void> => {
        const res = await instance.post<string, AxiosResponse>('/company/add', {company});
        setNewCompany('');
        return res.data;
    }

    const handleCancel = () => {
        props.setIsModalOpen(false);
        form.resetFields();
    };

    const searchCompanyFilter = (input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

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

    useEffect(() => {
        getCompaniesAsync();
    }, [newCompany])

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
                    onFinish={submitReviewAsync}
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
                        <Select
                            showSearch
                            placeholder="Select a company"
                            filterOption={searchCompanyFilter}
                            options={companies.map(company => ({key: company.companyId, value: company.name, label: company.name}))}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider
                                        style={{
                                        margin: '8px 0',
                                        }}
                                    />
                                    <Space
                                        style={{
                                        padding: '0 8px 4px',
                                        }}
                                    >
                                        <Input
                                            placeholder="Please enter item"
                                            //ref={inputRef}
                                            value={newCompany}
                                            onChange={(e) => setNewCompany(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <Button type="text" icon={<PlusOutlined />} onClick={() => addCompany(newCompany)}>
                                            Add company
                                        </Button>
                                    </Space>
                                </>
                              )}
                        />
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
                        <Select placeholder="Select a grade level" options={gradeLevels} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}