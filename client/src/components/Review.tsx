import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Tooltip, notification} from 'antd';
import '../styling/Review.css';
import SubmitReviewModal from './SubmitReviewModal';
import axios, { AxiosResponse } from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';

export default function Review(): ReactElement {
    //initialize state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReviewViewModel[]>([]);

    const [notificationApi, contextHolder] = notification.useNotification();

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

    //create a review element for each review
    const reviewElements = reviews.map((review) => {
        return (
            <div className='review'>
                <h1 className='title'>{review.title}</h1>
                <h2>{review.company}</h2>
                <h2>{review.gradeLevel}</h2>
                <h3>{review.startDate}</h3>
                <h3>{review.endDate}</h3>
                <p>{review.description}</p>
            </div>
        )
    });

    return (
        <>
            {contextHolder}
            {/* Render review elements */}
            <div className='review__container'>
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
                
                {reviewElements}
            </div>

            {/* Render modal */}
            <SubmitReviewModal 
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </>
    );
}

