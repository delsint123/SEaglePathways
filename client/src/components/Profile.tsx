import React, {ReactElement, useState} from 'react';

import { Typography, notification, Card, Table, Tag } from "antd";
import IUser from "../../../server/models/userModel";
import axios from "axios";
import "../styling/Profile.css";
import IReviewViewModel from '../../../server/viewModels/reviewViewModel';

export default function Profile(): ReactElement {
    //initialize state
    const [userDetails, setUserDetails] = useState<IUser>({} as IUser);
    const [userReviews, setUserReviews] = useState<IReviewViewModel[]>([]);

    const [notificationApi, contextHolder] = notification.useNotification();
    const { Paragraph, Text, Title } = Typography;

    const instance = axios.create({
        baseURL: 'http://localhost:5000'
    })

    const getUserDetails = async (): Promise<void> => {

    }

    const getUserReviews = async (): Promise<void> => {

    }

    return (
        <div className='content profilePage'>
            <div className='profileDetailsContainer'>
                <Card 
                    className='profileDetails' 
                    title="Profile" 
                    headStyle={{ fontSize:"22px", padding: "20px"}}
                    // loading={true}
                >
                    <Paragraph>
                        <Text strong>Name: </Text>
                        <Text>John Doe</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Email: </Text>
                    </Paragraph>
                </Card>
            </div>
            <div className='userReviewsContainer'>
                <Card 
                    className='userReviews' 
                    title="Your Reviews" 
                    headStyle={{ fontSize:"22px", padding: "20px"}}
                    // loading={true}
                >
                    <Table>
                        <Table.Column title="Title" dataIndex="title" key="title" />
                        <Table.Column title="Company" dataIndex="company" key="company" />
                        <Table.Column title="Tags" dataIndex="tags" key="tags" />
                        <Table.Column title="Grade Level" dataIndex="gradeLevel" key="gradeLevel" />
                        <Table.Column title="Date" dataIndex="date" key="date" />
                    </Table>
                </Card>
            </div>
        </div>
    );
}