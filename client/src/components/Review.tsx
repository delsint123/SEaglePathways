import React, {ReactElement, useEffect, useState} from 'react';
import {Button} from 'antd';
import '../styling/Review.css';
import IReview from '../../../server/models/reviewModel'
import SubmitReviewModal from './SubmitReviewModal';
import axios, { AxiosResponse } from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';

export default function Review(): ReactElement {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReviewViewModel[]>([]);

    const toggleReviewModal = (): void => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }

    const getReviews = async (): Promise<void> => {
        const instance = axios.create({
            baseURL: 'http://localhost:5000'
        })

        const res = await instance.get('/review/allReviews');

        const reviews = [...res.data] as IReviewViewModel[];
        setReviews(reviews);
    }

    useEffect(() => {
        getReviews();
    }, [isModalOpen]);

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
            <div className='review__container'>
                <Button onClick={toggleReviewModal}>Add a Review</Button>
                {reviewElements}
            </div>

            <SubmitReviewModal 
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </>
    );
}

