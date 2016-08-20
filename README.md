# nomumo

<h3>Online: <a href="http://nomumo.de" target="_blank">nomumo.de</a></h3>

## What is nomumo?
Nomumo is an advanced scheduling tool that can be used to easily find and appoint a date and time for any activity attended by multiple people. If you want to find the perfect day for your party or the next trip, you can predefine some available dates and times for each date and immediately start a poll. 

## Installation
Hosting the application on your own is simple. Just make sure that the latest stable version of Node.js (including npm and bower) is installed on your machine.
Then run the following line from the path of your cloned repository to install all frontend-dependencies. 
```bash
bower install
```

After this run the following line from the api-folder to install all backend-dependencies.
```bash
npm install
```

To create the MySQL tables you need to enter following CREATE statements in your MySQL instance.
```bash
CREATE DATABASE `nomumo` /*!40100 DEFAULT CHARACTER SET utf8 */;

CREATE TABLE `polls` (
  `pollID` varchar(8) NOT NULL,
  `location` varchar(80) DEFAULT NULL,
  `description` varchar(5000) DEFAULT NULL,
  `name` varchar(80) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `title` varchar(80) DEFAULT NULL,
  `maybe` int(11) DEFAULT NULL,
  PRIMARY KEY (`pollID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `polldates` (
  `pollDateID` int(11) NOT NULL AUTO_INCREMENT,
  `pollID` varchar(8) DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`pollDateID`),
  KEY `pollID_idx` (`pollID`),
  CONSTRAINT `pollID` FOREIGN KEY (`pollID`) REFERENCES `polls` (`pollID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=786 DEFAULT CHARSET=utf8;


CREATE TABLE `polldatetimes` (
  `pollDateTimesID` int(11) NOT NULL AUTO_INCREMENT,
  `pollDateID` int(11) DEFAULT NULL,
  `time` varchar(45) DEFAULT NULL,
  `timeCountOnDay` int(11) DEFAULT NULL,
  PRIMARY KEY (`pollDateTimesID`),
  KEY `pollDateID_idx` (`pollDateID`),
  CONSTRAINT `pollDateID` FOREIGN KEY (`pollDateID`) REFERENCES `polldates` (`pollDateID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=618 DEFAULT CHARSET=utf8;


CREATE TABLE `users` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `pollID` varchar(8) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `userHash` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`userID`),
  KEY `pollID_idx` (`pollID`),
  CONSTRAINT `pollIDForUser` FOREIGN KEY (`pollID`) REFERENCES `polls` (`pollID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8;


CREATE TABLE `users` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `pollID` varchar(8) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `userHash` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`userID`),
  KEY `pollID_idx` (`pollID`),
  CONSTRAINT `pollIDForUser` FOREIGN KEY (`pollID`) REFERENCES `polls` (`pollID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8;


CREATE TABLE `userpolltimes` (
  `userPollTimeID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) DEFAULT NULL,
  `result` int(1) DEFAULT NULL,
  `pollDateTimeID` int(11) DEFAULT NULL,
  PRIMARY KEY (`userPollTimeID`),
  KEY `userIDForUserPollTime_idx` (`userID`),
  KEY `pollDateTimeIDForUserPollTime_idx` (`pollDateTimeID`),
  CONSTRAINT `pollDateTimeIDForUserPollTime` FOREIGN KEY (`pollDateTimeID`) REFERENCES `polldatetimes` (`pollDateTimesID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `userIDForUserPollTime` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=425 DEFAULT CHARSET=utf8;


CREATE TABLE `comments` (
  `commentID` int(11) NOT NULL AUTO_INCREMENT,
  `comment` varchar(800) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `pollID` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`commentID`),
  KEY `pollIDForComments_idx` (`pollID`),
  CONSTRAINT `pollIDForComments` FOREIGN KEY (`pollID`) REFERENCES `polls` (`pollID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;
```


## Start
To start the webserver type in following line from the api directory.
```bash
node main.js
```
