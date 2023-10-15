import React, {ReactElement} from 'react';
import {Button} from 'antd';
import '../styling/Review.css';
import IReview from '../../../server/models/reviewModel'
import SubmitReviewModal from './SubmitReviewModal';

export default function Review(): ReactElement {

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const toggleReviewModal = (): void => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }

    const reviews = [{
        reviewId: 1,
        title: "WE JUST VIBING", 
        company: "Google",
        description: "The internship is alright.", 
        startDate: new Date('05/22/2023'),
        endDate: new Date('08/22/2023'),
        gradeLevel: "Senior"
    } as IReview, 
    {
        reviewId: 2,
        title: "WE JUST VIBING", 
        company: "Google",
        description: "The internship is alright.", 
        startDate: new Date('05/22/2023'),
        endDate: new Date('08/22/2023'),
        gradeLevel: "Senior"
    } as IReview, 
    ];

    const reviewElements = reviews.map((review) => {
        return (
            <div className='review'>
                <h1 className='title'>{review.title}</h1>
                <h2>{review.company}</h2>
                <h3>{review.startDate.toDateString()}</h3>
                <h3>{review.endDate.toDateString()}</h3>
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

