import React, {ReactElement, useEffect, useState} from 'react';
import {Button} from 'antd';
import '../styling/Review.css';
import SubmitReviewModal from './SubmitReviewModal';
import axios, { AxiosResponse } from 'axios';
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';

export default function Review(): ReactElement {
    //initialize state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReviewViewModel[]>([]);

    //toggle review modal
    const toggleReviewModal = (): void => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }

    //retrieve all reviews from the server
    const getReviews = async (): Promise<void> => {
        const instance = axios.create({
            baseURL: 'http://localhost:5000'
        })

        const res = await instance.get('/review/allReviews');

        //save the review data into state
        const reviews = [...res.data] as IReviewViewModel[];
        setReviews(reviews);
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
            {/* Render review elements */}
            <div className='review__container'>
                <Button onClick={toggleReviewModal}>Add a Review</Button>
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

