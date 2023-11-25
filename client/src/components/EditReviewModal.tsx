import React, {ReactElement, useEffect} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Modal, Form, Select, Input, DatePicker, Divider, Space, Button, notification} from 'antd';
import IReview from '../../../server/models/reviewModel';
import axios, { AxiosResponse } from 'axios';
import ISubmitReviewViewModel from '../models/submitReviewViewModel';
import ICompany from '../../../server/models/companyModel';
import ITag from '../../../server/models/tagModel';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';
import dayjs from 'dayjs';

//Define the properties that this component expects
interface EditReviewModalProps {
    review: IReviewViewModel,
    isEditing: boolean,
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
    companies: ICompany[],
    tags: ITag[],
    getCompaniesAsync: () => Promise<void>,
    getTagsAsync: () => Promise<void>,
    addCompany: (companyName: string) => Promise<void>
    addTag: (tag: ITag) => Promise<void>
}

//Define the functional component that represents
export default function EditReviewModal(props: EditReviewModalProps): ReactElement {
    //initialize state
    const [newCompany, setNewCompany] = React.useState<string>("");
    const [newTag, setNewTag] = React.useState<ITag>({} as ITag);
    const [currentTagIds, setCurrentTagIds] = React.useState<number[]>(props.review.tags.map(tag => tag.tagId) as number[]);

    const [form] = Form.useForm();
    const [notificationApi, contextHolder] = notification.useNotification();

    //create an axios instance
    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //edit a review asynchronously
    const editReviewAsync = async (request: ISubmitReviewViewModel) => {

        const sessionUserId = sessionStorage.getItem('user');

        const companyId = props.companies.find(comp => comp.name === request.company)?.companyId;
        
        const review = {
            reviewId: props.review.reviewId,
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
        await instance.post<IReview, AxiosResponse>('/review/edit', {review})
            .then((res) => {
                props.setIsEditing(false);
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

    const addACompany = async (): Promise<void> => {
        await props.addCompany(newCompany)
            .then(() => {
                setNewCompany('');
                form.setFieldsValue({company: newCompany});
            });
    }

    const addATag = async (): Promise<void> => {
        await props.addTag(newTag)
            .then(() => {
                setNewTag({} as ITag);
                //form.setFieldsValue({tag: newTag});
            });
    }

    const handleCancel = () => {
        //close form modal and reset form fields
        props.setIsEditing(false);
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

    useEffect(() => {}, [props.review])

    return (
        <div>
            {contextHolder}
            {/*Uses modal component retrieved from AntDesign*/}
            <Modal title="Edit Review" open={props.isEditing} onOk={form.submit} onCancel={handleCancel} >
                {/*Uses form, form.item, and select components retrieved from AntDesign*/}
                <Form
                    name="Edit Review"
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 800 }}
                    initialValues={{ remember: true }}
                    onFinish={editReviewAsync}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        initialValue={props.review.title}
                        rules={[
                            {
                                required: true,
                                message: 'Please input the title of your review!',
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Company"
                        name="company"
                        initialValue={props.review.company}
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
                                        <Button type="text" icon={<PlusOutlined />} onClick={() => addACompany()}>
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
                        initialValue={[dayjs(props.review.startDate), dayjs(props.review.endDate)]}
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
                        initialValue={props.review.description}
                        rules={[
                            {
                                required: true,
                                message: 'Please input the description!',
                            },
                        ]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item label="Tags" name="tags" initialValue={props.review.tags.map(tag => tag.name)}>
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
                                        
                                        <Button type="text" icon={<PlusOutlined />} onClick={() => addATag()}>
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
                        initialValue={props.review.gradeLevel}
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