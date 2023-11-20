import React, {ReactElement, useEffect, useState} from 'react';

import { Typography, notification, Card, Table, Tag } from "antd";
import IUser from "../../../server/models/userModel";
import axios from "axios";
import "../styling/Profile.css";
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';
import { useNavigate } from 'react-router-dom';

export default function Profile(): ReactElement {
    //initialize state
    const [userDetails, setUserDetails] = useState<IUser>({} as IUser);
    const [userReviews, setUserReviews] = useState<IReviewViewModel[]>([]);

    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text } = Typography;

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const getUserDetails = async (): Promise<void> => {
        await instance.get<IUser>('/user/details/' + sessionStorage.getItem('user'))
            .then((res) => {
                //save the user data into state
                const user = res.data as IUser;
                setUserDetails(user);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }

    const getUserReviews = async (): Promise<void> => {
        await instance.get<IReviewViewModel[]>('/review/user/' + sessionStorage.getItem('user'))
            .then((res) => {
                //save the user data into state
                const reviews = res.data as IReviewViewModel[];
                setUserReviews(reviews);
            })
            .catch((error) => {
                notificationApi.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'bottomRight',
                });
            });
    }
    
    const reviews = [
        {
            title: 'Title',
            key: 'title',
            render: (review: IReviewViewModel) => (
                <a onClick={() => navigate(`/review/${review.reviewId}`)}>
                    <Text className='reviewLink'>{review.title}</Text>
                </a>
            ),
            sorter: (a: IReviewViewModel, b: IReviewViewModel) => a.title.localeCompare(b.title),
            width: '25%',
        },
        {
            title: 'Company',
            key: 'company',
            render: (review: IReviewViewModel) => (
                <Text>{review.company}</Text>
            ),
            sorter: (a: IReviewViewModel, b: IReviewViewModel) => a.company.localeCompare(b.company),
            width: '15%'
        },
        {
            title: 'Tags',
            key: 'tags',
            render: (review: IReviewViewModel) => (
                <>
                    {review.tags.map((tag) => (
                        <Tag>{tag.name}</Tag>
                    ))}
                </>
            ),
            width: '20%'
        },
        {
            title: 'Grade Level',
            key: 'gradeLevel',
            render: (review: IReviewViewModel) => (
                <Text>{review.gradeLevel}</Text>
            ),
            sorter: (a: IReviewViewModel, b: IReviewViewModel) => a.gradeLevel.localeCompare(b.gradeLevel),
            width: '15%'
        },
        {
            title: 'Date',
            key: 'date',
            render: (review: IReviewViewModel) => (
                <Text>{`${review.startDate.slice(0, 10)} ~ ${review.endDate.slice(0, 10)}`}</Text>
            ),
            sorter: (a: IReviewViewModel, b: IReviewViewModel) => a.startDate.localeCompare(b.startDate),
            width: '20%'
        }
    ]

    useEffect(() => {
        getUserDetails();
        getUserReviews();
    }, []);

    return (
        <div className='content profilePage'>
            {contextHolder}
            <div className='profileDetailsContainer'>
                <Card 
                    className='profileDetails' 
                    title="Profile" 
                    headStyle={{ fontSize:"21px", padding: "15px 24px"}}
                    loading={userDetails.userId == null}
                >
                    <Paragraph>
                        <Text strong>Name: </Text>
                        <Text>{userDetails.name}</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Email: </Text>
                        <Text>{userDetails.email}</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Graduation Year: </Text>
                        <Text>{userDetails.graduationYear}</Text>
                    </Paragraph>
                </Card>
            </div>
            <div className='userReviewsContainer'>
                <Card 
                    className='userReviews' 
                    title="Your Reviews" 
                    headStyle={{ fontSize:"21px", padding: "15px 24px"}}
                    bodyStyle={{ paddingBottom: "0px"}}
                    loading={userReviews.length == 0}
                >
                    <Table
                        dataSource={userReviews}
                        columns={reviews}
                        pagination={{ 
                            pageSize: 15, 
                            total: userReviews.length, 
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`,
                            hideOnSinglePage: true
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}