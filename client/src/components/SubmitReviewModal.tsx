import React, {ReactElement, useEffect} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Modal, Form, Select, Input, DatePicker, Divider, Space, Button, notification} from 'antd';
import '../styling/SubmitReviewModal.css';
import IReview from '../../../server/models/reviewModel';
import axios, { AxiosResponse } from 'axios';
import ISubmitReviewViewModel from '../models/submitReviewViewModel';
import ICompany from '../../../server/models/companyModel';

//Define the properties that this component expects
interface SubmitReviewModalProps {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

//Define the functional component that represents
export default function SubmitReviewModal(props: SubmitReviewModalProps): ReactElement {
    //initialize state
    const [companies, setCompanies] = React.useState<ICompany[]>([]);
    const [newCompany, setNewCompany] = React.useState<string>("");

    const [form] = Form.useForm();
    const [notificationApi, contextHolder] = notification.useNotification();

    //create an axios instance
    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //submits a review to a server asynchronously
    const submitReviewAsync = async (request: ISubmitReviewViewModel) => {
        const sessionUserId = sessionStorage.getItem('user');
        
        const review = {
            userId: sessionUserId ? parseInt(sessionUserId) : null,
            title: request.title,
            company: request.company,
            description: request.description,
            startDate: request.datesAttended[0].toDate(),
            endDate: request.datesAttended[1].toDate(),
            gradeLevel: request.gradeLevel, 
        } as IReview;

        if (review.userId === null) { 
            notificationApi.error({
                message: 'Error',
                description: "You are not logged in! Can not submit review!",
                placement: 'bottomRight',
            });

            return;
        }

        //post the review to the server
        await instance.post<IReview, AxiosResponse>('/review/submit', {review})
            .then((res) => {
                props.setIsModalOpen(false);
                form.resetFields();                
                
                notificationApi.success({
                    message: 'Review Submitted',
                    description: 'Your review has been submitted successfully!',
                    placement: 'bottomRight',
                });
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            }
        );
    }

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

    //Add a company to the database
    const addCompany = async (company: string): Promise<void> => {
        await instance.post<string, AxiosResponse>('/company/add', {company})
            .then((res) => {
                //clear new company state and get companies from server
                setNewCompany('');
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

    const handleCancel = () => {
        //close form modal and reset form fields
        props.setIsModalOpen(false);
        form.resetFields();
    };

    //custom filter for company select
    const searchCompanyFilter = (input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    //define grade levels for select
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

    //get all companies after component first renders
    useEffect(() => {
        getCompaniesAsync();
    }, [])

    return (
        <div>
            {contextHolder}
            {/*Uses modal component retrieved from AntDesign*/}
            <Modal title="Submit Review" open={props.isModalOpen} onOk={form.submit} onCancel={handleCancel}>
                {/*Uses form, form.item, and select components retrieved from AntDesign*/}
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
                            message: 'Please input the dates!',
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
        </div>
    );
}