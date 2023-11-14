import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Tooltip, notification, List, Card, Typography, Pagination, Divider} from 'antd';
import '../styling/ReviewQueue.css';
import '../App.css';
import SubmitReviewModal from './SubmitReviewModal';
import axios, { AxiosResponse } from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';

export default function Review(): ReactElement {
    //initialize state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReviewViewModel[]>([]);

    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text } = Typography;

    const isUserLoggedOut = sessionStorage.getItem('user') == null;

    //toggle review modal
    const toggleReviewModal = (): void => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }

    //retrieve all reviews from the server
    const getReviews = async (): Promise<void> => {
        const instance = axios.create({
            baseURL: 'http://localhost:5000'
        })

        await instance.get('/review/allReviews')
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

    //refresh the review data when the modal opens and closes
    useEffect(() => {
        getReviews();
    }, [isModalOpen]);

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
                            >

                                <div className='review__companyDateContainer'>
                                    <Text className='review__company'>{review.company}</Text>

                                    <br />
                                    
                                    <Text italic={true} className='review__date'>
                                        {`${review.startDate.slice(0, 10)} ~ ${review.endDate.slice(0, 10)}`}
                                    </Text>
                                </div>

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
                    total={reviews.length}
                    showTotal={(total) => `${total} Total reviews`}
                    defaultPageSize={15}
                    className='review__pagination'
                />

            {/* Render modal */}
            <SubmitReviewModal 
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </div>
    );
}

