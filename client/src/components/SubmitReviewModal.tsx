import React, {ReactElement, useEffect} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Modal, Form, Select, Input, DatePicker, Divider, Space, Button, notification} from 'antd';
import '../styling/SubmitReviewModal.css';
import IReview from '../../../server/models/reviewModel';
import axios, { AxiosResponse } from 'axios';
import ISubmitReviewViewModel from '../models/submitReviewViewModel';
import ICompany from '../../../server/models/companyModel';
import ITag from '../../../server/models/tagModel';

//Define the properties that this component expects
interface SubmitReviewModalProps {
    companies: ICompany[],
    tags: ITag[],
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    getCompaniesAsync: () => Promise<void>,
    getTagsAsync: () => Promise<void>
}

//Define the functional component that represents
export default function SubmitReviewModal(props: SubmitReviewModalProps): ReactElement {
    //initialize state
    const [newCompany, setNewCompany] = React.useState<string>("");
    const [newTag, setNewTag] = React.useState<ITag>({} as ITag);
    const [currentTagIds, setCurrentTagIds] = React.useState<number[]>([]);

    const [form] = Form.useForm();
    const [notificationApi, contextHolder] = notification.useNotification();

    //create an axios instance
    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //submits a review to a server asynchronously
    const submitReviewAsync = async (request: ISubmitReviewViewModel) => {
        const sessionUserId = sessionStorage.getItem('user');

        const companyId = props.companies.find(comp => comp.name === request.company)?.companyId;
        
        const review = {
            userId: sessionUserId ? parseInt(sessionUserId) : null,
            title: request.title,
            company: request.company,
            companyId: companyId,
            description: request.description,
            startDate: request.datesAttended[0].toDate(),
            endDate: request.datesAttended[1].toDate(),
            gradeLevel: request.gradeLevel, 
            tagIds: currentTagIds
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

    //Add a company to the database
    const addCompany = async (company: string): Promise<void> => {
        await instance.post<string, AxiosResponse>('/company/add', {company})
            .then((res) => {
                //clear new company state and get companies from server
                setNewCompany('');
                props.getCompaniesAsync();

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
                setNewTag({} as ITag);
                props.getTagsAsync();

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

    const handleCancel = () => {
        //close form modal and reset form fields
        props.setIsModalOpen(false);
        form.resetFields();
    };

    //custom filter for company select
    const searchFilter = (input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

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

    useEffect(() => {
        props.getCompaniesAsync();
        props.getTagsAsync();
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
                            filterOption={searchFilter}
                            options={props.companies.map(company => ({key: company.companyId, value: company.name, label: company.name}))}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Space style={{ padding: '0 8px 4px' }}>
                                        <Input
                                            placeholder="Please enter item"
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

                    <Form.Item label="Tags" name="tags">
                        <Select
                            mode='multiple'
                            showSearch
                            placeholder="Select tags"
                            filterOption={searchFilter}
                            onSelect={(value, option) => setCurrentTagIds((prevTagIds: number[]) => [...prevTagIds, option.key])}
                            onDeselect={(value, option) => setCurrentTagIds((prevTagIds: number[]) => prevTagIds.filter((tagId: number) => tagId !== option.key))}
                            options={props.tags.map(tag => ({key: tag.tagId as number, value: tag.name, label: tag.name}))}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}

                                    <Divider style={{ margin: '8px 0' }} />
                                    <Space style={{ padding: '0 8px 4px'}}>
                                        <div style={{display: 'block'}}>
                                            <Input
                                                value={newTag.name}
                                                onChange={(e) => setNewTag((prevTag: ITag) => ({ ...prevTag, name: e.target.value} as ITag))}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                placeholder='Name'
                                                style={{marginBottom: '8px'}}
                                            />
                                            <Input
                                                value={newTag.description}
                                                onChange={(e) => setNewTag((prevTag: ITag) => ({ ...prevTag, description: e.target.value} as ITag))}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                placeholder='Description'
                                            />
                                        </div>
                                        
                                        <Button type="text" icon={<PlusOutlined />} onClick={() => addTag(newTag)}>
                                            Add tag
                                        </Button>
                                    </Space>
                                </>
                              )}
                        />
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