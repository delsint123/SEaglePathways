import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Tooltip, notification, List, Card, Typography, Pagination, Divider, Tag, Select, DatePicker, Form} from 'antd';
import '../styling/ReviewQueue.css';
import SubmitReviewModal from './SubmitReviewModal';
import axios, { AxiosResponse } from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';
import IQueueReviewRequest from '../../../server/models/queueReviewRequestModel';
import { useNavigate } from 'react-router-dom';
import ICompany from '../../../server/models/companyModel';
import ITag from '../../../server/models/tagModel';
import IReviewFilterRequest from '../../../server/models/reviewFilterRequestModel';
import IReviewFilterViewModel from '../models/reviewFilterViewModel';
import EditReviewModal from './EditReviewModal';
import { EditTwoTone } from '@ant-design/icons';

interface ReviewQueueProps {
    companies: ICompany[],
    tags: ITag[],
    getCompaniesAsync: () => Promise<void>,
    getTagsAsync: () => Promise<void>,
    addCompany: (companyName: string) => Promise<void>,
    addTag: (tag: ITag) => Promise<void>
}

export default function ReviewQueue(props: ReviewQueueProps): ReactElement {
    //initialize state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReviewViewModel[]>([]);
    const [totalReviewCount, setTotalReviewCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentFilter, setCurrentFilter] = useState<string>('None');
    const [queueFilters, setQueueFilters] = useState<IReviewFilterViewModel>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [reviewToEdit, setReviewToEdit] = useState<IReviewViewModel>({} as IReviewViewModel);

    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text } = Typography;

    const isUserLoggedOut = sessionStorage.getItem('user') == null;
    const currentUser = parseInt(sessionStorage.getItem('user') || "");

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //toggle review modal
    const toggleReviewModal = (): void => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }

    const getCurrentFilter = (): string => {
        if(queueFilters?.companyId && queueFilters?.tagId && queueFilters?.startDate && queueFilters?.endDate) {
            return 'Company, Tag, and Date';
        }
        if(queueFilters?.tagId && queueFilters?.startDate && queueFilters?.endDate) {
            return 'Tag and Date';
        }
        if(queueFilters?.companyId && queueFilters?.startDate && queueFilters?.endDate) {
            return 'Company and Date';
        }
        if(queueFilters?.companyId && queueFilters?.tagId) {
            return 'Company and Tag';
        }
        if(queueFilters?.companyId) {
            return 'Company';
        }
        if(queueFilters?.tagId) {
            return 'Tag';
        }
        if(queueFilters?.startDate && queueFilters?.endDate) {
            return 'Date';
        }
        
        return 'None';
    }

    //retrieve all reviews from the server
    const generateReviewQueueWithFilters = async (): Promise<void> => {
        const filterRequest = {
            queue: {page: currentFilter === getCurrentFilter() ? currentPage : 1, limit: 15} as IQueueReviewRequest,
            companyId: queueFilters?.companyId,
            tagId: queueFilters?.tagId,
            startDate: queueFilters?.startDate?.toDate(),
            endDate: queueFilters?.endDate?.toDate()
        } as IReviewFilterRequest;

        await instance.post<IReviewFilterRequest, AxiosResponse>('/review/queueReviews', {filterRequest})
            .then((res) => {
                const reviews = [...res.data] as IReviewViewModel[];

                if(currentFilter !== getCurrentFilter()) {
                    setCurrentPage(1);
                }

                setReviews(reviews);
                setCurrentFilter(getCurrentFilter());
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                    duration: 60
                });
            });
    }

    const getTotalReviewCount = async (): Promise<void> => {
        const filterRequest = {
            queue: {page: currentFilter === getCurrentFilter() ? currentPage : 1, limit: 15} as IQueueReviewRequest,
            companyId: queueFilters?.companyId,
            tagId: queueFilters?.tagId,
            startDate: queueFilters?.startDate?.toDate(),
            endDate: queueFilters?.endDate?.toDate()
        } as IReviewFilterRequest;

        await instance.post('/review/totalReviewCount', {filterRequest})
            .then((res) => {
                const reviewCount = res.data.count;
                setTotalReviewCount(reviewCount);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                    duration: 60
                });
            });
    }

    const getTagsForDisplay = (review: IReviewViewModel): ReactElement[] => {
        return review.tags.map((tag, index) => (
            <Tooltip title={tag.description} placement='bottom'>
                <Tag key={index}>{tag.name}</Tag>
            </Tooltip>
        ))
    }

    const openEditModal = (e: React.MouseEvent<HTMLElement>, reviewId: number): void => {
        e.stopPropagation();
        setIsEditing(true);
        setReviewToEdit(reviews.find(review => review.reviewId === reviewId) as IReviewViewModel);
    }

    //refresh the review data when the modal opens and closes
    useEffect(() => {
        generateReviewQueueWithFilters();
        form.resetFields();
    }, [isModalOpen]);

    useEffect(() => {
        generateReviewQueueWithFilters();
    }, [currentPage]);

    useEffect(() => {
        getTotalReviewCount();
    }, [currentPage, currentFilter, isModalOpen]);

    return (
        <div className='content'>
            {contextHolder}
            {/* Render review elements */}

            <div className='review__editMenu'>
                {isUserLoggedOut && 
                    <Tooltip placement='top' title='You are not logged in! Please log in to submit a review'>
                        <Button disabled={isUserLoggedOut}>
                            Add a Review
                        </Button>
                    </Tooltip>
                }
                {!isUserLoggedOut &&
                    <Button onClick={toggleReviewModal} className='addReviewButton'>
                        Add a Review
                    </Button>
                }
            
                <Text style={{ marginLeft: "auto" }}>Filter By: </Text>

                <Form
                    className='filterForm'
                    name="filter"
                    form={form}
                    initialValues={{ remember: true }}
                    onFinish={generateReviewQueueWithFilters}
                    autoComplete="off"
                >
                    <Form.Item className='filterForm__item'>
                        <Select 
                            showSearch
                            allowClear
                            className='filterForm__select'
                            style={{ marginLeft: "10px"}}
                            placeholder="Company"
                            optionFilterProp='children'
                            onSelect={(companyId) => setQueueFilters((prevFilters) => ({ ...prevFilters, companyId: companyId } as IReviewFilterViewModel)) }
                            onClear={() => setQueueFilters((prevFilters) => ({ ...prevFilters, companyId: undefined } as IReviewFilterViewModel))}
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            filterSort={(a, b) => (a.label.toLowerCase()).localeCompare(b.label.toLowerCase())}
                            options={props.companies.map(company => ({ value: company.companyId, label: company.name }))}
                        />
                    </Form.Item>
                    <Form.Item className='filterForm__item'>
                        <Select 
                            showSearch
                            allowClear
                            className='filterForm__select'
                            placeholder="Tag"
                            optionFilterProp='children'
                            onSelect={(tagId) => setQueueFilters((prevFilters) => ({ ...prevFilters, tagId: tagId } as IReviewFilterViewModel)) }
                            onClear={() => setQueueFilters((prevFilters) => ({ ...prevFilters, tagId: undefined } as IReviewFilterViewModel)) }
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            filterSort={(a, b) => (a.label.toLowerCase()).localeCompare(b.label.toLowerCase())}
                            options={props.tags.map(tag => ({ value: tag.tagId, label: tag.name }))}
                        />
                    </Form.Item>
                    <Form.Item className='filterForm__item'>
                        <DatePicker.RangePicker 
                            style={{ width: "275px"}}
                            onChange={(dates) => { setQueueFilters((prevFilters) => ({ ...prevFilters, startDate: dates?.[0], endDate: dates?.[1]} as IReviewFilterViewModel))}}
                        />
                    </Form.Item>
                    <Form.Item className='filterForm__item'>
                        <Button type="primary" htmlType="submit" className='filterForm__submit'>
                            Generate
                        </Button>
                    </Form.Item>
                </Form>
                
            </div>

            <div className='review__container'>
                <List
                    grid={{ gutter: 16, column: 3}}
                    dataSource={reviews}
                    renderItem={review => (
                        <List.Item>
                            <Card 
                                className='review' 
                                title={review.title}
                                onClick={() => navigate(`/review/${review.reviewId}`)}
                                extra={review.userId == currentUser && 
                                    <Button onClick={(e) => openEditModal(e, review.reviewId)}>
                                        <EditTwoTone twoToneColor='#004785'/>
                                    </Button>
                                }
                                loading={reviews.length === 0}
                            >
                                <div className='review__companyDateContainer'>
                                    <Text className='review__company'>{review.company}</Text>
                                    <br />
                                    <Text italic={true}>{`${review.startDate.slice(0, 10)} ~ ${review.endDate.slice(0, 10)}`}</Text>
                                </div>

                                {getTagsForDisplay(review)}

                                <Divider orientation='right' orientationMargin="0px" style={{ color:"rgba(1, 121, 76)" }}>
                                    {review.gradeLevel}
                                </Divider>

                                <Paragraph ellipsis={{rows:3}} style={{ marginBottom:"0px" }}>
                                    {review.description}
                                </Paragraph>
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
            
            <Pagination 
                current={currentPage}
                total={totalReviewCount}
                showTotal={(total) => `${total} Total reviews`}
                defaultPageSize={15}
                onChange={(page) => setCurrentPage(page)}
                className='review__pagination'
            />

            {/* Render modal */}
            <SubmitReviewModal 
                companies={props.companies}
                tags={props.tags}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                getCompaniesAsync={props.getCompaniesAsync}
                getTagsAsync={props.getTagsAsync}
                addCompany={props.addCompany}
                addTag={props.addTag}
            />

            {isEditing &&
                <EditReviewModal
                    review={reviewToEdit}
                    companies={props.companies}
                    tags={props.tags}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    getCompaniesAsync={props.getCompaniesAsync}
                    getTagsAsync={props.getTagsAsync}
                    addCompany={props.addCompany}
                    addTag={props.addTag}
                />
            }
        </div>
    );
}

