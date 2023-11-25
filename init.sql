CREATE TABLE user (
     userId            integer not null auto_increment,
     firstName          varchar(30),
	 lastName			varchar(30),
     email           	varchar(50),
	 password			varchar(60),
	 graduationYear    integer,
     primary key (userId)
);

CREATE TABLE company (
     companyId         integer not null auto_increment,
     name               varchar(40),
     primary key (companyId)
);

CREATE TABLE review (
     reviewId     		integer not null auto_increment,
     title              varchar(40),
     userId	            integer,
     companyId	        integer,
     description        Longtext,
     startDate	        date,
     endDate	        date,
	 gradeLevel		varchar(20),
     primary key (reviewId),
     foreign key (companyId)
         references company (companyId),
     foreign key (userId)
         references user (userId)
);

CREATE TABLE tag (
     tagId              integer not null auto_increment,
     name               varchar(40),
     description        varchar(100),
     primary key (tagId)
);

CREATE TABLE reviewTags (
     reviewId      		integer,
     tagId             	integer,
     primary key (reviewId, tagId),
     foreign key (reviewId)
          references review (reviewId),
     foreign key (tagId)
          references tag (tagId)
);