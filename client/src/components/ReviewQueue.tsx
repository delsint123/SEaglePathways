import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Tooltip, notification, List, Card, Typography, Pagination, Divider, Tag, Select} from 'antd';
import '../styling/ReviewQueue.css';
import SubmitReviewModal from './SubmitReviewModal';
import axios, { AxiosResponse } from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';
import IQueueReviewRequest from '../../../server/models/queueReviewRequestModel';
import { useNavigate } from 'react-router-dom';
import ICompany from '../../../server/models/companyModel';
import ITag from '../../../server/models/tagModel';

export default function ReviewQueue(): ReactElement {
    //initialize state
    const [companies, setCompanies] = React.useState<ICompany[]>([]);
    const [tags, setTags] = React.useState<ITag[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReviewViewModel[]>([]);
    const [totalReviewCount, setTotalReviewCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text } = Typography;

    const isUserLoggedOut = sessionStorage.getItem('user') == null;

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //toggle review modal
    const toggleReviewModal = (): void => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }

    //retrieve all reviews from the server
    const getReviews = async (): Promise<void> => {
        const queueRequest = {
            page: currentPage,
            limit: 15
        } as IQueueReviewRequest;

        await instance.post<IQueueReviewRequest, AxiosResponse>('/review/queueReviews', {queueRequest})
            .then((res) => {
                //save the review data into state
                const reviews = [...res.data] as IReviewViewModel[];
                setReviews(reviews);
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
        await instance.get('/review/totalReviewCount')
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

    const getTagsAsync = async (): Promise<void> => {
        await instance.get('/tag/allTags')
            .then((res) => {
                //update state with data retrieved from server
                const tags = [...res.data] as ITag[];
                setTags(tags);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
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

    const navigateToReview = (reviewId: number): void => {
        navigate(`/review/${reviewId}`);
    }

    //refresh the review data when the modal opens and closes
    useEffect(() => {
        getReviews();
        getTotalReviewCount();
    }, [isModalOpen]);

    useEffect(() => {
        getReviews();
    }, [currentPage]);

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
                    <Button onClick={toggleReviewModal}>
                        Add a Review
                    </Button>
                }
            
                <Text style={{ marginLeft: "auto" }}>Filter By: </Text>

                <Select 
                    showSearch
                    style={{ width: "150px", marginLeft: "10px", marginRight: "8px" }}
                    placeholder="Company"
                    optionFilterProp='children'
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    filterSort={(a, b) => (a.label.toLowerCase()).localeCompare(b.label.toLowerCase())}
                    options={companies.map(company => ({ value: company.companyId, label: company.name }))}
                />

                <Select 
                    showSearch
                    style={{ width: "150px" }}
                    placeholder="Tags"
                    optionFilterProp='children'
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    filterSort={(a, b) => (a.label.toLowerCase()).localeCompare(b.label.toLowerCase())}
                    options={tags.map(tag => ({ value: tag.tagId, label: tag.name }))}
                />
            </div>

            <div className='review__container'>
                <List
                    grid={{ gutter: 16, column: 3}}
                    dataSource={reviews}
                    renderItem={review => (
                        <List.Item>
                            <Card 
                                headStyle={{ fontSize:"20px" }} 
                                className='review' 
                                title={review.title}
                                onClick={() => navigateToReview(review.reviewId)}
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
                companies={companies}
                tags={tags}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                getCompaniesAsync={getCompaniesAsync}
                getTagsAsync={getTagsAsync}
            />
        </div>
    );
}

