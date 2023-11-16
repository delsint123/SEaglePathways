import React, {ReactElement, useEffect, useState} from 'react';
import {notification, Typography, Divider, Tooltip, Tag} from 'antd';
import '../styling/Review.css';
import axios from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';
import { useParams } from 'react-router-dom';

export default function Review(): ReactElement {
    const params = useParams();

    //initialize state
    const [currentReview, setCurrentReview] = useState<IReviewViewModel>({} as IReviewViewModel);
    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text, Title } = Typography;

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    //retrieve single review from the server
    const getReview = async (): Promise<void> => {
        await instance.get<IReviewViewModel>('/review/' + params.reviewId)
            .then((res) => {
                //save the review data into state
                const review = res.data as IReviewViewModel;
                setCurrentReview(review);
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
    
    useEffect(() => {
        getReview();
    }, []);

    return (
        <div className='content'>

            {contextHolder}
            
            <div className='reviewPg'>
                <Title level={2}>{currentReview.title}</Title>
                <Divider />

                {currentReview.tags &&
                    currentReview.tags.map((tag, index) => (
                        <Tooltip title={tag.description} placement='top'>
                            <Tag key={index}>{tag.name}</Tag>
                        </Tooltip>
                    ))
                }

                <br />

                <Text>{currentReview.company}</Text>
                <br />
                <Text italic={true}>
                    {`${currentReview.startDate?.slice(0, 10)} ~ ${currentReview.endDate?.slice(0, 10)}`}
                </Text>
                <br />
                <Text>{currentReview.gradeLevel}</Text>
                <Paragraph>{currentReview.description}</Paragraph>
            </div>
            
        </div>
    );
}