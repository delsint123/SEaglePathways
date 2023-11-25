import React, {ReactElement, useEffect, useState} from 'react';
import {notification, Typography, Divider, Tooltip, Tag, Card, Button} from 'antd';
import '../styling/Review.css';
import axios from 'axios';
import IReviewViewModel from '../viewModels/reviewViewModel';
import { useParams } from 'react-router-dom';
import { EditTwoTone } from '@ant-design/icons';
import EditReviewModal from './EditReviewModal';
import ICompany from '../models/companyModel';
import ITag from '../models/tagModel';

interface ReviewProps {
    companies: ICompany[],
    tags: ITag[],
    getCompaniesAsync: () => Promise<void>,
    getTagsAsync: () => Promise<void>,
    addCompany: (companyName: string) => Promise<void>,
    addTag: (tag: ITag) => Promise<void>
}

export default function Review(props: ReviewProps): ReactElement {
    //initialize state
    const [currentReview, setCurrentReview] = useState<IReviewViewModel>({} as IReviewViewModel);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    
    const params = useParams();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text } = Typography;

    const currentUser = parseInt(sessionStorage.getItem('user') || "");

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
                });
            });
    }

    const openEditModal = (e: React.MouseEvent<HTMLElement>): void => {
        e.stopPropagation();
        setIsEditing(true);
    }

    console.log(currentReview, currentUser);
    
    useEffect(() => {
        getReview();
    }, [isEditing]);

    return (
        <div className='content reviewPageContainer'>
            {contextHolder}
            
            <Card 
                title={currentReview.title}
                className='reviewPage'
                extra={
                    <>
                        <Text italic={true} className='reviewPage__date'>
                            {`${currentReview.startDate?.slice(0, 10)} ~ ${currentReview.endDate?.slice(0, 10)}`}
                        </Text>

                        {currentReview.userId == currentUser && 
                            <Button className='reviewPage__edit' onClick={(e) => openEditModal(e)}>
                                <EditTwoTone twoToneColor='#004785'/>
                            </Button>
                        }
                    </>
                    
                }
                loading={currentReview.title === undefined}
            >
                <div className='reviewPage__companyGradeContainer'>
                    <Paragraph>
                        <Text className='reviewPage__company'>{currentReview.company}</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text className='reviewPage__grade'>{currentReview.gradeLevel}</Text>
                    </Paragraph>                    
                </div>

                {currentReview.tags?.length !== 0 &&
                    <Divider orientation='left' orientationMargin="0px" className='blueDivider'>
                        Tags
                    </Divider>
                }
                
                {currentReview.tags &&
                    currentReview.tags.map((tag, index) => (
                        <Tooltip title={tag.description} placement='top'>
                            <Tag key={index} className='reviewPage__tags'>{tag.name}</Tag>
                        </Tooltip>
                    ))
                }

                <Divider orientation='left' orientationMargin="0px" className='greenDivider'>
                    Description
                </Divider>
                
                <Paragraph>
                    <Text>{currentReview.description}</Text>
                </Paragraph>
            </Card>    

            {isEditing &&
                <EditReviewModal
                    review={currentReview}
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